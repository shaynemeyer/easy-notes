# Public Note Sharing Feature Implementation Plan

## Overview

Add public sharing functionality to allow note owners to generate shareable links. The sharing toggle will be integrated into the create and edit note forms, and public notes will be viewable by anyone (including guests) at `/p/[slug]`.

## Current State Analysis

**Backend Foundation (Already Complete):**

- Database has `is_public` INTEGER and `public_slug` TEXT UNIQUE columns in `notes` table
- Indexes already exist: `idx_notes_public_slug`, `idx_notes_is_public`
- `getNoteByPublicSlug(slug)` function exists to fetch public notes
- `setNotePublic(userId, noteId, isPublic)` exists but will be superseded by integrated approach

**Frontend Structure:**

- NewNoteForm: `/components/new-note-form.tsx` - handles note creation
- EditNoteForm: `/components/edit-note-form.tsx` - handles note updates
- Server actions: `/app/(authenticated)/notes/actions.ts`
- Placeholder public page exists at `/app/p/[slug]/page.tsx`

## Implementation Steps

### 1. Update Backend Functions to Support Sharing During Create/Update

**File: `/lib/notes.ts`**

Modify `createNote()` function:

- Add optional `isPublic?: boolean` parameter (defaults to false)
- If `isPublic` is true, generate `public_slug` using `nanoid(16)` and set `is_public = 1`
- If `isPublic` is false, leave `public_slug` as null and `is_public = 0`

Modify `updateNote()` function:

- Add optional `isPublic?: boolean` parameter
- Handle three scenarios:
  - Enable sharing: Generate slug if none exists, set `is_public = 1`
  - Disable sharing: Set `is_public = 0` (keep slug for potential re-enabling)
  - No change: Leave sharing status as-is (parameter not provided)

### 2. Create ShareNoteToggle Component

**File: `/components/share-note-toggle.tsx`**

Create client component with:

- Props: `value: boolean`, `onChange: (value: boolean) => void`, `publicSlug?: string | null`
- Toggle/checkbox labeled "Make this note public"
- When enabled AND publicSlug exists: Display readonly URL field with copy button
- Note: On create form, publicSlug won't exist until after save, so just show toggle
- Styling: Match existing form controls, use zinc colors and dark mode support

**UI Elements:**

- Toggle switch or checkbox with clear label
- Conditional public URL display with copy-to-clipboard button
- Copy feedback animation ("Copied!" message)
- Use modern Clipboard API with fallback

### 3. Integrate Toggle into NewNoteForm

**File: `/components/new-note-form.tsx`**

Changes:

- Add state: `const [isPublic, setIsPublic] = useState(false)`
- Import and render `ShareNoteToggle` component before the "Create Note" button
- Pass `value={isPublic}` and `onChange={setIsPublic}` to component
- No publicSlug to display (note doesn't exist yet)
- Include `isPublic` in FormData when submitting

### 4. Integrate Toggle into EditNoteForm

**File: `/components/edit-note-form.tsx`**

Changes:

- Add state: `const [isPublic, setIsPublic] = useState(initialIsPublic)`
- Import and render `ShareNoteToggle` component before the "Save Changes" button
- Pass `value={isPublic}`, `onChange={setIsPublic}`, and `publicSlug={note.publicSlug}`
- Show public URL if sharing is already enabled
- Include `isPublic` in FormData when submitting

### 5. Update Server Actions

**File: `/app/(authenticated)/notes/actions.ts`**

Modify `createNoteAction()`:

- Extract `isPublic` from FormData: `formData.get('isPublic') === 'true'`
- Pass to `createNote(user.id, { title, contentJson, isPublic })`
- Return created note (will include publicSlug if sharing enabled)

Modify `updateNoteAction()`:

- Extract `isPublic` from FormData
- Pass to `updateNote(user.id, noteId, { title, contentJson, isPublic })`
- Return updated note

### 6. Implement Public Note Viewer Page

**File: `/app/p/[slug]/page.tsx`**

Replace placeholder with:

- Server component (no authentication required)
- Extract slug from params (handle Next.js 15+ async params)
- Call `getNoteByPublicSlug(slug)`
- If note is null, call `notFound()` from `next/navigation`
- Render minimal layout:
  - Page title from note title
  - "Public Note" badge/indicator
  - Note title as h1
  - `NoteEditor` component with `editable={false}` and note content
  - Clean, distraction-free reading experience
  - No Edit/Delete buttons, no navigation to auth areas

**Styling:**

- Consistent max-width and padding with authenticated pages
- Support dark mode
- Use TailwindCSS prose classes for content

### 7. Add URL Helper Utility

**File: `/lib/note-utils.ts`**

Add function:

```typescript
export function getPublicNoteUrl(slug: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || '';
  return baseUrl ? `${baseUrl}/p/${slug}` : `/p/${slug}`;
}
```

Use this in ShareNoteToggle component to generate URLs consistently.

### 8. Environment Variable

Add to `.env.example` and documentation:

```
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

For production, set to actual domain (e.g., `https://easynotes.app`)

## Critical Files

- `/lib/notes.ts` - Update createNote and updateNote to accept isPublic parameter
- `/components/share-note-toggle.tsx` - New component for sharing toggle with URL display
- `/components/new-note-form.tsx` - Integrate ShareNoteToggle before save button
- `/components/edit-note-form.tsx` - Integrate ShareNoteToggle before save button
- `/app/(authenticated)/notes/actions.ts` - Update server actions to handle isPublic
- `/app/p/[slug]/page.tsx` - Implement public note viewer
- `/lib/note-utils.ts` - Add getPublicNoteUrl helper function

## Security Considerations

- Backend functions already enforce ownership checks via `userId` parameter
- `getNoteByPublicSlug()` only returns notes where `is_public = 1`
- Public slugs are 16-character random strings (sufficient entropy)
- No new security vulnerabilities introduced

## Testing & Verification

**Create Flow:**

1. Navigate to `/notes/new`
2. Enter title and content
3. Enable "Make this note public" toggle
4. Click "Create Note"
5. Verify note is created with public slug
6. Check that public URL is accessible in incognito mode

**Edit Flow:**

1. Open existing note for editing
2. Enable sharing toggle
3. Click "Save Changes"
4. Verify public URL appears with copy button
5. Copy link and verify it works in incognito window
6. Return to edit, disable sharing
7. Verify previous public URL now returns 404

**Public Viewing:**

1. Open public URL (not logged in)
2. Verify note content displays correctly in read-only mode
3. Verify no edit controls or auth navigation visible
4. Test with non-existent slug → 404
5. Test with disabled sharing → 404

**Edge Cases:**

- Create note without sharing, edit to enable → slug generated
- Enable sharing, disable, re-enable → same slug reused
- Multiple notes with sharing enabled → unique slugs for each
