# Story 2.2: Session Persistence & Logout

Status: ready-for-dev

## Story

As a **logged-in user**,
I want **my session to persist across browser refreshes and have a logout option**,
So that **I don't have to log in repeatedly but can securely sign out when needed**.

## Acceptance Criteria

1. **AC1: Session Persists on Refresh**
   - Given I am logged in
   - When I refresh the page
   - Then I remain logged in
   - And I am not redirected to the login page
   - And my session data is preserved

2. **AC2: Session Persists on Browser Restart**
   - Given I am logged in
   - When I close and reopen the browser
   - Then I remain logged in (session persists via cookies)
   - And my role and permissions are still active

3. **AC3: Role Persists in Session**
   - Given I am logged in with a specific role
   - When I refresh the page
   - Then my role (staff/manager/admin/super_admin) is still accessible
   - And role-based access controls still apply

4. **AC4: Logout Button Available**
   - Given I am logged in
   - When I view any authenticated page
   - Then a logout option is visible/accessible
   - And it is easy to locate (in navigation or user menu)

5. **AC5: Logout Terminates Session**
   - Given I am logged in
   - When I click the logout button
   - Then my session is terminated
   - And session cookies are cleared
   - And I am redirected to the login page

6. **AC6: Protected Routes After Logout**
   - Given I have logged out
   - When I try to access /entry, /dashboard, /team, or /admin
   - Then I am redirected to the login page
   - And I cannot access protected content

7. **AC7: Logout Loading State**
   - Given I am logged in
   - When I click the logout button
   - Then a loading state is shown briefly
   - And the transition to login page is smooth

## Tasks / Subtasks

- [ ] **Task 1: Verify Cookie-Based Session** (AC: 1, 2)
  - [ ] 1.1 Review Supabase SSR cookie configuration from starter
  - [ ] 1.2 Verify `supabase.auth.getUser()` works after refresh
  - [ ] 1.3 Test session persistence across browser restart
  - [ ] 1.4 Verify middleware refreshes session cookies

- [ ] **Task 2: Implement User Context/Hook** (AC: 3)
  - [ ] 2.1 Create `hooks/use-user.ts` to access current user and role
  - [ ] 2.2 Fetch role from public.users table
  - [ ] 2.3 Cache user data appropriately (or use Server Component)

- [ ] **Task 3: Implement Logout Server Action** (AC: 5, 6)
  - [ ] 3.1 Create logout action in `actions/auth.ts`
  - [ ] 3.2 Call `supabase.auth.signOut()`
  - [ ] 3.3 Use `ActionResult<T>` return pattern
  - [ ] 3.4 Handle redirect to /login

- [ ] **Task 4: Add Logout UI Component** (AC: 4, 7)
  - [ ] 4.1 Create logout button component
  - [ ] 4.2 Add to app layout or user menu
  - [ ] 4.3 Implement loading state during logout
  - [ ] 4.4 Style consistently with design system

- [ ] **Task 5: Test Session Scenarios** (AC: all)
  - [ ] 5.1 Test login → refresh → still logged in
  - [ ] 5.2 Test login → close browser → reopen → still logged in
  - [ ] 5.3 Test logout → try protected route → redirected
  - [ ] 5.4 Test role persistence after refresh

## Dev Notes

### Supabase SSR Session Management

The official starter uses `@supabase/ssr` which handles:
- Cookie-based session storage (HttpOnly, Secure)
- Automatic session refresh via middleware
- Server-side session access

### Middleware Session Refresh

```typescript
// src/middleware.ts (from starter, verify this exists)
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // IMPORTANT: getUser() refreshes the session if needed
  const { data: { user } } = await supabase.auth.getUser();

  // ... route protection logic
  return supabaseResponse;
}
```

### User Hook with Role

