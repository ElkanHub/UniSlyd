'use client'

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Sparkles, Loader2, StopCircle } from "lucide-react"
import { MessageBubble } from "@/components/chat/message-bubble"
import { cn } from "@/lib/utils"

interface Message {
    id?: string
    role: 'user' | 'assistant'
    content: string
    sources?: any[]
}

interface ResearchChatProps {
    sessionId: string
    initialMessages: Message[]
}

export function ResearchChat({ sessionId, initialMessages }: ResearchChatProps) {
    const [messages, setMessages] = useState<Message[]>(initialMessages)
    const [input, setInput] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)
    const abortControllerRef = useRef<AbortController | null>(null)

    // Scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault()
        if (!input.trim() || isLoading) return

        const userMessage = input.trim()
        setInput("")

        const newMessages: Message[] = [...messages, { role: 'user', content: userMessage }]
        setMessages(newMessages)
        setIsLoading(true)

        try {
            abortControllerRef.current = new AbortController()

            const response = await fetch('/api/research/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMessage, sessionId }),
                signal: abortControllerRef.current.signal
            })

            if (!response.ok) {
                const error = await response.json()
                const errorMsg = error.error || "Connection failed";
                setMessages(prev => [...prev, { role: 'assistant', content: `**Error**: ${errorMsg}` }])
                return;
            }

            const reader = response.body?.getReader()
            const sourcesHeader = response.headers.get('x-sources')
            const sources = sourcesHeader ? JSON.parse(atob(sourcesHeader)) : []

            let accumulatedResponse = ""
            setMessages(prev => [...prev, { role: 'assistant', content: "", sources: [] }])

            if (reader) {
                const decoder = new TextDecoder()
                while (true) {
                    const { done, value } = await reader.read()
                    if (done) break
                    const chunk = decoder.decode(value, { stream: true })
                    accumulatedResponse += chunk

                    setMessages(prev => {
                        const newArr = [...prev]
                        newArr[newArr.length - 1] = {
                            role: 'assistant',
                            content: accumulatedResponse,
                            sources: sources
                        }
                        return newArr
                    })
                }
            }

        } catch (error: any) {
            if (error.name === 'AbortError') {
                console.log('Stream aborted')
            } else {
                console.error('Chat error:', error)
                setMessages(prev => [...prev, { role: 'assistant', content: "An error occurred." }])
            }
        } finally {
            setIsLoading(false)
            abortControllerRef.current = null
        }
    }

    const handleStop = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort()
        }
    }

    return (
        <div className="flex flex-col h-full bg-background border-l min-w-0">
            <div className="p-3 border-b flex items-center justify-between bg-muted/20">
                <span className="text-sm font-semibold flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-500" />
                    Research Assistant
                </span>
            </div>

            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-4"
            >
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 text-muted-foreground opacity-50">
                        <Sparkles className="w-12 h-12 mb-2" />
                        <p className="text-sm">Ask questions based on your decks.</p>
                    </div>
                ) : (
                    messages.map((msg, i) => (
                        <MessageBubble
                            key={i}
                            role={msg.role}
                            content={msg.content}
                            sources={msg.sources}
                        />
                    ))
                )}
                {isLoading && messages[messages.length - 1]?.role === 'user' && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground p-2">
                        <Loader2 className="w-3 h-3 animate-spin" /> Thinking...
                    </div>
                )}
            </div>

            <div className="p-4 border-t bg-background">
                <form onSubmit={handleSubmit} className="relative">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask about this research..."
                        className="pr-12"
                        disabled={isLoading && !abortControllerRef.current}
                    />
                    {isLoading ? (
                        <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="absolute right-1 top-1 h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                            onClick={handleStop}
                        >
                            <StopCircle className="w-4 h-4" />
                        </Button>
                    ) : (
                        <Button
                            type="submit"
                            size="icon"
                            className="absolute right-1 top-1 h-8 w-8"
                            disabled={!input.trim()}
                        >
                            <Send className="w-4 h-4" />
                        </Button>
                    )}
                </form>
            </div>
        </div>
    )
}
