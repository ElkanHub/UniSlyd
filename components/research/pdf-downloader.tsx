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
            try {
                const blob = await pdf(<ResearchDocument session={session} />).toBlob()
                const url = URL.createObjectURL(blob)
                const link = document.createElement('a')
                link.href = url
                link.download = `${session.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'research'}.pdf`
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
                URL.revokeObjectURL(url)

                onComplete()
            } catch (error) {
                console.error("PDF Generation Error", error)
                onError()
            }
        }

        generate()
    }, [session, onComplete, onError])

    return null
}
