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

        // 2. Embed Query
        const queryEmbedding = await generateEmbedding(message)

        // 3. Vector Search (RPC call)
        // We need to create this RPC function in Supabase first (see schema update)
        // For now assuming we can call it directly or just use basic query if we had pgvector-js, but RPC is best
        const { data: similarChunks, error: searchError } = await supabase.rpc('match_slides', {
            query_embedding: queryEmbedding,
            match_threshold: 0.5, // tunable
            match_count: 5
        })

        if (searchError) {
            console.error("Vector Search Error", searchError)
            return NextResponse.json({ error: 'Search failed' }, { status: 500 })
        }

        // 4. Construct Prompt
        const contextText = similarChunks?.map((chunk: any) =>
            `[Slide ${chunk.slide_number}]: ${chunk.content}`
        ).join('\n\n') || "No relevant slides found."

        const systemPrompt = `You are Unislyd, an AI study assistant for university students.
    
    CONTEXT:
    ${contextText}
    
    INSTRUCTIONS:
    - Answer the student's question based STRICTLY on the provided CONTEXT.
    - If the answer is not in the context, say "I couldn't find that in your slides."
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
            model: "llama3-70b-8192", // High performance open model
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
