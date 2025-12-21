'use client'

import * as React from 'react'
import { useParams } from 'next/navigation'
import { MessageBubble } from '@/components/chat/message-bubble'
import { ChatInput } from '@/components/chat/chat-input'
import { createClient } from '@/lib/supabase/client'
import { useQueryClient } from '@tanstack/react-query'

type Message = {
    id: string
    role: 'user' | 'assistant'
    content: string
    sources?: any[]
}

export default function ChatPage() {
    const params = useParams()
    const queryClient = useQueryClient()
    const [messages, setMessages] = React.useState<Message[]>([])
    const [loading, setLoading] = React.useState(false)
    const id = params.id as string

    // Fetch history on load
    React.useEffect(() => {
        const fetchMessages = async () => {
            setLoading(true)
            const supabase = createClient()
            try {
                const { data, error } = await supabase
                    .from('messages')
                    .select('*')
                    .eq('conversation_id', id)
                    .order('created_at', { ascending: true })

                if (error) throw error

                if (data) {
                    setMessages(data as Message[])
                }
            } catch (error) {
                console.error('Error fetching messages:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchMessages()
    }, [id])

    const handleSend = async (text: string, examMode: boolean) => {
        const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content: text }
        setMessages(prev => [...prev, userMsg])
        setLoading(true)

        // Create placeholder for AI response
        const aiMsgId = crypto.randomUUID()
        const initialAiMsg: Message = {
            id: aiMsgId,
            role: 'assistant',
            content: '',
            sources: undefined
        }
        setMessages(prev => [...prev, initialAiMsg])

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: text,
                    conversationId: id,
                    examMode
                })
            })

            if (!response.ok) throw new Error("Failed to fetch response")

            // 1. Extract Sources from Header immediately
            const sourcesHeader = response.headers.get('x-sources')
            let sources: any[] = []
            if (sourcesHeader) {
                try {
                    const jsonStr = atob(sourcesHeader)
                    sources = JSON.parse(jsonStr)
                    // Update message with sources immediately
                    setMessages(prev => prev.map(m =>
                        m.id === aiMsgId ? { ...m, sources: sources } : m
                    ))
                } catch (e) {
                    console.error("Failed to parse sources header", e)
                }
            }

            // 2. Stream the text
            const reader = response.body?.getReader()
            const decoder = new TextDecoder()

            if (!reader) throw new Error("No reader available")

            while (true) {
                const { done, value } = await reader.read()
                if (done) break

                const chunk = decoder.decode(value, { stream: true })

                setMessages(prev => prev.map(m =>
                    m.id === aiMsgId ? { ...m, content: m.content + chunk } : m
                ))
            }

            // Invalidate usage to update banner immediately
            await queryClient.invalidateQueries({ queryKey: ['usage'] })

        } catch (error) {
            console.error("Chat Error", error)
            // Show error toast
            // Remove the empty/partial AI message if it failed completely? 
            // Or leave it as error state.
            setMessages(prev => prev.map(m =>
                m.id === aiMsgId ? { ...m, content: m.content || "Sorry, something went wrong." } : m
            ))
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex flex-col h-[calc(100vh-theme(spacing.16))]">
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-3xl mx-auto py-6 space-y-6">
                    {messages.length === 0 && (
                        <div className="text-center text-muted-foreground mt-20">
                            <h2 className="text-2xl font-semibold mb-2">Start Studying</h2>
                            <p>Ask a question about your uploaded slides.</p>
                        </div>
                    )}

                    {messages.map(m => (
                        <MessageBubble key={m.id} role={m.role} content={m.content} sources={m.sources} />
                    ))}

                    {loading && (
                        <div className="flex justify-start px-4">
                            <div className="bg-muted h-8 w-24 rounded animate-pulse" />
                        </div>
                    )}
                </div>
            </div>
            <ChatInput onSend={handleSend} disabled={loading} />
        </div>
    )
}
