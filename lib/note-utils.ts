/**
 * Utility functions for note processing and formatting
 */

interface TipTapNode {
  type: string;
  content?: TipTapNode[];
  text?: string;
}

interface TipTapDocument {
  type: 'doc';
  content: TipTapNode[];
}

/**
 * Extract plain text from TipTap JSON document
 */
function extractTextFromNode(node: TipTapNode): string {
  if (node.text) {
    return node.text;
  }

  if (node.content && Array.isArray(node.content)) {
    return node.content.map(extractTextFromNode).join(' ');
  }

  return '';
}

/**
 * Generate a preview text from TipTap JSON content
 * @param contentJson - Stringified TipTap JSON document
 * @param maxLength - Maximum length of preview (default: 150)
 * @returns Plain text preview with ellipsis if truncated
 */
export function generateNotePreview(contentJson: string, maxLength = 150): string {
  try {
    const doc: TipTapDocument = JSON.parse(contentJson);

    if (!doc.content || doc.content.length === 0) {
      return 'Empty note';
    }

    const text = extractTextFromNode(doc).trim();

    if (!text) {
      return 'Empty note';
    }

    if (text.length <= maxLength) {
      return text;
    }

    return text.substring(0, maxLength).trim() + '...';
  } catch (error) {
    return 'Unable to preview note';
  }
}

/**
 * Format ISO date string to readable format
 * @param isoDate - ISO 8601 date string
 * @returns Formatted date string (e.g., "Jan 15, 2024")
 */
export function formatNoteDate(isoDate: string): string {
  try {
    const date = new Date(isoDate);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch (error) {
    return 'Invalid date';
  }
}

/**
 * Generate the full public URL for a note given its slug
 */
export function getPublicNoteUrl(slug: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || '';
  return baseUrl ? `${baseUrl}/p/${slug}` : `/p/${slug}`;
}
