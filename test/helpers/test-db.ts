import { Database } from 'bun:sqlite';

export function createTestDb(): Database {
  const db = new Database(':memory:');

  // Create notes table
  db.run(`
    CREATE TABLE notes (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      content_json TEXT NOT NULL,
      is_public INTEGER NOT NULL DEFAULT 0,
      public_slug TEXT UNIQUE,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);

  // Create indexes
  db.run('CREATE INDEX idx_notes_user_id ON notes(user_id)');
  db.run('CREATE INDEX idx_notes_public_slug ON notes(public_slug)');
  db.run('CREATE INDEX idx_notes_is_public ON notes(is_public)');

  return db;
}

export function seedTestData(db: Database, userId: string) {
  const now = new Date().toISOString();

  db.run(
    `INSERT INTO notes (id, user_id, title, content_json, is_public, public_slug, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'note-1',
      userId,
      'Test Note 1',
      JSON.stringify({
        type: 'doc',
        content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Content 1' }] }],
      }),
      0,
      null,
      now,
      now,
    ],
  );

  db.run(
    `INSERT INTO notes (id, user_id, title, content_json, is_public, public_slug, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'note-2',
      userId,
      'Test Note 2',
      JSON.stringify({
        type: 'doc',
        content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Content 2' }] }],
      }),
      1,
      'public-slug-123',
      now,
      now,
    ],
  );
}

export function clearAllTables(db: Database) {
  db.run('DELETE FROM notes');
}
