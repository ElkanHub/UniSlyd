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

        // 1. Upload to Storage
        const fileExt = file.name.split('.').pop()
        const filePath = `${user.id}/${Date.now()}.${fileExt}`

        const { data: storageData, error: storageError } = await supabase
            .storage
            .from('decks')
            .upload(filePath, file)

        if (storageError) {
            console.error("Storage Upload Error", storageError)
            return NextResponse.json({ error: 'Failed to upload file to storage' }, { status: 500 })
        }

        const { data: { publicUrl } } = supabase.storage.from('decks').getPublicUrl(filePath)

        // 2. Parse Text
        let parsedContent
        try {
            parsedContent = await parseFile(file)
        } catch (e: any) {
            console.error("Parse Error", e)
            return NextResponse.json({ error: `Failed to parse file content: ${e.message}` }, { status: 422 })
        }

        // 3. Create Deck Record
        const { data: deck, error: dbError } = await supabase
            .from('decks')
            .insert({
                user_id: user.id,
                filename: file.name,
                original_file_url: publicUrl,
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
            let chunkRecords: any[] = []

            console.log(`[Upload] Content parsed. Metadata:`, parsedContent.metadata)

            if (parsedContent.slides && parsedContent.slides.length > 0) {
                console.log(`[Upload] Processing ${parsedContent.slides.length} structured slides`)

                // Process structured slides (PPTX)
                // We process each slide individually to preserve boundaries
                for (const slide of parsedContent.slides) {
                    const slideText = slide.text.join('\n')
                    // Basic chunking of this slide's text
                    const chunks = chunkText(slideText)

                    const embeddings = await Promise.all(
                        chunks.map(chunk => generateEmbedding(chunk).catch(e => {
                            console.error(`[Upload] Embedding failed for slide ${slide.slideIndex} chunk`, e)
                            return null
                        }))
                    )

                    chunks.forEach((chunk, i) => {
                        if (embeddings[i]) {
                            chunkRecords.push({
                                deck_id: deck.id,
                                slide_number: slide.slideIndex, // Use actual slide index
                                content: chunk,
                                embedding: embeddings[i],
                                metadata: { ...parsedContent.metadata, slide: slide.slideIndex }
                            })
                        }
                    })
                }
            } else {
                console.log(`[Upload] No structured slides found. Fallback to naive global chunking.`)
                // Fallback for PDF/DOCX (treat as one big text for now)
                const chunks = chunkText(parsedContent.text)
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

                chunkRecords = chunks.map((chunk, i) => {
                    if (!embeddings[i]) return null
                    return {
                        deck_id: deck.id,
                        slide_number: i + 1, // Approximation
                        content: chunk,
                        embedding: embeddings[i],
                        metadata: parsedContent.metadata
                    }
                }).filter(r => r !== null)
            }

            console.log(`[Upload] Prepared ${chunkRecords.length} chunks for insertion.`)

            if (chunkRecords.length === 0) {
                // Warning but maybe not error if file was meaningless
                console.warn("No chunks to insert")
            } else {
                const { error: chunkError } = await supabase.from('slide_chunks').insert(chunkRecords)
                if (chunkError) {
                    console.error("Chunk Insert Error", chunkError)
                } else {
                    console.log(`[Upload] Successfully inserted ${chunkRecords.length} chunks.`)
                }
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
