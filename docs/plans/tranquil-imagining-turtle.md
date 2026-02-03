# Implementation Plan: Header Component & New Note Creation

## Overview

Add header navigation and new note creation flow to Easy Notes app with TipTap rich text editor.

## Features to Implement

1. **Header Component** - "EasyNotes" branding linking to `/dashboard` + logout button
2. **Dashboard Enhancement** - Add "New Note" button linking to new note route
3. **New Note Route** - Form with title input and TipTap rich text editor
4. **Form Submission** - Server Action to save note to database

## Architecture Decisions

### Route Structure

- **New note route:** `/notes/new` (RESTful convention)
- **Edit note route:** `/notes/[id]` (existing, will be enhanced)
- **Authenticated layout:** Use route group `(authenticated)` to wrap dashboard and notes routes

### Form Submission Pattern

- **Server Actions** (Next.js App Router pattern) instead of API routes
- Simpler integration, less boilerplate
- Uses existing `createNote(userId, data)` function from `lib/notes.ts`

### Component Structure

- **Header:** Reusable component in authenticated layout
- **TipTap Editor:** Separate client component for reusability
- **New Note Form:** Client component handling form state and submission

## Implementation Steps

### 1. Create Header Component

**File:** `/components/header.tsx`

- Client component using Next.js Link and authClient
- Layout: "EasyNotes" title/logo on left, logout button on right
- "EasyNotes" links to `/dashboard`
- **Logout button:**
  - Uses `authClient.signOut()` from `@/lib/auth-client`
  - Shows loading state during sign out
  - Redirects to `/authenticate` after successful logout
  - Styled as secondary button (subtle, not primary)
- Clean Tailwind styling matching existing auth form patterns
- Dark mode support with zinc color palette
- Flex layout with space-between for logo and logout button
- Responsive padding, max-width container

### 2. Create Authenticated Layout

**File:** `/app/(authenticated)/layout.tsx`

- Server component wrapping authenticated pages
- Calls `protectRoute()` to enforce authentication
- Renders `<Header />` above children
- Route group `(authenticated)` prevents URL pollution

### 3. Move Dashboard to Authenticated Group

**File:** `/app/(authenticated)/dashboard/page.tsx`

- Move existing dashboard from `/app/dashboard/page.tsx`
- Remove individual `protectRoute()` call (handled by layout)
- Add "New Note" button/link to `/notes/new`
- Use existing Button component styled as primary action
- Prominent placement (e.g., "+ New Note" or "Create New Note")

### 4. Create TipTap Editor Component

**File:** `/components/note-editor.tsx`

- **Client component** with `"use client"` directive
- Props:
  ```typescript
  interface NoteEditorProps {
    initialContent?: string; // JSON string from DB
    onChange?: (contentJson: string) => void;
    editable?: boolean;
  }
  ```
- Use `useEditor` hook from `@tiptap/react`
- Configure with `StarterKit` extension:
  - Headings (H1, H2, H3)
  - Bold, Italic, Code
  - Bullet lists, ordered lists
  - Code blocks, blockquotes
- Render formatting toolbar with buttons (B, I, H1, H2, H3, List, Code)
- Editor area with border, min-height, prose styling
- Parse `initialContent` with try/catch fallback to empty doc
- Call `onChange` in `onUpdate` callback with `editor.getJSON()`

### 5. Create New Note Form Component

**File:** `/components/new-note-form.tsx`

- **Client component** for form interactivity
- State:
  - `title` (default: "Untitled note")
  - `contentJson` (default: empty TipTap doc)
  - `isSubmitting` (loading state)
  - `error` (error messages)
- Render Input component for title field
- Render NoteEditor with onChange handler
- Hidden input for contentJson (passed to Server Action)
- Submit button using existing Button component with loading state
- Form onSubmit calls Server Action

### 6. Create Server Action

**File:** `/app/(authenticated)/notes/actions.ts`

```typescript
async function createNoteAction(formData: FormData) {
  'use server';
  const user = await requireAuth();

  // Extract and validate
  const title = formData.get('title') as string;
  const contentJson = formData.get('contentJson') as string;

  // Zod validation schema
  const noteSchema = z.object({
    title: z.string().min(1).max(200),
    contentJson: z.string().refine(isValidTipTapJson),
  });

  const validated = noteSchema.parse({ title, contentJson });

  // Create note
  const note = await createNote(user.id, {
    title: validated.title,
    contentJson: validated.contentJson,
  });

  // Redirect to edit page or dashboard
  redirect(`/notes/${note.id}`);
}
```

- Validate title (non-empty, max 200 chars)
- Validate TipTap JSON structure (type: "doc", content array)
- Call existing `createNote()` function
- Redirect to `/notes/[id]` on success
- Return validation errors to form

### 7. Create New Note Page

**File:** `/app/(authenticated)/notes/new/page.tsx`

- Server component (protected by layout)
- Renders `NewNoteForm` component
- Minimal wrapper, no additional logic needed

### 8. Update Note Editor Page (Future)

**File:** `/app/(authenticated)/notes/[id]/page.tsx`

