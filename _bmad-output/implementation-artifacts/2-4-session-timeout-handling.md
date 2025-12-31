# Story 2.4: Session Timeout Handling

Status: done

## Story

As a **security-conscious user**,
I want **my session to expire after inactivity**,
So that **my account remains secure if I forget to logout**.

## Acceptance Criteria

1. **AC1: Session Expires After Inactivity**
   - Given I am logged in
   - When I remain inactive for 8 hours (Supabase default)
   - Then my session expires automatically
   - And session cookies become invalid

2. **AC2: Redirect on Expired Session**
   - Given my session has expired
   - When I try to perform any action (navigate, submit form)
   - Then I am redirected to the login page
   - And a message indicates "Session expired. Please login again."

3. **AC3: Active Session Refresh**
   - Given I am actively using the app
   - When the session is about to expire
   - Then the session is refreshed automatically (via middleware)
   - And I remain logged in seamlessly

4. **AC4: Graceful Error Handling**
   - Given my session expires mid-action
   - When a server action fails due to auth error
   - Then I see a friendly error message
   - And I am redirected to login
   - And no data is lost (form state persisted if applicable)

5. **AC5: Auth State Change Detection**
   - Given I am on an authenticated page
   - When my session expires (detected client-side)
   - Then I am notified gracefully
   - And redirected to login without abrupt errors

## Tasks / Subtasks

- [x] **Task 1: Configure Supabase Session Settings** (AC: 1)
  - [x] 1.1 Review Supabase project auth settings
  - [x] 1.2 Verify JWT expiry is set appropriately (default 1 hour, refresh extends)
  - [x] 1.3 Document session timeout behavior

- [x] **Task 2: Implement Middleware Session Refresh** (AC: 3)
  - [x] 2.1 Verify middleware calls `getUser()` to refresh session
  - [x] 2.2 Ensure cookies are updated on each request
  - [x] 2.3 Test session refresh extends expiry

- [x] **Task 3: Handle Expired Session Redirect** (AC: 2)
  - [x] 3.1 Detect expired session in middleware
  - [x] 3.2 Redirect to /login with `expired=true` query param
  - [x] 3.3 Display "Session expired" toast on login page

- [x] **Task 4: Handle Server Action Auth Errors** (AC: 4)
  - [x] 4.1 Create auth error handler utility
  - [x] 4.2 Wrap server actions with session check
  - [x] 4.3 Return consistent error for expired sessions
  - [x] 4.4 Client handles auth errors with redirect

- [x] **Task 5: Client-Side Auth State Listener** (AC: 5)
  - [x] 5.1 Add `onAuthStateChange` listener in app layout
  - [x] 5.2 Handle SIGNED_OUT event
  - [x] 5.3 Redirect gracefully with notification

- [x] **Task 6: Test Session Timeout Scenarios** (AC: all)
  - [x] 6.1 Test active usage keeps session alive
  - [x] 6.2 Test session expiry after inactivity (may need shortened timeout for testing)
  - [x] 6.3 Test expired session redirect with message
  - [x] 6.4 Test server action failure on expired session

## Dev Notes

### Known Limitations

**AC4 - Form State Persistence:** The current implementation redirects immediately on auth errors without persisting form state. The AC states "no data is lost (form state persisted **if applicable**)". For this story, form state persistence is considered out of scope as the primary use case (time entry forms) should auto-save drafts (covered by Story 4.10: Form Draft Auto-Save). Future enhancement: Consider implementing a form state cache in localStorage before redirect.

### Supabase Session Behavior

Supabase Auth uses JWT tokens with:
- **Access Token**: Short-lived (default 1 hour)
- **Refresh Token**: Long-lived (default 1 week, configurable)
- Session is refreshed automatically when access token expires if refresh token is valid

The middleware's `getUser()` call automatically refreshes the session if the access token is expired but refresh token is valid.

### Session Timeout Configuration

