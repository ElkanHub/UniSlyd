'use client'

import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import { Trash2, MessageSquare, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { deleteDeck } from '@/lib/actions/deck-actions'
import { useToast } from '@/components/ui/use-toast'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface Deck {
    id: string
    filename: string
    page_count: number
    created_at: string
    original_file_url?: string
}

interface DeckCardProps {
    deck: Deck
    userTier: string
}

export function DeckCard({ deck, userTier }: DeckCardProps) {
    const { toast } = useToast()
    const [isDeleting, setIsDeleting] = useState(false)

    const isPro = userTier !== 'free'

    const handleDelete = async () => {
        setIsDeleting(true)
        try {
            await deleteDeck(deck.id)
            toast({
                title: "Deck deleted",
                description: "The deck has been removed from your library.",
            })
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to delete deck.",
                variant: "destructive",
            })
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <Card className="flex flex-col h-full hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-base font-medium truncate" title={deck.filename}>
                        {deck.filename}
                    </CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                </div>
                <CardDescription className="text-xs">
                    Uploaded {formatDistanceToNow(new Date(deck.created_at), { addSuffix: true })}
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow pb-2">
                <p className="text-sm text-muted-foreground">
                    {deck.page_count} {deck.page_count === 1 ? 'page' : 'pages'} / slides
                </p>
            </CardContent>
            <CardFooter className="pt-2 flex justify-between gap-2 border-t mt-auto">
                <Link href={`/dashboard/chat/new?deckId=${deck.id}`} className="w-full">
                    <Button variant="outline" size="sm" className="w-full gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Chat
                    </Button>
                </Link>

                {isPro ? (
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="icon" className="h-9 w-9 flex-shrink-0">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Delete this deck?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the deck and all associated chat history.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                                    {isDeleting ? "Deleting..." : "Delete"}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                ) : (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 flex-shrink-0 text-muted-foreground/50 hover:bg-transparent hover:text-muted-foreground/50 cursor-not-allowed"
                        title="Delete available on Pro plan. Files auto-deleted monthly on Free tier."
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                )}
            </CardFooter>
        </Card>
    )
}
