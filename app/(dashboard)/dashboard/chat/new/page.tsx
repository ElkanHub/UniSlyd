import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { v4 as uuidv4 } from 'uuid' // We'll rely on DB default or just random UUID here. 
// Note: UUID import might fail if not installed/typed. Let's use crypto.randomUUID()

export default async function NewChatPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    // Create a new conversation record
    const { data, error } = await supabase.from('conversations').insert({
        user_id: user.id,
        title: 'New Study Session'
    }).select('id').single()

    if (error || !data) {
        // Fallback if DB fails? Just go to dashboard
        redirect('/dashboard')
    }

    redirect(`/dashboard/chat/${data.id}`)
}
