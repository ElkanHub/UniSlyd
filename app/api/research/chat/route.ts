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
        // Default to FREE if no profile found, though that shouldn't happen for valid users
        const userTier = (profile?.tier === 'pro' || profile?.tier === 'pro_plus') ? 'PRO' : 'FREE'
        const limits = RATE_LIMITS[userTier]

        // Check Daily Research Usage
        const now = new Date()
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()

        const { data: dailyLog } = await supabase
            .from('usage_logs')
            .select('count')
            .eq('user_id', user.id)
            .eq('metric', 'research_turn') // Distinct metric for research
            .gte('created_at', startOfDay)

        const dailyCount = dailyLog ? dailyLog.reduce((acc, curr) => acc + curr.count, 0) : 0

        // Research limit check
        if (dailyCount >= limits.RESEARCH_DAILY_LIMIT) {
            return NextResponse.json(
                { error: `Research daily limit reached (${limits.RESEARCH_DAILY_LIMIT}). Upgrade to Pro for more.` },
                { status: 429 }
            )
        }
        // --- END LIMIT CHECK ---

        // 2. Fetch Research Session to get locked Context (Selected Decks)
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

        // 3. Embed Query
        const queryEmbedding = await generateEmbedding(message)

        // 4. Scoped Vector Search
        // We need to match chunks ONLY from the selected decks.
        // We'll use the existing `match_slides` RPC but we might need to filter manually or update the RPC.
        // The current `match_slides` usually takes a single `filter_deck_id`.
        // Ideally we update the RPC to accept an array unique `filter_deck_ids`.
        // FOR NOW: We will implement a client-side filter fallback or loop if the RPC doesn't support arrays yet.
        // CHECK: Does `match_slides` support arrays? Usually no.
        // OPTION: We run the RPC without deck filter and filter in code (inefficient if many users),
        // OR we create/use a `match_slides_multiple` RPC.
        // 
        // Let's assume we need to fetch relevant chunks for EACH deck? No, that's too many requests.
        // Best approach without new migration: Use Supabase JS `rpc` with customized query if possible, or...
        // Wait, pgvector usually allows filtering.
        // Let's try to query `slide_chunks` directly using the embedding similarity order if possible within Supabase client? 
        // Supabase JS doesn't do vector math easily without RPC.
        // 
        // WORKAROUND: We will fetch top chunks for *each* deck (up to 3 per deck) to ensure balanced context, 
        // then re-rank or flatten. This ensures multi-deck context.
        // LIMIT: If user has 10 decks, that's 30 chunks. Too many tokens? 
        // Let's cap total decks processed or just take the first 5 active ones? 
        // The plan said "Max recommended 5-10". 

        let allChunks: any[] = []

        // Parallel fetch for selected decks (up to 5 to avoid timeouts)
        // detailed "multi-deck" hybrid search
        const decksToQuery = selectedDeckIds.slice(0, 5) // Cap at 5 decks for query performance

        const promises = decksToQuery.map(async (deckId: string) => {
            // We use the existing RPC but filtered to this specific deck
            const { data: chunks } = await supabase.rpc('match_slides', {
                query_embedding: queryEmbedding,
                match_threshold: 0.5,
                match_count: 4, // 4 chunks per deck
                filter_deck_id: deckId
            })
            return chunks || []
        })

        const results = await Promise.all(promises)
        allChunks = results.flat()

        // Deduplicate
        const uniqueMap = new Map()
        allChunks.forEach(chunk => {
            if (!uniqueMap.has(chunk.id)) {
                uniqueMap.set(chunk.id, chunk)
            }
        })

        // Sort by similarity match? The RPC returns distinct sets. 
        // We might just take them all if token count permits.
        const finalChunks = Array.from(uniqueMap.values())


        // 5. Construct Prompt
        const contextText = finalChunks.length > 0
            ? finalChunks.map((chunk: any) =>
                `[Deck: ${chunk.deck_id?.slice(0, 5)}... Slide ${chunk.slide_number}]: ${chunk.content}`
            ).join('\n\n')
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
- CITATIONS ARE MANDATORY: Whenever you use information, append a citation like [Slide X].
- If the answer is not in the decks, you may provide a general academic answer but MUST state: "This is outside your selected decks, but generally..."
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
            temperature: 0.5, // Lower temp for research
            max_tokens: 1500, // Longer output for research
            stream: true,
        });

        const encoder = new TextEncoder()
        let fullResponse = ""

        // Construct sources metadata
        // We might need to fetch deck names if we want pretty citations, but IDs are okay for now or we rely on frontend cache.
        const sources = finalChunks.map((c: any) => ({
            id: c.id,
            slide_number: c.slide_number,
            deck_id: c.deck_id,
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
                        // User Msg
                        await supabase.from('research_messages').insert({
                            session_id: sessionId,
                            role: 'user',
                            content: message
                        })

                        // AI Msg
                        await supabase.from('research_messages').insert({
                            session_id: sessionId,
                            role: 'assistant',
                            content: fullResponse || "No response.",
                            sources: sources
                        })

                        // Log Usage
                        await supabase.from('usage_logs').insert({
                            user_id: user.id,
                            metric: 'research_turn',
                            count: 1,
                            bucket_month: logDate.toISOString().slice(0, 7) + '-01'
                        })

                        // Update Session "last_opened_at"
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
