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

# Format code with oxfmt
bun run format

# Run all tests (unit + integration)
bun run test

# Run unit tests only
bun run test:unit

# Run integration tests only
bun run test:integration

# Watch mode for tests
bun run test:watch

# Test coverage report
bun run test:coverage
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
- **Testing:** Vitest 4.0.18 with happy-dom and coverage (v8)
- **Formatting:** oxfmt 0.28.0

## Architecture

### Directory Structure

```ascii
app/                          # Next.js App Router
├── api/
│   └── auth/[...all]/       # better-auth route handler
├── (authenticated)/         # Auth-protected routes
│   ├── dashboard/           # Notes list page
│   ├── notes/
│   │   ├── actions.ts       # Server Actions (create, update, delete)
│   │   ├── new/             # Create note page
│   │   └── [id]/
│   │       ├── page.tsx     # View note
│   │       └── edit/        # Edit note page
│   └── layout.tsx           # Authenticated layout with header
├── authenticate/            # Login/register page
├── p/[slug]/               # Public note viewer (no auth)
├── layout.tsx              # Root layout with fonts
├── page.tsx                # Landing page
└── globals.css             # Global styles + TailwindCSS

lib/                        # Server utilities
├── db.ts                   # SQLite connection & query helpers
├── notes.ts                # Note repository (CRUD + public sharing)
├── session.ts              # requireAuth() helper
├── note-utils.ts           # Note utility functions
├── auth.ts                 # better-auth server config
└── auth-client.ts          # better-auth client config

components/                 # React components
├── ui/                     # shadcn-style UI primitives
│   ├── button.tsx
│   ├── dialog.tsx
│   └── input.tsx
├── note-editor.tsx         # TipTap editor wrapper
├── note-card.tsx           # Note display card
├── new-note-form.tsx       # Create note form
├── edit-note-form.tsx      # Edit note form
├── share-note-toggle.tsx   # Public sharing toggle
├── delete-note-button.tsx  # Delete confirmation dialog
├── auth-form.tsx           # Login/register form
└── header.tsx              # App header with navigation
```

### Data Flow

1. **Authentication:** better-auth manages user sessions; server components and Server Actions use `requireAuth()` from `lib/session.ts` to enforce auth
2. **Database Access:** `lib/db.ts` exports SQLite query helpers; `lib/notes.ts` contains repository functions with raw SQL queries and user ownership checks
3. **API Layer:** Next.js Server Actions in `app/(authenticated)/notes/actions.ts` handle note mutations (create, update, delete) with form data and Zod validation
4. **Frontend:** Server components fetch data directly from repository; client components handle TipTap editor, forms, and interactive UI

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

### Server Actions

All Server Actions in `app/(authenticated)/notes/actions.ts` require authentication and enforce user ownership:

- `createNoteAction(formData)` - Create new note with title, content, and optional public flag
- `updateNoteAction(noteId, formData)` - Update note title, content, or public status
- `deleteNoteAction(noteId)` - Delete note and redirect to dashboard

**Server-side data fetching** (used in Server Components):

- `getNotesByUser(userId)` - List all notes for authenticated user
- `getNoteById(userId, noteId)` - Get single note (enforces ownership)
- `getNoteByPublicSlug(slug)` - Get public note by slug (no auth required)
- `setNotePublic(userId, noteId, isPublic)` - Toggle public sharing

**Security:** All authenticated functions enforce user ownership via `userId` parameter checks in SQL queries (`WHERE user_id = ?`).

## TipTap Integration

### Editor Configuration

The `NoteEditor` component (`components/note-editor.tsx`) wraps TipTap with:

```typescript
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

const editor = useEditor({
  extensions: [
    StarterKit.configure({
      heading: { levels: [1, 2, 3] },
    }),
  ],
  content: parseContent(initialContent), // Parse JSON from DB
  editable: true, // Can be false for read-only view
  immediatelyRender: false,
  onUpdate: ({ editor }) => {
    const json = JSON.stringify(editor.getJSON());
    onChange(json); // Callback to save
  },
});
```

