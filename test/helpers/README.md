# Test Helpers Guide

This directory contains shared utilities for testing the Timelog application.

## Overview

| File | Purpose | Use Case |
|------|---------|----------|
| `e2e-auth.ts` | E2E login helpers | Playwright tests |
| `supabase-test.ts` | RLS testing utilities | Unit tests with RLS |
| `test-users.ts` | Test user/department definitions | All tests |
| `master-data.ts` | Master data factories | Unit tests |
| `cleanup.ts` | Test cleanup utilities | afterEach hooks |

---

## E2E Authentication (Playwright)

### Quick Start

```typescript
import { loginAsManager, navigateAsAdmin } from '@test/helpers/e2e-auth';

test.describe('Team Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsManager(page);
  });

  test('manager can view team', async ({ page }) => {
    await page.goto('/team');
    await expect(page.getByText('Team Dashboard')).toBeVisible();
  });
});
```

### Available Functions

| Function | Role | Access |
|----------|------|--------|
| `loginAsStaff(page)` | staff | Entry, Dashboard |
| `loginAsManager(page)` | manager | + Team Dashboard |
| `loginAsAdmin(page)` | admin | + Admin Panel |
| `loginAsSuperAdmin(page)` | super_admin | Full access |

### Shortcut: Navigate After Login

```typescript
// Instead of:
await loginAsManager(page);
await page.goto('/team');

// Use:
await navigateAsManager(page, '/team');
```

Available shortcuts: `navigateAsStaff`, `navigateAsManager`, `navigateAsAdmin`, `navigateAsSuperAdmin`

### Test Credentials

All test users use password `password123`:

| Role | Email |
|------|-------|
| Staff | `staff@example.com` |
| Manager | `manager@example.com` |
| Admin | `admin@example.com` |
| Super Admin | `superadmin@example.com` |

> These must match users seeded in the test database (`supabase/seed.sql`)

### Advanced: Custom Login Options

```typescript
await loginAs(page, 'manager', {
  waitForRedirect: true,        // default: true
  expectedUrl: /\/team/,        // default: /(dashboard|entry|team|admin)/
});
```

### Logout Between Tests

```typescript
test('switch users in same test', async ({ page }) => {
  await loginAsStaff(page);
  // ... do staff things ...

  await logout(page);
  await loginAsAdmin(page);
  // ... do admin things ...
});
```

---

## RLS Testing (Unit Tests)

### Quick Start

```typescript
import { asUser, createUserClient } from '@test/helpers/supabase-test';
import { testUsers } from '@test/helpers/test-users';

describe('RLS: time_entries', () => {
  it('staff can only see own entries', async () => {
    const entries = await asUser(testUsers.staff.email, (supabase) =>
      supabase.from('time_entries').select('*')
    );

    // All returned entries should belong to staff user
    expect(entries.data?.every(e => e.user_id === testUsers.staff.id)).toBe(true);
  });
});
```

### Available Functions

| Function | Purpose |
|----------|---------|
| `createServiceClient()` | Bypass RLS (setup/cleanup) |
| `createUserClient(email)` | Get authenticated client |
| `asUser(email, query)` | Execute query as user |
| `createAuthUser(id, email)` | Create test user in auth.users |
| `deleteAuthUser(id)` | Delete test user from auth.users |

### Service Client (Bypass RLS)

Use for test setup/cleanup only:

```typescript
import { createServiceClient } from '@test/helpers/supabase-test';

beforeAll(async () => {
  const service = createServiceClient();

  // Insert test data (bypasses RLS)
  await service.from('time_entries').insert({
    user_id: testUsers.staff.id,
    // ...
  });
});

afterAll(async () => {
  const service = createServiceClient();
  await service.from('time_entries').delete().eq('user_id', testUsers.staff.id);
});
```

### User Client (Respects RLS)

Use for actual RLS testing:

```typescript
import { createUserClient } from '@test/helpers/supabase-test';

it('manager can read managed department entries', async () => {
  const managerClient = await createUserClient(testUsers.manager.email);

  const { data, error } = await managerClient
    .from('time_entries')
    .select('*');

  expect(error).toBeNull();
  expect(data?.length).toBeGreaterThan(0);
});
```

### Shorthand: asUser()

Cleaner syntax for one-off queries:

```typescript
// Long form
const client = await createUserClient(testUsers.admin.email);
const { data } = await client.from('users').select('*');

// Short form
const { data } = await asUser(testUsers.admin.email, (supabase) =>
  supabase.from('users').select('*')
);
```

---

## Test Users & Departments

### Predefined Users

```typescript
import { testUsers, testDepartments } from '@test/helpers/test-users';

// Available users
testUsers.staff      // role: 'staff', dept: Audio Production
testUsers.staffB     // role: 'staff', dept: Video Production
testUsers.manager    // role: 'manager', manages: deptA, deptB
testUsers.admin      // role: 'admin'
testUsers.superAdmin // role: 'super_admin'

// Available departments
testDepartments.deptA // Audio Production
testDepartments.deptB // Video Production
testDepartments.deptC // Localization (manager does NOT manage)
```

### User Structure

```typescript
interface TestUser {
  id: string;           // UUID
  email: string;        // Login email
  role: UserRole;       // staff | manager | admin | super_admin
  departmentId: string; // User's own department
  displayName: string;  // Display name
  managedDepartments?: string[]; // For managers only
}
```

### Testing Manager Multi-Department Access

```typescript
// Manager manages deptA and deptB, but NOT deptC
// Use this for negative testing

it('manager cannot see deptC entries', async () => {
  const { data } = await asUser(testUsers.manager.email, (supabase) =>
    supabase.from('time_entries')
      .select('user:users!inner(department_id)')
  );

  // No entries from deptC should be visible
  const deptCEntries = data?.filter(
    e => e.user?.department_id === testDepartments.deptC.id
  );
  expect(deptCEntries).toHaveLength(0);
});
```

---

## Environment Variables

Required for RLS testing:

```bash
# .env.local or .env.test
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

> Run `npx supabase start` to get local keys

---

## Best Practices

### 1. Use Role-Specific Logins

```typescript
// Good: Clear intent
await loginAsManager(page);

// Avoid: Magic credentials
await page.fill('input[name="email"]', 'manager@example.com');
```

### 2. Clean Up Test Data

```typescript
afterEach(async () => {
  const service = createServiceClient();
  await service.from('time_entries').delete().eq('notes', 'test-entry');
});
```

### 3. Test Both Positive and Negative Cases

```typescript
it('staff CAN read own entries', async () => { /* ... */ });
it('staff CANNOT read other entries', async () => { /* ... */ });
```

### 4. Use testUsers for Consistent IDs

```typescript
// Good: Consistent, refactorable
await service.from('time_entries').insert({
  user_id: testUsers.staff.id,
});

// Avoid: Hardcoded UUIDs
await service.from('time_entries').insert({
  user_id: '11111111-1111-4111-a111-111111111111',
});
```

---

## Troubleshooting

### "Failed to sign in as X"

1. Check user exists in both `auth.users` and `public.users`
2. Verify password matches `TEST_PASSWORD` in `supabase-test.ts`
3. Ensure Supabase is running: `npx supabase start`

### "Multiple GoTrueClient instances" Warning

This is expected when running multiple tests. The helpers use singletons to minimize this.

### RLS Test Returns Empty Data

1. Verify user has correct role in `public.users`
2. Check `manager_departments` for manager tests
3. Review RLS policy: `supabase/migrations/*_rls*.sql`

---

*Last updated: 2026-01-05 (Epic 7 Retrospective AI-4)*
