# Story 2.1: Company Email Login

Status: done

## Story

As a **staff member**,
I want **to log in using my company email and password**,
So that **I can securely access the timelog system**.

## Acceptance Criteria

1. **AC1: Login Page Accessible**
   - Given I am not authenticated
   - When I navigate to the application root (/)
   - Then I am redirected to the login page (/login)
   - And the login form is displayed with email and password fields

2. **AC2: Successful Authentication**
   - Given I am on the login page
   - When I enter my valid company email (@company.com) and password
   - Then I am authenticated via Supabase Auth
   - And I am redirected to the Quick Entry page (/entry)
   - And my session is established

3. **AC3: Session Contains Role**
   - Given I have successfully authenticated
   - When my session is established
   - Then my role is available (staff/manager/admin/super_admin)
   - And the role is fetched from public.users table

4. **AC4: Invalid Credentials Error**
   - Given I am on the login page
   - When I enter invalid email or password
   - Then authentication fails
   - And "Invalid email or password" error is displayed
   - And I remain on the login page

5. **AC5: Loading State During Auth**
   - Given I am on the login page
   - When I click the login button
   - Then the button shows loading state (spinner or disabled)
   - And the form inputs are disabled during authentication
   - And loading state clears on success or error

6. **AC6: Email Validation**
   - Given I am on the login page
   - When I enter an invalid email format
   - Then client-side validation shows "Please enter a valid email"
   - And the form is not submitted

7. **AC7: Password Required**
   - Given I am on the login page
   - When I try to submit with empty password
   - Then client-side validation shows "Password is required"
   - And the form is not submitted

## Tasks / Subtasks

- [x] **Task 1: Review Existing Login Page** (AC: 1, 2)
  - [x] 1.1 Review `app/(auth)/login/page.tsx` from starter template
  - [x] 1.2 Identify modifications needed for company email focus
  - [x] 1.3 Verify Supabase Auth configuration

- [x] **Task 2: Implement Login Form Validation** (AC: 6, 7)
  - [x] 2.1 Create Zod schema for login form in `schemas/auth.schema.ts`
  - [x] 2.2 Integrate React Hook Form with Zod resolver
  - [x] 2.3 Add client-side validation error display

- [x] **Task 3: Implement Login Server Action** (AC: 2, 3, 4)
  - [x] 3.1 Create/update `actions/auth.ts` with login action
  - [x] 3.2 Use `ActionResult<T>` return pattern
  - [x] 3.3 Call `supabase.auth.signInWithPassword()`
  - [x] 3.4 Handle error cases with user-friendly messages

- [x] **Task 4: Implement Loading State** (AC: 5)
  - [x] 4.1 Use React useTransition for pending state
  - [x] 4.2 Disable form inputs during submission
  - [x] 4.3 Show spinner or loading indicator on button

- [x] **Task 5: Implement Redirect Logic** (AC: 2)
  - [x] 5.1 Redirect to /entry on successful login
  - [x] 5.2 Verify middleware allows access after auth

- [x] **Task 6: Style Login Page** (AC: 1)
  - [x] 6.1 Ensure mobile-first responsive design
  - [x] 6.2 Use shadcn/ui components (Button, Input, Card)
  - [x] 6.3 Add company branding if needed

- [x] **Task 7: Test Login Flow** (AC: all)
  - [x] 7.1 Test with valid test user credentials
  - [x] 7.2 Test with invalid credentials
  - [x] 7.3 Test validation error states
  - [x] 7.4 Test loading state visibility
  - [x] 7.5 Verify redirect to /entry works

## Dev Notes

### Starter Template Provides

The official Supabase starter template includes:
- `app/(auth)/login/page.tsx` - Basic login page
- `app/(auth)/layout.tsx` - Auth layout (no navigation)
- `lib/supabase/client.ts` - Browser client
- `lib/supabase/server.ts` - Server client
- `middleware.ts` - Auth middleware for protected routes

### Login Schema

```typescript
// src/schemas/auth.schema.ts
import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email'),
  password: z
    .string()
    .min(1, 'Password is required'),
});

export type LoginInput = z.infer<typeof loginSchema>;
```

### Login Server Action

```typescript
// src/actions/auth.ts
'use server';

import { createClient } from '@/lib/supabase/server';
import { loginSchema, type LoginInput } from '@/schemas/auth.schema';

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function login(input: LoginInput): Promise<ActionResult<{ userId: string }>> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: 'Invalid input' };
  }

  try {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });

    if (error) {
      return { success: false, error: 'Invalid email or password' };
    }

    return { success: true, data: { userId: data.user.id } };
  } catch (err) {
    console.error('Login error:', err);
    return { success: false, error: 'Unable to connect. Please check your internet connection.' };
  }
}
```

### Login Form Component

```typescript
// src/components/login-form.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { loginSchema, type LoginInput } from '@/schemas/auth.schema';
import { login } from '@/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export function LoginForm() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = (data: LoginInput) => {
    startTransition(async () => {
      const result = await login(data);
      if (result.success) {
        router.push('/entry');
        router.refresh();
      } else {
        form.setError('root', { message: result.error });
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Login to Timelog</CardTitle>
        <CardDescription>Enter your company email below to login</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {form.formState.errors.root && (
            <div className="text-sm text-red-500 bg-red-50 p-3 rounded-md">
              {form.formState.errors.root.message}
            </div>
          )}
          {/* Email and password inputs with validation... */}
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Logging in...
              </>
            ) : (
              'Login'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
```

### Middleware Configuration

The starter template includes middleware. Ensure it redirects unauthenticated users:

