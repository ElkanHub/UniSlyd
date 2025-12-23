'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function getDecks() {
    const supabase = await createClient()
    // Try to fetch from 'decks' table. If it doesn't exist, we fallback to 'files' or similar based on APPDOC.
    // Based on previous context, 'decks' seems correct.
    const { data, error } = await supabase
        .from('decks')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        console.error("Failed to fetch decks", error)
        return []
    }
    return data
}

export async function createResearchSession(title: string = "Untitled Research") {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Check for Gold/Pro tier if strictly required, but for now we assume access control is handled via routes/middleware or UI
    // We can add a check here if needed.

    const { data, error } = await supabase
        .from('research_sessions')
        .insert({
            user_id: user.id,
            title: title,
        })
        .select()
        .single()

    if (error) {
        console.error("Failed to create research session", error)
        throw new Error("Failed to create research session")
    }

    revalidatePath('/dashboard/research')
    redirect(`/dashboard/research/${data.id}`)
}

export async function updateResearchSession(id: string, updates: any) {
    const supabase = await createClient()

    // Auto-update last_opened_at if not explicitly updating it, but usually updates imply activity
    // The timestamp trigger handles updated_at.

    // We might want to separate "content save" from "metadata update" if we want to be granular,
    // but a generic update is fine for now.

    const { error } = await supabase
        .from('research_sessions')
        .update(updates)
        .eq('id', id)

    if (error) {
        console.error("Failed to update research session", error)
        throw new Error("Failed to update research session")
    }

    revalidatePath(`/dashboard/research/${id}`)
    revalidatePath('/dashboard/research')
}

export async function deleteResearchSession(id: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('research_sessions')
        .delete()
        .eq('id', id)

    if (error) {
        console.error("Failed to delete research session", error)
        throw new Error("Failed to delete research session")
    }

    revalidatePath('/dashboard/research')
}

export async function searchResearchSessions({
    query = '',
    page = 1,
    limit = 15
}: {
    query?: string
    page?: number
    limit?: number
} = {}) {
    const supabase = await createClient()
    const offset = (page - 1) * limit

    let queryBuilder = supabase
        .from('research_sessions')
        .select('*', { count: 'exact' })
        .order('last_opened_at', { ascending: false })
        .range(offset, offset + limit - 1)

    if (query) {
        queryBuilder = queryBuilder.ilike('title', `%${query}%`)
    }

    const { data, error, count } = await queryBuilder

    if (error) {
        console.error("Failed to fetch sessions", error)
        return { data: [], total: 0 }
    }

    return { data, total: count || 0 }
}

export async function renameResearchSession(id: string, newTitle: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('research_sessions')
        .update({ title: newTitle })
        .eq('id', id)

    if (error) {
        console.error("Failed to rename session", error)
        throw new Error("Failed to rename session")
    }

    revalidatePath('/dashboard/research')
}

export async function getResearchSession(id: string) {
    const supabase = await createClient()

    // Also fetch the decks details if we need them, but the frontend might fetch decks separately.
    // Let's just return the session data.
    const { data, error } = await supabase
        .from('research_sessions')
        .select('*')
        .eq('id', id)
        .single()

    if (error) {
        console.error("Failed to fetch session", error)
        return null
    }

    return data
}

export async function getResearchMessages(sessionId: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('research_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true })

    if (error) {
        console.error("Failed to fetch messages", error)
        return []
    }

    return data
}
