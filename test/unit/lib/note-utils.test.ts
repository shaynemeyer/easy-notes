import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { generateNotePreview, formatNoteDate, getPublicNoteUrl } from '@/lib/note-utils';
import {
  VALID_TIPTAP_DOC,
  EMPTY_TIPTAP_DOC,
  COMPLEX_TIPTAP_DOC,
  INVALID_TIPTAP_DOC,
} from '../../helpers/test-fixtures';

describe('generateNotePreview', () => {
  it('should extract text from simple TipTap document', () => {
    const contentJson = JSON.stringify(VALID_TIPTAP_DOC);
    const preview = generateNotePreview(contentJson);
    expect(preview).toBe('Hello world');
  });

  it('should extract text from complex TipTap document', () => {
    const contentJson = JSON.stringify(COMPLEX_TIPTAP_DOC);
    const preview = generateNotePreview(contentJson);
    expect(preview).toContain('Heading');
    expect(preview).toContain('bold');
    expect(preview).toContain('italic');
  });

  it('should truncate long text with ellipsis', () => {
    const longDoc = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'a'.repeat(200) }],
        },
      ],
    };
    const contentJson = JSON.stringify(longDoc);
    const preview = generateNotePreview(contentJson);
    expect(preview).toHaveLength(153); // 150 chars + '...'
    expect(preview.endsWith('...')).toBe(true);
  });

  it('should handle empty content and return "Empty note"', () => {
    const contentJson = JSON.stringify(EMPTY_TIPTAP_DOC);
    const preview = generateNotePreview(contentJson);
    expect(preview).toBe('Empty note');
  });

  it('should handle document with empty text nodes', () => {
    const emptyTextDoc = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: '   ' }],
        },
      ],
    };
    const contentJson = JSON.stringify(emptyTextDoc);
    const preview = generateNotePreview(contentJson);
    expect(preview).toBe('Empty note');
  });

  it('should handle invalid JSON and return "Unable to preview note"', () => {
    const preview = generateNotePreview('invalid json');
    expect(preview).toBe('Unable to preview note');
  });

  it('should handle invalid TipTap structure', () => {
    const contentJson = JSON.stringify(INVALID_TIPTAP_DOC);
    const preview = generateNotePreview(contentJson);
    expect(preview).toBe('Empty note'); // Still parses as doc but with invalid content
  });

  it('should respect custom maxLength parameter', () => {
    const longDoc = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'a'.repeat(100) }],
        },
      ],
    };
    const contentJson = JSON.stringify(longDoc);
    const preview = generateNotePreview(contentJson, 50);
    expect(preview).toHaveLength(53); // 50 chars + '...'
    expect(preview.endsWith('...')).toBe(true);
  });

  it('should not add ellipsis if text is exactly maxLength', () => {
    const doc = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'a'.repeat(150) }],
        },
      ],
    };
    const contentJson = JSON.stringify(doc);
    const preview = generateNotePreview(contentJson);
    expect(preview).toHaveLength(150);
    expect(preview.endsWith('...')).toBe(false);
  });
});

describe('formatNoteDate', () => {
  it('should format valid ISO date to readable format', () => {
    const isoDate = '2024-01-15T12:00:00.000Z';
    const formatted = formatNoteDate(isoDate);
    expect(formatted).toBe('Jan 15, 2024');
  });

  it('should format different dates correctly', () => {
    const isoDate = '2023-12-31T23:59:59.999Z';
    const formatted = formatNoteDate(isoDate);
    expect(formatted).toMatch(/Dec 31, 2023|Jan 1, 2024/); // Could vary by timezone
  });

  it('should handle invalid date and return "Invalid Date"', () => {
    const formatted = formatNoteDate('not-a-date');
    expect(formatted).toBe('Invalid Date');
  });

  it('should handle empty string', () => {
    const formatted = formatNoteDate('');
    expect(formatted).toBe('Invalid Date');
  });
});

describe('getPublicNoteUrl', () => {
  const originalEnv = process.env.NEXT_PUBLIC_APP_URL;

  afterEach(() => {
    process.env.NEXT_PUBLIC_APP_URL = originalEnv;
  });

  it('should use NEXT_PUBLIC_APP_URL when set', () => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://example.com';
    const url = getPublicNoteUrl('test-slug-123');
    expect(url).toBe('https://example.com/p/test-slug-123');
  });

  it('should fallback to relative path when no env var', () => {
    process.env.NEXT_PUBLIC_APP_URL = '';
    const url = getPublicNoteUrl('test-slug-123');
    expect(url).toBe('/p/test-slug-123');
  });

  it('should handle undefined env var', () => {
    delete process.env.NEXT_PUBLIC_APP_URL;
    const url = getPublicNoteUrl('test-slug-123');
    expect(url).toBe('/p/test-slug-123');
  });

  it('should handle different slugs', () => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://example.com';
    const url = getPublicNoteUrl('another-slug-456');
    expect(url).toBe('https://example.com/p/another-slug-456');
  });
});