In Supabase Dashboard > Authentication > Settings:
```
JWT Expiry: 3600 (1 hour) - default
Refresh Token Rotation: Enabled
Refresh Token Reuse Interval: 10 (seconds)
```

For this project, we use defaults:
- User active = session continuously refreshed
- User inactive 1 hour = access token expires, refresh on next request
- User inactive > 1 week = refresh token expires, must re-login

### Middleware Session Refresh (Already Implemented)

```typescript
// src/middleware.ts (verify this behavior exists)
export async function middleware(request: NextRequest) {
  // ... setup

  // This call refreshes the session automatically
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // Session expired or not authenticated
    const isProtectedRoute = /* ... */;
    if (isProtectedRoute) {
      const redirectUrl = new URL('/login', request.url);
      redirectUrl.searchParams.set('expired', 'true');
      return NextResponse.redirect(redirectUrl);
    }
  }

  // ... rest of middleware
}
```

### Expired Session Toast on Login Page

```typescript
// src/app/(auth)/login/page.tsx
'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function SessionExpiredHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const expired = searchParams.get('expired');
    if (expired === 'true') {
      toast.info('Session Expired', {
        description: 'Your session has expired. Please login again.',
      });
      // Clean up URL
      const url = new URL(window.location.href);
      url.searchParams.delete('expired');
      router.replace(url.pathname);
    }
  }, [searchParams, router]);

  return null;
}
```

### Server Action Auth Error Handling

```typescript
// src/lib/auth-guard.ts
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function requireAuth() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/login?expired=true');
  }

  return { supabase, user };
}

// Usage in server actions
// src/actions/entry.ts
'use server';

import { requireAuth } from '@/lib/auth-guard';

export async function createEntry(formData: FormData) {
  const { supabase, user } = await requireAuth();

  // Now safe to proceed
  const { data, error } = await supabase
    .from('time_entries')
    .insert({...})
    .select()
    .single();

  // ...
}
```

### Alternative: Action Result with Auth Error

```typescript
// src/actions/entry.ts
'use server';

import { createClient } from '@/lib/supabase/server';

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; authError?: boolean };

export async function createEntry(formData: FormData): Promise<ActionResult<TimeEntry>> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'Session expired', authError: true };
  }

  // ... rest of action
}
```

### Client-Side Auth Error Handler

```typescript
// src/hooks/use-action.ts
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function useActionHandler() {
  const router = useRouter();

  const handleResult = <T>(result: ActionResult<T>) => {
    if (!result.success) {
      if (result.authError) {
        toast.error('Session Expired', {
          description: 'Please login again.',
        });
        router.push('/login?expired=true');
        return null;
      }
      toast.error(result.error);
      return null;
    }
    return result.data;
  };

  return { handleResult };
}
```

### Client-Side Auth State Listener

```typescript
// src/app/(app)/layout.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

export function AuthStateListener({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED' && !session) {
          toast.info('Session Expired', {
            description: 'Please login again.',
          });
          router.push('/login?expired=true');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [router]);

  return <>{children}</>;
}
```

### Project Structure

```
src/
├── lib/
│   └── auth-guard.ts               # requireAuth() helper
├── hooks/
│   └── use-action.ts               # Action result handler with auth error
├── app/
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx            # SessionExpiredHandler
│   └── (app)/
│       └── layout.tsx              # AuthStateListener
└── middleware.ts                   # Session refresh & expired redirect
```

### Testing Session Timeout

For testing purposes (not production):
1. Temporarily set shorter JWT expiry in Supabase Dashboard
2. Or mock the auth state in tests

```typescript
// test/e2e/auth/session-timeout.test.ts
import { test, expect } from '@playwright/test';

test('shows session expired message on login page', async ({ page }) => {
  await page.goto('/login?expired=true');

  // Toast should appear
  await expect(page.getByText('Session Expired')).toBeVisible();
  await expect(page.getByText('Please login again')).toBeVisible();

  // URL should be cleaned up
  await expect(page).toHaveURL('/login');
});
```

