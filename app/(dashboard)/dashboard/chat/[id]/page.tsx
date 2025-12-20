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

            const data = await response.json()

            const aiMsg: Message = {
                id: crypto.randomUUID(),
                role: 'assistant',
                content: data.reply,
                sources: data.sources
            }
            setMessages(prev => [...prev, aiMsg])

            // Invalidate usage to update banner immediately
            await queryClient.invalidateQueries({ queryKey: ['usage'] })

        } catch (error) {
            console.error("Chat Error", error)
            // Show error toast
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
