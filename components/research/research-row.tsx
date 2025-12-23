"use client"

import { useState } from "react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { MoreVertical, FileText, Trash2, Edit2, BookOpen, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { deleteResearchSession, renameResearchSession } from "@/app/actions/research"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

// PDF generation will be handled in a separate utility or dynamically imported
// import { generatePDF } from "@/lib/pdf-utils" 

// Dynamic import of the downloader to avoid Turbopack/Build issues with @react-pdf/renderer
import dynamic from "next/dynamic"

const PdfDownloader = dynamic(() => import("./pdf-downloader"), {
    ssr: false,
    loading: () => <p className="hidden">Loading PDF module...</p>
})

interface ResearchRowProps {
    session: any
}

export function ResearchRow({ session }: ResearchRowProps) {
    const [isRenaming, setIsRenaming] = useState(false)
    const [newName, setNewName] = useState(session.title)
    const [isDeleting, setIsDeleting] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    // State to trigger the hidden downloader component
    const [isDownloading, setIsDownloading] = useState(false)

    const handleRename = async () => {
        if (!newName.trim() || newName === session.title) {
            setIsRenaming(false)
            return
        }
        setIsLoading(true)
        try {
            await renameResearchSession(session.id, newName)
            setIsRenaming(false)
        } catch (error) {
            console.error("Rename failed", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleDelete = async () => {
        setIsLoading(true)
        try {
            await deleteResearchSession(session.id)
            setIsDeleting(false)
        } catch (error) {
            console.error("Delete failed", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleDownload = () => {
        console.log("Download requested for:", session.title)
        toast.info("Generating PDF...")
        setIsDownloading(true)

        // Safety timeout in case the component fails to mount or crash without callback
        setTimeout(() => {
            setIsDownloading(prev => {
                if (prev) {
                    toast.error("PDF generation timed out. Please try again.")
                    return false
                }
                return prev
            })
        }, 15000)
    }

    const handleDownloadComplete = () => {
        console.log("Download complete callback received")
        toast.success("PDF Downloaded successfully")
        setIsDownloading(false)
    }

    const handleDownloadError = () => {
        console.log("Download error callback received")
        toast.error("Failed to generate PDF")
        setIsDownloading(false)
    }

    return (
        <div className="group flex items-center justify-between p-4 border rounded-lg bg-card hover:border-primary/50 hover:shadow-sm transition-all">
            <Link href={`/dashboard/research/${session.id}`} className="flex-1 flex max-w-[80%]">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate pr-4 text-base">{session.title}</h3>
                        <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                            <span>{session.selected_deck_ids?.length || 0} decks</span>
                            <span>•</span>
                            <span>Open {formatDistanceToNow(new Date(session.last_opened_at), { addSuffix: true })}</span>
                        </div>
                    </div>
                </div>
            </Link>

            <div className="flex items-center gap-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                            <MoreVertical className="w-4 h-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setIsRenaming(true)}>
                            <Edit2 className="w-4 h-4 mr-2" /> Rename
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href={`/dashboard/research/${session.id}/read`}>
                                <BookOpen className="w-4 h-4 mr-2" /> Read Mode
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleDownload}>
                            <Download className="w-4 h-4 mr-2" /> Download PDF
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => setIsDeleting(true)}
                        >
                            <Trash2 className="w-4 h-4 mr-2" /> Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Rename Dialog */}
            <Dialog open={isRenaming} onOpenChange={setIsRenaming}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Rename Session</DialogTitle>
                        <DialogDescription>Enter a new name for this research session.</DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Input
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            placeholder="Brief title"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleRename()
                            }}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsRenaming(false)}>Cancel</Button>
                        <Button onClick={handleRename} disabled={isLoading}>Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog open={isDeleting} onOpenChange={setIsDeleting}>
                {/* ... Dialog Content ... */}
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Session</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{session.title}"? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleting(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
                            {isLoading ? "Deleting..." : "Delete"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {isDownloading && (
                <PdfDownloader
                    session={session}
                    onComplete={handleDownloadComplete}
                    onError={handleDownloadError}
                />
            )}
        </div>
    )
}
