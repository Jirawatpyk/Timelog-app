# Story 1.4: RLS Policies for All Roles

Status: done

## Story

As a **developer**,
I want **Row Level Security policies configured for all 4 roles**,
So that **data access is properly restricted at the database level**.

## Acceptance Criteria

1. **AC1: Staff Time Entry Access**
   - Given a user with role 'staff'
   - When they query time_entries
   - Then they can only SELECT their own entries (user_id = auth.uid())
   - And they can INSERT entries with their own user_id
   - And they can UPDATE their own entries
   - And they can DELETE their own entries

2. **AC2: Manager Time Entry Access**
   - Given a user with role 'manager'
   - When they query time_entries
   - Then they can SELECT their own entries
   - And they can SELECT entries from departments they manage (via manager_departments junction)
   - And they can INSERT entries with their own user_id only
   - And they can UPDATE their own entries only
   - And they can DELETE their own entries only

3. **AC3: Admin Time Entry Access**
   - Given a user with role 'admin'
   - When they query time_entries
   - Then they can SELECT all entries
   - And they can INSERT entries with their own user_id
   - And they can UPDATE their own entries
   - And they can DELETE their own entries

4. **AC4: Super Admin Full Access**
   - Given a user with role 'super_admin'
   - When they access any table
   - Then they have full SELECT/INSERT/UPDATE/DELETE on all tables
   - And they can manage users, master data, and all entries

5. **AC5: Master Data Read Access**
   - Given any authenticated user
   - When they query clients, projects, jobs, services, or tasks
   - Then they can SELECT only active records (WHERE active = true)
   - And they cannot INSERT, UPDATE, or DELETE

6. **AC6: Master Data Write Access**
   - Given a user with role 'admin' or 'super_admin'
   - When they access master data tables
   - Then they can INSERT new records
   - And they can UPDATE existing records
   - And they can set active = false (soft delete)

7. **AC7: RLS Enabled on All Tables**
   - Given all tables exist
   - When checking RLS status
   - Then RLS is enabled on: departments, users, clients, projects, jobs, services, tasks, time_entries, manager_departments, user_recent_combinations, audit_logs

8. **AC8: Staff Cannot Read Other Entries (E2E Test)**
   - Given staff user A and staff user B
   - When user A queries time_entries
   - Then user A's entries are returned
   - And user B's entries are NOT returned
   - And E2E test `staff_cannot_read_other_users_entries` passes

9. **AC9: Manager Cross-Department Restriction (E2E Test)**
   - Given manager managing dept-a and dept-b
   - When manager queries entries from dept-c
   - Then zero entries are returned
   - And E2E test `manager_cannot_read_entries_from_non_managed_department` passes

10. **AC10: Manager Multi-Department Access (E2E Test)**
    - Given manager managing dept-a and dept-b
    - When manager queries entries from dept-a
    - Then dept-a entries are returned
    - When manager queries entries from dept-b
    - Then dept-b entries are returned
    - And E2E test `manager_can_read_entries_from_both_managed_departments` passes

## Tasks / Subtasks

- [x] **Task 1: Create RLS Policies Migration** (AC: 1-7)
  - [x] 1.1 Run `supabase migration new 008_rls_policies`
  - [x] 1.2 Verify RLS is enabled on all tables (should be from prior migrations)
  - [x] 1.3 Create helper function to get current user's role

- [x] **Task 2: Implement Time Entries RLS** (AC: 1, 2, 3, 4)
  - [x] 2.1 Create staff SELECT policy (own entries only)
  - [x] 2.2 Create staff INSERT policy (own user_id only)
  - [x] 2.3 Create staff UPDATE policy (own entries only)
  - [x] 2.4 Create staff DELETE policy (own entries only)
  - [x] 2.5 Create manager SELECT policy (own + managed departments)
  - [x] 2.6 Create admin SELECT policy (all entries)
  - [x] 2.7 Create super_admin full access policy

- [x] **Task 3: Implement Master Data RLS** (AC: 5, 6)
  - [x] 3.1 Create authenticated read policy for clients (active only)
  - [x] 3.2 Create authenticated read policy for projects (active only)
  - [x] 3.3 Create authenticated read policy for jobs (active only)
  - [x] 3.4 Create authenticated read policy for services (active only)
  - [x] 3.5 Create authenticated read policy for tasks (active only)
  - [x] 3.6 Create admin/super_admin write policies for all master data

