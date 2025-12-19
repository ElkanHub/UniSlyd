import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ChatList } from '@/components/dashboard/chat-list'

export default async function ChatsPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const awaitedSearchParams = await searchParams
    const page = Number(awaitedSearchParams.page) || 1
    const pageSize = 15
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    // Fetch total count
    const { count } = await supabase
        .from('conversations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

    // Fetch paginated conversations
    const { data: conversations, error } = await supabase
        .from('conversations')
        .select('id, title, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range(from, to)

    if (error) {
        console.error('Failed to fetch chats:', error)
        return (
            <div className="p-8 text-center text-destructive">
                Failed to load chats. Please try again later.
            </div>
        )
    }

    const totalPages = count ? Math.ceil(count / pageSize) : 0

    return (
        <div className="container max-w-5xl py-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Your Conversations</h1>
                    <p className="text-muted-foreground mt-2">
                        Browse and manage your study sessions and chat history.
                    </p>
                </div>
            </div>

            <ChatList
                initialChats={conversations || []}
                totalPages={totalPages}
                currentPage={page}
            />
        </div>
    )
}
