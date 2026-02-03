# Authentication Flow & Route Protection Implementation

## Overview

Add route-level authentication protection to dashboard and note-related routes while allowing public notes to remain accessible. Implement smart redirect flow that returns users to their intended destination after authentication.

## Requirements Met

1. ✅ Redirect to /dashboard after successful authentication
2. ✅ Protect /dashboard and /notes/[id] from unauthenticated access
3. ✅ Per-route protection (not layout-based)
4. ✅ Keep /p/[slug] public and accessible

## Implementation Steps

### 1. Enhance Session Utilities with Route Protection Helper

**File:** `lib/session.ts`

Add a reusable `protectRoute()` function and callback URL validation:

```typescript
// Add to existing exports
export async function protectRoute(requestedPath: string) {
  const user = await getCurrentUser();

  if (!user) {
    const callbackUrl = encodeURIComponent(requestedPath);
    redirect(`/authenticate?callbackUrl=${callbackUrl}`);
  }

  return user;
}

// Prevent open redirect vulnerabilities
export function isValidCallbackUrl(url: string): boolean {
  return url.startsWith('/') && !url.startsWith('//');
}
```

**Purpose:** Centralizes redirect logic while keeping protection explicit per route

### 2. Update AuthForm to Handle Dynamic Redirects

**File:** `components/auth-form.tsx`

Modify to read and use callback URL from query params:

```typescript
'use client';

import { useSearchParams } from 'next/navigation';

export function AuthForm({ mode }: AuthFormProps) {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  const handleSubmit = async (values: FormData) => {
    // ... existing validation

    const result =
      mode === 'login'
        ? await authClient.signIn.email({
            email: values.email,
            password: values.password,
            callbackURL: callbackUrl, // Dynamic instead of hardcoded
          })
        : await authClient.signUp.email({
            email: values.email,
            password: values.password,
            name: values.name,
            callbackURL: callbackUrl, // Dynamic instead of hardcoded
          });

    if (result.data) {
      router.push(callbackUrl); // Use dynamic callback
    }
  };

  const handleModeSwitch = () => {
    const newMode = mode === 'login' ? 'register' : 'login';
    const currentCallbackUrl = searchParams.get('callbackUrl');

    // Preserve callback URL when switching modes
    const url = currentCallbackUrl
      ? `/authenticate?mode=${newMode}&callbackUrl=${currentCallbackUrl}`
      : `/authenticate?mode=${newMode}`;

    router.push(url);
  };

  // ... rest of component
}
```

**Changes:**

- Read `callbackUrl` from search params
- Pass to `signIn/signUp` callbacks
- Preserve callback URL when switching between login/register modes

### 3. Update Authenticate Page to Handle Callback Redirects

**File:** `app/authenticate/page.tsx`

Modify to redirect authenticated users to their callback URL:

```typescript
interface AuthenticatePageProps {
  searchParams: Promise<{ mode?: string; callbackUrl?: string }>;
}

export default async function AuthenticatePage({
  searchParams,
}: AuthenticatePageProps) {
  const user = await getCurrentUser();
  const params = await searchParams;

  if (user) {
    // Redirect to callback URL if present, otherwise dashboard
    const callbackUrl = params.callbackUrl || "/dashboard";

    // Validate callback URL to prevent open redirects
    if (callbackUrl && !callbackUrl.startsWith('/')) {
      redirect("/dashboard");
    }

    redirect(decodeURIComponent(callbackUrl));
  }

  const mode = params.mode === "register" ? "register" : "login";

  return <AuthForm mode={mode} />;
}
```

**Security:** Validates callback URLs are relative paths to prevent open redirect attacks

### 4. Protect Dashboard Route

**File:** `app/dashboard/page.tsx`

Add authentication check at the top of the component:

```typescript
import { protectRoute } from '@/lib/session';

export default async function DashboardPage() {
  const user = await protectRoute('/dashboard');

  // Existing dashboard implementation
  // user is now guaranteed to be authenticated
}
```

**Behavior:** Unauthenticated users redirected to `/authenticate?callbackUrl=/dashboard`

### 5. Protect Note Editor Route with Ownership Verification

**File:** `app/notes/[id]/page.tsx`

