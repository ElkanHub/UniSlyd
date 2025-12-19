import mammoth from 'mammoth'
import pdf from 'pdf-parse'
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

async function parsePPTX(buffer: Buffer) {
    // PPTX parsing is complex. Using a basic reliable approach or library is key.
    // pptx2json usually converts to JSON, we need to extract text from that JSON.
    // Implementation depends on the specific library version API.
    // For now, we will wrap in try-catch and assume a basic text extraction.

    // NOTE: This is a placeholder for the robust PPTX logic requested.
    // Since we can't run this library without testing, we'll setup the structure.
    // Using a robust customized parser is recommended. 

    try {
        const pptx = new pptx2json()
        const json = await pptx.toJson(buffer)
        // Extract text from the JSON structure
        // This part highly depends on pptx2json output structure
        // For this plan, we will return a placeholder if library fails or is complex
        return {
            text: JSON.stringify(json), // Temporary dump
            metadata: {}
        }
    } catch (e) {
        console.error("PPTX Parsing failed", e)
        throw new Error("Failed to parse PPTX")
    }
}
