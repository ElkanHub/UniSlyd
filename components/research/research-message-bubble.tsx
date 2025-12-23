"use client";

import { cn, stripMarkdown } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Markdown } from "@/components/ui/markdown"
import { useState } from "react"
import { Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"


interface ResearchMessageBubbleProps {
    role: 'user' | 'assistant'
    content: string
    sources?: any[]
}

export function ResearchMessageBubble({ role, content, sources }: ResearchMessageBubbleProps) {
    const [isCopied, setIsCopied] = useState(false)

    const handleCopy = async () => {
        try {
            const cleanText = stripMarkdown(content)

            // Simple Markdown to HTML converter for clipboard
            // This ensures Tiptap receives HTML and can preserve formatting
            let htmlContent = content
                .replace(/^### (.*$)/gim, '<h3>$1</h3>')
                .replace(/^## (.*$)/gim, '<h2>$1</h2>')
                .replace(/^# (.*$)/gim, '<h1>$1</h1>')
                .replace(/\*\*(.*?)\*\*/gim, '<b>$1</b>')
                .replace(/\*(.*?)\*/gim, '<i>$1</i>')
                .replace(/\n/gim, '<br>')

            // Should be wrapped in a container
            htmlContent = `<div>${htmlContent}</div>`

            const blobHtml = new Blob([htmlContent], { type: "text/html" })
            const blobText = new Blob([cleanText], { type: "text/plain" })
            const data = [new ClipboardItem({
                ["text/html"]: blobHtml,
                ["text/plain"]: blobText
            })]

            await navigator.clipboard.write(data)
            setIsCopied(true)
            setTimeout(() => setIsCopied(false), 2000)
        } catch (err) {
            console.error('Failed to copy text: ', err)
            // Fallback
            try {
                await navigator.clipboard.writeText(content)
                setIsCopied(true)
                setTimeout(() => setIsCopied(false), 2000)
            } catch (e) {
                console.error("Fallback failed", e)
            }
        }
    }

    // Filter sources to only show those that are actually cited in the content
    // Citation format from backend: [Deck Name - Slide X]
    const usedSources = (sources && role === 'assistant') ? sources.filter(source => {
        // We check if the slide number is mentioned in the content in context of a citation
        // Simple heuristic: Look for "Slide X" or specific deck name
        // The backend format is strictly [DeckName - Slide X]
        const slideRefRegex = new RegExp(`Slide\\s+${source.slide_number}`, 'i')
        return slideRefRegex.test(content)
    }) : []

    // Deduplicate used sources
    const uniqueUsedSources = usedSources.filter((source, index, self) =>
        index === self.findIndex((t) => (
            t.deck_id === source.deck_id && t.slide_number === source.slide_number
        ))
    )

    return (
        <div className={cn(
            "flex w-full gap-4 p-4",
            role === 'assistant' ? "bg-muted/50" : ""
        )}>
            <Avatar className="h-8 w-8 border">
                <AvatarFallback>{role === 'user' ? 'U' : 'AI'}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                    <div className="font-semibold text-sm">
                        {role === 'user' ? 'You' : 'Unislyd'}
                    </div>
                    {role === 'assistant' && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-muted-foreground hover:text-foreground"
                            onClick={handleCopy}
                            title="Copy to clipboard"
                        >
                            {isCopied ? (
                                <Check className="h-3.5 w-3.5" />
                            ) : (
                                <Copy className="h-3.5 w-3.5" />
                            )}
                            <span className="sr-only">Copy message</span>
                        </Button>
                    )}
                </div>
                <div className="text-sm leading-relaxed text-foreground/90">
                    <Markdown>{content}</Markdown>
                </div>

                {/* Only show sources if we found them used in the text */}
                {uniqueUsedSources.length > 0 && (
                    <div className="mt-2 pt-2 border-t text-xs text-muted-foreground">
                        <p className="font-semibold mb-1">Sources Used:</p>
                        <div className="flex flex-col gap-1.5">
                            {Object.entries(uniqueUsedSources.reduce((acc: Record<string, number[]>, source) => {
                                const key = source.filename || 'Unknown File';
                                if (!acc[key]) acc[key] = [];
                                if (!acc[key].includes(source.slide_number)) {
                                    acc[key].push(source.slide_number);
                                }
                                return acc;
                            }, {})).map(([filename, slides], i) => (
                                <div key={i} className="text-xs text-muted-foreground">
                                    <span className="font-semibold text-primary/80 mr-1">[{filename}]:</span>
                                    <span>
                                        {(slides as number[]).sort((a, b) => a - b).map(num => `Slide ${num}`).join(', ')}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
