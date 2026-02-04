# Implementation Plan: Editable and Deletable Notes

## Overview

Add Edit and Delete functionality to note viewing page. Edit links to separate edit route with editable TipTap editor and title. Delete opens native `<dialog>` confirmation, then removes note and redirects to dashboard.

## Critical Files

- `app/(authenticated)/notes/actions.ts` - Add server actions
- `app/(authenticated)/notes/[id]/page.tsx` - Add Edit/Delete buttons
- `app/(authenticated)/notes/[id]/edit/page.tsx` - New edit route
- `components/edit-note-form.tsx` - New edit form (mirrors NewNoteForm)
- `components/delete-note-button.tsx` - New delete button with dialog
- `components/ui/dialog.tsx` - New reusable dialog component
- `components/ui/button.tsx` - Extend with variant support

## Existing Resources to Reuse

- `updateNote(userId, noteId, data)` - lib/notes.ts:92
- `deleteNote(userId, noteId)` - lib/notes.ts:138
- `requireAuth()` - lib/session.ts
- `noteSchema` - actions.ts:8 (Zod validation for title/content)
- `NoteEditor` component with `editable` prop - components/note-editor.tsx
- Form pattern from `NewNoteForm` - components/new-note-form.tsx

## Implementation Steps

### 1. Create Server Actions

**File:** `app/(authenticated)/notes/actions.ts`

Add two new actions after existing `createNoteAction`:

```typescript
export async function updateNoteAction(noteId: string, formData: FormData) {
  const user = await requireAuth();
  const title = formData.get('title') as string;
  const contentJson = formData.get('contentJson') as string;

  try {
    const validated = noteSchema.parse({ title, contentJson });
    const note = await updateNote(user.id, noteId, {
      title: validated.title,
      contentJson: validated.contentJson,
    });

    if (!note) {
      throw new Error('Note not found');
    }

    redirect(`/notes/${noteId}`);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(error.issues[0].message);
    }
    throw error;
  }
}

export async function deleteNoteAction(noteId: string) {
  const user = await requireAuth();
  await deleteNote(user.id, noteId);
  redirect('/dashboard');
}
```

**Security:** Uses requireAuth() for userId, database functions enforce user_id in WHERE clauses.

### 2. Create Dialog Component

**File:** `components/ui/dialog.tsx`

```typescript
"use client";

import { useEffect, useRef } from "react";

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
}

export function Dialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
}: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [isOpen]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="rounded-lg p-6 backdrop:bg-black/50 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
    >
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <p className="text-zinc-600 dark:text-zinc-400 mb-6">{description}</p>
      <div className="flex gap-3 justify-end">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium rounded-md border border-zinc-300 dark:border-zinc-700"
        >
          {cancelText}
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-2 text-sm font-medium rounded-md bg-red-600 text-white hover:bg-red-700"
        >
          {confirmText}
        </button>
      </div>
    </dialog>
  );
}
```

### 3. Extend Button Component

**File:** `components/ui/button.tsx`

Add variant prop to support different button styles:

- `variant`: "primary" (default blue), "secondary" (outlined), "danger" (red)
- Keep existing `loading` and `disabled` props
- Apply appropriate Tailwind classes based on variant

### 4. Create Delete Button Component

**File:** `components/delete-note-button.tsx`

```typescript
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { deleteNoteAction } from "@/app/(authenticated)/notes/actions";

interface DeleteNoteButtonProps {
  noteId: string;
  noteTitle: string;
}

export function DeleteNoteButton({ noteId, noteTitle }: DeleteNoteButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteNoteAction(noteId);
    } catch (error) {
      setIsDeleting(false);
      alert("Failed to delete note");
    }
  };

  return (
    <>
      <Button
        variant="danger"
        onClick={() => setIsDialogOpen(true)}
        disabled={isDeleting}
      >
        Delete
      </Button>
      <Dialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete Note"
        description={`Are you sure you want to delete "${noteTitle}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </>
  );
}
```

### 5. Create Edit Form Component

**File:** `components/edit-note-form.tsx`

Mirror `NewNoteForm` pattern with:

- Props: `noteId`, `initialTitle`, `initialContent`, `onSubmit`
- State: `title`, `contentJson`, `isSubmitting`, `error`
- Form with Input (title) and NoteEditor (editable)
- Submit calls onSubmit with FormData
- Cancel button: `<Link href="/notes/[noteId]">Cancel</Link>`
- Error display matching NewNoteForm styling

### 6. Create Edit Route

**File:** `app/(authenticated)/notes/[id]/edit/page.tsx`

```typescript
import { requireAuth } from "@/lib/session";
import { getNoteById } from "@/lib/notes";
import { notFound } from "next/navigation";
import { EditNoteForm } from "@/components/edit-note-form";
import { updateNoteAction } from "@/app/(authenticated)/notes/actions";
import Link from "next/link";

export default async function EditNotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireAuth();
  const { id } = await params;

  const note = await getNoteById(user.id, id);

  if (!note) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link
          href={`/notes/${id}`}
          className="inline-flex items-center text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Note
        </Link>
      </div>

      <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-8">
        Edit Note
      </h1>

      <EditNoteForm
        noteId={id}
        initialTitle={note.title}
        initialContent={note.contentJson}
        onSubmit={updateNoteAction}
      />
    </div>
  );
}
```

### 7. Update Note View Page

**File:** `app/(authenticated)/notes/[id]/page.tsx`

Add action buttons between back button and title (line 44):

```typescript
{/* Action buttons */}
<div className="flex gap-3 mb-6">
  <Link href={`/notes/${note.id}/edit`}>
    <Button variant="secondary">Edit</Button>
  </Link>
  <DeleteNoteButton noteId={note.id} noteTitle={note.title} />
</div>
```

Import: `import { DeleteNoteButton } from "@/components/delete-note-button";`

## Verification Testing

After implementation, test:

1. **Edit Flow:**
   - Click Edit button on note view page
   - Verify redirect to `/notes/[id]/edit`
   - Modify title and content in TipTap editor
   - Submit form
   - Verify redirect back to view page with updated content
   - Check database updated_at timestamp changed

2. **Delete Flow:**
   - Click Delete button on note view page
   - Verify dialog appears with note title
   - Click Cancel - dialog closes, nothing happens
   - Click Delete again, confirm
   - Verify redirect to /dashboard
   - Verify note no longer appears in list
   - Verify note removed from database

3. **Security:**
   - Try accessing edit page for non-existent note (should 404)
   - Try editing/deleting another user's note (should 404)

4. **Validation:**
   - Try saving empty title (should show error)
   - Try saving title > 200 chars (should show error)
   - Verify error messages display below input field

5. **UI/UX:**
   - Verify button variants render correctly (secondary, danger)
   - Test dialog ESC key closes dialog
   - Test dialog backdrop click closes dialog
   - Verify dark mode styling
   - Test loading states during submission
