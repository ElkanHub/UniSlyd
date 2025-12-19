// @ts-ignore
import pptx2json from 'pptx2json'

export type ExtractedSlide = {
    slideIndex: number;
    text: string[];
};

// Heuristics to determine if text is "gibberish" or actual content
function isMeaningfulText(text: string): boolean {
    if (!text) return false
    // If it's too short, it's likely noise (unless it's a specific acronym, but usually safer to skip < 3 chars)
    if (text.length < 3) return false

    // Must contain at least some letters (not just numbers or symbols)
    if (!/[a-zA-Z]/.test(text)) return false

    // Skip things that look like code/CSS snippets common in pptx2json garbage
    if (text.includes('{') && text.includes('}')) return false
    if (text.includes('rgb(')) return false

    // Skip common metadata keys that might sneak in if validation fails
    if (['key', 'id', 'name', 'type'].includes(text.toLowerCase())) return false

    return true
}

// Clean text helper
function cleanText(text: string): string {
    return text
        .replace(/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F]/g, "")
        .replace(/[ \t]+/g, " ")
        .replace(/[_-]{3,}/g, " ")
        .replace(/click to add (title|text|subtitle)/gi, "")
        .trim()
}

export async function extractPptxText(
    filePath: string
): Promise<ExtractedSlide[]> {
    try {
        const pptx = new pptx2json()
        const result = await pptx.toJson(filePath)

        const slides: ExtractedSlide[] = [];

        // 1. Identification: Find keys that look like 'ppt/slides/slideX.xml'
        const keys = Object.keys(result);
        const slideKeys = keys.filter(key => key.match(/^ppt\/slides\/slide\d+\.xml$/));

        // 2. Sorting: Sort by slide number (slide1, slide2, slide10...)
        slideKeys.sort((a, b) => {
            const numA = parseInt(a.match(/slide(\d+)\.xml$/)![1]);
            const numB = parseInt(b.match(/slide(\d+)\.xml$/)![1]);
            return numA - numB;
        });

        console.log(`[extractPptxText] found ${slideKeys.length} slide files.`);

        // 3. Extraction: Iterate and extract text
        slideKeys.forEach((key, index) => {
            const slideData = result[key];
            const slideText: string[] = [];

            // Recursive function to find strings in strange places
            const collectStrings = (obj: any) => {
                if (!obj) return;

                if (typeof obj === 'string') {
                    const cleaned = cleanText(obj);
                    if (isMeaningfulText(cleaned)) {
                        slideText.push(cleaned);
                    }
                    return;
                }

                if (Array.isArray(obj)) {
                    obj.forEach(val => collectStrings(val));
                    return;
                }

                if (typeof obj === 'object') {
                    // Try to be smart: usually text is in 'a:t' or '_' (if xml2js)
                    // But raw recursion is safest given we don't know the exact parser config
                    // We just need to avoid key names being treated as text

                    // Optimization: if obj looks like a text node { "a:t": "Foo" } or { "_": "Foo" }
                    if (obj['a:t']) {
                        // Often arrays
                        const tVal = obj['a:t'];
                        if (Array.isArray(tVal)) tVal.forEach(v => collectStrings(v));
                        else collectStrings(tVal);
                    }
                    else if (obj['_']) {
                        collectStrings(obj['_']);
                    }
                    else {
                        // Traverse children
                        for (const k in obj) {
                            // Skip headers/metadata keys that likely contain attribute values we don't want
                            // e.g., 'attr', '$', 'xmlns'
                            if (k === '$' || k === 'attr') continue;
                            collectStrings(obj[k]);
                        }
                    }
                }
            }

            collectStrings(slideData);

            // Remove duplicates within a slide (common in some parsers)
            const uniqueLines = Array.from(new Set(slideText));

            if (uniqueLines.length > 0) {
                slides.push({
                    slideIndex: index + 1,
                    text: uniqueLines
                });
            }
        });

        console.log(`[extractPptxText] Extracted content from ${slides.length} slides.`);
        return slides;

    } catch (error) {
        console.error("Extraction error", error);
        throw error;
    }
}
