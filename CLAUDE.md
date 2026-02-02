# CLAUDE.md

We're building the app described in @SPEC.md. Read that file for general architectural tasks or to double-check the exact database structure, tech stack or application architecture.

Keep your replies extremely concise and focus on conveying the key information. No unnecessary fluff, no long code snippets.

Whenever working with any third-party library or something similar, you MUST look up the official documentation to ensure that you're working with up-to-date information.
Use the DocsExplorer subagent for efficient documentation lookup.

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A note-taking web application built with Next.js 16 (App Router), TypeScript, TailwindCSS, and Bun runtime. Users can create, edit, delete, and publicly share rich-text notes with authentication via better-auth and storage in SQLite.

## Development Commands

```bash
# Development server (runs on http://localhost:3000)
bun run dev

# Production build
bun run build

# Start production server
bun start

# Lint code
bun run lint
```

## Tech Stack

- **Runtime:** Bun (NOT npm/yarn/pnpm)
- **Framework:** Next.js 16.1.1 with App Router
- **Language:** TypeScript 5 (strict mode enabled)
- **Styling:** TailwindCSS v4
- **Database:** SQLite via Bun's built-in SQLite client
- **Auth:** better-auth 1.4.18
- **Rich Text Editor:** TipTap 3.18.0
- **Validation:** Zod 4.3.6

## Architecture

### Directory Structure

```ascii
app/                    # Next.js App Router
├── api/               # API route handlers (to be created)
├── (auth)/            # Auth routes: login, register (to be created)
├── dashboard/         # Authenticated notes list (to be created)
├── notes/[id]/        # Note editor page (to be created)
├── p/[slug]/          # Public note viewer (to be created)
├── layout.tsx         # Root layout with fonts
├── page.tsx           # Landing page
└── globals.css        # Global styles + TailwindCSS

lib/                   # Server utilities (to be created)
├── db.ts              # SQLite connection & helpers
├── notes.ts           # Note repository functions
└── auth.ts            # better-auth configuration

components/            # React components (to be created)
├── NoteEditor.tsx     # TipTap editor wrapper
├── NoteList.tsx       # List of user notes
├── ShareToggle.tsx    # Public sharing toggle
└── DeleteNoteButton.tsx
```

### Data Flow

1. **Authentication:** better-auth manages user sessions; server components/API routes use `getCurrentUser()` to enforce auth
2. **Database Access:** `lib/db.ts` exports singleton SQLite connection; `lib/notes.ts` contains repository functions with raw SQL queries
3. **API Layer:** Route handlers in `app/api/notes/` expose REST-like JSON endpoints
4. **Frontend:** Server components fetch data; client components handle TipTap editor and interactive UI

### Database Schema

**better-auth tables** (auto-generated via `npx @better-auth/cli migrate`):

- `user` - User accounts (id, email, name, emailVerified, etc.)
- `session` - Active sessions
- `account` - Auth providers/credentials
- `verification` - Email verification codes

**Application tables:**

- `notes` - User notes with:
  - `id` (TEXT, PK)
  - `user_id` (TEXT, FK to user.id)
  - `title` (TEXT)
  - `content_json` (TEXT) - Stringified TipTap JSON document
  - `is_public` (INTEGER) - 0/1 boolean
  - `public_slug` (TEXT, UNIQUE) - For public sharing
  - `created_at`, `updated_at` (TEXT, ISO 8601)

**Indexes:**

```sql
CREATE INDEX idx_notes_user_id ON notes(user_id);
CREATE INDEX idx_notes_public_slug ON notes(public_slug);
CREATE INDEX idx_notes_is_public ON notes(is_public);
```

### API Routes (to be implemented)

All routes under `/api/notes` require authentication except public note reads.

- `GET /api/notes` - List current user's notes
- `POST /api/notes` - Create new note
- `GET /api/notes/:id` - Get single note (auth required, owner check)
- `PUT /api/notes/:id` - Update note title/content
- `DELETE /api/notes/:id` - Delete note
- `POST /api/notes/:id/share` - Toggle public sharing (generates/removes `public_slug`)
- `GET /api/public-notes/:slug` - Get public note (no auth)

**Security:** All authenticated endpoints MUST filter queries by `user_id` from session to prevent cross-user access.

## TipTap Integration

### Editor Configuration

```typescript
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

const editor = useEditor({
  extensions: [
    StarterKit.configure({
      heading: { levels: [1, 2, 3] },
    }),
  ],
  content: JSON.parse(contentJson), // Load from DB
  onUpdate: ({ editor }) => {
    const json = editor.getJSON();
    // Save to DB via API
  },
});
```

### Supported Formatting

- Bold, Italic
- Headings (H1, H2, H3)
- Inline code, code blocks
- Bullet lists
- Horizontal rules

**Storage:** Always store as `JSON.stringify(editor.getJSON())` in DB; parse when loading.

## Path Aliases

- `@/*` maps to project root (configured in tsconfig.json)
- Example: `import { getDb } from '@/lib/db'`

## Important Implementation Notes

### Database Initialization

Before running the app, initialize SQLite database:

1. Run `npx @better-auth/cli migrate` to create auth tables
2. Create `notes` table and indexes manually or via init script

### better-auth Setup

Configure in `lib/auth.ts` with:

- SQLite adapter pointing to same DB file
- Email/password provider
- Session management

Do NOT modify better-auth table schemas; it will break authentication.

### Public Note Slugs

When enabling public sharing (`is_public = 1`), generate a random slug with sufficient entropy (16+ chars) to prevent guessing. Use `nanoid()` or similar.

### Security Requirements

- All note queries in authenticated context MUST include `WHERE user_id = ?`
- Validate TipTap JSON structure with Zod before saving
- Only render TipTap content using TipTap's rendering (no `dangerouslySetInnerHTML` with raw HTML)
- Public slugs should be unguessable random strings

### Styling

TailwindCSS v4 is configured with custom CSS variables in `app/globals.css`:

- Theme variables: `--background`, `--foreground`
- Font families: `--font-geist-sans`, `--font-geist-mono`
- Supports light/dark mode via `@media (prefers-color-scheme: dark)`

## Environment Setup

Create `.env` file (see `.env.example`) for:

- Database path
- better-auth secrets
- Any API keys

## Reference Documentation

See `SPEC.md` for complete technical specification including:

- Detailed API contracts
- Full database schema
- Component specifications
- Development workflow
