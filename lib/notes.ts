import { query, get, run, type NoteRow } from '@/lib/db';
import { nanoid } from 'nanoid';

// Application model type with proper camelCase and boolean mapping
export type Note = {
  id: string;
  userId: string;
  title: string;
  contentJson: string;
  isPublic: boolean;
  publicSlug: string | null;
  createdAt: string;
  updatedAt: string;
};

// Helper function to convert database row to application model
function rowToNote(row: NoteRow): Note {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    contentJson: row.content_json,
    isPublic: row.is_public === 1,
    publicSlug: row.public_slug,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Default empty TipTap document
const EMPTY_TIPTAP_DOC = JSON.stringify({
  type: 'doc',
  content: [{ type: 'paragraph' }],
});

/**
 * Create a new note for a user
 */
export async function createNote(
  userId: string,
  data: { title?: string; contentJson?: string; isPublic?: boolean } = {},
): Promise<Note> {
  const id = nanoid();
  const title = data.title || 'Untitled note';
  const contentJson = data.contentJson || EMPTY_TIPTAP_DOC;
  const now = new Date().toISOString();
  const isPublic = data.isPublic ?? false;
  const publicSlug = isPublic ? nanoid(16) : null;

  run(
    `INSERT INTO notes (id, user_id, title, content_json, is_public, public_slug, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, userId, title, contentJson, isPublic ? 1 : 0, publicSlug, now, now],
  );

  const row = get<NoteRow>('SELECT * FROM notes WHERE id = ?', [id]);
  if (!row) {
    throw new Error('Failed to create note');
  }

  return rowToNote(row);
}

/**
 * Get a single note by ID (enforces user ownership)
 */
export async function getNoteById(userId: string, noteId: string): Promise<Note | null> {
  const row = get<NoteRow>('SELECT * FROM notes WHERE id = ? AND user_id = ?', [noteId, userId]);

  return row ? rowToNote(row) : null;
}

/**
 * Get all notes for a user
 */
export async function getNotesByUser(userId: string): Promise<Note[]> {
  const rows = query<NoteRow>('SELECT * FROM notes WHERE user_id = ? ORDER BY updated_at DESC', [
    userId,
  ]);

  return rows.map(rowToNote);
}

/**
 * Update a note's title and/or content (enforces user ownership)
 */
export async function updateNote(
  userId: string,
  noteId: string,
  data: Partial<{ title: string; contentJson: string; isPublic: boolean }>,
): Promise<Note | null> {
  // First verify the note exists and belongs to the user
  const existing = await getNoteById(userId, noteId);
  if (!existing) {
    return null;
  }

  const updates: string[] = [];
  const params: any[] = [];

  if (data.title !== undefined) {
    updates.push('title = ?');
    params.push(data.title);
  }

  if (data.contentJson !== undefined) {
    updates.push('content_json = ?');
    params.push(data.contentJson);
  }

  if (data.isPublic !== undefined) {
    updates.push('is_public = ?');
    params.push(data.isPublic ? 1 : 0);

    // Generate slug if enabling public sharing and no slug exists
    if (data.isPublic && !existing.publicSlug) {
      updates.push('public_slug = ?');
      params.push(nanoid(16));
    }
  }

  if (updates.length === 0) {
    return existing; // No updates needed
  }

  // Always update the updated_at timestamp
  updates.push('updated_at = ?');
  params.push(new Date().toISOString());

  // Add WHERE clause parameters
  params.push(noteId, userId);

  run(`UPDATE notes SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`, params);

  return getNoteById(userId, noteId);
}

/**
 * Delete a note (enforces user ownership)
 */
export async function deleteNote(userId: string, noteId: string): Promise<void> {
  run('DELETE FROM notes WHERE id = ? AND user_id = ?', [noteId, userId]);
}

/**
 * Toggle public sharing for a note (enforces user ownership)
 */
export async function setNotePublic(
  userId: string,
  noteId: string,
  isPublic: boolean,
): Promise<Note | null> {
  // First verify the note exists and belongs to the user
  const existing = await getNoteById(userId, noteId);
  if (!existing) {
    return null;
  }

  const now = new Date().toISOString();

  if (isPublic) {
    // Enable public sharing - generate slug if it doesn't exist
    const publicSlug = existing.publicSlug || nanoid(16);

    run(
      'UPDATE notes SET is_public = 1, public_slug = ?, updated_at = ? WHERE id = ? AND user_id = ?',
      [publicSlug, now, noteId, userId],
    );
  } else {
    // Disable public sharing - keep slug but set is_public to 0
    run('UPDATE notes SET is_public = 0, updated_at = ? WHERE id = ? AND user_id = ?', [
      now,
      noteId,
      userId,
    ]);
  }

  return getNoteById(userId, noteId);
}

/**
 * Get a public note by its slug (no authentication required)
 */
export async function getNoteByPublicSlug(slug: string): Promise<Note | null> {
  const row = get<NoteRow>('SELECT * FROM notes WHERE public_slug = ? AND is_public = 1', [slug]);

  return row ? rowToNote(row) : null;
}