- [x] **Task 4: Implement Supporting Tables RLS** (AC: 4, 7)
  - [x] 4.1 Create user_recent_combinations policies (own records only)
  - [x] 4.2 Create manager_departments policies (read all, write super_admin)
  - [x] 4.3 Create audit_logs policies (admin/super_admin read only)
  - [x] 4.4 Create departments policies (read all, write super_admin)
  - [x] 4.5 Create users policies (read self, admin read all)

- [x] **Task 5: Create Test User Setup** (AC: 8, 9, 10)
  - [x] 5.1 Create `test/helpers/test-users.ts` with 4 test users
  - [x] 5.2 Create `test/helpers/supabase-test.ts` with asUser() helper
  - [x] 5.3 Create `test/helpers/cleanup.ts` for test data cleanup
  - [x] 5.4 Create test fixtures in `test/fixtures/`

- [x] **Task 6: Implement RLS E2E Tests** (AC: 8, 9, 10)
  - [x] 6.1 Create `test/e2e/rls/staff.test.ts`
  - [x] 6.2 Implement `staff_can_read_own_entries` test
  - [x] 6.3 Implement `staff_cannot_read_other_users_entries` test
  - [x] 6.4 Create `test/e2e/rls/manager.test.ts`
  - [x] 6.5 Implement `manager_can_read_dept_a_entries` test
  - [x] 6.6 Implement `manager_can_read_dept_b_entries` test
  - [x] 6.7 Implement `manager_cannot_read_entries_from_non_managed_department` test
  - [x] 6.8 Create `test/e2e/rls/admin.test.ts`
  - [x] 6.9 Implement admin and super_admin access tests

- [x] **Task 7: Verify All Policies** (AC: all)
  - [x] 7.1 Run all E2E tests: `npm run test -- --run test/e2e/rls` ✅ 24/24 tests passing
  - [x] 7.2 Verify no policy allows unintended access ✅ Negative tests verify restrictions
  - [x] 7.3 Test data setup with Supabase Auth Admin API for proper FK constraints

## Dev Notes

### Role Hierarchy

```
super_admin > admin > manager > staff

super_admin: Full access to everything
admin: Read all entries, write own entries, manage master data + users
manager: Read own + managed department entries, write own entries
staff: Read/write own entries only
```

### Helper Function for Role Check

```sql
-- Add to 008_rls_policies.sql
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;
```

### Complete SQL for Time Entries RLS

```sql
-- supabase/migrations/008_rls_policies.sql

-- ============================================
-- TIME ENTRIES POLICIES
-- ============================================

-- Staff: Own entries only (CRUD)
CREATE POLICY "staff_select_own_entries" ON time_entries
FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "staff_insert_own_entries" ON time_entries
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "staff_update_own_entries" ON time_entries
FOR UPDATE TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "staff_delete_own_entries" ON time_entries
FOR DELETE TO authenticated
USING (user_id = auth.uid());

-- Manager: View managed departments (additional SELECT policy)
CREATE POLICY "manager_select_dept_entries" ON time_entries
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM manager_departments md
    WHERE md.manager_id = auth.uid()
    AND md.department_id = time_entries.department_id
  )
  AND public.get_user_role() = 'manager'
);

-- Admin: View all entries
CREATE POLICY "admin_select_all_entries" ON time_entries
FOR SELECT TO authenticated
USING (public.get_user_role() IN ('admin', 'super_admin'));

-- Super Admin: Full access to all entries
CREATE POLICY "super_admin_all_entries" ON time_entries
FOR ALL TO authenticated
USING (public.get_user_role() = 'super_admin')
WITH CHECK (public.get_user_role() = 'super_admin');
```

### Complete SQL for Master Data RLS

