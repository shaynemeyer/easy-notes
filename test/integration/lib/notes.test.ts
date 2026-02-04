import { describe, it, expect, beforeEach } from 'bun:test';
import { Database } from 'bun:sqlite';
import { createTestDb } from '../../helpers/test-db';
import { VALID_TIPTAP_DOC } from '../../helpers/test-fixtures';

// Mock the db module to use our test database
let testDb: Database;

// Use Bun's mock module
import { mock } from 'bun:test';

mock.module('@/lib/db', () => ({
  query: (sql: string, params: any[]) => testDb.prepare(sql).all(...params),
  get: (sql: string, params: any[]) => testDb.prepare(sql).get(...params),
  run: (sql: string, params: any[]) => testDb.prepare(sql).run(...params),
}));

// Now import the module under test
import {
  createNote,
  getNoteById,
  getNotesByUser,
  updateNote,
  deleteNote,
  setNotePublic,
  getNoteByPublicSlug,
} from '@/lib/notes';

describe('notes.ts - Business Logic', () => {
  const TEST_USER_ID = 'test-user-123';
  const OTHER_USER_ID = 'other-user-456';

  beforeEach(() => {
    testDb = createTestDb();
  });

  describe('createNote', () => {
    it('should create note with defaults (Untitled, empty doc, private)', async () => {
      const note = await createNote(TEST_USER_ID);

      expect(note.id).toBeDefined();
      expect(note.userId).toBe(TEST_USER_ID);
      expect(note.title).toBe('Untitled note');
      expect(note.contentJson).toContain('"type":"doc"');
      expect(note.isPublic).toBe(false);
      expect(note.publicSlug).toBeNull();
      expect(note.createdAt).toBeDefined();
      expect(note.updatedAt).toBeDefined();
    });

    it('should create public note with 16-char slug', async () => {
      const note = await createNote(TEST_USER_ID, { isPublic: true });

      expect(note.isPublic).toBe(true);
      expect(note.publicSlug).toBeDefined();
      expect(note.publicSlug!.length).toBeGreaterThanOrEqual(16);
    });

    it('should create note with custom title and content', async () => {
      const customTitle = 'My Custom Note';
      const customContent = JSON.stringify(VALID_TIPTAP_DOC);

      const note = await createNote(TEST_USER_ID, {
        title: customTitle,
        contentJson: customContent,
      });

      expect(note.title).toBe(customTitle);
      expect(note.contentJson).toBe(customContent);
    });

    it('should verify database insertion', async () => {
      const note = await createNote(TEST_USER_ID);

      const row = testDb.prepare('SELECT * FROM notes WHERE id = ?').get(note.id);
      expect(row).toBeDefined();
      expect((row as any).user_id).toBe(TEST_USER_ID);
    });
  });

  describe('getNoteById', () => {
    it('should return note for owner', async () => {
      const created = await createNote(TEST_USER_ID, { title: 'Test Note' });
      const retrieved = await getNoteById(TEST_USER_ID, created.id);

      expect(retrieved).not.toBeNull();
      expect(retrieved!.id).toBe(created.id);
      expect(retrieved!.title).toBe('Test Note');
    });

    it('should return null for non-owner (security check)', async () => {
      const created = await createNote(TEST_USER_ID);
      const retrieved = await getNoteById(OTHER_USER_ID, created.id);

      expect(retrieved).toBeNull();
    });

    it('should return null for non-existent ID', async () => {
      const retrieved = await getNoteById(TEST_USER_ID, 'non-existent-id');
      expect(retrieved).toBeNull();
    });
  });

  describe('getNotesByUser', () => {
    it('should return all user notes ordered by updated_at DESC', async () => {
      await createNote(TEST_USER_ID, { title: 'Note 1' });
      await new Promise((resolve) => setTimeout(resolve, 10)); // Small delay
      await createNote(TEST_USER_ID, { title: 'Note 2' });
      await new Promise((resolve) => setTimeout(resolve, 10));
      await createNote(TEST_USER_ID, { title: 'Note 3' });

      const notes = await getNotesByUser(TEST_USER_ID);

      expect(notes).toHaveLength(3);
      expect(notes[0].title).toBe('Note 3'); // Most recent
      expect(notes[1].title).toBe('Note 2');
      expect(notes[2].title).toBe('Note 1');
    });

    it('should return empty array when no notes', async () => {
      const notes = await getNotesByUser(TEST_USER_ID);
      expect(notes).toEqual([]);
    });

    it('should filter out other users notes (security check)', async () => {
      await createNote(TEST_USER_ID, { title: 'User 1 Note' });
      await createNote(OTHER_USER_ID, { title: 'User 2 Note' });

      const notes = await getNotesByUser(TEST_USER_ID);

      expect(notes).toHaveLength(1);
      expect(notes[0].title).toBe('User 1 Note');
    });
  });

  describe('updateNote', () => {
    it('should update title only', async () => {
      const created = await createNote(TEST_USER_ID, { title: 'Original' });
      const updated = await updateNote(TEST_USER_ID, created.id, { title: 'Updated' });

      expect(updated).not.toBeNull();
      expect(updated!.title).toBe('Updated');
      expect(updated!.contentJson).toBe(created.contentJson);
    });

    it('should update content only', async () => {
      const created = await createNote(TEST_USER_ID);
      const newContent = JSON.stringify(VALID_TIPTAP_DOC);
      const updated = await updateNote(TEST_USER_ID, created.id, { contentJson: newContent });

      expect(updated).not.toBeNull();
      expect(updated!.contentJson).toBe(newContent);
      expect(updated!.title).toBe(created.title);
    });

    it('should update isPublic and generate slug if needed', async () => {
      const created = await createNote(TEST_USER_ID);
      expect(created.isPublic).toBe(false);

      const updated = await updateNote(TEST_USER_ID, created.id, { isPublic: true });

      expect(updated).not.toBeNull();
      expect(updated!.isPublic).toBe(true);
      expect(updated!.publicSlug).toBeDefined();
      expect(updated!.publicSlug!.length).toBeGreaterThanOrEqual(16);
    });

    it('should return null for non-owner (security check)', async () => {
      const created = await createNote(TEST_USER_ID);
      const updated = await updateNote(OTHER_USER_ID, created.id, { title: 'Hacked' });

      expect(updated).toBeNull();

      // Verify the note was not updated
      const original = await getNoteById(TEST_USER_ID, created.id);
      expect(original!.title).toBe(created.title);
    });

    it('should update updated_at timestamp', async () => {
      const created = await createNote(TEST_USER_ID);
      await new Promise((resolve) => setTimeout(resolve, 10));
      const updated = await updateNote(TEST_USER_ID, created.id, { title: 'Updated' });

      expect(updated!.updatedAt).not.toBe(created.updatedAt);
    });

    it('should return existing note if no updates provided', async () => {
      const created = await createNote(TEST_USER_ID);
      const updated = await updateNote(TEST_USER_ID, created.id, {});

      expect(updated).toEqual(created);
    });
  });

  describe('deleteNote', () => {
    it('should delete owned note', async () => {
      const created = await createNote(TEST_USER_ID);
      await deleteNote(TEST_USER_ID, created.id);

      const retrieved = await getNoteById(TEST_USER_ID, created.id);
      expect(retrieved).toBeNull();
    });

    it('should not delete non-owned note (security check)', async () => {
      const created = await createNote(TEST_USER_ID);
      await deleteNote(OTHER_USER_ID, created.id);

      const retrieved = await getNoteById(TEST_USER_ID, created.id);
      expect(retrieved).not.toBeNull();
    });

    it('should be no-op for non-existent note', async () => {
      await expect(deleteNote(TEST_USER_ID, 'non-existent-id')).resolves.toBeUndefined();
    });
  });

  describe('setNotePublic', () => {
    it('should enable sharing and generate slug', async () => {
      const created = await createNote(TEST_USER_ID);
      expect(created.isPublic).toBe(false);

      const updated = await setNotePublic(TEST_USER_ID, created.id, true);

      expect(updated).not.toBeNull();
      expect(updated!.isPublic).toBe(true);
      expect(updated!.publicSlug).toBeDefined();
      expect(updated!.publicSlug!.length).toBeGreaterThanOrEqual(16);
    });

    it('should disable sharing but keep slug', async () => {
      const created = await createNote(TEST_USER_ID, { isPublic: true });
      const originalSlug = created.publicSlug;

      const updated = await setNotePublic(TEST_USER_ID, created.id, false);

      expect(updated).not.toBeNull();
      expect(updated!.isPublic).toBe(false);
      expect(updated!.publicSlug).toBe(originalSlug); // Slug preserved
    });

    it('should return null for non-owner (security check)', async () => {
      const created = await createNote(TEST_USER_ID);
      const updated = await setNotePublic(OTHER_USER_ID, created.id, true);

      expect(updated).toBeNull();

      // Verify the note was not made public
      const original = await getNoteById(TEST_USER_ID, created.id);
      expect(original!.isPublic).toBe(false);
    });

    it('should reuse existing slug when re-enabling public', async () => {
      const created = await createNote(TEST_USER_ID, { isPublic: true });
      const originalSlug = created.publicSlug;

      await setNotePublic(TEST_USER_ID, created.id, false);
      const reEnabled = await setNotePublic(TEST_USER_ID, created.id, true);

      expect(reEnabled!.publicSlug).toBe(originalSlug);
    });
  });

  describe('getNoteByPublicSlug', () => {
    it('should return public note by slug', async () => {
      const created = await createNote(TEST_USER_ID, {
        title: 'Public Note',
        isPublic: true,
      });

      const retrieved = await getNoteByPublicSlug(created.publicSlug!);

      expect(retrieved).not.toBeNull();
      expect(retrieved!.id).toBe(created.id);
      expect(retrieved!.title).toBe('Public Note');
    });

    it('should return null for private note (privacy check)', async () => {
      const created = await createNote(TEST_USER_ID, { isPublic: true });
      await setNotePublic(TEST_USER_ID, created.id, false);

      const retrieved = await getNoteByPublicSlug(created.publicSlug!);

      expect(retrieved).toBeNull();
    });

    it('should return null for invalid slug', async () => {
      const retrieved = await getNoteByPublicSlug('invalid-slug');
      expect(retrieved).toBeNull();
    });

    it('should not require authentication', async () => {
      // This test verifies the function doesn't check userId
      const created = await createNote(TEST_USER_ID, { isPublic: true });
      const retrieved = await getNoteByPublicSlug(created.publicSlug!);

      expect(retrieved).not.toBeNull();
    });
  });
});
