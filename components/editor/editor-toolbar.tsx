"use client"

import { Editor } from "@tiptap/react"
import {
    Bold,
    Italic,
    Underline,
    Strikethrough,
    AlignLeft,
    AlignCenter,
    AlignRight,
    AlignJustify,
    List,
    ListOrdered,
    CheckSquare,
    Highlighter,
    Type,
    Link as LinkIcon,
    Image as ImageIcon,
    Table as TableIcon,
    Undo,
    Redo,
    RemoveFormatting,
    Heading1,
    Heading2,
    Heading3,
    Youtube,
    Columns,
    Rows,
    Trash2,
    Merge,
    Split
} from "lucide-react"
import { Toggle } from "@/components/ui/toggle"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { useState } from "react"

interface EditorToolbarProps {
    editor: Editor
}

export function EditorToolbar({ editor }: EditorToolbarProps) {
    if (!editor) {
        return null
    }

    const setLink = () => {
        const previousUrl = editor.getAttributes("link").href
        const url = window.prompt("URL", previousUrl)

        // cancelled
        if (url === null) {
            return
        }

        // empty
        if (url === "") {
            editor.chain().focus().extendMarkRange("link").unsetLink().run()
            return
        }

        // update
        editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run()
    }

    const addImage = () => {
        const url = window.prompt("Image URL")

        if (url) {
            editor.chain().focus().setImage({ src: url }).run()
        }
    }

    const addYoutube = () => {
        const url = window.prompt("YouTube URL")

        if (url) {
            editor.commands.setYoutubeVideo({
                src: url,
            })
        }
    }

    return (
        <div className="border-b p-2 flex flex-wrap gap-1 sticky top-0 bg-background/95 backdrop-blur z-10 items-center">
            {/* History */}
            <div className="flex items-center gap-1 mr-2">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().chain().focus().undo().run()}
                    className="h-8 w-8"
                >
                    <Undo className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().chain().focus().redo().run()}
                    className="h-8 w-8"
                >
                    <Redo className="h-4 w-4" />
                </Button>
            </div>

            <Separator orientation="vertical" className="h-6 mx-1" />

            {/* Typography */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 gap-1">
                        <Type className="h-4 w-4" />
                        <span className="text-xs">Text</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem
                        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                        className={editor.isActive("heading", { level: 1 }) ? "bg-accent" : ""}
                    >
                        <Heading1 className="h-4 w-4 mr-2" />
                        Heading 1
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                        className={editor.isActive("heading", { level: 2 }) ? "bg-accent" : ""}
                    >
                        <Heading2 className="h-4 w-4 mr-2" />
                        Heading 2
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                        className={editor.isActive("heading", { level: 3 }) ? "bg-accent" : ""}
                    >
                        <Heading3 className="h-4 w-4 mr-2" />
                        Heading 3
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => editor.chain().focus().setParagraph().run()}
                        className={editor.isActive("paragraph") ? "bg-accent" : ""}
                    >
                        <Type className="h-4 w-4 mr-2" />
                        Paragraph
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Basic Formatting */}
            <Toggle
                size="sm"
                pressed={editor.isActive("bold")}
                onPressedChange={() => editor.chain().focus().toggleBold().run()}
                className="h-8 w-8 p-0"
            >
                <Bold className="h-4 w-4" />
            </Toggle>
            <Toggle
                size="sm"
                pressed={editor.isActive("italic")}
                onPressedChange={() => editor.chain().focus().toggleItalic().run()}
                className="h-8 w-8 p-0"
            >
                <Italic className="h-4 w-4" />
            </Toggle>
            <Toggle
                size="sm"
                pressed={editor.isActive("underline")}
                onPressedChange={() => editor.chain().focus().toggleUnderline().run()}
                className="h-8 w-8 p-0"
            >
                <Underline className="h-4 w-4" />
            </Toggle>
            <Toggle
                size="sm"
                pressed={editor.isActive("strike")}
                onPressedChange={() => editor.chain().focus().toggleStrike().run()}
                className="h-8 w-8 p-0"
            >
                <Strikethrough className="h-4 w-4" />
            </Toggle>
            <Toggle
                size="sm"
                pressed={editor.isActive("highlight")}
                onPressedChange={() => editor.chain().focus().toggleHighlight().run()}
                className="h-8 w-8 p-0"
            >
                <Highlighter className="h-4 w-4" />
            </Toggle>

            <Separator orientation="vertical" className="h-6 mx-1" />

            {/* Alignment */}
            <Toggle
                size="sm"
                pressed={editor.isActive({ textAlign: "left" })}
                onPressedChange={() => editor.chain().focus().setTextAlign("left").run()}
                className="h-8 w-8 p-0"
            >
                <AlignLeft className="h-4 w-4" />
            </Toggle>
            <Toggle
                size="sm"
                pressed={editor.isActive({ textAlign: "center" })}
                onPressedChange={() => editor.chain().focus().setTextAlign("center").run()}
                className="h-8 w-8 p-0"
            >
                <AlignCenter className="h-4 w-4" />
            </Toggle>
            <Toggle
                size="sm"
                pressed={editor.isActive({ textAlign: "right" })}
                onPressedChange={() => editor.chain().focus().setTextAlign("right").run()}
                className="h-8 w-8 p-0"
            >
                <AlignRight className="h-4 w-4" />
            </Toggle>
            <Toggle
                size="sm"
                pressed={editor.isActive({ textAlign: "justify" })}
                onPressedChange={() => editor.chain().focus().setTextAlign("justify").run()}
                className="h-8 w-8 p-0"
            >
                <AlignJustify className="h-4 w-4" />
            </Toggle>

            <Separator orientation="vertical" className="h-6 mx-1" />

            {/* Lists */}
            <Toggle
                size="sm"
                pressed={editor.isActive("bulletList")}
                onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
                className="h-8 w-8 p-0"
            >
                <List className="h-4 w-4" />
            </Toggle>
            <Toggle
                size="sm"
                pressed={editor.isActive("orderedList")}
                onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
                className="h-8 w-8 p-0"
            >
                <ListOrdered className="h-4 w-4" />
            </Toggle>
            <Toggle
                size="sm"
                pressed={editor.isActive("taskList")}
                onPressedChange={() => editor.chain().focus().toggleTaskList().run()}
                className="h-8 w-8 p-0"
            >
                <CheckSquare className="h-4 w-4" />
            </Toggle>

            <Separator orientation="vertical" className="h-6 mx-1" />

            {/* Insert */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 px-2 gap-1">
                        Insert
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem onClick={setLink}>
                        <LinkIcon className="h-4 w-4 mr-2" />
                        Link
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={addImage}>
                        <ImageIcon className="h-4 w-4 mr-2" />
                        Image
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={addYoutube}>
                        <Youtube className="h-4 w-4 mr-2" />
                        YouTube
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
                    >
                        <TableIcon className="h-4 w-4 mr-2" />
                        Table
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Table Controls (only show when table is active) */}
            {editor.isActive("table") && (
                <>
                    <Separator orientation="vertical" className="h-6 mx-1" />
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 px-2 gap-1 text-blue-500">
                                <TableIcon className="h-4 w-4" />
                                Table
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => editor.chain().focus().addColumnBefore().run()}>
                                <Columns className="h-4 w-4 mr-2" /> Add Col Before
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => editor.chain().focus().addColumnAfter().run()}>
                                <Columns className="h-4 w-4 mr-2" /> Add Col After
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => editor.chain().focus().deleteColumn().run()}>
                                <Trash2 className="h-4 w-4 mr-2" /> Delete Col
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => editor.chain().focus().addRowBefore().run()}>
                                <Rows className="h-4 w-4 mr-2" /> Add Row Before
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => editor.chain().focus().addRowAfter().run()}>
                                <Rows className="h-4 w-4 mr-2" /> Add Row After
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => editor.chain().focus().deleteRow().run()}>
                                <Trash2 className="h-4 w-4 mr-2" /> Delete Row
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => editor.chain().focus().mergeCells().run()}>
                                <Merge className="h-4 w-4 mr-2" /> Merge Cells
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => editor.chain().focus().splitCell().run()}>
                                <Split className="h-4 w-4 mr-2" /> Split Cell
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => editor.chain().focus().deleteTable().run()} className="text-destructive">
                                <Trash2 className="h-4 w-4 mr-2" /> Delete Table
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </>
            )}

            <div className="flex-1" />

            {/* Cleanup */}
            <Button
                variant="ghost"
                size="icon"
                onClick={() => editor.chain().focus().unsetAllMarks().run()}
                title="Clear Formatting"
                className="h-8 w-8"
            >
                <RemoveFormatting className="h-4 w-4" />
            </Button>
        </div>
    )
}
