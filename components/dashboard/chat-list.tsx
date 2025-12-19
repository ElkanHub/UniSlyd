'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { Search, MoreVertical, Trash2, Edit2, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { deleteChat, renameChat } from '@/app/(dashboard)/dashboard/chats/actions'
import { toast } from 'sonner'

interface Chat {
    id: string
    title: string
    created_at: string
    last_message_at?: string
}

export function ChatList({
    initialChats,
    totalPages = 1,
    currentPage = 1
}: {
    initialChats: Chat[]
    totalPages?: number
    currentPage?: number
}) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '')

    // Dialog states
    const [isRenameOpen, setIsRenameOpen] = useState(false)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
    const [newTitle, setNewTitle] = useState('')

    const filteredChats = initialChats.filter(chat =>
        chat.title.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleSearch = (term: string) => {
        setSearchTerm(term)
        const params = new URLSearchParams(searchParams)
        if (term) {
            params.set('search', term)
            params.set('page', '1') // Reset to page 1 on search
        } else {
            params.delete('search')
            // keep current page or reset? usually reset makes sense if clearing search
            params.set('page', '1')
        }
        router.replace(`/dashboard/chats?${params.toString()}`)
    }

    const handlePageChange = (page: number) => {
        const params = new URLSearchParams(searchParams)
        params.set('page', page.toString())
        router.push(`/dashboard/chats?${params.toString()}`)
    }

    const handleDelete = async () => {
        if (!selectedChat) return
        const result = await deleteChat(selectedChat.id)
        if (result.success) {
            toast.success('Chat deleted')
            router.refresh()
            setIsDeleteOpen(false)
        } else {
            toast.error('Failed to delete chat')
        }
    }

    const handleRename = async () => {
        if (!selectedChat) return
        const result = await renameChat(selectedChat.id, newTitle)
        if (result.success) {
            toast.success('Chat renamed')
            router.refresh()
            setIsRenameOpen(false)
        } else {
            toast.error('Failed to rename chat')
        }
    }

    const openRename = (chat: Chat) => {
        setSelectedChat(chat)
        setNewTitle(chat.title)
        setIsRenameOpen(true)
    }

    const openDelete = (chat: Chat) => {
        setSelectedChat(chat)
        setIsDeleteOpen(true)
    }

    return (
        <div className="space-y-4">
            <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search chats..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-9 bg-background"
                />
            </div>

            <div className="rounded-md border bg-card">
                {filteredChats.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                        No chats found.
                    </div>
                ) : (
                    <div className="divide-y">
                        {filteredChats.map((chat) => (
                            <div key={chat.id} className="flex items-center justify-between p-4 hover:bg-accent/50 transition-colors">
                                <Link href={`/dashboard/chat/${chat.id}`} className="flex items-center gap-4 flex-1 min-w-0">
                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                        <MessageSquare className="h-5 w-5 text-primary" />
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="font-semibold truncate text-foreground">{chat.title || 'Untitled Chat'}</h3>
                                        <p className="text-sm text-muted-foreground">
                                            {format(new Date(chat.created_at), 'MMM d, yyyy')}
                                        </p>
                                    </div>
                                </Link>

                                <div className="ml-4">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <MoreVertical className="h-4 w-4" />
                                                <span className="sr-only">Open menu</span>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => openRename(chat)}>
                                                <Edit2 className="mr-2 h-4 w-4" /> Rename
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => openDelete(chat)} className="text-destructive focus:text-destructive">
                                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-end space-x-2 py-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage <= 1}
                    >
                        Previous
                    </Button>
                    <div className="text-sm text-muted-foreground">
                        Page {currentPage} of {totalPages}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage >= totalPages}
                    >
                        Next
                    </Button>
                </div>
            )}

            {/* Rename Dialog */}
            <Dialog open={isRenameOpen} onOpenChange={setIsRenameOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Rename Chat</DialogTitle>
                        <DialogDescription>
                            Enter a new title for this conversation.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Input
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            placeholder="Chat title"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleRename()
                            }}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsRenameOpen(false)}>Cancel</Button>
                        <Button onClick={handleRename}>Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Chat</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this chat? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDelete}>Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
