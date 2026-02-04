# Vitest Setup & Unit Testing Plan for Easy Notes

## Overview

Set up Vitest testing infrastructure and add comprehensive unit tests for all key features: database operations, business logic, session management, server actions, and utility functions.

## Tech Stack Context

- **Runtime:** Bun (NOT Node.js)
- **Framework:** Next.js 16 App Router
- **Database:** SQLite via Bun's built-in client
- **Auth:** better-auth
- **Editor:** TipTap

## Implementation Steps

### 1. Install Dependencies

```bash
bun add -d @vitest/coverage-v8 happy-dom
```

### 2. Create Vitest Configuration

**File:** `vitest.config.ts`

- Node environment for server-side tests
- Path aliases matching tsconfig (`@/*`)
- Coverage thresholds: 80% lines/functions, 75% branches
- Pool: forks (for SQLite isolation)
- Setup file: `test/setup.ts`
- Coverage includes: `lib/**/*.ts`, `app/**/actions.ts`

### 3. Test Infrastructure Setup

#### A. Global Setup (`test/setup.ts`)

- Import vitest globals
- Set up any global test configuration

#### B. Test Helpers (`test/helpers/`)

- **test-db.ts**: In-memory SQLite database creation
  - `createTestDb()`: Initialize :memory: DB with full schema (notes table + indexes)
  - `seedTestData(db, userId)`: Insert test fixtures
  - `clearAllTables(db)`: Cleanup helper

- **test-fixtures.ts**: Reusable test data
  - `VALID_TIPTAP_DOC`, `EMPTY_TIPTAP_DOC`, `COMPLEX_TIPTAP_DOC`, `INVALID_TIPTAP_DOC`
  - `createMockUser(overrides)`: Mock user objects
  - `createMockNote(overrides)`: Mock note objects

#### C. Mocks (`test/mocks/`)

- **db.ts**: Mock database functions (query, get, run) for unit tests
- **session.ts**: Mock better-auth session utilities (getCurrentUser, requireAuth)
- **next.ts**: Mock Next.js functions (redirect, headers)

### 4. Test Implementation (Priority Order)

#### Phase 1: Utility Functions (Quick Wins)

**File:** `test/unit/lib/note-utils.test.ts`
**Target:** `/lib/note-utils.ts` (3 functions)

Tests:

- `generateNotePreview()`:
  - Extract text from simple/complex TipTap docs
  - Truncate long text with ellipsis
  - Handle empty content → "Empty note"
  - Handle invalid JSON → "Unable to preview note"
  - Custom maxLength parameter

- `formatNoteDate()`:
  - Format valid ISO dates → "Jan 15, 2024"
  - Handle invalid dates → "Invalid date"

- `getPublicNoteUrl()`:
  - Use NEXT_PUBLIC_APP_URL when set
  - Fallback to relative path when no env var

**Coverage Goal:** 100%

#### Phase 2: Business Logic (Core Features)

**File:** `test/integration/lib/notes.test.ts`
**Target:** `/lib/notes.ts` (7 functions)

Use **in-memory SQLite** for realistic integration testing.

Tests for each function:

- `createNote()`:
  - Create with defaults (Untitled, empty doc, private)
  - Create public note with 16-char slug
  - Create with custom title/content
  - Verify database insertion

- `getNoteById()`:
  - Return note for owner
  - **Security:** Return null for non-owner
  - Return null for non-existent ID

- `getNotesByUser()`:
  - Return all user notes (ordered by updated_at DESC)
  - Empty array when no notes
  - **Security:** Filter out other users' notes

- `updateNote()`:
  - Update title only
  - Update content only
  - Update isPublic (generates slug if needed)
  - **Security:** Return null for non-owner
  - Update updated_at timestamp

- `deleteNote()`:
  - Delete owned note
  - **Security:** Don't delete non-owned note
  - No-op for non-existent note

- `setNotePublic()`:
  - Enable sharing → generate slug
  - Disable sharing → keep slug
  - **Security:** Return null for non-owner

- `getNoteByPublicSlug()`:
  - Return public note by slug
  - **Privacy:** Return null for private note (even with valid slug)
  - Return null for invalid slug

**Coverage Goal:** 95%+ (all security branches)

#### Phase 3: Session Management

**File:** `test/unit/lib/session.test.ts`
**Target:** `/lib/session.ts`

Mock better-auth's `getSession()` and Next.js headers/redirect.

Tests:

- `getCurrentUser()`:
  - Return user when session exists
  - Return null when no session

- `requireAuth()`:
  - Return user when authenticated
  - Throw error when not authenticated

