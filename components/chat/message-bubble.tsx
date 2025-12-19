import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Markdown } from "@/components/ui/markdown" // We will need a markdown renderer, simple placeholder for now or use library

// Simple markdown renderer replacement for now until we install react-markdown
function SimpleMarkdown({ content }: { content: string }) {
    return <div className="whitespace-pre-wrap">{content}</div>
}

interface MessageBubbleProps {
    role: 'user' | 'assistant'
    content: string
    sources?: any[]
}

export function MessageBubble({ role, content, sources }: MessageBubbleProps) {
    return (
        <div className={cn(
            "flex w-full gap-4 p-4",
            role === 'assistant' ? "bg-muted/50" : ""
        )}>
            <Avatar className="h-8 w-8 border">
                <AvatarFallback>{role === 'user' ? 'U' : 'AI'}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
                <div className="font-semibold text-sm">
                    {role === 'user' ? 'You' : 'Unislyd'}
                </div>
                <div className="text-sm leading-relaxed text-foreground/90">
                    <SimpleMarkdown content={content} />
                </div>
                {sources && sources.length > 0 && (
                    <div className="mt-2 pt-2 border-t text-xs text-muted-foreground">
                        <p className="font-semibold mb-1">Sources:</p>
                        <div className="flex flex-wrap gap-2">
                            {sources.map((s, i) => (
                                <span key={i} className="bg-background border px-1.5 py-0.5 rounded">
                                    Slide {s.slide_number}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
