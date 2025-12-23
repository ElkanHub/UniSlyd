"use client"

import { useEffect } from 'react'
import { pdf } from '@react-pdf/renderer'
import { ResearchDocument } from './pdf-document'
import { toast } from 'sonner'

interface PdfDownloaderProps {
    session: any
    onComplete: () => void
    onError: () => void
}

export default function PdfDownloader({ session, onComplete, onError }: PdfDownloaderProps) {
    useEffect(() => {
        const generate = async () => {
            console.log("Starting PDF generation for session:", session?.id)
            try {
                if (!session) throw new Error("No session provided")
                if (!session.editor_content) console.warn("Session has no editor content")

                console.log("Generating blob...")
                const instance = pdf(<ResearchDocument session={session} />)
                const blob = await instance.toBlob()
                console.log("Blob generated", blob.size)

                const url = URL.createObjectURL(blob)
                const link = document.createElement('a')
                link.href = url
                link.download = `${session.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'research'}.pdf`
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
                URL.revokeObjectURL(url)

                console.log("Download triggered")
                onComplete()
            } catch (error) {
                console.error("PDF Generation Detailed Error:", error)
                if (error instanceof Error) {
                    console.error("Message:", error.message)
                    console.error("Stack:", error.stack)
                }
                onError()
            }
        }

        generate()
    }, [session, onComplete, onError])

    return null
}
