'use client'

import * as React from 'react'
import { useDropzone } from 'react-dropzone'
import { UploadCloud, File, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function UploadZone() {
    const [files, setFiles] = React.useState<File[]>([])
    const [uploading, setUploading] = React.useState(false)

    const onDrop = React.useCallback((acceptedFiles: File[]) => {
        // Validate extensions extra strictly here if needed, though accept prop handles most
        setFiles((prev) => [...prev, ...acceptedFiles])
    }, [])

    const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
            'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
            'text/plain': ['.txt']
        },
        maxSize: 20 * 1024 * 1024, // 20MB
        maxFiles: 5
    })

    const removeFile = (index: number) => {
        setFiles((prev) => prev.filter((_, i) => i !== index))
    }

    const handleUpload = async () => {
        if (files.length === 0) return
        setUploading(true)

        // TODO: Implement actual upload logic to /api/upload
        // We will iterate and upload one by one or batch

        setTimeout(() => {
            setUploading(false)
            alert('Simulated Upload Complete')
            setFiles([])
        }, 2000)
    }

    return (
        <div className="w-full max-w-xl mx-auto space-y-6">
            <div
                {...getRootProps()}
                className={cn(
                    "border-2 border-dashed rounded-lg p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-colors",
                    isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"
                )}
            >
                <input {...getInputProps()} />
                <UploadCloud className="h-10 w-10 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">
                    {isDragActive ? "Drop files here" : "Drag & drop your slides"}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                    PDF, PPTX, DOCX, TXT (Max 20MB)
                </p>
            </div>

            {/* File List */}
            {files.length > 0 && (
                <div className="space-y-3">
                    {files.map((file, i) => (
                        <div key={i} className="flex items-center justify-between p-3 border rounded-md bg-card">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <File className="h-5 w-5 text-primary shrink-0" />
                                <span className="text-sm truncate">{file.name}</span>
                                <span className="text-xs text-muted-foreground">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                            </div>
                            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); removeFile(i); }}>
                                Remove
                            </Button>
                        </div>
                    ))}

                    <div className="flex justify-end pt-4">
                        <Button onClick={handleUpload} disabled={uploading}>
                            {uploading ? "Uploading..." : `Process ${files.length} Files`}
                        </Button>
                    </div>
                </div>
            )}

            {/* Errors */}
            {fileRejections.length > 0 && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    <span>Some files were rejected (wrong type or too large).</span>
                </div>
            )}
        </div>
    )
}
