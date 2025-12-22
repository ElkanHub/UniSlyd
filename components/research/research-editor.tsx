'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { useEffect, useRef, useState } from 'react'
import { updateResearchSession } from '@/app/actions/research'
import { cn } from '@/lib/utils'

interface ResearchEditorProps {
    sessionId: string
    initialContent: any
}

export function ResearchEditor({ sessionId, initialContent }: ResearchEditorProps) {
    const [status, setStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved')
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)

    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder: 'Start writing your research paper here...',
            }),
        ],
        immediatelyRender: false,
        content: initialContent || {},
        editorProps: {
            attributes: {
                class: 'prose dark:prose-invert max-w-none focus:outline-none min-h-[calc(100vh-200px)] p-8',
            },
        },
        onUpdate: ({ editor }) => {
            setStatus('unsaved')

            // Debounce save
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }

            timeoutRef.current = setTimeout(async () => {
                setStatus('saving')
                const json = editor.getJSON()
                try {
                    await updateResearchSession(sessionId, { editor_content: json })
                    setStatus('saved')
                } catch (error) {
                    console.error("Failed to autosave", error)
                    setStatus('unsaved') // Keep retry state or error state
                }
            }, 1000) // 1 second debounce
        },
    })

    // Cleanup
    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current)
        }
    }, [])

    if (!editor) {
        return null
    }

    return (
        <div className="relative w-full h-full flex flex-col bg-background min-w-0">
            <div className="absolute top-4 right-4 z-10 text-xs text-muted-foreground transition-opacity duration-300">
                {status === 'saving' && 'Saving...'}
                {status === 'saved' && 'Saved'}
                {status === 'unsaved' && 'Unsaved changes'}
            </div>

            <div className="flex-1 overflow-y-auto w-full">
                {/* Toolbar could go here */}
                <div className="border-b p-2 flex flex-wrap gap-2 sticky top-0 bg-background/95 backdrop-blur z-10">
                    <button
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        disabled={!editor.can().chain().focus().toggleBold().run()}
                        className={cn("p-1.5 rounded hover:bg-muted font-bold w-8 text-sm", editor.isActive('bold') ? 'bg-muted text-primary' : '')}
                    >
                        B
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        disabled={!editor.can().chain().focus().toggleItalic().run()}
                        className={cn("p-1.5 rounded hover:bg-muted italic w-8 text-sm", editor.isActive('italic') ? 'bg-muted text-primary' : '')}
                    >
                        I
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                        className={cn("p-1.5 rounded hover:bg-muted font-bold w-8 text-sm", editor.isActive('heading', { level: 1 }) ? 'bg-muted text-primary' : '')}
                    >
                        H1
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                        className={cn("p-1.5 rounded hover:bg-muted font-bold w-8 text-sm", editor.isActive('heading', { level: 2 }) ? 'bg-muted text-primary' : '')}
                    >
                        H2
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        className={cn("p-1.5 rounded hover:bg-muted w-8 text-sm", editor.isActive('bulletList') ? 'bg-muted text-primary' : '')}
                    >
                        •
                    </button>
                </div>

                <div className="max-w-4xl mx-auto min-w-0">
                    <EditorContent editor={editor} />
                </div>
            </div>
        </div>
    )
}
