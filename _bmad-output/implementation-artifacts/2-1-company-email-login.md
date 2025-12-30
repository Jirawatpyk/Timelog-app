# Story 2.1: Company Email Login

Status: ready-for-dev

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

- [ ] **Task 1: Review Existing Login Page** (AC: 1, 2)
  - [ ] 1.1 Review `app/(auth)/login/page.tsx` from starter template
  - [ ] 1.2 Identify modifications needed for company email focus
  - [ ] 1.3 Verify Supabase Auth configuration

- [ ] **Task 2: Implement Login Form Validation** (AC: 6, 7)
  - [ ] 2.1 Create Zod schema for login form in `schemas/auth.schema.ts`
  - [ ] 2.2 Integrate React Hook Form with Zod resolver
  - [ ] 2.3 Add client-side validation error display

- [ ] **Task 3: Implement Login Server Action** (AC: 2, 3, 4)
  - [ ] 3.1 Create/update `actions/auth.ts` with login action
  - [ ] 3.2 Use `ActionResult<T>` return pattern
  - [ ] 3.3 Call `supabase.auth.signInWithPassword()`
  - [ ] 3.4 Handle error cases with user-friendly messages

- [ ] **Task 4: Implement Loading State** (AC: 5)
  - [ ] 4.1 Use React useTransition for pending state
  - [ ] 4.2 Disable form inputs during submission
  - [ ] 4.3 Show spinner or loading indicator on button

- [ ] **Task 5: Implement Redirect Logic** (AC: 2)
  - [ ] 5.1 Redirect to /entry on successful login
  - [ ] 5.2 Verify middleware allows access after auth

- [ ] **Task 6: Style Login Page** (AC: 1)
  - [ ] 6.1 Ensure mobile-first responsive design
  - [ ] 6.2 Use shadcn/ui components (Button, Input, Card)
  - [ ] 6.3 Add company branding if needed

- [ ] **Task 7: Test Login Flow** (AC: all)
  - [ ] 7.1 Test with valid test user credentials
  - [ ] 7.2 Test with invalid credentials
  - [ ] 7.3 Test validation error states
  - [ ] 7.4 Test loading state visibility
  - [ ] 7.5 Verify redirect to /entry works

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
import { redirect } from 'next/navigation';
import { loginSchema, type LoginInput } from '@/schemas/auth.schema';

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function login(input: LoginInput): Promise<ActionResult<{ userId: string }>> {
  // Validate input
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: 'Invalid input' };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    // Generic error message for security
    return { success: false, error: 'Invalid email or password' };
  }

  return { success: true, data: { userId: data.user.id } };
}
```

### Login Page Component

```typescript
// src/app/(auth)/login/page.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { loginSchema, type LoginInput } from '@/schemas/auth.schema';
import { login } from '@/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoginPage() {
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
      } else {
        form.setError('root', { message: result.error });
      }
    });
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Login to Timelog</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {form.formState.errors.root && (
            <div className="text-red-500 text-sm">
              {form.formState.errors.root.message}
            </div>
          )}

          <div>
            <Input
              type="email"
              placeholder="Email"
              disabled={isPending}
              {...form.register('email')}
            />
            {form.formState.errors.email && (
              <span className="text-red-500 text-sm">
                {form.formState.errors.email.message}
              </span>
            )}
          </div>

          <div>
            <Input
              type="password"
              placeholder="Password"
              disabled={isPending}
              {...form.register('password')}
            />
            {form.formState.errors.password && (
              <span className="text-red-500 text-sm">
                {form.formState.errors.password.message}
              </span>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Logging in...' : 'Login'}
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

- [ ] Login page displays with email and password fields
- [ ] Form validation works (email format, required fields)
- [ ] Loading state visible during authentication
- [ ] Successful login redirects to /entry
- [ ] Invalid credentials show error message
- [ ] Root path (/) redirects appropriately
- [ ] Protected routes redirect to /login when unauthenticated
- [ ] All test users can log in successfully

## Dev Agent Record

### Agent Model Used

_To be filled by dev agent_

### Completion Notes List

_To be filled during implementation_

### File List

_To be filled with all created/modified files_
