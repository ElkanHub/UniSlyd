'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function deleteDeck(deckId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Unauthorized')
    }

    // 1. Get the deck to find the storage path
    const { data: deck, error: fetchError } = await supabase
        .from('decks')
        .select('*')
        .eq('id', deckId)
        .single()

    if (fetchError || !deck) {
        throw new Error('Deck not found')
    }

    if (deck.user_id !== user.id) {
        throw new Error('Unauthorized')
    }

    // 2. Delete from Storage
    // content comes from original_file_url
    // e.g. https://xyz.supabase.co/storage/v1/object/public/decks/userid/timestamp.pptx
    // We need 'userid/timestamp.pptx'

    if (deck.original_file_url) {
        try {
            const url = new URL(deck.original_file_url)
            // Pathname is usually /storage/v1/object/public/decks/path/to/file
            // We want path/to/file
            const pathParts = url.pathname.split('/decks/')
            if (pathParts.length > 1) {
                const storagePath = pathParts[1]
                const { error: storageError } = await supabase
                    .storage
                    .from('decks')
                    .remove([decodeURIComponent(storagePath)])

                if (storageError) {
                    console.error("Failed to delete file from storage", storageError)
                    // Continue to delete DB record anyway? Yes, to avoid inconsistencies.
                }
            }
        } catch (e) {
            console.error("Error parsing storage URL", e)
        }
    }

    // 3. Delete from DB
    const { error: deleteError } = await supabase
        .from('decks')
        .delete()
        .eq('id', deckId)

    if (deleteError) {
        throw new Error('Failed to delete deck')
    }

    revalidatePath('/dashboard/decks')
    return { success: true }
}
