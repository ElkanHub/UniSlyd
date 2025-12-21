import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateEmbedding } from '@/lib/ai/embedding'
import Groq from 'groq-sdk'
import { RATE_LIMITS } from '@/lib/limits'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient()
        const { message, conversationId, examMode } = await req.json()

        const logDate = new Date()

        // 1. Auth check
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        // --- RATE LIMIT CHECK (Start) ---
        // 1.1 Fetch Profile & Tiers
        const { data: profile } = await supabase.from('profiles').select('tier').eq('id', user.id).single()
        const userTier = (profile?.tier === 'pro' || profile?.tier === 'pro_plus') ? 'PRO' : 'FREE'
        const limits = RATE_LIMITS[userTier]

        // 1.2 Check Monthly Usage
        const now = new Date()
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

        const { data: monthlyLog } = await supabase
            .from('usage_logs')
            .select('count')
            .eq('user_id', user.id)
            .eq('metric', 'query')
            .gte('created_at', startOfMonth)

        const monthlyCount = monthlyLog ? monthlyLog.reduce((acc, curr) => acc + curr.count, 0) : 0
        if (monthlyCount >= limits.MAX_QUERIES_PER_MONTH) {
            return NextResponse.json(
                { error: `Monthly limit reached (${limits.MAX_QUERIES_PER_MONTH}). specific_code: LIMIT_MONTHLY` },
                { status: 429 }
            )
        }

        // 1.3 Check Daily Usage
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
        const { data: dailyLog } = await supabase
            .from('usage_logs')
            .select('count')
            .eq('user_id', user.id)
            .eq('metric', 'query')
            .gte('created_at', startOfDay)

        const dailyCount = dailyLog ? dailyLog.reduce((acc, curr) => acc + curr.count, 0) : 0
        if (dailyCount >= limits.MAX_QUERIES_PER_DAY) {
            return NextResponse.json(
                { error: `Daily limit reached (${limits.MAX_QUERIES_PER_DAY}). specific_code: LIMIT_DAILY` },
                { status: 429 }
            )
        }
        // --- RATE LIMIT CHECK (End) ---


        // 2. Fetch conversation to get deck_id for filtering
        const { data: conversation } = await supabase
            .from('conversations')
            .select('deck_id, decks(filename)')
            .eq('id', conversationId)
            .single()

        const filterDeckId = conversation?.deck_id
        const deckFilename = Array.isArray(conversation?.decks)
            ? conversation.decks[0]?.filename
            : (conversation?.decks as any)?.filename


        // 3. Embed Query
        const queryEmbedding = await generateEmbedding(message)

        // 3.5 Check for "Full Context" intent (e.g., "stroll through slides", "overview")
        const fullContextMatch = message.match(/(stroll|overview|whole|all\s+slides|entire\s+presentation|summary|summarize|full\s+context)/i)

        // 3.6 Check for specific slide reference (Hybrid Search)
        // Matches "slide 5", "slide #5", "Slide 5"
        const slideMatch = message.match(/slide\s+#?(\d+)/i)

        let finalChunks: any[] = []

        if (fullContextMatch && filterDeckId) {
            console.log(`[Chat] Detected full context intent. Fetching all slides for deck: ${filterDeckId}`)

            // Fetch all slides (remove limit or set very high to get full potential content first, then truncate reliably)
            // Or keep limit 100 if we assume 100 slides is safe-ish, but let's be smarter.
            // Let's limit to 300 to capture really long decks, then truncate tokens.
            const { data: allSlides, error: allSlidesError } = await supabase
                .from('slide_chunks')
                .select('*')
                .eq('deck_id', filterDeckId)
                .order('slide_number', { ascending: true })
                .limit(300)

            if (!allSlidesError && allSlides) {
                // Token Management Strategy
                // Groq Free Tier has strict TPM limits (e.g. 8000 TPM). 
                // We must stay well below this. 
                const SAFE_TOKEN_LIMIT = 6000
                let currentTokens = 0
                let truncatedSlides: any[] = []
                let truncated = false

                for (const slide of allSlides) {
                    const text = slide.content || ""
                    const estimatedTokens = Math.ceil(text.length / 4)

                    if (currentTokens + estimatedTokens > SAFE_TOKEN_LIMIT) {
                        truncated = true
                        break
                    }

                    truncatedSlides.push(slide)
                    currentTokens += estimatedTokens
                }

                finalChunks = truncatedSlides

                if (truncated) {
                    console.warn(`[Chat] Context truncated. Used ${truncatedSlides.length}/${allSlides.length} slides.`)
                    // Optionally inject a "virtual" chunk at the end to warn the AI? 
                    // Or just handle it in the system prompt construction. 
                    // Let's add a property to the last chunk or handle it in step 4.
                    // For now, we will trust the system prompt to handle "what you see is what you get".
                }
            }
        } else {
            // Standard Hybrid Search
            let specificSlideChunks: any[] = []

            if (slideMatch && filterDeckId) {
                const slideNum = parseInt(slideMatch[1])
                console.log(`[Chat] Detected specific slide intent: Slide ${slideNum}`)

                const { data: slides, error: slideError } = await supabase
                    .from('slide_chunks')
                    .select('*')
                    .eq('deck_id', filterDeckId)
                    .eq('slide_number', slideNum)
                    .limit(5)

                if (!slideError && slides) {
                    specificSlideChunks = slides
                }
            }

            // 4. Vector Search (RPC call)
            const { data: similarChunks, error: searchError } = await supabase.rpc('match_slides', {
                query_embedding: queryEmbedding,
                match_threshold: 0.5, // tunable
                match_count: 5,
                filter_deck_id: filterDeckId
            })

            if (searchError) {
                console.error("Vector Search Error", searchError)
                return NextResponse.json({ error: 'Search failed' }, { status: 500 })
            }

            // Merge: Specific slides FIRST, then semantic results
            // Use a Map to deduplicate by ID
            const allChunks = [...specificSlideChunks, ...(similarChunks || [])]
            const uniqueMap = new Map()
            allChunks.forEach(chunk => {
                if (!uniqueMap.has(chunk.id)) {
                    uniqueMap.set(chunk.id, chunk)
                }
            })
            finalChunks = Array.from(uniqueMap.values())
        }

        // 4. Construct Prompt
        const contextText = finalChunks.length > 0
            ? finalChunks.map((chunk: any) =>
                `[Slide ${chunk.slide_number}]: ${chunk.content}`
            ).join('\n\n')
            : "No relevant slides found."

        const systemPrompt = `
You are Unislyd, an intelligent academic study assistant for university students.

You act like a professional tutor who uses the student’s lecture slides as a primary reference,
but you are not limited to word-for-word matches.

CONTEXT (Lecture Slides):
${contextText}

CORE BEHAVIOR:
- Always attempt to understand the student’s intent, even if the question is phrased loosely or indirectly.
- Treat the slides as an anchor and reference point, not as the only allowable source of reasoning.
- If the question is conceptually related to the slides, use the slides to guide, explain, and expand the answer.
- You may extend explanations using standard academic knowledge as long as it aligns with the topic of the slides.

ANSWERING RULES (IMPORTANT):
1. If the answer is directly stated in the slides:
   - Answer clearly and cite the relevant slide number(s).

2. If the answer is NOT stated word-for-word, but can be reasonably inferred, derived, or supported by the ideas in the slides:
   - Answer using the closest related concepts from the slides.
   - Explicitly say that the answer is inferred or derived from the slide content.
   - Cite the most relevant slide(s).

3. If the question goes slightly beyond the slides but is still within the same academic topic:
   - Use the slides as a foundation.
   - Provide a guided explanation that builds on them.
   - Make it clear where the slides stop and where general academic knowledge is added.
   - Still reference relevant slides where applicable.

4. ONLY say “I couldn’t find that in your slides” if:
   - The question is clearly unrelated to the lecture topic, OR
   - The question is extreme, fictional, or completely outside the course domain.

SLIDE-SPECIFIC QUESTIONS:
- If a student asks “What is on slide X?”, answer strictly based on slide X or the closest matching slide.
- Mention explicitly which slide the answer is derived from (e.g., [Slide 4]).

CITATIONS:
- Always cite slide numbers when slide content is used (e.g., [Slide 6]).
- Do NOT invent slide content or slide numbers.

${examMode ? `
EXAM MODE ACTIVE:
- Focus on definitions, key facts, and examinable concepts.
- Use bullet points.
- Be concise, precise, and memory-oriented.
` : `
GENERAL MODE:
- Be supportive, clear, and explanatory.
- Teach step-by-step when appropriate.
- Sound like a knowledgeable, calm academic guide.
`}
    `

        // 5. Generate with Groq (Streaming)
        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: message }
            ],
            model: "openai/gpt-oss-120b",
            temperature: examMode ? 0.3 : 0.7,
            max_tokens: 1024,
            stream: true, // Enable streaming
        });

        // 6. Create a ReadableStream
        const encoder = new TextEncoder()
        let fullResponse = ""

        // Construct sources metadata
        const sources = finalChunks.map((c: any) => ({
            id: c.id,
            slide_number: c.slide_number,
            deck_id: c.deck_id,
            filename: deckFilename
        }))

        const stream = new ReadableStream({
            async start(controller) {
                try {
                    for await (const chunk of completion) {
                        const content = chunk.choices[0]?.delta?.content || ""
                        if (content) {
                            fullResponse += content
                            controller.enqueue(encoder.encode(content))
                        }
                    }
                } catch (err) {
                    console.error("Streaming error:", err)
                    controller.error(err)
                } finally {
                    controller.close()

                    // 7. Save Message & Usage (After stream completes)
                    // Note: In serverless (Vercel), you might need `waitUntil` or similar if this gets cut off.
                    // For standard Node/VPS, this usually runs fine. 
                    try {
                        const { error: msgError } = await supabase.from('messages').insert({
                            conversation_id: conversationId,
                            role: 'assistant',
                            content: fullResponse || "No response generated.", // Fallback
                            sources: sources
                        })

                        if (msgError) console.error("Failed to save AI message:", msgError)

                        // Update usage
                        await supabase.from('usage_logs').insert({
                            user_id: user.id,
                            metric: 'chat_turn',
                            count: 1, // Increment count for chat turn
                            bucket_month: logDate.toISOString().slice(0, 7) + '-01'
                        })

                    } catch (dbErr) {
                        console.error("Post-stream DB save failed:", dbErr)
                    }
                }
            }
        })

        // Save USER message first (sync) to ensure order
        await supabase.from('messages').insert({
            conversation_id: conversationId,
            role: 'user',
            content: message
        })

        // Return the stream with sources header
        // We base64 encode sources to ensure it passes safely in headers
        const sourcesHeader = Buffer.from(JSON.stringify(sources)).toString('base64')

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
                'x-sources': sourcesHeader
            }
        })



        // Note: Usage logging and message saving for the assistant are now handled INSIDE the stream completion block above.
        // User message saving is handled before the stream starts.

        // Auto-generate title could be triggered here if we didn't need the reply content, 
        // but since we usually use the first few messages, we might trigger it separately or 
        // in the stream completion block if we want to use the AI's reply.
        // For now, simpler to just skip it or trigger off user message only.


    } catch (error) {
        console.error('Chat API Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

// Background function to generate title (fire-and-forget in a real edge runtime is tricky, but we'll await it for now or use Vercel functions if available, 
// strictly for this environment we will just await it to ensure it happens, or do it after the response if we could, but Next.js API routes are request-bound)
// ACTUALLY: The best place is step 5.5, before returning JSON but in parallel with saving the message?
// Let's refactor slightly to do it before the return.

async function updateConversationTitle(conversationId: string, firstMessage: string, reply: string) {
    try {
        const supabase = await createClient()

        // Check current title
        const { data: conv } = await supabase
            .from('conversations')
            .select('title')
            .eq('id', conversationId)
            .single()

        // Only update if it's the default title
        if (conv?.title === 'New Study Session' || conv?.title === 'Study Session') {
            const groq = new Groq({
                apiKey: process.env.GROQ_API_KEY
            });

            // Generate a sparse title
            const titleCompletion = await groq.chat.completions.create({
                messages: [
                    {
                        role: "system",
                        content: "Generate a very brief, specific title (max 4-5 words) for a study session that starts with this user message. Do not use quotes. Just the title."
                    },
                    { role: "user", content: firstMessage }
                ],
                model: "openai/gpt-oss-120b", // Fast, cheap model
                max_tokens: 15,
            });

            const newTitle = titleCompletion.choices[0]?.message?.content?.trim()
            if (newTitle) {
                await supabase
                    .from('conversations')
                    .update({ title: newTitle })
                    .eq('id', conversationId)
            }
        }
    } catch (e) {
        console.error("Failed to auto-title conversation:", e)
    }
}
