import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateEmbedding } from '@/lib/ai/embedding'
import Groq from 'groq-sdk'

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient()
        const { message, conversationId, examMode } = await req.json()

        // 1. Auth check
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        // 2. Fetch conversation to get deck_id for filtering
        const { data: conversation } = await supabase
            .from('conversations')
            .select('deck_id')
            .eq('id', conversationId)
            .single()

        const filterDeckId = conversation?.deck_id

        // 3. Embed Query
        const queryEmbedding = await generateEmbedding(message)

        // 3.5 Check for specific slide reference (Hybrid Search)
        // Matches "slide 5", "slide #5", "Slide 5"
        const slideMatch = message.match(/slide\s+#?(\d+)/i)
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
        const finalChunks = Array.from(uniqueMap.values())

        // 4. Construct Prompt
        const contextText = finalChunks.length > 0
            ? finalChunks.map((chunk: any) =>
                `[Slide ${chunk.slide_number}]: ${chunk.content}`
            ).join('\n\n')
            : "No relevant slides found."

        const systemPrompt = `You are Unislyd, an AI study assistant for university students.
    
    CONTEXT:
    ${contextText}
    
    INSTRUCTIONS:
    - Answer the student's question based on the provided CONTEXT and elaborate further with relevant information to help broaden and deepen the understanding for the student.
    -If a student asks "What is on slide X?", answer the question based on the context found on the stated slide number or closest in meaning and let the student know that you have derived the answer from the meaning of the context [mention slide number]. 
    - If the answer is not in the context, say "I couldn't find that in your slides."
    -If the question cannot be found word for word yet the meaning can be derived from the context, answer the question based on the context or closest in meaning and let the student know that you have derived the answer from the meaning of the context [mention slide number]. 
    - Cite your sources by referring to the Slide number (e.g., [Slide 4]).
    ${examMode ? `
    EXAM MODE ACTIVE:
    - Focus on high-density facts, definitions, and key concepts.
    - Use bullet points often.
    - Be concise and rigorous.
    - Explain like you are helping the student memorize for a test.
    ` : `
    - Be helpful, encouraging, and academic in tone.
    - Explain clearly and step-by-step if needed.
    `}
    `

        // 5. Generate with Groq
        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: message }
            ],
            model: "openai/gpt-oss-120b", // High performance open model
            temperature: examMode ? 0.3 : 0.7,
            max_tokens: 1024,
        });

        const reply = completion.choices[0]?.message?.content || "No response generated."

        // 6. Save Message & Usage (Async)
        // In a real app, use waitUntil or fire-and-forget
        await supabase.from('messages').insert({
            conversation_id: conversationId,
            role: 'user',
            content: message
        })

        // Construct sources metadata
        const sources = similarChunks.map((c: any) => ({
            id: c.id,
            slide_number: c.slide_number,
            deck_id: c.deck_id
        }))

        await supabase.from('messages').insert({
            conversation_id: conversationId,
            role: 'assistant',
            content: reply,
            sources: sources
        })

        return NextResponse.json({ reply, sources })

    } catch (error) {
        console.error('Chat API Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
