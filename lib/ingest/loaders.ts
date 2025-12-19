// @ts-ignore
// @ts-ignore
let pdf = require('pdf-parse/lib/pdf-parse.js')
// Handle ESM/CJS interop (Next.js sometimes wraps CJS in default)
if (pdf.default) pdf = pdf.default
// @ts-ignore
import pptx2json from 'pptx2json'
import mammoth from 'mammoth'
import { extractPptxText } from '@/lib/extractPptxText'

// Basic parser interface
export type ParsedContent = {
    text: string
    metadata?: Record<string, any>
    slides?: { slideIndex: number; text: string[] }[] // Added structured slides
}

export async function parseFile(file: File): Promise<ParsedContent> {
    const buffer = Buffer.from(await file.arrayBuffer())
    const type = file.type
    const name = file.name

    if (type === 'application/pdf' || name.endsWith('.pdf')) {
        return parsePDF(buffer)
    }
    if (type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || name.endsWith('.docx')) {
        return parseDOCX(buffer)
    }
    if (type === 'text/plain' || name.endsWith('.txt')) {
        return parseTXT(buffer)
    }
    if (type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' || name.endsWith('.pptx')) {
        return parsePPTX(buffer)
    }

    throw new Error(`Unsupported file type: ${type}`)
}

// @ts-ignore
import os from 'os'
// @ts-ignore
import fs from 'fs'
// @ts-ignore
import path from 'path'

// Helper cleaning function (still useful for PDF or general cleanup)
function cleanText(text: string): string {
    return text
        // Remove non-printable characters (keep newlines/tabs)
        .replace(/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F]/g, "")
        // Collapse multiple spaces/tabs into single space (but keep newlines)
        .replace(/[ \t]+/g, " ")
        // Remove weird excessive underscores or dashes often found in layouts
        .replace(/[_-]{3,}/g, " ")
        // Remove common placeholder text (case insensitive)
        .replace(/click to add (title|text|subtitle)/gi, "")
        .trim()
}

async function parsePDF(buffer: Buffer) {
    const data = await pdf(buffer)
    return {
        text: cleanText(data.text), // Still use basic cleaning for PDF
        metadata: {
            pages: data.numpages
        }
    }
}

async function parseDOCX(buffer: Buffer) {
    const result = await mammoth.extractRawText({ buffer })
    return {
        text: result.value,
        metadata: {}
    }
}

async function parseTXT(buffer: Buffer) {
    return {
        text: buffer.toString('utf-8'),
        metadata: {}
    }
}

async function parsePPTX(buffer: Buffer) {
    // pptx2json requires a file path, so we use a temp file
    const tempDir = os.tmpdir()
    const tempFilePath = path.join(tempDir, `upload-${Date.now()}.pptx`)

    try {
        fs.writeFileSync(tempFilePath, buffer)

        // Use the new robust extraction utility which returns structured slides
        const slides = await extractPptxText(tempFilePath)

        // Combine all text for the main "text" field
        // We preserve slide structure in the text by adding headers
        const fullText = slides.map(s =>
            `[Slide ${s.slideIndex}]\n${s.text.join('\n')}`
        ).join('\n\n')

        return {
            text: fullText,
            slides: slides, // Return structured data
            metadata: {
                pages: slides.length
            }
        }
    } catch (e) {
        console.error("PPTX Parsing failed", e)
        throw new Error("Failed to parse PPTX")
    } finally {
        // Cleanup temp file
        if (fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath)
        }
    }
}
