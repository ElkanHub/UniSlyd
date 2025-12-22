import { getResearchSessions, createResearchSession } from "@/app/actions/research"
import { Button } from "@/components/ui/button"
import { Plus, BookOpen, Clock } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

export const dynamic = 'force-dynamic'

export default async function ResearchDashboard() {
    const sessions = await getResearchSessions()

    return (
        <div className="flex-1 w-full flex flex-col p-6 h-full overflow-hidden">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Research Zone</h1>
                    <p className="text-muted-foreground mt-1">
                        Deep dive into your decks with focused AI assistance and rich note-taking.
                    </p>
                </div>
                <form action={async () => {
                    'use server'
                    await createResearchSession()
                }}>
                    <Button type="submit">
                        <Plus className="w-4 h-4 mr-2" />
                        New Research
                    </Button>
                </form>
            </div>

            {sessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center flex-1 border rounded-xl border-dashed bg-muted/40 p-8 text-center animate-in fade-in-50">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-accent/50 mb-4">
                        <BookOpen className="h-10 w-10 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold">No research sessions yet</h3>
                    <p className="text-muted-foreground max-w-sm mt-2 mb-6">
                        Start a new session to combine multiple slide decks and write comprehensive papers.
                    </p>
                    <form action={async () => {
                        'use server'
                        await createResearchSession()
                    }}>
                        <Button size="lg">Create your first session</Button>
                    </form>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto pb-10 flex-1 min-h-0">
                    {sessions.map((session: any) => (
                        <Link key={session.id} href={`/dashboard/research/${session.id}`}>
                            <div className="group relative flex flex-col justify-between rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/50 cursor-pointer h-[200px]">
                                <div className="space-y-2">
                                    <h3 className="font-semibold leading-none tracking-tight group-hover:text-primary transition-colors text-lg truncate">
                                        {session.title}
                                    </h3>
                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                        {session.selected_deck_ids?.length || 0} decks selected
                                    </p>
                                </div>
                                <div className="flex items-center text-xs text-muted-foreground mt-4">
                                    <Clock className="w-3.5 h-3.5 mr-1" />
                                    <span>Opened {formatDistanceToNow(new Date(session.last_opened_at), { addSuffix: true })}</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}