```sql
-- ============================================
-- MASTER DATA POLICIES (clients, projects, jobs, services, tasks)
-- ============================================

-- Clients: Read active only, admin+ can write
CREATE POLICY "authenticated_read_active_clients" ON clients
FOR SELECT TO authenticated
USING (active = true OR public.get_user_role() IN ('admin', 'super_admin'));

CREATE POLICY "admin_manage_clients" ON clients
FOR ALL TO authenticated
USING (public.get_user_role() IN ('admin', 'super_admin'))
WITH CHECK (public.get_user_role() IN ('admin', 'super_admin'));

-- Projects: Read active only, admin+ can write
CREATE POLICY "authenticated_read_active_projects" ON projects
FOR SELECT TO authenticated
USING (active = true OR public.get_user_role() IN ('admin', 'super_admin'));

CREATE POLICY "admin_manage_projects" ON projects
FOR ALL TO authenticated
USING (public.get_user_role() IN ('admin', 'super_admin'))
WITH CHECK (public.get_user_role() IN ('admin', 'super_admin'));

-- Jobs: Read active only, admin+ can write
CREATE POLICY "authenticated_read_active_jobs" ON jobs
FOR SELECT TO authenticated
USING (active = true OR public.get_user_role() IN ('admin', 'super_admin'));

CREATE POLICY "admin_manage_jobs" ON jobs
FOR ALL TO authenticated
USING (public.get_user_role() IN ('admin', 'super_admin'))
WITH CHECK (public.get_user_role() IN ('admin', 'super_admin'));

-- Services: Read active only, admin+ can write
CREATE POLICY "authenticated_read_active_services" ON services
FOR SELECT TO authenticated
USING (active = true OR public.get_user_role() IN ('admin', 'super_admin'));

CREATE POLICY "admin_manage_services" ON services
FOR ALL TO authenticated
USING (public.get_user_role() IN ('admin', 'super_admin'))
WITH CHECK (public.get_user_role() IN ('admin', 'super_admin'));

-- Tasks: Read active only, admin+ can write
CREATE POLICY "authenticated_read_active_tasks" ON tasks
FOR SELECT TO authenticated
USING (active = true OR public.get_user_role() IN ('admin', 'super_admin'));

CREATE POLICY "admin_manage_tasks" ON tasks
FOR ALL TO authenticated
USING (public.get_user_role() IN ('admin', 'super_admin'))
WITH CHECK (public.get_user_role() IN ('admin', 'super_admin'));
```

### Complete SQL for Supporting Tables RLS

```sql
-- ============================================
-- SUPPORTING TABLES POLICIES
-- ============================================

-- Departments: Read all, write super_admin only
CREATE POLICY "authenticated_read_departments" ON departments
FOR SELECT TO authenticated
USING (true);

CREATE POLICY "super_admin_manage_departments" ON departments
FOR ALL TO authenticated
USING (public.get_user_role() = 'super_admin')
WITH CHECK (public.get_user_role() = 'super_admin');

-- Users: Read own profile, admin+ read all
CREATE POLICY "users_read_own_profile" ON users
FOR SELECT TO authenticated
USING (id = auth.uid() OR public.get_user_role() IN ('admin', 'super_admin'));

CREATE POLICY "admin_manage_users" ON users
FOR ALL TO authenticated
USING (public.get_user_role() IN ('admin', 'super_admin'))
WITH CHECK (public.get_user_role() IN ('admin', 'super_admin'));

-- Manager Departments: Read all, write super_admin only
CREATE POLICY "authenticated_read_manager_departments" ON manager_departments
FOR SELECT TO authenticated
USING (true);

CREATE POLICY "super_admin_manage_manager_departments" ON manager_departments
FOR ALL TO authenticated
USING (public.get_user_role() = 'super_admin')
WITH CHECK (public.get_user_role() = 'super_admin');

-- User Recent Combinations: Own records only
CREATE POLICY "users_own_recent_combinations" ON user_recent_combinations
FOR ALL TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Audit Logs: Admin/Super Admin read only, no writes from app
CREATE POLICY "admin_read_audit_logs" ON audit_logs
FOR SELECT TO authenticated
USING (public.get_user_role() IN ('admin', 'super_admin'));
```

### Test Users Setup