```typescript
// src/middleware.ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Supabase cookie refresh logic from starter...

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protected routes
  const protectedRoutes = ['/entry', '/dashboard', '/team', '/admin'];
  const isProtectedRoute = protectedRoutes.some(route =>
    request.nextUrl.pathname.startsWith(route)
  );

  if (isProtectedRoute && !user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Redirect authenticated users away from auth pages
  if (user && request.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/entry', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
```

### Route Redirect (Root Page)

```typescript
// src/app/page.tsx
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect('/entry');
  } else {
    redirect('/login');
  }
}
```

### Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Root redirect
│   └── (auth)/
│       ├── layout.tsx              # Auth layout (no nav)
│       └── login/
│           └── page.tsx            # Login page (modify)
├── actions/
│   └── auth.ts                     # Login/logout actions
├── schemas/
│   └── auth.schema.ts              # Login validation schema
└── middleware.ts                   # Auth middleware (modify)
```

### Error Messages

| Scenario | Error Message |
|----------|---------------|
| Invalid email format | "Please enter a valid email" |
| Empty password | "Password is required" |
| Wrong credentials | "Invalid email or password" |
| Network error | "Unable to connect. Please try again." |

### Security Considerations

- Never reveal whether email exists (use generic error)
- Rate limiting handled by Supabase Auth
- Password requirements enforced by Supabase Auth settings
- Session cookies are HttpOnly and Secure

### Test Users (from Story 1.5)

| Email | Password | Role |
|-------|----------|------|
| staff@test.com | test123456 | staff |
| manager@test.com | test123456 | manager |
| admin@test.com | test123456 | admin |
| superadmin@test.com | test123456 | super_admin |

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#Authentication & Security]
- [Source: _bmad-output/planning-artifacts/architecture.md#Starter Template Details]
- [Source: _bmad-output/planning-artifacts/epics.md#Story 2.1]
- [Source: _bmad-output/project-context.md#Server Actions Pattern]

## Definition of Done

- [x] Login page displays with email and password fields
- [x] Form validation works (email format, required fields)
- [x] Loading state visible during authentication
- [x] Successful login redirects to /entry
- [x] Invalid credentials show error message
- [x] Root path (/) redirects appropriately
- [x] Protected routes redirect to /login when unauthenticated
- [x] All test users can log in successfully

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Completion Notes List

1. **Task 1 Complete**: Reviewed existing login page from Supabase starter template. Identified need for:
   - Zod validation + React Hook Form integration
   - Server action with ActionResult<T> pattern
   - useTransition for loading state
   - Fixed env variable mismatch (NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY → NEXT_PUBLIC_SUPABASE_ANON_KEY)

2. **Task 2 Complete**: Created `src/schemas/auth.schema.ts` with Zod validation for email (required + valid format) and password (required). Created 9 unit tests covering all validation scenarios.

3. **Task 3 Complete**: Created `src/actions/auth.ts` with login server action using ActionResult<T> pattern. Uses supabase.auth.signInWithPassword() and returns generic "Invalid email or password" error for security.

4. **Task 4 Complete**: Refactored LoginForm to use React useTransition for pending state. Button shows "Logging in..." text and form inputs are disabled during authentication.

5. **Task 5 Complete**:
   - Updated LoginForm to redirect to /entry on success
   - Updated middleware (proxy.ts) with proper protected/public route definitions
   - Created root page redirect logic in app/page.tsx
   - Created /entry placeholder page in app/(app)/entry/page.tsx

6. **Task 6 Complete**: Login form uses shadcn/ui components (Card, Button, Input, Label). Mobile-first responsive design maintained from starter template.

7. **Task 7 Complete**: Created 9 E2E tests in test/e2e/auth/login.test.ts covering:
   - Successful authentication for all 4 roles (staff, manager, admin, super_admin)
   - Role fetch from public.users table
   - Invalid credentials handling
   - Empty credentials handling

### Test Results

- **Unit Tests**: 9/9 passed (auth.schema.test.ts)
- **E2E Auth Tests**: 9/9 passed (login.test.ts)
- **Build**: Successful

### File List

**Created:**
- src/schemas/auth.schema.ts - Zod validation schema for login
- src/schemas/auth.schema.test.ts - Unit tests for validation schema
- src/actions/auth.ts - Login server action with ActionResult<T> pattern
- src/app/(app)/entry/page.tsx - Protected entry page placeholder
- test/e2e/auth/login.test.ts - E2E tests for login API (AC2, AC3, AC4)
- src/components/login-form.test.tsx - Component tests (AC5, AC6, AC7)

**Modified:**
- src/components/login-form.tsx (refactored for React Hook Form + Zod + useTransition + Loader2 spinner)
- src/lib/supabase/client.ts (fixed env variable name)
- src/lib/supabase/server.ts (fixed env variable name)
- src/lib/supabase/proxy.ts (fixed env variable name, added proper route protection)
- src/app/page.tsx (added redirect logic)
- package.json (added react-hook-form, @hookform/resolvers dependencies)

### Test Coverage Notes

**Covered by E2E API tests (test/e2e/auth/login.test.ts):**

- AC2: Successful authentication for all roles
- AC3: Session contains role from public.users
- AC4: Invalid credentials error handling

**Covered by Component tests (src/components/login-form.test.tsx):**

- AC5: Loading state (spinner, disabled inputs)
- AC6: Email validation display
- AC7: Password required display
- Redirect logic after successful login
- Error message display on failed login

## Change Log

| Date | Change |
|------|--------|
| 2025-12-31 | Implemented login flow with Zod validation, server action, and E2E tests (Story 2.1) |
| 2025-12-31 | Added component tests for AC5/AC6/AC7, code review fixes, marked as done |
