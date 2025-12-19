'use client'

import * as React from 'react'
import { Send, Sparkles } from 'lucide-react'
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

    const handleSend = () => {
        if (!input.trim()) return
        onSend(input, examMode)
        setInput('')
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    return (
        <div className="p-4 border-t bg-background">
            <div className="max-w-3xl mx-auto space-y-3">
                <div className="flex items-center gap-2">
                    <Button
                        variant={examMode ? "default" : "outline"}
                        size="sm"
                        onClick={() => setExamMode(!examMode)}
                        className={cn("gap-2 transition-all", examMode ? "bg-amber-500 hover:bg-amber-600 text-white border-amber-500" : "text-muted-foreground")}
                    >
                        <Sparkles className="w-4 h-4" />
                        {examMode ? "Exam Mode ON" : "Exam Mode"}
                    </Button>
                    <span className="text-xs text-muted-foreground">
                        {examMode ? "High-density facts & definitions." : "Standard study helper."}
                    </span>
                </div>

                <div className="relative flex w-full">
                    <Textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask a question about your slides..."
                        className="min-h-[60px] resize-none"
                        disabled={disabled}
                    />
                    <Button
                        onClick={handleSend}
                        disabled={disabled || !input.trim()}
                        className="absolute right-2 bottom-2 h-8 w-8 p-0"
                    >
                        <Send className="w-4 h-4" />
                    </Button>
                </div>
                <p className="text-xs text-center text-muted-foreground">
                    Unislyd can make mistakes. Check important info.
                </p>
            </div>
        </div>
    )
}
