import { getResearchSession, getResearchMessages, getDecks } from "@/app/actions/research"
import { notFound } from "next/navigation"
import { DeckSelector } from "@/components/research/deck-selector"
import { ResearchEditor } from "@/components/research/research-editor"
import { ResearchChat } from "@/components/research/research-chat"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"

export const dynamic = 'force-dynamic'

interface PageProps {
    params: { id: string }
}

export default async function ResearchWorkspacePage({ params }: PageProps) {
    const { id } = await params
    const session = await getResearchSession(id)
    const messages = await getResearchMessages(id)
    const decks = await getDecks()

    if (!session) {
        notFound()
    }

    // Cast selected_deck_ids to string[] consistently
    const selectedDeckIds = (session.selected_deck_ids as string[]) || []

    return (
        <div className="h-full flex flex-col w-full overflow-hidden">
            {/* Top Bar */}
            <div className="border-b bg-background px-4 py-2 flex items-center justify-between shrink-0 h-14">
                <div className="flex items-center gap-4 overflow-hidden">
                    <h2 className="font-semibold truncate max-w-[200px]">{session.title}</h2>
                    <div className="h-4 w-px bg-border" />
                    <DeckSelector
                        sessionId={session.id}
                        initialSelectedDeckIds={selectedDeckIds}
                        availableDecks={decks || []}
                    />
                </div>
                {/* Actions like Export/Delete could go here */}
            </div>

            {/* Main Area */}
            <ResizablePanelGroup direction="horizontal" className="flex-1 w-full">
                <ResizablePanel defaultSize={60} minSize={20}>
                    <ResearchEditor
                        sessionId={session.id}
                        initialContent={session.editor_content}
                    />
                </ResizablePanel>

                <ResizableHandle withHandle />

                <ResizablePanel defaultSize={40} minSize={20} maxSize={80}>
                    <ResearchChat
                        sessionId={session.id}
                        initialMessages={messages as any[]} // cast role or type
                    />
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    )
}
