// @ts-ignore
// @ts-ignore
let pdf = require('pdf-parse/lib/pdf-parse.js')
// Handle ESM/CJS interop (Next.js sometimes wraps CJS in default)
if (pdf.default) pdf = pdf.default
// @ts-ignore
import pptx2json from 'pptx2json'
import mammoth from 'mammoth'

// Basic parser interface
export type ParsedContent = {
    text: string
    metadata?: Record<string, any>
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

async function parsePDF(buffer: Buffer) {
    const data = await pdf(buffer)
    return {
        text: cleanText(data.text),
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

// @ts-ignore
import os from 'os'
// @ts-ignore
import fs from 'fs'
// @ts-ignore
import path from 'path'

// Helper cleaning function
function cleanText(text: string): string {
    return text
        // Remove non-printable characters (keep newlines/tabs)
        .replace(/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F]/g, "")
        // Collapse multiple spaces/tabs into single space
        .replace(/[ \t]+/g, " ")
        // Fix split words (hyphen at end of line) - basic attempt
        .replace(/-\s+/g, "")
        // Remove common placeholder text (case insensitive)
        .replace(/click to add (title|text|subtitle)/gi, "")
        .trim()
}

async function parsePPTX(buffer: Buffer) {
    // pptx2json requires a file path, so we use a temp file
    const tempDir = os.tmpdir()
    const tempFilePath = path.join(tempDir, `upload-${Date.now()}.pptx`)

    try {
        fs.writeFileSync(tempFilePath, buffer)

        const pptx = new pptx2json()
        const json = await pptx.toJson(tempFilePath)

        // Helper to recursively extract text from the messy JSON structure
        const extractText = (obj: any): string => {
            let text = ''
            if (typeof obj === 'string') {
                // Heuristic: skip short UUID-like strings or file paths if they appear as raw strings
                if (obj.length < 3) return ''
                if (obj.includes('http://') || obj.includes('https://')) return '' // Skip URLs in raw text for now if they act as noise
                return obj + ' '
            }
            if (Array.isArray(obj)) {
                return obj.map(extractText).join(' ')
            }
            if (typeof obj === 'object' && obj !== null) {
                // Skip specific keys that are usually metadata/garbage in pptx2json output
                const skipKeys = new Set(['uri', 'rId', 'name', 'type', 'schema', 'layout', 'slideLayoutSpNode'])

                for (const key in obj) {
                    if (skipKeys.has(key)) continue
                    text += extractText(obj[key])
                }
            }
            return text
        }

        const rawText = extractText(json)
        const cleanedText = cleanText(rawText)

        // Naive page count estimation: 
        let pageCount = 1
        if (json && json['slides'] && Array.isArray(json['slides'])) {
            pageCount = json['slides'].length
        } else if (Array.isArray(json)) {
            pageCount = json.length
        } else if (typeof json === 'object' && json !== null) {
            pageCount = Object.keys(json).length
        }

        return {
            text: cleanedText,
            metadata: {
                pages: pageCount
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
