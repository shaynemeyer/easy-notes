import { Database } from 'bun:sqlite';

export interface NoteRow {
  id: string;
  user_id: string;
  title: string;
  content_json: string;
  is_public: number; // SQLite uses 0/1 for boolean
  public_slug: string | null;
  created_at: string;
  updated_at: string;
}

let db: Database | null = null;

export function getDb(): Database {
  if (!db) {
    const dbPath = process.env.DATABASE_PATH || 'data/app.db';
    db = new Database(dbPath, { create: true });

    // Enable WAL mode for better read/write concurrency
    db.exec('PRAGMA journal_mode = WAL;');

    // Create notes table if not exists
    db.exec(`
      CREATE TABLE IF NOT EXISTS notes (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        content_json TEXT NOT NULL,
        is_public INTEGER NOT NULL DEFAULT 0,
        public_slug TEXT UNIQUE,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);

    // Create indexes
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
    `);
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_notes_public_slug ON notes(public_slug);
    `);
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_notes_is_public ON notes(is_public);
    `);

    console.log(`Database initialized at ${dbPath} with WAL mode enabled`);
  }

  return db;
}

// Utility wrapper functions for database operations
export function query<T>(sql: string, params?: any[]): T[] {
  const db = getDb();
  const stmt = db.query<T, any>(sql);
  return params ? stmt.all(...params) : stmt.all();
}

export function get<T>(sql: string, params?: any[]): T | undefined {
  const db = getDb();
  const stmt = db.query<T, any>(sql);
  const result = params ? stmt.get(...params) : stmt.get();
  return result ?? undefined;
}

export function run(sql: string, params?: any[]) {
  const db = getDb();
  return params ? db.run(sql, params) : db.run(sql);
}