```typescript
// test/helpers/test-users.ts
// Using valid UUID v4 format (required by Supabase)
export const testDepartments = {
  deptA: { id: '00000000-0000-4000-a001-000000000001', name: 'Audio Production' },
  deptB: { id: '00000000-0000-4000-a002-000000000002', name: 'Video Production' },
  deptC: { id: '00000000-0000-4000-a003-000000000003', name: 'Localization' }, // Manager does NOT manage this
};

export const testUsers = {
  staff: {
    id: '11111111-1111-4111-a111-111111111111',
    email: 'staff@test.timelog.local',
    role: 'staff' as const,
    departmentId: testDepartments.deptA.id,
    displayName: 'Test Staff User',
  },
  staffB: {
    id: '11111111-1111-4111-a111-111111111112',
    email: 'staffb@test.timelog.local',
    role: 'staff' as const,
    departmentId: testDepartments.deptB.id,
    displayName: 'Test Staff User B',
  },
  manager: {
    id: '22222222-2222-4222-a222-222222222222',
    email: 'manager@test.timelog.local',
    role: 'manager' as const,
    departmentId: testDepartments.deptA.id,
    managedDepartments: [testDepartments.deptA.id, testDepartments.deptB.id], // Critical: 2 departments
    displayName: 'Test Manager',
  },
  admin: {
    id: '33333333-3333-4333-a333-333333333333',
    email: 'admin@test.timelog.local',
    role: 'admin' as const,
    departmentId: testDepartments.deptA.id,
    displayName: 'Test Admin',
  },
  superAdmin: {
    id: '44444444-4444-4444-a444-444444444444',
    email: 'superadmin@test.timelog.local',
    role: 'super_admin' as const,
    departmentId: testDepartments.deptA.id,
    displayName: 'Test Super Admin',
  },
};
```

### Test Helper: asUser()

```typescript
// test/helpers/supabase-test.ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

export async function asUser<T>(
  userId: string,
  query: (supabase: ReturnType<typeof createClient<Database>>) => Promise<T>
): Promise<T> {
  // Create client impersonating the user
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      global: {
        headers: {
          // Impersonate user for RLS
          Authorization: `Bearer ${await getTestUserToken(userId)}`,
        },
      },
    }
  );
  return query(supabase);
}
```

### Critical E2E Test: Negative Test Case

```typescript
// test/e2e/rls/manager.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { asUser } from '@/test/helpers/supabase-test';
import { testUsers, testDepartments } from '@/test/helpers/test-users';
import { setupTestData, cleanupTestData } from '@/test/helpers/cleanup';

describe('Manager RLS Policies', () => {
  beforeAll(async () => {
    await setupTestData();
  });

  afterAll(async () => {
    await cleanupTestData();
  });

  it('manager_can_read_dept_a_entries', async () => {
    const entries = await asUser(testUsers.manager.id, (supabase) =>
      supabase.from('time_entries')
        .select('*')
        .eq('department_id', testDepartments.deptA.id)
    );
    expect(entries.data).not.toBeNull();
    expect(entries.data!.length).toBeGreaterThan(0);
  });

  it('manager_can_read_dept_b_entries', async () => {
    const entries = await asUser(testUsers.manager.id, (supabase) =>
      supabase.from('time_entries')
        .select('*')
        .eq('department_id', testDepartments.deptB.id)
    );
    expect(entries.data).not.toBeNull();
    expect(entries.data!.length).toBeGreaterThan(0);
  });

  // CRITICAL NEGATIVE TEST
  it('manager_cannot_read_entries_from_non_managed_department', async () => {
    const entries = await asUser(testUsers.manager.id, (supabase) =>
      supabase.from('time_entries')
        .select('*')
        .eq('department_id', testDepartments.deptC.id)
    );
    // MUST be empty - manager does not manage dept-c
    expect(entries.data).toHaveLength(0);
  });
});
```

### RLS Test Matrix

| Role | Own Entries | Dept Entries | Other Dept | All Entries |
|------|-------------|--------------|------------|-------------|
| Staff | CRUD | - | - | - |
| Manager | CRUD | Read | - | - |
| Admin | CRUD | Read | Read | Read |
| Super Admin | CRUD | CRUD | CRUD | CRUD |

### Policy Naming Convention

All policies follow: `{role}_{operation}_{scope}`
- Example: `staff_select_own_entries`
- Example: `manager_select_dept_entries`
- Example: `admin_manage_clients`

### Project Structure for Tests

