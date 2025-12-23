"use client"

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { Underline } from '@tiptap/extension-underline'
import { TextAlign } from '@tiptap/extension-text-align'
import { Image } from '@tiptap/extension-image'
import { Link } from '@tiptap/extension-link'
import { Youtube } from '@tiptap/extension-youtube'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import { Highlight } from '@tiptap/extension-highlight'
import { FontFamily } from '@tiptap/extension-font-family'
import { TaskList } from '@tiptap/extension-task-list'
import { TaskItem } from '@tiptap/extension-task-item'
import { EditorToolbar } from './editor-toolbar'
import { cn } from '@/lib/utils'

interface RichTextEditorProps {
    content: any
    onChange: (content: any) => void
    placeholder?: string
    readOnly?: boolean
}

export function RichTextEditor({ content, onChange, placeholder, className, readOnly = false }: RichTextEditorProps) {
    const editor = useEditor({
        editable: !readOnly,
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder: placeholder || 'Start writing...',
            }),
            Underline,
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            Image,
            Link.configure({
                openOnClick: false,
            }),
            Youtube.configure({
                controls: false,
            }),
            Table.configure({
                resizable: true,
            }),
            TableRow,
            TableHeader,
            TableCell,
            TextStyle,
            Color,
            Highlight.configure({}),
            FontFamily,
            TaskList,
            TaskItem.configure({
                nested: true,
            }),
        ],
        immediatelyRender: false,
        content: content,
        editorProps: {
            attributes: {
                class: 'prose dark:prose-invert max-w-none focus:outline-none min-h-full p-4',
            },
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getJSON())
        },
    })

    if (!editor) {
        return null
    }

    return (
        <div className={cn("border rounded-md overflow-hidden bg-background flex flex-col", className)}>
            {!readOnly && <EditorToolbar editor={editor} />}
            <div className="flex-1 overflow-y-auto">
                <EditorContent editor={editor} />
            </div>
        </div>
    )
}