### Supported Formatting

The editor toolbar provides:

- **Text styles:** Bold, Italic, Inline code
- **Headings:** H1, H2, H3
- **Lists:** Bullet lists, ordered lists
- **Blocks:** Code blocks, blockquotes, horizontal rules

### Storage Format

**Always** store as `JSON.stringify(editor.getJSON())` in `notes.content_json` column. The `parseContent()` helper safely parses JSON with fallback to empty document:

```typescript
{
  type: 'doc',
  content: [{ type: 'paragraph' }]
}
```

**Never** store HTML or plain text - use TipTap's JSON format for consistent rendering.

## Path Aliases

- `@/*` maps to project root (configured in tsconfig.json)
- Example: `import { getDb } from '@/lib/db'`

## Important Implementation Notes

### Database Initialization

Run the migration script to set up all required tables:

```bash
bun scripts/migrate.ts
```

This creates:

- All better-auth tables (user, session, account, verification)
- Notes table with proper indexes
- Foreign key constraints
- WAL mode for better concurrency

Database location defaults to `data/app.db` (set via `DATABASE_PATH` env var).

### better-auth Setup

Configured in `lib/auth.ts` with:

- SQLite adapter pointing to same DB file
- Email/password credential provider
- Session management with HTTP-only cookies

**IMPORTANT:** Do NOT modify better-auth table schemas manually - use the migrate script which matches better-auth's expectations.

### Authentication Flow

- Client-side auth utilities in `lib/auth-client.ts`
- Server-side session validation via `requireAuth()` in `lib/session.ts`
- Protected routes wrapped in `(authenticated)` layout group
- Public routes: landing page (`/`), authenticate (`/authenticate`), public notes (`/p/[slug]`)

### Public Note Slugs

Public sharing generates a 16-character random slug using `nanoid(16)`. Slugs are:

- Generated on first enable or if missing
- Persisted even when sharing is disabled (allows re-enabling with same URL)
- Checked with `is_public = 1` flag for access control

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
- Editor uses Tailwind Typography plugin for prose rendering

### Testing

Vitest is configured for both unit and integration tests:

- **Unit tests:** Located in `test/unit/`, run with `bun run test:unit`
- **Integration tests:** Located in `test/integration/`, run with Bun's test runner
- **Environment:** Uses `happy-dom` for DOM simulation in unit tests
- **Coverage:** Generate reports with `bun run test:coverage`

Write tests for:

- Repository functions in `lib/notes.ts`
- Server Actions validation
- Component rendering and interactions
- Public sharing logic

### Code Formatting

The project uses `oxfmt` (oxidized formatter) for code formatting:

```bash
# Format all files
bun run format
```

A post-tool-use hook automatically runs the formatter after file changes.

## Environment Setup

Create `.env.local` file with:

```env
# Database location (defaults to data/app.db if not set)
DATABASE_PATH=data/app.db

# better-auth configuration
BETTER_AUTH_SECRET=your-secret-key-here
BETTER_AUTH_URL=http://localhost:3000

# Node environment
NODE_ENV=development
```

Generate a secure `BETTER_AUTH_SECRET` with `openssl rand -base64 32`.

## Implementation Status

**✅ Fully Implemented:**

- User authentication (sign up, login, sessions)
- Dashboard with note listing
- Create, read, update, delete notes
- Rich-text editing with TipTap (toolbar with formatting options)
- Public note sharing with unguessable slugs
- Public note viewing (no auth required)
- Server Actions for all mutations
- SQLite database with proper indexes
- Responsive UI with dark mode support
- Testing setup (Vitest + happy-dom)
- Code formatting with oxfmt

**Architecture Decisions:**

- Using **Server Actions** instead of REST API routes for better integration with Next.js App Router
- All repository functions enforce user ownership at the database query level
- TipTap content stored as JSON (not HTML) for consistency
- Public slugs persist across enable/disable cycles

## Reference Documentation

See `SPEC.md` for complete technical specification including:

- Detailed API contracts
- Full database schema
- Component specifications
- Development workflow
