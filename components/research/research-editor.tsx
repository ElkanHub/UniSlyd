'use client'

import { useEffect, useRef, useState } from 'react'
import { updateResearchSession } from '@/app/actions/research'
import { RichTextEditor } from '@/components/editor/rich-text-editor'

interface ResearchEditorProps {
    sessionId: string
    initialContent: any
}

export function ResearchEditor({ sessionId, initialContent }: ResearchEditorProps) {
    const [status, setStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved')
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)

    const handleContentChange = (content: any) => {
        setStatus('unsaved')

        // Debounce save
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
        }

        timeoutRef.current = setTimeout(async () => {
            setStatus('saving')
            try {
                await updateResearchSession(sessionId, { editor_content: content })
                setStatus('saved')
            } catch (error) {
                console.error("Failed to autosave", error)
                setStatus('unsaved')
            }
        }, 1000) // 1 second debounce
    }

    // Cleanup
    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current)
        }
    }, [])

    return (
        <div className="relative w-full h-full flex flex-col bg-background min-w-0">
            <div className="absolute top-4 right-4 z-10 text-xs text-muted-foreground transition-opacity duration-300">
                {status === 'saving' && 'Saving...'}
                {status === 'saved' && 'Saved'}
                {status === 'unsaved' && 'Unsaved changes'}
            </div>

            <div className="flex-1 overflow-y-auto w-full">
                <div className="max-w-4xl mx-auto min-w-0 h-full">
                    <RichTextEditor
                        content={initialContent || {}}
                        onChange={handleContentChange}
                        placeholder="Start writing your research paper here..."
                        className="h-full border-border"
                    />
                </div>
            </div>
        </div>
    )
}
