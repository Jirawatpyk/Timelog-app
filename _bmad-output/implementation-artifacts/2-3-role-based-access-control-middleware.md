.# Story 2.3: Role-Based Access Control Middleware

Status: done

## Story

As a **system**,
I want **routes protected based on user roles**,
So that **users can only access features appropriate to their role**.

## Acceptance Criteria

1. **AC1: Staff Route Restrictions**
   - Given a user with role "staff"
   - When they try to access /team page
   - Then they are redirected to /entry
   - And an "Access Denied" message is shown (via toast or query param)

2. **AC2: Staff Admin Restriction**
   - Given a user with role "staff"
   - When they try to access /admin pages
   - Then they are redirected to /entry
   - And an "Access Denied" message is shown

3. **AC3: Manager Team Access**
   - Given a user with role "manager"
   - When they access /team page
   - Then they can access the page successfully
   - And they see the team dashboard content

4. **AC4: Manager Admin Restriction**
   - Given a user with role "manager"
   - When they try to access /admin pages
   - Then they are redirected to /entry
   - And an "Access Denied" message is shown

5. **AC5: Admin Full Access**
   - Given a user with role "admin"
   - When they access any page (/entry, /dashboard, /team, /admin)
   - Then they can access all routes successfully

6. **AC6: Super Admin Full Access**
   - Given a user with role "super_admin"
   - When they access any page
   - Then they can access all routes including /admin
   - And they have full administrative capabilities

7. **AC7: Unauthenticated Redirect**
   - Given an unauthenticated user
   - When they try to access any protected route
   - Then they are redirected to /login
   - And a "Please login" message may be shown

## Tasks / Subtasks

- [x] **Task 1: Define Route Permission Matrix** (AC: 1-6)
  - [x] 1.1 Create `constants/routes.ts` with route definitions
  - [x] 1.2 Define role-to-route permission mapping
  - [x] 1.3 Document the permission matrix

- [x] **Task 2: Enhance Middleware for RBAC** (AC: 1-7)
  - [x] 2.1 Update `middleware.ts` to fetch user role
  - [x] 2.2 Implement route permission checking
  - [x] 2.3 Add role-based redirect logic
  - [x] 2.4 Pass "access denied" indicator via query param or cookie

- [x] **Task 3: Create Access Denied Handler** (AC: 1, 2, 4)
  - [x] 3.1 Create toast notification for access denied
  - [x] 3.2 Handle query param on /entry page
  - [x] 3.3 Show user-friendly message

- [x] **Task 4: Create Role Guard Component** (AC: 1-6)
  - [x] 4.1 Create `components/shared/RoleGuard.tsx`
  - [x] 4.2 Implement client-side role checking (backup)
  - [x] 4.3 Support multiple allowed roles

- [x] **Task 5: Test All Role Scenarios** (AC: all)
  - [x] 5.1 Test staff accessing /entry, /dashboard (allowed)
  - [x] 5.2 Test staff accessing /team, /admin (denied)
  - [x] 5.3 Test manager accessing /team (allowed)
  - [x] 5.4 Test manager accessing /admin (denied)
  - [x] 5.5 Test admin accessing all routes (allowed)
  - [x] 5.6 Test super_admin accessing all routes (allowed)
  - [x] 5.7 Test unauthenticated accessing protected routes (redirect to login)

## Dev Notes

### Role Hierarchy

```
super_admin (can access everything)
    ↓
admin (can access everything except super_admin-only features)
    ↓
manager (entry, dashboard, team)
    ↓
staff (entry, dashboard only)
```

### Route Permission Matrix