- Move existing `/app/notes/[id]/page.tsx` to authenticated group
- Fetch note with `getNoteById(user.id, id)`
- Render edit form similar to new note form
- Handle 404 if note not found
- Use same TipTap editor component
- Create separate `updateNoteAction` Server Action

## Files to Create/Modify

### New Files

- `/components/header.tsx` - App header with EasyNotes branding
- `/components/note-editor.tsx` - TipTap rich text editor wrapper
- `/components/new-note-form.tsx` - Form for creating notes
- `/app/(authenticated)/layout.tsx` - Authenticated pages layout
- `/app/(authenticated)/notes/new/page.tsx` - New note creation page
- `/app/(authenticated)/notes/actions.ts` - Server Actions for note operations

### Modified Files

- `/app/(authenticated)/dashboard/page.tsx` - Move from `/app/dashboard/` + add "New Note" button
- `/app/(authenticated)/notes/[id]/page.tsx` - Move from `/app/notes/[id]/` (for future editing)

### Existing Files (No Changes Needed)

- `/lib/notes.ts` - Already has `createNote()` function
- `/lib/session.ts` - Already has `protectRoute()`, `requireAuth()`
- `/components/ui/button.tsx` - Reuse for buttons
- `/components/ui/input.tsx` - Reuse for title input

## Validation & Security

### Zod Schema

```typescript
const noteSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  contentJson: z.string().refine((val) => {
    try {
      const parsed = JSON.parse(val);
      return parsed.type === 'doc' && Array.isArray(parsed.content);
    } catch {
      return false;
    }
  }, 'Invalid content format'),
});
```

### Security Measures

- Authentication enforced at layout level with `protectRoute()`
- User ownership automatically enforced by `createNote(userId, ...)`
- TipTap JSON prevents XSS (no raw HTML)
- Server Actions have built-in CSRF protection
- Input validation with Zod schemas

## Styling Guidelines

### Design Patterns

- Match existing auth form styling (zinc palette, blue accents)
- Dark mode with `dark:` Tailwind variants
- Rounded corners (`rounded-lg`), consistent spacing
- Focus states with ring (`focus:ring-2 focus:ring-blue-500`)
- Button loading states (existing Button component)

### TipTap Editor Styling

- Border around editor area
- Toolbar with button group (flex layout)
- Minimum height for editor (`min-h-[300px]`)
- Padding inside editor for comfortable typing
- Clear visual separation between toolbar and content

## Empty TipTap Document Default

```json
{
  "type": "doc",
  "content": [
    {
      "type": "paragraph"
    }
  ]
}
```

## Error Handling

- Empty title → Inline validation error
- Invalid TipTap JSON → Form-level error message
- Database failure → Generic error with logging
- Unauthorized → Handled by `protectRoute` redirect
- Note not found → 404 page or redirect to dashboard

## Verification Steps

### Testing Checklist

1. Navigate to `/dashboard` → Header shows "EasyNotes" logo and logout button
2. Click "EasyNotes" → Returns to `/dashboard`
3. Click logout button → Signs out and redirects to `/authenticate`
4. Log back in → Verify session restored
5. Click "New Note" button → Navigates to `/notes/new`
6. Fill in title → Input updates
7. Type in editor → Content updates, formatting buttons work
8. Test formatting (Bold, Italic, Headings, Lists, Code)
9. Submit form → Note created in database
10. Verify redirect to note page or dashboard
11. Check dark mode styling
12. Try empty title → Validation error displayed
13. Verify note stored with correct `user_id` in database

### Database Verification

```bash
bun --eval "
  const { getDb } = require('./lib/db.ts');
  const db = getDb();
  const notes = db.prepare('SELECT * FROM notes ORDER BY created_at DESC LIMIT 5').all();
  console.log(notes);
"
```

### Manual Testing Flow

1. Start dev server: `bun run dev`
2. Navigate to http://localhost:3000/dashboard
3. Verify header appears with "EasyNotes" branding
4. Click "New Note" button
5. Create note with title "Test Note" and formatted content
6. Submit form
7. Verify note saved successfully
8. Test all formatting options in editor
9. Check dark mode (system preference or browser DevTools)

## Future Enhancements (Out of Scope)

- Auto-save with debouncing
- Note preview before saving
- Keyboard shortcuts for formatting
- Word count display
- Advanced TipTap plugins (images, tables, etc.)
- Note list on dashboard with edit/delete actions

## Critical Dependencies

All required packages already installed:

- `@tiptap/react@^3.18.0`
- `@tiptap/starter-kit@^3.18.0`
- `@tiptap/pm@^3.18.0`
- `zod@^4.3.6`
- `next@16.1.1`

## Notes

- The `createNote()` function in `lib/notes.ts` handles ID generation (nanoid), timestamps, and default values
- TipTap editor is a client component (uses React hooks) while pages are server components
- Server Actions provide better UX than API routes for simple form submissions
- Route group `(authenticated)` doesn't affect URLs, only used for shared layout
- The authenticated layout eliminates need for per-page `protectRoute()` calls
