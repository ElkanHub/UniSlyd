'use client'

import * as React from 'react'
import { Send, Sparkles, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

interface ChatInputProps {
    onSend: (message: string, examMode: boolean) => void
    disabled?: boolean
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
    const [input, setInput] = React.useState('')
    const [examMode, setExamMode] = React.useState(false)
    const [isCollapsed, setIsCollapsed] = React.useState(false)

    // Expand when typing starts
    React.useEffect(() => {
        if (input && isCollapsed) {
            setIsCollapsed(false)
        }
    }, [input, isCollapsed])

    const handleSend = () => {
        if (!input.trim()) return
        onSend(input, examMode)
        setInput('')
        // Optionally collapse after sending on mobile?
        // setIsCollapsed(true) 
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    return (
        <div className={cn(
            "border-t bg-background transition-all duration-300 ease-in-out",
            isCollapsed ? "p-2" : "p-4"
        )}>
            <div className="max-w-3xl mx-auto space-y-3 relative">
                {/* Collapse Toggle */}
                <div className="flex justify-center -mt-6 mb-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-12 rounded-full border bg-background shadow-sm hover:bg-muted"
                        onClick={() => setIsCollapsed(!isCollapsed)}
                    >
                        {isCollapsed ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    </Button>
                </div>

                {!isCollapsed && (
                    <div className="flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
                        <Button
                            variant={examMode ? "default" : "outline"}
                            size="sm"
                            onClick={() => setExamMode(!examMode)}
                            className={cn("gap-2 transition-all", examMode ? "bg-amber-500 hover:bg-amber-600 text-white border-amber-500" : "text-muted-foreground")}
                        >
                            <Sparkles className="w-4 h-4" />
                            {examMode ? "Exam Mode ON" : "Exam Mode"}
                        </Button>
                        <span className="text-xs text-muted-foreground hidden sm:inline-block">
                            {examMode ? "High-density facts & definitions." : "Standard study helper."}
                        </span>
                    </div>
                )}

                <div className="relative flex w-full">
                    <Textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={isCollapsed ? "Type to expand..." : "Ask a question about your slides..."}
                        className={cn(
                            "resize-none transition-all duration-300",
                            isCollapsed ? "min-h-[40px] h-10 py-2" : "min-h-[60px]"
                        )}
                        disabled={disabled}
                    />
                    <Button
                        onClick={handleSend}
                        disabled={disabled || !input.trim()}
                        className={cn(
                            "absolute right-2 transition-all",
                            isCollapsed ? "bottom-1 h-7 w-7" : "bottom-2 h-8 w-8"
                        )}
                        size="icon"
                    >
                        <Send className="w-4 h-4" />
                    </Button>
                </div>

                {!isCollapsed && (
                    <p className="text-xs text-center text-muted-foreground animate-in fade-in">
                        Unislyd can make mistakes. Check important info.
                    </p>
                )}
            </div>
        </div>
    )
}
