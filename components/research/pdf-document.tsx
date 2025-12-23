"use client"

import React from 'react'
import { Document, Page, Text, View, StyleSheet, Font, Image, Link } from '@react-pdf/renderer'

// Register fonts if needed, otherwise using standard fonts
// Font.register({ family: 'Inter', src: '...' });

const styles = StyleSheet.create({
    page: {
        padding: 50,
        backgroundColor: '#ffffff',
        fontFamily: 'Helvetica',
        color: '#333333',
    },
    title: {
        fontSize: 24,
        marginBottom: 20,
        textAlign: 'center',
        fontWeight: 'bold',
    },
    text: {
        fontSize: 11,
        marginBottom: 8,
        lineHeight: 1.6,
    },
    h1: { fontSize: 20, marginTop: 16, marginBottom: 8, fontWeight: 'bold' },
    h2: { fontSize: 16, marginTop: 14, marginBottom: 6, fontWeight: 'bold' },
    h3: { fontSize: 14, marginTop: 12, marginBottom: 4, fontWeight: 'bold' },

    // Lists
    bulletPoint: {
        flexDirection: 'row',
        marginBottom: 4,
        paddingLeft: 15,
    },
    bulletDot: {
        width: 15,
        fontSize: 12,
        color: '#555',
    },
    bulletContent: {
        flex: 1,
        fontSize: 11,
        lineHeight: 1.6,
    },

    // Blockquote
    blockquote: {
        borderLeftWidth: 3,
        borderLeftColor: '#e5e7eb',
        paddingLeft: 10,
        marginLeft: 0,
        marginRight: 0,
        marginTop: 10,
        marginBottom: 10,
        fontStyle: 'italic',
        color: '#555',
    },

    // Code Block
    codeBlock: {
        fontFamily: 'Courier',
        backgroundColor: '#f3f4f6',
        padding: 10,
        fontSize: 10,
        borderRadius: 4,
        marginBottom: 10,
    },

    // Horizontal Rule
    hr: {
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
        marginVertical: 15,
        width: '100%',
    },

    // Image
    image: {
        marginVertical: 10,
        width: '100%',
        objectFit: 'contain',
    },

    // Links
    link: {
        color: '#2563eb',
        textDecoration: 'none',
    },
})

interface ResearchDocumentProps {
    session: any
}

export function ResearchDocument({ session }: ResearchDocumentProps) {
    const editorContent = session?.editor_content || {}

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <Text style={styles.title}>{session.title}</Text>
                <View>
                    {renderContent(editorContent)}
                </View>
                <Text style={{ position: 'absolute', bottom: 30, left: 0, right: 0, textAlign: 'center', fontSize: 9, color: '#9ca3af' }} render={({ pageNumber, totalPages }) => (
                    `${pageNumber} / ${totalPages}`
                )} fixed />
            </Page>
        </Document>
    )
}

function renderContent(node: any): any {
    if (!node) return null

    if (Array.isArray(node)) {
        return node.map((child, index) => <React.Fragment key={index}>{renderContent(child)}</React.Fragment>)
    }

    switch (node.type) {
        case 'doc':
            return renderContent(node.content)

        case 'paragraph':
            return (
                <Text style={styles.text}>
                    {renderTextContent(node.content)}
                </Text>
            )

        case 'heading':
            const level = node.attrs?.level || 1
            const style = level === 1 ? styles.h1 : level === 2 ? styles.h2 : styles.h3
            return <Text style={style}>{renderTextContent(node.content)}</Text>

        case 'bulletList':
        case 'orderedList': // Treating ordered list as bullet for simplicity, or add counter logic
            return <View style={{ marginBottom: 10 }}>{renderContent(node.content)}</View>

        case 'listItem':
            return (
                <View style={styles.bulletPoint}>
                    <Text style={styles.bulletDot}>•</Text>
                    <View style={styles.bulletContent}>{renderContent(node.content)}</View>
                </View>
            )

        case 'blockquote':
            return (
                <View style={styles.blockquote}>
                    {renderContent(node.content)}
                </View>
            )

        case 'codeBlock':
            return (
                <View style={styles.codeBlock}>
                    <Text>{node.content ? node.content[0].text : ''}</Text>
                </View>
            )

        case 'horizontalRule':
            return <View style={styles.hr} />

        case 'image':
            if (node.attrs && node.attrs.src) {
                return <Image style={styles.image} src={node.attrs.src} />
            }
            return null

        case 'taskList':
            return <View style={{ marginBottom: 10 }}>{renderContent(node.content)}</View>

        case 'taskItem':
            const checked = node.attrs?.checked
            return (
                <View style={[styles.bulletPoint, { paddingLeft: 0 }]}>
                    <Text style={{ width: 20, fontSize: 12 }}>{checked ? '[x]' : '[ ]'}</Text>
                    <View style={styles.bulletContent}>{renderContent(node.content)}</View>
                </View>
            )

        default:
            if (node.content) {
                return renderContent(node.content)
            }
            return null
    }
}

function renderTextContent(content: any[]): any {
    if (!content) return null

    return content.map((node, index) => {
        if (node.type === 'text') {
            const marks = node.marks || []
            let style: any = {}
            let isLink = false
            let href = ''

            marks.forEach((mark: any) => {
                if (mark.type === 'bold') style.fontWeight = 'bold'
                if (mark.type === 'italic') style.fontStyle = 'italic'
                if (mark.type === 'strike') style.textDecoration = 'line-through'
                if (mark.type === 'underline') style.textDecoration = 'underline'
                if (mark.type === 'link') {
                    isLink = true
                    href = mark.attrs.href
                }
            })

            // Fix for bold font family: map styles to specific standard font families 
            // and explicitly reset style/weight to normal to prevent React-PDF from looking for "Bold-Bold" or "Italic-Italic"
            if (style.fontWeight === 'bold' && style.fontStyle === 'italic') {
                style.fontFamily = 'Helvetica-BoldOblique'
                style.fontWeight = 'normal'
                style.fontStyle = 'normal'
            } else if (style.fontWeight === 'bold') {
                style.fontFamily = 'Helvetica-Bold'
                style.fontWeight = 'normal'
            } else if (style.fontStyle === 'italic') {
                style.fontFamily = 'Helvetica-Oblique'
                style.fontStyle = 'normal'
            } else {
                style.fontFamily = 'Helvetica'
            }

            if (isLink) {
                return <Link key={index} src={href} style={[styles.link, style]}>{node.text}</Link>
            }

            return <Text key={index} style={style}>{node.text}</Text>
        }

        // Handle hard break
        if (node.type === 'hardBreak') {
            return "\n"
        }

        return null
    })
}