```
test/
├── e2e/
│   ├── flows/           # User flow tests (future stories)
│   └── rls/             # RLS policy tests
│       ├── staff.test.ts
│       ├── manager.test.ts
│       └── admin.test.ts
├── fixtures/
│   ├── entries.ts       # Test time entries
│   ├── master-data.ts   # Test clients, projects, jobs
│   └── users.ts         # Test user data
└── helpers/
    ├── test-users.ts    # Test user definitions
    ├── supabase-test.ts # asUser() helper
    └── cleanup.ts       # Test data cleanup
```

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#RLS Policies for Multi-Department Managers]
- [Source: _bmad-output/planning-artifacts/architecture.md#RLS Testing Patterns]
- [Source: _bmad-output/planning-artifacts/architecture.md#Test Users Setup]
- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.4]
- [Source: _bmad-output/project-context.md#RLS Testing Requirements]

## Definition of Done

- [x] RLS enabled on all 11 tables (verified in prior migrations)
- [x] All role-specific policies created for time_entries
- [x] Master data read/write policies working
- [x] Supporting table policies working
- [x] Helper function `get_user_role()` created
- [x] Test helpers created (test-users.ts, supabase-test.ts, cleanup.ts)
- [x] E2E test: `staff_cannot_read_other_users_entries` implemented
- [x] E2E test: `manager_cannot_read_entries_from_non_managed_department` implemented
- [x] E2E test: `manager_can_read_entries_from_both_managed_departments` implemented
- [x] All E2E tests pass: `npm run test -- --run test/e2e/rls` ✅ 24/24 passing
- [x] No unintended access verified via negative test cases

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Completion Notes List

1. **Migration Created** - `supabase/migrations/20251230200544_008_rls_policies.sql` with all RLS policies
2. **Helper Function** - `get_user_role()` function created with SECURITY DEFINER for safe role lookup
3. **Time Entries Policies** - Complete CRUD policies for all 4 roles (staff, manager, admin, super_admin)
4. **Master Data Policies** - Read (active only) for all authenticated, write for admin/super_admin
5. **Supporting Tables Policies** - Appropriate access for departments, users, manager_departments, user_recent_combinations, audit_logs
6. **Test Infrastructure** - Complete test helpers and fixtures created
7. **E2E Tests** - 3 test files with comprehensive RLS policy tests including critical negative test cases
8. **Tests Require Supabase** - Tests need `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` environment variables

### Decisions Made

- Used `SECURITY DEFINER` on `get_user_role()` to ensure function can read users table regardless of caller's permissions
- Policies are named following `{role}_{operation}_{scope}` convention for clarity
- Manager SELECT policy uses EXISTS subquery for efficient department lookup
- Master data policies allow admin+ to see inactive records for management purposes

### File List

**Created:**
- `supabase/migrations/20251230200544_008_rls_policies.sql` - Complete RLS policies migration
- `test/helpers/test-users.ts` - Test user definitions (5 users, 3 departments)
- `test/helpers/supabase-test.ts` - Supabase test client utilities with createUserClient() and asUser() helpers
- `test/helpers/cleanup.ts` - Test data setup and cleanup utilities
- `test/fixtures/master-data.ts` - Test client, project, job, service, task fixtures
- `test/fixtures/entries.ts` - Test time entry fixtures
- `test/e2e/rls/staff.test.ts` - Staff RLS policy tests (5 tests)
- `test/e2e/rls/manager.test.ts` - Manager RLS policy tests (8 tests including critical negative test)
- `test/e2e/rls/admin.test.ts` - Admin & Super Admin RLS policy tests (11 tests)

**Modified:**
- `vitest.config.ts` - Added dotenv loading for .env.local, disabled file parallelism, increased test timeout
- `package.json` - Added dotenv@17.2.3 and supabase@2.70.5 to devDependencies
- `_bmad-output/implementation-artifacts/sprint-status.yaml` - Story status updated
- `_bmad-output/implementation-artifacts/1-4-rls-policies-for-all-roles.md` - This file

### Change Log

- 2024-12-31: Story implementation complete (Tasks 1-6). Task 7 verification requires running Supabase.
- 2024-12-31: Fixed invalid UUIDs in test fixtures (changed from string format to proper UUID v4)
- 2024-12-31: Updated vitest.config.ts to load .env.local using dotenv
- 2024-12-31: Added createAuthUser() helper to handle auth.users FK constraint
- 2024-12-31: All 24 E2E tests passing ✅ Task 7 complete. Story ready for code review.
- 2024-12-31: Code Review - Updated File List to include vitest.config.ts and package.json changes
- 2024-12-31: Code Review - Added createUserClient() for authenticated RLS testing, improved test documentation
