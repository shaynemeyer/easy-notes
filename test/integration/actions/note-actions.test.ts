import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { Database } from 'bun:sqlite';
import { createTestDb } from '../../helpers/test-db';
import { createMockUser, VALID_TIPTAP_DOC } from '../../helpers/test-fixtures';

// Set up test database
let testDb: Database;

// Mock dependencies
const mockRequireAuth = mock(() => Promise.resolve(createMockUser()));
const mockRedirect = mock((url: string) => {
  throw new Error(`NEXT_REDIRECT: ${url}`);
});

mock.module('@/lib/session', () => ({
  requireAuth: mockRequireAuth,
}));

mock.module('next/navigation', () => ({
  redirect: mockRedirect,
}));

mock.module('@/lib/db', () => ({
  query: (sql: string, params: any[]) => testDb.prepare(sql).all(...params),
  get: (sql: string, params: any[]) => testDb.prepare(sql).get(...params),
  run: (sql: string, params: any[]) => testDb.prepare(sql).run(...params),
}));

// Import actions after mocking
import {
  createNoteAction,
  updateNoteAction,
  deleteNoteAction,
} from '@/app/(authenticated)/notes/actions';

describe('note-actions.ts', () => {
  const mockUser = createMockUser();

  beforeEach(() => {
    testDb = createTestDb();
    mockRequireAuth.mockReset();
    mockRedirect.mockReset();
    mockRequireAuth.mockResolvedValue(mockUser);
    mockRedirect.mockImplementation((url: string) => {
      throw new Error(`NEXT_REDIRECT: ${url}`);
    });
  });

  describe('createNoteAction', () => {
    it('should create note and redirect to note page', async () => {
      const formData = new FormData();
      formData.append('title', 'Test Note');
      formData.append('contentJson', JSON.stringify(VALID_TIPTAP_DOC));
      formData.append('isPublic', 'false');

      await expect(createNoteAction(formData)).rejects.toThrow(/NEXT_REDIRECT: \/notes\/.+/);

      // Verify note was created
      const notes = testDb.prepare('SELECT * FROM notes WHERE user_id = ?').all(mockUser.id);
      expect(notes).toHaveLength(1);
      expect((notes[0] as any).title).toBe('Test Note');
    });

    it('should validate title is required', async () => {
      const formData = new FormData();
      formData.append('title', '');
      formData.append('contentJson', JSON.stringify(VALID_TIPTAP_DOC));

      await expect(createNoteAction(formData)).rejects.toThrow('Title is required');
    });

    it('should validate title max length (200 chars)', async () => {
      const formData = new FormData();
      formData.append('title', 'a'.repeat(201));
      formData.append('contentJson', JSON.stringify(VALID_TIPTAP_DOC));

      await expect(createNoteAction(formData)).rejects.toThrow(
        'Title must be 200 characters or less',
      );
    });

    it('should validate TipTap document structure', async () => {
      const formData = new FormData();
      formData.append('title', 'Test');
      formData.append('contentJson', JSON.stringify({ type: 'invalid' }));

      await expect(createNoteAction(formData)).rejects.toThrow('Invalid content format');
    });

    it('should reject invalid JSON', async () => {
      const formData = new FormData();
      formData.append('title', 'Test');
      formData.append('contentJson', 'not json');

      await expect(createNoteAction(formData)).rejects.toThrow('Invalid content format');
    });

    it('should require authentication', async () => {
      mockRequireAuth.mockRejectedValue(new Error('Unauthorized'));

      const formData = new FormData();
      formData.append('title', 'Test');
      formData.append('contentJson', JSON.stringify(VALID_TIPTAP_DOC));

      await expect(createNoteAction(formData)).rejects.toThrow('Unauthorized');
    });

    it('should create public note when isPublic is true', async () => {
      const formData = new FormData();
      formData.append('title', 'Public Note');
      formData.append('contentJson', JSON.stringify(VALID_TIPTAP_DOC));
      formData.append('isPublic', 'true');

      await expect(createNoteAction(formData)).rejects.toThrow(/NEXT_REDIRECT/);

      const notes = testDb.prepare('SELECT * FROM notes WHERE user_id = ?').all(mockUser.id);
      expect(notes).toHaveLength(1);
      expect((notes[0] as any).is_public).toBe(1);
      expect((notes[0] as any).public_slug).toBeDefined();
    });
  });

  describe('updateNoteAction', () => {
    it('should update note and redirect', async () => {
      // Create a note first
      const noteId = 'test-note-123';
      testDb
        .prepare(
          'INSERT INTO notes (id, user_id, title, content_json, is_public, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        )
        .run(
          noteId,
          mockUser.id,
          'Original Title',
          JSON.stringify(VALID_TIPTAP_DOC),
          0,
          new Date().toISOString(),
          new Date().toISOString(),
        );

      const formData = new FormData();
      formData.append('title', 'Updated Title');
      formData.append('contentJson', JSON.stringify(VALID_TIPTAP_DOC));
      formData.append('isPublic', 'false');

      await expect(updateNoteAction(noteId, formData)).rejects.toThrow(
        `NEXT_REDIRECT: /notes/${noteId}`,
      );

      const note = testDb.prepare('SELECT * FROM notes WHERE id = ?').get(noteId) as any;
      expect(note.title).toBe('Updated Title');
    });

    it('should validate ownership', async () => {
      const noteId = 'other-user-note';
      testDb
        .prepare(
          'INSERT INTO notes (id, user_id, title, content_json, is_public, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        )
        .run(
          noteId,
          'other-user-id',
          'Original',
          JSON.stringify(VALID_TIPTAP_DOC),
          0,
          new Date().toISOString(),
          new Date().toISOString(),
        );

      const formData = new FormData();
      formData.append('title', 'Hacked Title');
      formData.append('contentJson', JSON.stringify(VALID_TIPTAP_DOC));

      await expect(updateNoteAction(noteId, formData)).rejects.toThrow('Note not found');
    });

    it('should validate input data', async () => {
      const noteId = 'test-note-123';
      testDb
        .prepare(
          'INSERT INTO notes (id, user_id, title, content_json, is_public, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        )
        .run(
          noteId,
          mockUser.id,
          'Original',
          JSON.stringify(VALID_TIPTAP_DOC),
          0,
          new Date().toISOString(),
          new Date().toISOString(),
        );

      const formData = new FormData();
      formData.append('title', '');
      formData.append('contentJson', JSON.stringify(VALID_TIPTAP_DOC));

      await expect(updateNoteAction(noteId, formData)).rejects.toThrow('Title is required');
    });

    it('should require authentication', async () => {
      mockRequireAuth.mockRejectedValue(new Error('Unauthorized'));

      const formData = new FormData();
      formData.append('title', 'Test');
      formData.append('contentJson', JSON.stringify(VALID_TIPTAP_DOC));

      await expect(updateNoteAction('any-id', formData)).rejects.toThrow('Unauthorized');
    });
  });

  describe('deleteNoteAction', () => {
    it('should delete note and redirect to dashboard', async () => {
      const noteId = 'test-note-123';
      testDb
        .prepare(
          'INSERT INTO notes (id, user_id, title, content_json, is_public, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        )
        .run(
          noteId,
          mockUser.id,
          'Test',
          JSON.stringify(VALID_TIPTAP_DOC),
          0,
          new Date().toISOString(),
          new Date().toISOString(),
        );

      await expect(deleteNoteAction(noteId)).rejects.toThrow('NEXT_REDIRECT: /dashboard');

      const note = testDb.prepare('SELECT * FROM notes WHERE id = ?').get(noteId);
      expect(note).toBeNull();
    });

    it('should validate ownership (only delete own notes)', async () => {
      const noteId = 'other-user-note';
      testDb
        .prepare(
          'INSERT INTO notes (id, user_id, title, content_json, is_public, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        )
        .run(
          noteId,
          'other-user-id',
          'Test',
          JSON.stringify(VALID_TIPTAP_DOC),
          0,
          new Date().toISOString(),
          new Date().toISOString(),
        );

      await expect(deleteNoteAction(noteId)).rejects.toThrow('NEXT_REDIRECT: /dashboard');

      // Note should still exist
      const note = testDb.prepare('SELECT * FROM notes WHERE id = ?').get(noteId);
      expect(note).toBeDefined();
    });

    it('should require authentication', async () => {
      mockRequireAuth.mockRejectedValue(new Error('Unauthorized'));

      await expect(deleteNoteAction('any-id')).rejects.toThrow('Unauthorized');
    });
  });
});