Add authentication and note ownership checks:

```typescript
import { protectRoute } from '@/lib/session';
import { getNoteById } from '@/lib/notes';
import { notFound } from 'next/navigation';

export default async function NoteEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Protect route and get authenticated user
  const user = await protectRoute(`/notes/${(await params).id}`);
  const { id } = await params;

  // Verify user owns this note
  const note = await getNoteById(user.id, id);

  if (!note) {
    // Note doesn't exist or user doesn't own it
    notFound(); // Returns 404 to prevent information leakage
  }

  // Render editor with note data
  // user and note are both guaranteed at this point
}
```

**Security:** Uses `notFound()` for both non-existent notes and unauthorized access to prevent attackers from discovering which note IDs exist

### 6. Verify Public Route Remains Unprotected

**File:** `app/p/[slug]/page.tsx`

Ensure this route has NO authentication check:

```typescript
import { getNoteByPublicSlug } from '@/lib/notes';
import { notFound } from 'next/navigation';

export default async function PublicNotePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // No auth check - this is intentionally public
  const note = await getNoteByPublicSlug(slug);

  if (!note) {
    notFound();
  }

  // Render public note (read-only view)
}
```

**Note:** Public route requires no changes if already using `getNoteByPublicSlug()` which filters for `is_public = 1`

## Security Considerations

1. **Open Redirect Prevention:** Callback URLs validated to ensure they're relative paths
2. **Information Leakage Prevention:** Same 404 response for non-existent and unauthorized notes
3. **Session Management:** Existing better-auth handles session expiry and refresh
4. **Note Ownership:** Always use `getNoteById(userId, noteId)` which enforces ownership at DB level
5. **Public Slugs:** Already use 16-character nanoid for sufficient entropy

## Critical Files Modified

- `lib/session.ts` - Add `protectRoute()` utility and callback URL validation
- `components/auth-form.tsx` - Handle dynamic callback URLs in auth flow
- `app/authenticate/page.tsx` - Redirect authenticated users to callback URL
- `app/dashboard/page.tsx` - Add route protection
- `app/notes/[id]/page.tsx` - Add route protection and ownership verification
- `app/p/[slug]/page.tsx` - Verify no auth check (remains public)

## Verification Steps

After implementation, test the following scenarios:

### Unauthenticated User Flow

1. Visit `/dashboard` → redirects to `/authenticate?callbackUrl=/dashboard`
2. Visit `/notes/123` → redirects to `/authenticate?callbackUrl=/notes/123`
3. Visit `/p/valid-slug` → displays public note (no redirect)
4. Visit `/authenticate` → displays login form

### Authentication Flow

1. Login from `/authenticate?callbackUrl=/notes/123` → redirects to `/notes/123` after success
2. Register from redirect → redirects to intended destination
3. Login without callback URL → defaults to `/dashboard`
4. Switch between login/register → preserves callback URL in query string

### Authenticated User Flow

1. Visit `/dashboard` → displays dashboard (no redirect)
2. Visit `/notes/{owned-note-id}` → displays editor
3. Visit `/notes/{other-user-note-id}` → shows 404
4. Visit `/notes/{nonexistent-id}` → shows 404
5. Visit `/authenticate` → redirects to `/dashboard` (already logged in)

### Security Tests

1. Callback URL with external domain (`?callbackUrl=http://evil.com`) → redirects to `/dashboard`
2. Protocol-relative URL (`?callbackUrl=//evil.com`) → redirects to `/dashboard`
3. Valid relative URL (`?callbackUrl=/dashboard`) → works correctly

## Design Decisions

### Why Per-Route Protection Instead of Middleware?

- Explicit per-route protection makes auth requirements clear
- Easier to debug and understand auth flow
- Follows Next.js App Router patterns for server components
- Better TypeScript support and type safety

### Why Same 404 for Unauthorized and Non-Existent Notes?

- Prevents attackers from discovering which note IDs exist
- Standard security practice to avoid information leakage
- Simpler error handling (single code path)

### Why Callback URL Feature?

- Improves user experience (returns to intended destination)
- Standard authentication pattern (GitHub, Google, etc. use this)
- Minimal added complexity
- Security validated through URL checks
