import { createClient } from '@/lib/supabase/server'
import { UploadZone } from '@/components/dashboard/upload-zone'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { FileText, MessageSquare, Plus } from 'lucide-react'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    // Fetch Decks
    const { data: decks } = await supabase
        .from('decks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    // Fetch Conversations (Recent)
    const { data: conversations } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5)

    return (
        <div className="space-y-8">
            <section className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tight">Your Library</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    <div className="col-span-4 p-6 border rounded-xl bg-card shadow-sm">
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                            <Plus className="w-4 h-4 text-primary" />
                            Upload New Slides
                        </h3>
                        <UploadZone />
                    </div>

                    <div className="col-span-3 space-y-4">
                        <div className="p-6 border rounded-xl bg-card shadow-sm h-full">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold mb-4">Recent Decks</h3>
                                <Link href="/dashboard/decks">
                                    <Button size="sm" className="ml-auto">View All</Button>
                                </Link>
                            </div>
                            <div className="space-y-3">
                                {decks?.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">No slides uploaded yet.</p>
                                ) : (
                                    decks?.map((deck) => (
                                        <div key={deck.id} className="flex items-center justify-between group">
                                            <div className="flex items-center gap-2 overflow-hidden">
                                                <FileText className="w-4 h-4 text-primary flex-shrink-0" />
                                                <span className="text-sm truncate max-w-[150px]">{deck.filename}</span>
                                            </div>
                                            {/* Chat button */}
                                            <Link href={`/dashboard/chat/${deck.id}`}>
                                                <Button variant="outline" size="sm" className="ml-auto">Chat</Button>
                                            </Link>
                                            <span className="text-xs text-muted-foreground">{deck.page_count} pgs</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold tracking-tight">Recent Study Sessions</h2>
                    <Link href="/dashboard/chat/new">
                        <Button size="sm">New Session</Button>
                    </Link>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {conversations?.length === 0 ? (
                        <div className="col-span-full p-8 border border-dashed rounded-lg text-center text-muted-foreground">
                            No conversations yet. Start a new session!
                        </div>
                    ) : (
                        conversations?.map((conv) => (
                            <Link key={conv.id} href={`/dashboard/chat/${conv.id}`}>
                                <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer space-y-2">
                                    <div className="flex items-center gap-2">
                                        <MessageSquare className="w-4 h-4 text-primary" />
                                        <h4 className="font-medium truncate">{conv.title}</h4>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {new Date(conv.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </section>
        </div>
    )
}
