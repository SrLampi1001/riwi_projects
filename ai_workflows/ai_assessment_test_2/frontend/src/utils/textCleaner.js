/**
 * textCleaner.js
 * Strips markdown syntax from text before sending to the browser TTS engine.
 * Prevents the speech synthesizer from reading asterisks, backticks, hash marks, etc.
 */

/**
 * Convert markdown text to clean spoken text.
 * Handles: bold, italic, code blocks, inline code, headers, HR, lists, links, images, blockquotes.
 * @param {string} text - Raw markdown text
 * @returns {string} - Clean text safe for TTS
 */
export function cleanTextForTTS(text) {
  if (!text || typeof text !== 'string') return '';

  return text
    // Remove code blocks (multiline with triple backticks)
    .replace(/```[\s\S]*?```/g, (match) => {
      const lang = match.slice(3, match.indexOf('\n'));
      const code = match.slice(3 + lang.length, match.length - 3).trim();
      return code || '';
    })
    // Remove inline code markers, keep content
    .replace(/`([^`]+)`/g, '$1')
    // Remove images: ![alt](url) → just alt text
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
    // Remove links: [text](url) → just text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove bold markers but keep text
    .replace(/\*\*([^*\n]+)\*\*/g, '$1')
    // Remove italic markers (single *) but keep text (avoid conflicts with bold)
    .replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, '$1')
    // Remove italic underscores
    .replace(/_([^_\n]+)_/g, '$1')
    // Remove blockquote markers
    .replace(/^>\s?/gm, '')
    // Remove headers (all levels # ## ### etc)
    .replace(/^#{1,6}\s+/gm, '')
    // Remove horizontal rules (--- or *** or ___ on their own line)
    .replace(/^[-*_]{3,}\s*$/gm, '')
    // Remove unordered list markers (- or * or + at line start)
    .replace(/^[\s]*[-*+]\s+/gm, '')
    // Remove ordered list markers (1. 2. etc at line start)
    .replace(/^[\s]*\d+\.\s+/gm, '')
    // Collapse multiple spaces into one
    .replace(/ {2,}/g, ' ')
    // Trim each line
    .split('\n')
    .map((line) => line.trim())
    .join('\n')
    // Collapse multiple newlines
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}