```typescript
// src/hooks/use-user.ts
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import type { UserRole } from '@/types/domain';

interface UserWithRole {
  user: User | null;
  role: UserRole | null;
  isLoading: boolean;
}

export function useUser(): UserWithRole {
  const [state, setState] = useState<UserWithRole>({
    user: null,
    role: null,
    isLoading: true,
  });

  useEffect(() => {
    const supabase = createClient();

    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Fetch role from public.users
        const { data: profile } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();

        setState({
          user,
          role: profile?.role as UserRole ?? null,
          isLoading: false,
        });
      } else {
        setState({ user: null, role: null, isLoading: false });
      }
    }

    getUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const { data: profile } = await supabase
            .from('users')
            .select('role')
            .eq('id', session.user.id)
            .single();

          setState({
            user: session.user,
            role: profile?.role as UserRole ?? null,
            isLoading: false,
          });
        } else {
          setState({ user: null, role: null, isLoading: false });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return state;
}
```

### Logout Server Action

```typescript
// src/actions/auth.ts (add to existing file)
'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function logout(): Promise<ActionResult<null>> {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    return { success: false, error: 'Failed to logout' };
  }

  // Redirect happens after action completes
  redirect('/login');
}
```

### Logout Button Component

```typescript
// src/components/shared/LogoutButton.tsx
'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { logout } from '@/actions/auth';
import { Button } from '@/components/ui/button';

export function LogoutButton() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleLogout = () => {
    startTransition(async () => {
      const result = await logout();
      if (!result.success) {
        // Handle error - though redirect usually happens
        console.error(result.error);
      }
      // Redirect happens server-side, but force client refresh
      router.refresh();
    });
  };

  return (
    <Button
      variant="ghost"
      onClick={handleLogout}
      disabled={isPending}
    >
      {isPending ? 'Logging out...' : 'Logout'}
    </Button>
  );
}
```

### Adding Logout to App Layout

```typescript
// src/app/(app)/layout.tsx
import { LogoutButton } from '@/components/shared/LogoutButton';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="flex justify-between items-center p-4">
        <h1>Timelog</h1>
        <LogoutButton />
      </header>
      <main>{children}</main>
      {/* BottomNav will be added in Story 4.1 */}
    </div>
  );
}
```

### Server Component User Access

For Server Components, get user directly:

```typescript
// In any Server Component
import { createClient } from '@/lib/supabase/server';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch user profile with role
  const { data: profile } = await supabase
    .from('users')
    .select('role, display_name')
    .eq('id', user.id)
    .single();

  return (
    <div>
      <p>Welcome, {profile?.display_name}</p>
      <p>Role: {profile?.role}</p>
    </div>
  );
}
```

### Session Cookie Configuration

Supabase SSR automatically configures cookies:
- `sb-<project-ref>-auth-token` - Session token
- HttpOnly: true (not accessible via JavaScript)
- Secure: true (HTTPS only in production)
- SameSite: Lax (CSRF protection)

### Project Structure

```
src/
├── actions/
│   └── auth.ts                     # login, logout actions
├── hooks/
│   └── use-user.ts                 # Client-side user hook
├── components/
│   └── shared/
│       └── LogoutButton.tsx        # Logout button component
├── app/
│   └── (app)/
│       └── layout.tsx              # App layout with logout
└── middleware.ts                   # Session refresh
```

### Testing Session Persistence

Manual testing steps:
1. Login with test user
2. Check Network tab for Set-Cookie header
3. Refresh page - should remain logged in
4. Check Application > Cookies - session cookie exists
5. Close browser, reopen - should remain logged in
6. Click logout - cookie should be removed
7. Try /entry - should redirect to /login

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#Authentication & Security]
- [Source: _bmad-output/planning-artifacts/architecture.md#Starter Template Details]
- [Source: _bmad-output/planning-artifacts/epics.md#Story 2.2]
- [Source: _bmad-output/project-context.md#Server Actions Pattern]

## Definition of Done

- [ ] Session persists after page refresh
- [ ] Session persists after browser restart
- [ ] User role is accessible after session restore
- [ ] Logout button visible on authenticated pages
- [ ] Logout clears session and redirects to /login
- [ ] Protected routes inaccessible after logout
- [ ] Loading state visible during logout
- [ ] `use-user` hook works correctly

## Dev Agent Record

### Agent Model Used

_To be filled by dev agent_

### Completion Notes List

_To be filled during implementation_

### File List

_To be filled with all created/modified files_
