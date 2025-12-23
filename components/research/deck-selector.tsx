'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Check, Plus, X, FileText } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { updateResearchSession } from '@/app/actions/research'
import { cn } from '@/lib/utils'
import { ScrollArea } from "@/components/ui/scroll-area"

interface Deck {
    id: string
    filename: string
    // add other props if needed
}

interface DeckSelectorProps {
    sessionId: string
    initialSelectedDeckIds: string[]
    availableDecks: Deck[]
}

export function DeckSelector({ sessionId, initialSelectedDeckIds, availableDecks }: DeckSelectorProps) {
    const [selectedIds, setSelectedIds] = useState<string[]>(initialSelectedDeckIds)
    const [isOpen, setIsOpen] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    // Sync state if props change (unlikely in this flow but good practice)
    useEffect(() => {
        setSelectedIds(initialSelectedDeckIds)
    }, [initialSelectedDeckIds])

    const handleToggle = (id: string) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(d => d !== id))
        } else {
            setSelectedIds([...selectedIds, id])
        }
    }

    const handleSave = async () => {
        setIsSaving(true)
        try {
            await updateResearchSession(sessionId, { selected_deck_ids: selectedIds })
            setIsOpen(false)
        } catch (error) {
            console.error("Failed to save decks", error)
        } finally {
            setIsSaving(false)
        }
    }

    // Identify selected deck objects for display chips
    const selectedDecks = availableDecks.filter(d => selectedIds.includes(d.id))

    return (
        <div className="flex flex-col gap-2">
            <div className="flex flex-nowrap items-center gap-2 overflow-x-auto scrollbar-hide mask-fade-right">
                {selectedDecks.map(deck => (
                    <Badge key={deck.id} variant="secondary" className="pl-2 pr-1 h-7 text-xs flex items-center gap-1 shrink-0 max-w-[120px] md:max-w-[200px]">
                        <FileText className="w-3 h-3 opacity-70 shrink-0" />
                        <span className="truncate">{deck.filename}</span>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 ml-1 rounded-full hover:bg-muted-foreground/20 shrink-0"
                            onClick={() => {
                                // Immediate remove logic? Or just open modal?
                                // Let's do immediate optimistic update for UX
                                const newIds = selectedIds.filter(id => id !== deck.id)
                                setSelectedIds(newIds)
                                updateResearchSession(sessionId, { selected_deck_ids: newIds })
                            }}
                        >
                            <X className="w-2.5 h-2.5" />
                        </Button>
                    </Badge>
                ))}

                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="h-7 text-xs border-dashed gap-1 shrink-0">
                            <Plus className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Sources</span>
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Select Sources</DialogTitle>
                            <DialogDescription>
                                Choose which slide decks the AI should focus on.
                            </DialogDescription>
                        </DialogHeader>
                        <ScrollArea className="h-[300px] pr-4">
                            <div className="flex flex-col gap-2">
                                {availableDecks.length === 0 ? (
                                    <p className="text-sm text-muted-foreground text-center py-4">No decks available. Upload some first.</p>
                                ) : (
                                    availableDecks.map(deck => {
                                        const isSelected = selectedIds.includes(deck.id)
                                        return (
                                            <div
                                                key={deck.id}
                                                className={cn(
                                                    "flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all",
                                                    isSelected ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                                                )}
                                                onClick={() => handleToggle(deck.id)}
                                            >
                                                <div className="flex items-center gap-3 overflow-hidden">
                                                    <div className={cn("w-4 h-4 rounded border flex items-center justify-center transition-colors", isSelected ? "bg-primary border-primary" : "border-muted-foreground")}>
                                                        {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                                                    </div>
                                                    <span className="text-sm font-medium truncate">{deck.filename}</span>
                                                </div>
                                            </div>
                                        )
                                    })
                                )}
                            </div>
                        </ScrollArea>
                        <DialogFooter>
                            <Button onClick={handleSave} disabled={isSaving}>
                                {isSaving ? "Saving..." : "Done"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
            {selectedIds.length === 0 && (
                <p className="text-xs text-amber-600 dark:text-amber-500 font-medium animate-pulse">
                    ⚠ Please select a deck to enable AI assistance.
                </p>
            )}
        </div>
    )
}
