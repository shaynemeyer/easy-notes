# Implementation Plan: Dashboard Note List & Note Viewing

## Overview

Add functionality to display all user notes on the dashboard and render individual notes with proper styling.

## What's Already Working

- ✅ Authentication system (`requireAuth()` in `/lib/session.ts`)
- ✅ Database repository (`getNotesByUser()`, `getNoteById()` in `/lib/notes.ts`)
- ✅ TipTap editor component with read-only mode (`/components/note-editor.tsx`)
- ✅ Dashboard page structure with "New Note" button
- ✅ Note view page with auth check and data fetching

## Changes Required

### 1. Create Note Preview Utility

**File:** `/lib/note-utils.ts` (new file)

Create helper functions to:

- Extract plain text preview from TipTap JSON (first ~150 chars)
- Format dates for display
- Handle empty/invalid content gracefully

**Implementation:**

```typescript
export function generateNotePreview(
  contentJson: string,
  maxLength = 150,
): string {
  // Parse TipTap JSON and extract text from nodes
  // Truncate to maxLength with ellipsis
}

export function formatNoteDate(isoDate: string): string {
  // Format ISO date as readable string
}
```

### 2. Implement Dashboard Note List

**File:** `/app/(authenticated)/dashboard/page.tsx`

**Changes:**

1. Import `requireAuth()` from `/lib/session`
2. Import `getNotesByUser()` from `/lib/notes`
3. Import `generateNotePreview()` and `formatNoteDate()` from `/lib/note-utils`
4. Fetch user and notes in the server component
5. Replace placeholder text with note grid
6. Display empty state if no notes exist

**Layout:**

- Grid of note cards (responsive: 1 col mobile, 2-3 cols desktop)
- Each card shows:
  - Title (bold, large)
  - Content preview (2-3 lines, truncated)
  - Last updated date
  - Link wraps entire card for navigation to `/notes/[id]`

**Empty State:**

- Show friendly message when no notes exist
- Prompt user to create first note

### 3. Implement Note Viewing

**File:** `/app/(authenticated)/notes/[id]/page.tsx`

**Changes:**

1. Import `NoteEditor` component
2. Add "Back to Dashboard" link
3. Replace placeholder with `<NoteEditor initialContent={note.contentJson} editable={false} />`
4. Display updated date alongside created date

**Layout:**

- Title at top
- Metadata row (created, updated dates)
- Back link/button
- TipTap editor in read-only mode (no toolbar, just styled content)

## Key Implementation Details

### TipTap Rendering

- Use existing `NoteEditor` component with `editable={false}`
- Component automatically hides toolbar when not editable (line 56)
- Content is styled with Tailwind prose classes
- Secure: TipTap handles JSON-to-DOM conversion safely

### Preview Generation Algorithm

1. Parse TipTap JSON document
2. Recursively traverse `content` array
3. Extract text from text nodes in paragraphs, headings, lists
4. Skip empty paragraphs
5. Join with spaces, truncate to max length
6. Add ellipsis if truncated

### Styling Guidelines

- Follow existing zinc color palette
- Container: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8`
- Cards: `bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800`
- Hover effect on cards: `hover:bg-zinc-50 dark:hover:bg-zinc-800/50`
- Responsive grid: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4`

## Files to Modify

1. `/lib/note-utils.ts` - New utility file for preview generation
2. `/app/(authenticated)/dashboard/page.tsx` - Add note list display
3. `/app/(authenticated)/notes/[id]/page.tsx` - Add note content rendering

## Critical Files Referenced

- `/lib/session.ts` - Auth helpers (`requireAuth`)
- `/lib/notes.ts` - Repository functions (`getNotesByUser`, `getNoteById`)
- `/components/note-editor.tsx` - TipTap editor with read-only support

## Edge Cases Handled

- Empty note list → Show empty state with CTA
- Invalid note ID → Already handled with `notFound()`
- Malformed JSON → TipTap's `parseContent()` has fallback
- Empty note content → Preview shows "Empty note" or similar
- Long titles → Truncate with CSS `line-clamp`
- Long content → Preview limited to 150 chars

## Verification Steps

After implementation:

1. Navigate to `/dashboard`
2. Verify all user notes are displayed
3. Check empty state shows when no notes exist
4. Click on a note card
5. Verify navigation to `/notes/[id]`
6. Verify note content renders with proper formatting (headings, lists, bold, etc.)
7. Verify read-only mode (no editing possible, no toolbar)
8. Verify "Back to Dashboard" link works
9. Test dark mode rendering
10. Test responsive layout on mobile/tablet