### Error Message Consistency

| Scenario | Message |
|----------|---------|
| Session expired (redirect) | "Session expired. Please login again." |
| Auth error in action | "Session expired" |
| Token refresh failed | "Session expired. Please login again." |
| Network error during auth | "Unable to connect. Please try again." |

### Security Considerations

- Never expose specific auth error reasons (e.g., "invalid token")
- Use generic "session expired" messaging
- Clear sensitive data on logout/expiry
- Redirect to login immediately on auth failure

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#Authentication & Security]
- [Source: _bmad-output/planning-artifacts/architecture.md#Error Handling]
- [Source: _bmad-output/planning-artifacts/epics.md#Story 2.4]
- [Source: _bmad-output/project-context.md#Server Actions Pattern]

## Definition of Done

- [x] Session expires after inactivity (Supabase default behavior verified)
- [x] Active usage refreshes session automatically
- [x] Expired session redirects to /login with message
- [x] "Session expired" toast displays on login page
- [x] Server actions handle auth errors gracefully
- [x] Client-side auth state listener implemented
- [x] No abrupt errors on session expiry
- [x] All test scenarios pass

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Completion Notes List

1. **Task 1 - Session Settings:** Verified Supabase uses default JWT expiry (1 hour access token, 1 week refresh token). Middleware uses `getClaims()` which properly handles session refresh.

2. **Task 2 - Middleware Session Refresh:** Confirmed `proxy.ts` correctly implements session refresh via `getClaims()`. Cookies are updated on each request through the `setAll` callback.

3. **Task 3 - Expired Session Redirect:** Updated middleware to detect expired sessions by checking for stale auth cookies. Redirects to `/login?expired=true`. Created `SessionExpiredHandler` component that shows toast notification and cleans URL.

4. **Task 4 - Server Action Auth Errors:** Created `auth-guard.ts` with `requireAuth()` (redirects) and `getAuthUser()` (returns ActionResult). Extended ActionResult type with `authError` flag. Created `use-auth-action.ts` hook for client-side handling.

5. **Task 5 - Auth State Listener:** Created `AuthStateListener` component that listens for `SIGNED_OUT` and `TOKEN_REFRESHED` events. Integrated into `(app)/layout.tsx` to wrap all protected pages.

6. **Task 6 - Tests:** All 188 tests pass including:
   - 9 E2E session timeout tests (session configuration, refresh, auth state)
   - 5 SessionExpiredHandler unit tests
   - 9 auth-guard unit tests
   - 9 useAuthAction hook tests (including handleAuthError)
   - 6 AuthStateListener unit tests

### File List

**Created:**
- `src/lib/auth-guard.ts` - Auth guard utilities for server actions
- `src/lib/auth-guard.test.ts` - Unit tests for auth-guard
- `src/hooks/use-auth-action.ts` - Client-side hook for handling auth errors
- `src/hooks/use-auth-action.test.ts` - Unit tests for useAuthAction and handleAuthError
- `src/components/shared/session-expired-handler.tsx` - Session expired toast handler
- `src/components/shared/session-expired-handler.test.tsx` - Unit tests
- `src/components/shared/auth-state-listener.tsx` - Client-side auth state listener
- `src/components/shared/auth-state-listener.test.tsx` - Unit tests
- `test/e2e/auth/session-timeout.test.ts` - E2E tests for session timeout
- `src/constants/messages.ts` - Centralized auth message constants

**Modified:**
- `src/lib/supabase/proxy.ts` - Added expired session detection with `expired=true` query param
- `src/app/(auth)/login/page.tsx` - Added SessionExpiredHandler component
- `src/app/(app)/layout.tsx` - Added AuthStateListener wrapper, updated branding to "Timelog"

## Change Log

| Date | Change |
|------|--------|
| 2025-12-31 | Story 2.4: Session Timeout Handling - Complete implementation |
| 2025-12-31 | Code Review: Fixed duplicate isAuthError, added handleAuthError tests, created message constants |
