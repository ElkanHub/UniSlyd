export function chunkText(text: string, maxTokens = 1000): string[] {
    // Very basic chunking by character/words for now. 
    // Ideally use 'tiktoken' or recursive splitter.
    // Assuming 1 token ~ 4 chars
    const chunkSize = maxTokens * 4
    const chunks: string[] = []

    for (let i = 0; i < text.length; i += chunkSize) {
        chunks.push(text.slice(i, i + chunkSize))
    }

    return chunks
}
