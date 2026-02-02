# Easy Notes

A modern note-taking web application with rich text editing, authentication, and public sharing capabilities.

## Features

- Create, edit, and delete notes with rich text formatting
- User authentication and session management
- Public note sharing with unique URLs
- Rich text editor powered by TipTap
- SQLite database for efficient storage
- Dark mode support

## Tech Stack

- **Runtime:** Bun
- **Framework:** Next.js 16 with App Router
- **Language:** TypeScript 5
- **Styling:** TailwindCSS v4
- **Database:** SQLite (via Bun's built-in client)
- **Authentication:** better-auth 1.4.18
- **Rich Text Editor:** TipTap 3.18.0
- **Validation:** Zod 4.3.6

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) installed on your system

### Installation

1. Clone the repository
2. Install dependencies:

```bash
bun install
```

3. Set up environment variables:

```bash
cp .env.example .env
```

4. Initialize the database:

```bash
npx @better-auth/cli migrate
```

5. Run the development server:

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Development Commands

```bash
bun run dev      # Start development server
bun run build    # Build for production
bun start        # Start production server
bun run lint     # Lint code
```

## Project Structure

```
app/                    # Next.js App Router
├── api/               # API route handlers
├── (auth)/            # Authentication routes
├── dashboard/         # User dashboard
├── notes/[id]/        # Note editor
└── p/[slug]/          # Public note viewer

lib/                   # Server utilities
├── db.ts              # SQLite connection
├── notes.ts           # Note repository
└── auth.ts            # Authentication config

components/            # React components
├── NoteEditor.tsx     # TipTap editor
├── NoteList.tsx       # Notes list
└── ShareToggle.tsx    # Sharing controls
```

## Documentation

- See [CLAUDE.md](./CLAUDE.md) for development guidance
- See [SPEC.md](./SPEC.md) for complete technical specification
