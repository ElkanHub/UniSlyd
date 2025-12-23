import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateEmbedding } from '@/lib/ai/embedding'
import Groq from 'groq-sdk'
import { RATE_LIMITS } from '@/lib/limits'

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient()
        const { message, sessionId } = await req.json()

        const logDate = new Date()

        // 1. Auth check
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        // --- RATE LIMIT CHECK (Research Specific) ---
        const { data: profile } = await supabase.from('profiles').select('tier').eq('id', user.id).single()
        const userTier = (profile?.tier === 'pro' || profile?.tier === 'pro_plus') ? 'PRO' : 'FREE'
        const limits = RATE_LIMITS[userTier]

        // Check Daily Research Usage
        const now = new Date()
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()

        const { data: dailyLog } = await supabase
            .from('usage_logs')
            .select('count')
            .eq('user_id', user.id)
            .eq('metric', 'research_turn')
            .gte('created_at', startOfDay)

        const dailyCount = dailyLog ? dailyLog.reduce((acc, curr) => acc + curr.count, 0) : 0

        if (dailyCount >= limits.RESEARCH_DAILY_LIMIT) {
            return NextResponse.json(
                { error: `Research daily limit reached (${limits.RESEARCH_DAILY_LIMIT}). Upgrade to Pro for more.` },
                { status: 429 }
            )
        }
        // --- END LIMIT CHECK ---

        // 2. Fetch Research Session to get locked Context
        const { data: session } = await supabase
            .from('research_sessions')
            .select('selected_deck_ids')
            .eq('id', sessionId)
            .single()

        if (!session || !session.selected_deck_ids || session.selected_deck_ids.length === 0) {
            return NextResponse.json(
                { error: 'No decks selected for this research session. Please select at least one deck.' },
                { status: 400 }
            )
        }

        const selectedDeckIds = session.selected_deck_ids

        // 2.1 Fetch Deck Filenames for Metadata
        const { data: decksMetadata } = await supabase
            .from('decks')
            .select('id, filename')
            .in('id', selectedDeckIds)

        const deckMap = new Map<string, string>()
        decksMetadata?.forEach((d: any) => deckMap.set(d.id, d.filename))

        // 3. Embed Query
        const queryEmbedding = await generateEmbedding(message)

        // 3.1 Check for specific slide intent (Hybrid Search)
        // Matches "slide 5", "slide #5"
        const slideMatch = message.match(/slide\s+#?(\d+)/i)
        let specificSlideChunks: any[] = []

        if (slideMatch) {
            const slideNum = parseInt(slideMatch[1])
            console.log(`[Research] Detected specific slide intent: Slide ${slideNum}`)

            const { data: slides } = await supabase
                .from('slide_chunks')
                .select('*')
                .in('deck_id', selectedDeckIds)
                .eq('slide_number', slideNum)
                .limit(10)

            if (slides) specificSlideChunks = slides
        }

        // 4. Scoped Vector Search
        let allChunks: any[] = []

        // Parallel fetch for selected decks (search all selected, or cap if too many)
        const decksToQuery = selectedDeckIds.slice(0, 5)

        const promises = decksToQuery.map(async (deckId: string) => {
            const { data: chunks } = await supabase.rpc('match_slides', {
                query_embedding: queryEmbedding,
                match_threshold: 0.1, // Low threshold for broad context
                match_count: 6,
                filter_deck_id: deckId
            })
            return chunks || []
        })

        const results = await Promise.all(promises)
        allChunks = [...specificSlideChunks, ...results.flat()]

        // Deduplicate
        const uniqueMap = new Map()
        allChunks.forEach(chunk => {
            if (!uniqueMap.has(chunk.id)) {
                uniqueMap.set(chunk.id, chunk)
            }
        })
        const finalChunks = Array.from(uniqueMap.values())


        // 5. Construct Prompt
        const contextText = finalChunks.length > 0
            ? finalChunks.map((chunk: any) => {
                const fname = deckMap.get(chunk.deck_id) || "Unknown Deck"
                return `[Deck: ${fname} | Slide ${chunk.slide_number}]: ${chunk.content}`
            }).join('\n\n')
            : "No relevant slides found in selected decks."

        const systemPrompt = `
You are the Unislyd Research Assistant.
You are helping a student write a paper or study deeply.

STRICT CONTEXT:
You have access ONLY to the user's selected slide decks.
Use the content below to answer.

CONTEXT:
${contextText}

INSTRUCTIONS:
- Synthesize information from multiple slides/decks if possible.
- BE ACADEMIC: Use a formal, objective tone.
- CITATIONS ARE MANDATORY: Whenever you use information, append a citation like [Deck Name - Slide X].
- If the answer is not in the decks, DO NOT hallucinate. You may provide a general academic answer but MUST state: "This is outside your selected decks, but generally..."
- Format for readability: Use bolding for key terms.

Do not be conversational or chatty. Be a research tool.
`

        // 6. Generate
        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: message }
            ],
            model: "openai/gpt-oss-120b",
            temperature: 0.4,
            max_tokens: 1500,
            stream: true,
        });

        const encoder = new TextEncoder()
        let fullResponse = ""

        // Construct sources metadata with filenames
        const sources = finalChunks.map((c: any) => ({
            id: c.id,
            slide_number: c.slide_number,
            deck_id: c.deck_id,
            filename: deckMap.get(c.deck_id) || "Unknown Deck"
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

                    // Save to DB
                    try {
                        await supabase.from('research_messages').insert({
                            session_id: sessionId,
                            role: 'user',
                            content: message
                        })

                        await supabase.from('research_messages').insert({
                            session_id: sessionId,
                            role: 'assistant',
                            content: fullResponse || "No response.",
                            sources: sources
                        })

                        await supabase.from('usage_logs').insert({
                            user_id: user.id,
                            metric: 'research_turn',
                            count: 1,
                            bucket_month: logDate.toISOString().slice(0, 7) + '-01'
                        })

                        await supabase.from('research_sessions')
                            .update({ last_opened_at: new Date().toISOString() })
                            .eq('id', sessionId)

                    } catch (dbErr) {
                        console.error("Research DB Save Failed:", dbErr)
                    }
                }
            }
        })

        const sourcesHeader = Buffer.from(JSON.stringify(sources)).toString('base64')

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
                'x-sources': sourcesHeader
            }
        })

    } catch (error) {
        console.error('Research Chat API Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
