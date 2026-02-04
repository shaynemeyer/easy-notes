# Authentication Pages Implementation Plan

## Overview

Add email + password authentication pages to the app. Users can switch between login/register modes via search params (`?mode=register`). No password reset functionality.

## Current State

- better-auth configured at `lib/auth.ts` with email/password provider
- Auth API route exists at `app/api/auth/[...all]/route.ts`
- Session helpers at `lib/session.ts` (getCurrentUser, requireAuth)
- Placeholder page at `app/authenticate/page.tsx` (needs replacement)
- No components directory exists yet

## Implementation Strategy

### Architecture

- Single auth form component with conditional rendering based on mode
- Server component checks session and redirects if authenticated
- Client component handles form state, validation, and submission
- better-auth React client for signIn/signUp API calls

### Files to Create

1. **`/lib/auth-client.ts`** - better-auth React client singleton
   - Export `authClient` configured with baseURL
   - Used by components to call signIn/signUp methods

2. **`/components/ui/input.tsx`** - Reusable input component
   - Props: label, error, type, value, onChange, name, placeholder
   - Error state styling with red border/text
   - Dark mode support with Tailwind `dark:` classes
   - Accessible with htmlFor/id pairing

3. **`/components/ui/button.tsx`** - Reusable button component
   - Props: children, loading, disabled, onClick, type
   - Loading state shows spinner and "Loading..." text
   - Disabled state with opacity and cursor-not-allowed
   - Primary blue styling with hover states

4. **`/components/auth-form.tsx`** - Main authentication form
   - "use client" directive for interactivity
   - Props: mode ('login' | 'register')
   - State: email, password, errors, isLoading
   - Zod validation schemas for both modes
   - better-auth integration (signIn.email / signUp.email)
   - For registration: use email as name (better-auth requires name field)
   - Error mapping from better-auth responses
   - Mode switching link (toggle between login/register)
   - Redirects to /dashboard on success

### Files to Modify

1. **`/app/authenticate/page.tsx`** - Replace placeholder
   - Server component that checks existing session
   - Redirect to /dashboard if already authenticated
   - Read searchParams for mode (default: 'login')
   - Render AuthForm with mode prop
   - Add metadata (title, description)

## Key Implementation Details

### Form Validation (Zod)

**Login schema:**

- email: Valid email format
- password: Min 8 characters

**Register schema:**

- email: Valid email format
- password: Min 8, max 128 characters

Note: No separate name field - we use email as the name for better-auth registration.

### better-auth Integration

**Login:**

```typescript
const { data, error } = await authClient.signIn.email({
  email,
  password,
  callbackURL: '/dashboard',
});
```

**Register:**

```typescript
const { data, error } = await authClient.signUp.email({
  email,
  password,
  name: email, // Use email as name (better-auth requires name)
  callbackURL: '/dashboard',
});
```

Auto-signin is enabled in better-auth config, so registration automatically logs user in.

### Error Handling

- Validation errors: Display inline below each field (red text)
- Auth errors: Display as alert banner above form (red background)
- Clear field errors on input change
- Clear all errors on mode switch
- Map better-auth error codes to user-friendly messages

### URL Structure

- Login: `/authenticate` or `/authenticate?mode=login`
- Register: `/authenticate?mode=register`
- Mode switching preserves no form state (intentional security/UX)

### Styling (TailwindCSS v4)

- Centered card layout: `min-h-screen flex items-center justify-center`
- Form container: `max-w-md w-full bg-white dark:bg-zinc-900 p-8 rounded-lg shadow-lg`
- Inputs: Blue focus ring, red error states, dark mode with zinc colors
- Button: Blue primary with hover states, loading spinner
- Typography: Use existing font variables from globals.css

### Session Redirect Logic

In page component (server):

1. Check `getCurrentUser()`
2. If user exists, redirect to `/dashboard`
3. Otherwise, render AuthForm

This prevents authenticated users from accessing auth page.

## Critical Files

- `lib/auth-client.ts` - Client-side better-auth instance
- `components/auth-form.tsx` - Form logic and better-auth integration
- `app/authenticate/page.tsx` - Session check and form rendering
- `components/ui/input.tsx` - Reusable input with error states
- `components/ui/button.tsx` - Reusable button with loading states

## Security Considerations

- Client-side validation is UX only (server validates)
- Better-auth handles password hashing automatically
- No password storage in state longer than necessary
- Session cookies are HttpOnly, Secure, SameSite (better-auth default)
- 7-day session expiration configured

## Verification Steps

1. **Login flow:**
   - Navigate to `/authenticate`
   - Enter valid email/password
   - Click "Sign in"
   - Should redirect to `/dashboard`

2. **Register flow:**
   - Navigate to `/authenticate?mode=register`
   - Enter email and password (no name field, uses email as name)
   - Click "Create account"
   - Should auto-login and redirect to `/dashboard`

3. **Validation:**
   - Try invalid email format (should show error)
   - Try short password (should show error)
   - Try empty fields (should show errors)

4. **Error handling:**
   - Login with wrong password (should show auth error)
   - Register with existing email (should show error)

5. **Mode switching:**
   - Click "Create account" link (should switch to register)
   - Click "Already have an account?" (should switch to login)
   - Form should clear when switching

6. **Session redirect:**
   - Login successfully
   - Try to access `/authenticate` again
   - Should auto-redirect to `/dashboard`

7. **Dark mode:**
   - Toggle system dark mode
   - Form should adapt with dark backgrounds and text

8. **Loading states:**
   - Submit form and verify button shows spinner
   - Inputs should be disabled during loading
   - Should not allow re-submission

## Dependencies

All required dependencies already installed:

- `better-auth@1.4.18`
- `zod@4.3.6`
- `next@16.1.1`
- `react@19.2.3`
- `tailwindcss@4`

## Notes

- No password reset functionality (per requirements)
- Single component with conditional rendering (simpler than separate login/register)
- Uses existing `/authenticate` route (no need for route group)
- All path imports use `@/` alias
- TypeScript strict mode enabled
- Mobile responsive with Tailwind utilities
