import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { parseFile } from '@/lib/ingest/loaders'
import { generateEmbedding } from '@/lib/ai/embedding'
import { chunkText } from '@/lib/ai/chunking'

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const formData = await req.formData()
        const file = formData.get('file') as File

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
        }

        // Server-side validation
        if (file.size > 20 * 1024 * 1024) {
            return NextResponse.json({ error: 'File too large (Max 20MB)' }, { status: 400 })
        }

        const validTypes = [
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation'
        ]

        // Check type (sometimes file.type is missing or trust it for now, can verify magic bytes if needed)
        // We will rely on loaders to fail if format is wrong

        console.log('Processing file:', file.name, file.type)

        // 1. Upload to Storage (Optional for now, but good practice)
        // const { data: storageData, error: storageError } = await supabase.storage.from('decks').upload(...)

        // 2. Parse Text
        let parsedContent
        try {
            parsedContent = await parseFile(file)
        } catch (e) {
            console.error("Parse Error", e)
            return NextResponse.json({ error: 'Failed to parse file content' }, { status: 422 })
        }

        // 3. Create Deck Record
        const { data: deck, error: dbError } = await supabase
            .from('decks')
            .insert({
                user_id: user.id,
                filename: file.name,
                page_count: parsedContent.metadata?.pages || 0,
            })
            .select()
            .single()

        if (dbError) {
            console.error("DB Error", dbError)
            return NextResponse.json({ error: 'Database error' }, { status: 500 })
        }

        // 4. Chunk & Embed
        try {
            const chunks = chunkText(parsedContent.text)

            // Use Promise.all with some concurrency limit ideally, but for now simple parallel
            const embeddings = await Promise.all(
                chunks.map(async (chunk) => {
                    try {
                        return await generateEmbedding(chunk)
                    } catch (e) {
                        console.error("Embedding failed for chunk", e)
                        return null
                    }
                })
            )

            const validEmbeddings = embeddings.filter(e => e !== null) as number[][]
            // If all fail, we have a problem
            if (validEmbeddings.length === 0 && chunks.length > 0) {
                throw new Error("Failed to generate embeddings")
            }

            const chunkRecords = chunks.map((chunk, i) => {
                if (!embeddings[i]) return null
                return {
                    deck_id: deck.id,
                    slide_number: i + 1, // Approximation
                    content: chunk,
                    embedding: embeddings[i],
                    metadata: parsedContent.metadata
                }
            }).filter(r => r !== null)

            const { error: chunkError } = await supabase.from('slide_chunks').insert(chunkRecords)

            if (chunkError) {
                console.error("Chunk Insert Error", chunkError)
                // Non-fatal? Or fatal? let's log.
            }
        } catch (e) {
            console.error("Embedding Process Failed", e)
            // We still return success as the file is uploaded, but maybe with a warning?
        }

        // Log usage
        await supabase.from('usage_logs').insert({
            user_id: user.id,
            metric: 'deck_upload',
            bucket_month: new Date().toISOString().slice(0, 7) + '-01' // YYYY-MM-01
        })

        return NextResponse.json({
            success: true,
            deckId: deck.id,
            message: 'File uploaded and parsed successfully',
            preview: parsedContent.text.slice(0, 200)
        })

    } catch (error) {
        console.error('Upload handler error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
