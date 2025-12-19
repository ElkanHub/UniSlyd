import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'


// Note: In Next.js 15 app dir, searchParams is a Promise
export default async function NewChatPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const { deckId } = await searchParams

    // Create a new conversation record
    const { data, error } = await supabase.from('conversations').insert({
        user_id: user.id,
        title: deckId ? 'Study Session' : 'New Study Session',
        deck_id: deckId || null // Link the deck
    }).select('id').single()

    if (error || !data) {
        // Fallback if DB fails? Just go to dashboard
        console.error("Failed to create conversation", error)
        redirect('/dashboard')
    }

    redirect(`/dashboard/chat/${data.id}`)
}
