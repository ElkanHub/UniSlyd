"use client";

import { cn, stripMarkdown } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Markdown } from "@/components/ui/markdown"
import { useState } from "react"
import { Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"


interface MessageBubbleProps {
    role: 'user' | 'assistant'
    content: string
    sources?: any[]
}

export function MessageBubble({ role, content, sources }: MessageBubbleProps) {
    const [isCopied, setIsCopied] = useState(false)

    const handleCopy = async () => {
        try {
            const cleanText = stripMarkdown(content)
            await navigator.clipboard.writeText(cleanText)
            setIsCopied(true)
            setTimeout(() => setIsCopied(false), 2000)
        } catch (err) {
            console.error('Failed to copy text: ', err)
        }
    }

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
                {sources && sources.length > 0 && (
                    <div className="mt-2 pt-2 border-t text-xs text-muted-foreground">
                        <p className="font-semibold mb-1">Sources:</p>
                        <div className="flex flex-col gap-1.5">
                            {Object.entries((sources || []).reduce((acc: Record<string, number[]>, source) => {
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
