'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { DeckSelector } from "@/components/research/deck-selector"
import { ResearchEditor } from "@/components/research/research-editor"
import { ResearchChat } from "@/components/research/research-chat"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { MessageSquare, Sparkles } from "lucide-react"

interface ResearchInterfaceProps {
    session: any
    messages: any[]
    decks: any[]
}

export function ResearchInterface({ session, messages, decks }: ResearchInterfaceProps) {
    const selectedDeckIds = (session.selected_deck_ids as string[]) || []
    const [isChatOpen, setIsChatOpen] = useState(false)

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Check for Ctrl+B or Cmd+B
            if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
                e.preventDefault()
                setIsChatOpen(prev => !prev)
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [])

    return (
        <div className="h-full flex flex-col w-full overflow-hidden relative">
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

                {/* Chat Toggle */}
                <Sheet open={isChatOpen} onOpenChange={setIsChatOpen}>
                    <SheetTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-2" title="Toggle Chat (Ctrl+B)">
                            <Sparkles className="w-4 h-4 text-purple-500" />
                            Research Assistant
                            <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100 sm:flex">
                                <span className="text-xs">⌘</span>B
                            </kbd>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-[90%] sm:max-w-[600px] p-0 flex flex-col gap-0 border-l">
                        <div className="flex flex-col h-full">
                            <SheetHeader className="px-4 py-3 border-b">
                                <SheetTitle className="text-base flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-purple-500" />
                                    Research Assistant
                                </SheetTitle>
                            </SheetHeader>
                            <div className="flex-1 min-h-0">
                                <ResearchChat
                                    sessionId={session.id}
                                    initialMessages={messages}
                                />
                            </div>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>

            {/* Main Area - Editor */}
            <div className="flex-1 w-full min-h-0 relative">
                <ResearchEditor
                    sessionId={session.id}
                    initialContent={session.editor_content}
                />
            </div>
        </div>
    )
}
