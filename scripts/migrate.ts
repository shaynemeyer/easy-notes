#!/usr/bin/env bun

import { Database } from 'bun:sqlite';

const dbPath = process.env.DATABASE_PATH || 'data/app.db';
console.log(`Migrating database at ${dbPath}...`);

const db = new Database(dbPath, { create: true });

// Enable WAL mode
db.exec('PRAGMA journal_mode = WAL;');

// Create better-auth tables
db.exec(`
  CREATE TABLE IF NOT EXISTS user (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    emailVerified INTEGER NOT NULL DEFAULT 0,
    name TEXT NOT NULL,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL,
    image TEXT
  );
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS session (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    expiresAt TEXT NOT NULL,
    token TEXT,
    ipAddress TEXT,
    userAgent TEXT,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL,
    FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE
  );
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS account (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    accountId TEXT NOT NULL,
    providerId TEXT NOT NULL,
    accessToken TEXT,
    refreshToken TEXT,
    idToken TEXT,
    expiresAt TEXT,
    password TEXT,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL,
    FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE
  );
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS verification (
    id TEXT PRIMARY KEY,
    identifier TEXT NOT NULL,
    value TEXT NOT NULL,
    expiresAt TEXT NOT NULL,
    createdAt TEXT NOT NULL,
    updatedAt TEXT
  );
`);

// Create indexes for auth tables
db.exec('CREATE INDEX IF NOT EXISTS idx_session_userId ON session(userId);');
db.exec('CREATE INDEX IF NOT EXISTS idx_account_userId ON account(userId);');

// Create notes table
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

// Create indexes for notes table
db.exec('CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);');
db.exec('CREATE INDEX IF NOT EXISTS idx_notes_public_slug ON notes(public_slug);');
db.exec('CREATE INDEX IF NOT EXISTS idx_notes_is_public ON notes(is_public);');

console.log('✓ Migration completed successfully!');
db.close();