| Route | staff | manager | admin | super_admin |
|-------|-------|---------|-------|-------------|
| /entry | ✅ | ✅ | ✅ | ✅ |
| /dashboard | ✅ | ✅ | ✅ | ✅ |
| /team | ❌ | ✅ | ✅ | ✅ |
| /admin/* | ❌ | ❌ | ✅ | ✅ |

### Routes Constants

```typescript
// src/constants/routes.ts
export const ROUTES = {
  LOGIN: '/login',
  ENTRY: '/entry',
  DASHBOARD: '/dashboard',
  TEAM: '/team',
  ADMIN: '/admin',
  ADMIN_USERS: '/admin/users',
  ADMIN_MASTER_DATA: '/admin/master-data',
} as const;

export const ROUTE_PERMISSIONS: Record<string, string[]> = {
  '/entry': ['staff', 'manager', 'admin', 'super_admin'],
  '/dashboard': ['staff', 'manager', 'admin', 'super_admin'],
  '/team': ['manager', 'admin', 'super_admin'],
  '/admin': ['admin', 'super_admin'],
};

// Helper to check route access
export function canAccessRoute(role: string | null, pathname: string): boolean {
  if (!role) return false;

  // Find matching route pattern
  for (const [route, allowedRoles] of Object.entries(ROUTE_PERMISSIONS)) {
    if (pathname.startsWith(route)) {
      return allowedRoles.includes(role);
    }
  }

  // Default: authenticated users can access
  return true;
}
```

### Enhanced Middleware

```typescript
// src/middleware.ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { ROUTES, canAccessRoute } from '@/constants/routes';

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

  // Refresh session
  const { data: { user } } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Public routes
  const publicRoutes = ['/login', '/signup', '/forgot-password'];
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    // Redirect authenticated users away from auth pages
    if (user) {
      return NextResponse.redirect(new URL(ROUTES.ENTRY, request.url));
    }
    return supabaseResponse;
  }

  // Protected routes - require authentication
  if (!user) {
    const redirectUrl = new URL(ROUTES.LOGIN, request.url);
    redirectUrl.searchParams.set('message', 'Please login to continue');
    return NextResponse.redirect(redirectUrl);
  }

  // Fetch user role from public.users
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  const userRole = profile?.role ?? null;

  // Check route permissions
  if (!canAccessRoute(userRole, pathname)) {
    const redirectUrl = new URL(ROUTES.ENTRY, request.url);
    redirectUrl.searchParams.set('access', 'denied');
    return NextResponse.redirect(redirectUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
```

### Access Denied Toast Handler

```typescript
// src/app/(app)/entry/page.tsx (or layout)
'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'sonner'; // or your toast library

export function AccessDeniedHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const access = searchParams.get('access');
    if (access === 'denied') {
      toast.error('Access Denied', {
        description: 'You do not have permission to access that page.',
      });
      // Clean up URL
      const url = new URL(window.location.href);
      url.searchParams.delete('access');
      router.replace(url.pathname);
    }
  }, [searchParams, router]);

  return null;
}
```

### RoleGuard Component (Client-Side Backup)

```typescript
// src/components/shared/RoleGuard.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useUser } from '@/hooks/use-user';
import type { UserRole } from '@/types/domain';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallback?: React.ReactNode;
}

export function RoleGuard({ children, allowedRoles, fallback }: RoleGuardProps) {
  const { role, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && role && !allowedRoles.includes(role)) {
      router.replace('/entry?access=denied');
    }
  }, [role, isLoading, allowedRoles, router]);

  if (isLoading) {
    return fallback ?? <div>Loading...</div>;
  }

  if (!role || !allowedRoles.includes(role)) {
    return fallback ?? null;
  }

  return <>{children}</>;
}
```

### Usage in Pages

```typescript
// src/app/(app)/team/page.tsx
import { RoleGuard } from '@/components/shared/RoleGuard';

export default function TeamPage() {
  return (
    <RoleGuard allowedRoles={['manager', 'admin', 'super_admin']}>
      <div>Team Dashboard Content</div>
    </RoleGuard>
  );
}
```

### Server-Side Role Check (Alternative)

```typescript
// src/app/(app)/admin/page.tsx
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile?.role || !['admin', 'super_admin'].includes(profile.role)) {
    redirect('/entry?access=denied');
  }

  return (
    <div>Admin Panel Content</div>
  );
}
```

### Project Structure

```
src/
├── constants/
│   └── routes.ts                   # Route definitions & permissions
├── components/
│   └── shared/
│       └── RoleGuard.tsx           # Client-side role guard
├── app/
│   └── (app)/
│       ├── entry/
│       │   └── page.tsx            # AccessDeniedHandler here
│       ├── team/
│       │   └── page.tsx            # Manager+ only
│       └── admin/
│           └── page.tsx            # Admin+ only
└── middleware.ts                   # Main RBAC enforcement
```

### Testing Scenarios

| Test | Login As | Try Access | Expected |
|------|----------|------------|----------|
| 1 | staff@test.com | /entry | ✅ Allowed |
| 2 | staff@test.com | /dashboard | ✅ Allowed |
| 3 | staff@test.com | /team | ❌ Redirect + toast |
| 4 | staff@test.com | /admin | ❌ Redirect + toast |
| 5 | manager@test.com | /team | ✅ Allowed |
| 6 | manager@test.com | /admin | ❌ Redirect + toast |
| 7 | admin@test.com | /admin | ✅ Allowed |
| 8 | superadmin@test.com | /admin | ✅ Allowed |
| 9 | (not logged in) | /entry | ❌ Redirect to /login |

### Performance Consideration

The middleware fetches user role on every request. For optimization:
- Consider caching role in session/cookie after login
- Or use edge-compatible role lookup
- Current approach is acceptable for ~60 users

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#Authentication & Security]
- [Source: _bmad-output/planning-artifacts/architecture.md#Authorization Pattern]
- [Source: _bmad-output/planning-artifacts/epics.md#Story 2.3]
- [Source: _bmad-output/project-context.md#Critical Implementation Rules]

## Definition of Done

- [x] Route constants defined with permission matrix
- [x] Middleware enhanced with role-based access control
- [x] Staff cannot access /team or /admin
- [x] Manager can access /team but not /admin
- [x] Admin and Super Admin can access all routes
- [x] Access denied toast shown on redirect
- [x] Unauthenticated users redirected to /login
- [x] RoleGuard component available for client-side backup
- [x] All test scenarios pass

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Completion Notes List

- **Task 1:** Created `src/constants/routes.ts` with ROUTES constants, ROUTE_PERMISSIONS matrix, and helper functions (canAccessRoute, isPublicRoute, isProtectedRoute). 30 unit tests pass.
- **Task 2:** Updated `src/lib/supabase/proxy.ts` to fetch user role from public.users table and check route permissions using canAccessRoute. Redirects unauthorized users to /entry?access=denied.
- **Task 3:** Created `src/components/shared/access-denied-handler.tsx` that listens for ?access=denied query param and shows toast notification. Added to /entry page with Suspense boundary. Added Toaster to root layout. 5 unit tests pass.
- **Task 4:** Created `src/components/shared/role-guard.tsx` for client-side role protection. Uses useUser hook and redirects unauthorized users. 11 unit tests pass.
- **Task 5:** Created comprehensive E2E tests in `test/e2e/rbac/route-access.test.ts` covering all AC scenarios. 22 tests pass.
- All 150 tests pass, lint passes, build succeeds.

### File List

**Created:**
- src/constants/routes.ts
- src/constants/routes.test.ts
- src/components/shared/access-denied-handler.tsx
- src/components/shared/access-denied-handler.test.tsx
- src/components/shared/role-guard.tsx
- src/components/shared/role-guard.test.tsx
- test/e2e/rbac/route-access.test.ts

**Modified:**
- src/lib/supabase/proxy.ts
- src/app/layout.tsx
- src/app/(app)/entry/page.tsx

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-12-31 | Story implementation complete - RBAC middleware, AccessDeniedHandler, RoleGuard component | Claude Opus 4.5 |
| 2025-12-31 | Code review fixes: Added error handling to proxy.ts, refactored RoleGuard with useMemo, improved AccessDeniedHandler with usePathname, added JSDoc documentation | Claude Opus 4.5 |
