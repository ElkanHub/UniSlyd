"use client"

import React from 'react'
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'

const styles = StyleSheet.create({
    page: {
        padding: 50,
        backgroundColor: '#ffffff'
    },
    title: {
        fontSize: 24,
        marginBottom: 20,
        textAlign: 'center',
    },
    text: {
        fontSize: 12,
        marginBottom: 10,
        lineHeight: 1.5,
        fontFamily: 'Helvetica',
    },
    h1: { fontSize: 22, marginTop: 15, marginBottom: 10, fontWeight: 'bold', fontFamily: 'Helvetica-Bold' },
    h2: { fontSize: 18, marginTop: 12, marginBottom: 8, fontWeight: 'bold', fontFamily: 'Helvetica-Bold' },
    h3: { fontSize: 16, marginTop: 10, marginBottom: 6, fontWeight: 'bold', fontFamily: 'Helvetica-Bold' },
    bulletPoint: {
        flexDirection: 'row',
        marginBottom: 5,
        paddingLeft: 10,
    },
    bulletDot: {
        width: 10,
        fontSize: 12,
    },
    bulletContent: {
        flex: 1,
        fontSize: 12,
        fontFamily: 'Helvetica',
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
            return <View>{renderContent(node.content)}</View>

        case 'listItem':
            return (
                <View style={styles.bulletPoint}>
                    <Text style={styles.bulletDot}>•</Text>
                    <Text style={styles.bulletContent}>{renderContent(node.content)}</Text>
                </View>
            )

        case 'orderedList':
            return <View>{renderContent(node.content)}</View>

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
            return node.text
        }
        return null
    })
}