- `isValidCallbackUrl()`:
  - Allow valid relative URLs (`/dashboard`, `/notes/123`)
  - **Security:** Reject protocol-relative URLs (`//evil.com`)
  - **Security:** Reject absolute URLs (`https://evil.com`)
  - **Security:** Reject non-slash URLs (`javascript:alert(1)`)

**Coverage Goal:** 90%+

#### Phase 4: Server Actions

**File:** `test/integration/actions/note-actions.test.ts`
**Target:** `/app/(authenticated)/notes/actions.ts`

Mock session (requireAuth) and Next.js redirect. Use in-memory DB.

Tests:

- `createNoteAction()`:
  - Create note and redirect to `/notes/:id`
  - Validate title required
  - Validate title max length (200 chars)
  - Validate TipTap document structure
  - Require authentication

- `updateNoteAction()`:
  - Update note and redirect
  - Validate ownership
  - Validate input data

- `deleteNoteAction()`:
  - Delete note and redirect to `/dashboard`
  - Validate ownership
  - Require authentication

**Coverage Goal:** 90%+

#### Phase 5: Database Layer

**File:** `test/unit/lib/db.test.ts`
**Target:** `/lib/db.ts`

Tests:

- `getDb()`: Singleton pattern (returns same instance)
- `query()`: Execute SELECT with parameters
- `get()`: Return single row or undefined
- `run()`: Execute INSERT/UPDATE/DELETE

**Coverage Goal:** 80%+ (thin wrapper layer)

### 5. Package.json Scripts

Add test commands:

```json
{
  "test": "vitest",
  "test:unit": "vitest run test/unit",
  "test:integration": "vitest run test/integration",
  "test:watch": "vitest watch",
  "test:coverage": "vitest run --coverage"
}
```

## Critical Files to Modify/Create

**New Files:**

- `vitest.config.ts` - Vitest configuration
- `test/setup.ts` - Global test setup
- `test/helpers/test-db.ts` - In-memory DB utilities
- `test/helpers/test-fixtures.ts` - Test data
- `test/mocks/db.ts` - Database mocks
- `test/mocks/session.ts` - Session mocks
- `test/mocks/next.ts` - Next.js mocks
- `test/unit/lib/note-utils.test.ts` - Utility function tests
- `test/integration/lib/notes.test.ts` - Business logic integration tests
- `test/unit/lib/session.test.ts` - Session utility tests
- `test/integration/actions/note-actions.test.ts` - Server action tests
- `test/unit/lib/db.test.ts` - Database layer tests

**Modify:**

- `package.json` - Add test scripts

## Code Refactoring Needed

**Minimal changes** - codebase is already test-friendly:

1. No major refactoring required
2. Existing separation of concerns is excellent
3. Pure functions in `note-utils.ts` are ideal for testing
4. Database abstraction allows easy mocking

## Security Test Coverage

Ensure thorough testing of:

- ✅ User ownership enforcement on all CRUD operations
- ✅ Public/private note visibility rules
- ✅ Callback URL validation (prevent open redirects)
- ✅ Input validation (title length, TipTap JSON structure)
- ✅ SQL injection prevention (via parameterized queries)

## Verification Plan

After implementation:

1. **Run all tests:**

   ```bash
   bun run test
   ```

2. **Check coverage:**

   ```bash
   bun run test:coverage
   ```

   - Verify 85%+ overall coverage
   - Check coverage report in `coverage/` directory

3. **Run specific test suites:**

   ```bash
   bun run test:unit        # Fast unit tests
   bun run test:integration # Integration tests with DB
   ```

4. **Watch mode during development:**

   ```bash
   bun run test:watch
   ```

5. **Verify security tests:**
   - All ownership checks (getNoteById, updateNote, deleteNote, setNotePublic)
   - Public note privacy (getNoteByPublicSlug with private notes)
   - URL validation (isValidCallbackUrl edge cases)

6. **Manual spot checks:**
   - Test fixtures load correctly
   - In-memory DB initialization works
   - Mocks behave as expected
   - Test isolation (no cross-test pollution)

## Success Criteria

- ✅ All tests pass
- ✅ 85%+ code coverage on business logic
- ✅ 100% coverage on utility functions
- ✅ All security tests pass (ownership, privacy, validation)
- ✅ Tests run in parallel without conflicts
- ✅ Fast execution (<10s for full suite)
- ✅ Clear, maintainable test code

## Notes

- Use **in-memory SQLite** (`:memory:`) for integration tests - fast & isolated
- Use **vitest forks pool** to prevent test interference with database
- **Mock strategy**: Full mocks for unit tests, real DB for integration tests
- **TipTap validation**: Ensure proper JSON structure in all content tests
- **Bun runtime**: Leverages Bun's native SQLite - no external dependencies
