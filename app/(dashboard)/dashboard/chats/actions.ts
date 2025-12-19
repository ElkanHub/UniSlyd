'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function deleteChat(id: string) {
    const supabase = await createClient()

    try {
        const { error } = await supabase
            .from('conversations')
            .delete()
            .eq('id', id)

        if (error) throw error

        revalidatePath('/dashboard/chats')
        return { success: true }
    } catch (error) {
        console.error('Failed to delete chat:', error)
        return { success: false, error: 'Failed to delete chat' }
    }
}

export async function renameChat(id: string, newTitle: string) {
    const supabase = await createClient()

    try {
        const { error } = await supabase
            .from('conversations')
            .update({ title: newTitle })
            .eq('id', id)

        if (error) throw error

        revalidatePath('/dashboard/chats')
        return { success: true }
    } catch (error) {
        console.error('Failed to rename chat:', error)
        return { success: false, error: 'Failed to rename chat' }
    }
}
