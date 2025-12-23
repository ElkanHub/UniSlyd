"use client"

import { useEffect } from "react"

/**
 * A utility component that triggers window.print() when mounted.
 * Useful for pages that are opened specifically for printing/downloading as PDF.
 */
export function AutoPrint() {
    useEffect(() => {
        // slight delay to ensure content is rendered
        const timer = setTimeout(() => {
            window.print()
        }, 500)

        return () => clearTimeout(timer)
    }, [])

    return null
}
