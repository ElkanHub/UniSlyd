import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function stripMarkdown(text: string): string {
  if (!text) return "";

  return text
    // Replace headers
    .replace(/^#+\s+/gm, '')
    // Replace bold/italic
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    // Replace links but keep text
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
    // Remove images
    .replace(/!\[([^\]]*)\]\([^\)]+\)/g, '')
    // Remove code blocks
    .replace(/```[\s\S]*?```/g, (match) => match.replace(/```/g, ''))
    .replace(/`([^`]+)`/g, '$1')
    // Remove blockquotes
    .replace(/^>\s+/gm, '')
    // Remove list markers
    .replace(/^[\*\+-]\s+/gm, '')
    .replace(/^\d+\.\s+/gm, '')
    // Remove horizontal rules
    .replace(/^-{3,}$/gm, '')
    .trim();
}
