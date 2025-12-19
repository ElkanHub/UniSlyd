// @ts-ignore
// @ts-ignore
let pdf = require('pdf-parse/lib/pdf-parse.js')
// Handle ESM/CJS interop (Next.js sometimes wraps CJS in default)
if (pdf.default) pdf = pdf.default
// @ts-ignore
import pptx2json from 'pptx2json'

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
        text: data.text,
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
            if (typeof obj === 'string') return obj + ' '
            if (Array.isArray(obj)) {
                return obj.map(extractText).join(' ')
            }
            if (typeof obj === 'object' && obj !== null) {
                // pptx2json specific keys often look like 'content', 'text', etc.
                // We'll just grab all string values recursively for now
                for (const key in obj) {
                    text += extractText(obj[key])
                }
            }
            return text
        }

        const rawText = extractText(json)

        // Naive page count estimation: 
        // If it's an object, keys might be slides. If array, length.
        // If unknown, default to 1 so it's not 0.
        let pageCount = 1
        if (Array.isArray(json)) {
            pageCount = json.length
        } else if (typeof json === 'object' && json !== null) {
            pageCount = Object.keys(json).length
        }

        return {
            text: rawText.replace(/\s+/g, ' ').trim(), // Clean up whitespace
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
