import React, { memo } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

interface MarkdownProps {
    children: string
    className?: string
}

const Markdown = memo(({ children, className = "" }: MarkdownProps) => {
    return (
        <div className={`prose dark:prose-invert max-w-none text-sm break-words ${className}`}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    a: ({ node, ...props }) => (
                        <a
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-primary underline underline-offset-4"
                            {...props}
                        />
                    ),
                    p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                    ul: ({ node, ...props }) => <ul className="my-2 ml-6 list-disc [&>li]:mt-1" {...props} />,
                    ol: ({ node, ...props }) => <ol className="my-2 ml-6 list-decimal [&>li]:mt-1" {...props} />,
                    code: ({ node, className, children, ...props }) => {
                        // Check if inline code by checking if children is a string and no newlines
                        // This is a bit simplistic but works for basic cases
                        const match = /language-(\w+)/.exec(className || "") // Removed unused 'inline' variable and fixed check
                        const isInline = !match

                        if (isInline) {
                            return (
                                <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-xs font-semibold" {...props}>
                                    {children}
                                </code>
                            )
                        }

                        return (
                            <pre className="mt-2 w-full overflow-x-auto rounded-lg bg-black/5 p-4 dark:bg-white/5">
                                <code className="relative font-mono text-xs" {...props}>
                                    {children}
                                </code>
                            </pre>
                        )
                    },
                }}
            >
                {children}
            </ReactMarkdown>
        </div>
    )
})

Markdown.displayName = "Markdown"

export { Markdown }
