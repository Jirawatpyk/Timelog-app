# Story 3.7: Department Management

## Status: done

## Story

As a **super_admin**,
I want **to manage departments (add, edit, toggle active)**,
So that **I can organize users and teams effectively**.

## Acceptance Criteria

1. **AC1: View Departments Tab (Super Admin Only)**
   - Given I am logged in as super_admin
   - When I navigate to /admin/master-data
   - Then I see a "Departments" tab
   - And I see a list of all departments ordered by name
   - And inactive departments appear with opacity-50 and line-through

2. **AC2: Departments Tab Hidden for Admin**
   - Given I am logged in as admin (not super_admin)
   - When I navigate to /admin/master-data
   - Then I do NOT see the "Departments" tab
   - And only Services, Clients, Tasks, Projects, Jobs tabs are visible

3. **AC3: Add New Department**
   - Given I am on the Departments tab as super_admin
   - When I click "Add Department" button
   - Then a dialog appears for entering department name
   - And I can submit to create the department
   - And the new department appears in the list with active=true

4. **AC4: Unique Department Names**
   - Given I am adding or editing a department
   - When I enter a name that already exists
   - Then validation fails with "Department name already exists"
   - And the form is not submitted

5. **AC5: Edit Department Name**
   - Given I am viewing the departments list
   - When I click edit on a department
   - Then I can modify the department name
   - And save changes successfully
   - And the updated name appears in the list

6. **AC6: Toggle Active Status**
   - Given I am viewing the departments list
   - When I toggle a department's active status
   - Then the department is marked as inactive (or active)
   - And the change persists in the database
   - And inactive departments show with opacity-50
   - Note: Deactivating a department does NOT affect existing users in that department
   - Note: Users can still belong to inactive departments (for historical data)

7. **AC7: Validation**
   - Department name is required
   - Department name must be at least 2 characters
   - Department name must be at most 100 characters

## Tasks / Subtasks

- [x] **Task 1: Add Department Schema** (AC: 4, 7)
  - [x] 1.1 Add `departmentSchema` to `schemas/master-data.schema.ts`
  - [x] 1.2 Define name validation (min 2, max 100 characters, trim)
  - [x] 1.3 Export `DepartmentInput` type
  - [x] 1.4 Add unit tests for departmentSchema

- [x] **Task 2: Create Department Server Actions** (AC: 3, 5, 6)
  - [x] 2.1 Add `createDepartment` action to `actions/master-data.ts`
  - [x] 2.2 Add `updateDepartment` action
  - [x] 2.3 Add `toggleDepartmentActive` action
  - [x] 2.4 Require super_admin role (not just admin)
  - [x] 2.5 Handle unique constraint errors (code 23505)
  - [x] 2.6 Add unit tests for department actions

- [x] **Task 3: Create Departments List Component** (AC: 1)
  - [x] 3.1 Create `app/(app)/admin/master-data/components/DepartmentsList.tsx`
  - [x] 3.2 Fetch departments using Server Component
  - [x] 3.3 Display name and active status
  - [x] 3.4 Style inactive departments with opacity-50 and line-through
  - [x] 3.5 Create `DepartmentsListClient.tsx` wrapper

- [x] **Task 4: Create Department Item Component** (AC: 1, 6)
  - [x] 4.1 Implemented in DepartmentsListClient.tsx via DataTable
  - [x] 4.2 Add toggle switch for active status
  - [x] 4.3 Implement optimistic UI update
  - [x] 4.4 Add edit button with pencil icon

- [x] **Task 5: Create Add Department Dialog** (AC: 3, 4, 7)
  - [x] 5.1 Create `components/admin/AddDepartmentDialog.tsx`
  - [x] 5.2 Use shadcn Dialog component
  - [x] 5.3 Add form with React Hook Form + Zod
  - [x] 5.4 Handle submission and unique name errors

- [x] **Task 6: Create Edit Department Dialog** (AC: 5, 4, 7)
  - [x] 6.1 Create `components/admin/EditDepartmentDialog.tsx`
  - [x] 6.2 Pre-populate form with existing data
  - [x] 6.3 Handle update and unique constraint errors

- [x] **Task 7: Integrate Departments Tab with Role Check** (AC: 1, 2)
  - [x] 7.1 Update master-data page to include Departments tab
  - [x] 7.2 Conditionally render tab only for super_admin
  - [x] 7.3 Get current user role from server component

- [x] **Task 8: Unit Tests for Components** (AC: all)
  - [x] 8.1 Add AddDepartmentDialog.test.tsx (15 tests)
  - [x] 8.2 Add EditDepartmentDialog.test.tsx (14 tests)
  - [x] 8.3 Test role-based tab visibility via server component

- [x] **Task 9: E2E Tests** (AC: 1, 2, 3, 5, 6)
  - [x] 9.1 Test super_admin can access departments
  - [x] 9.2 Test role-based access control
  - [x] 9.3 Test add department with validation
  - [x] 9.4 Test edit department name
  - [x] 9.5 Test toggle active status persistence

## Dev Notes

### Key Difference from Other Master Data Stories

**Super Admin Only**: Unlike Services/Tasks/Clients which allow `admin` or `super_admin`, Department management is restricted to `super_admin` only. This matches the existing RLS policy:

### Deactivation Behavior (Team Review Decision)
- Deactivating a department does NOT affect existing users
- Users can remain in inactive departments (preserves historical data)
- Inactive departments are hidden from new user assignment dropdowns
- This is a soft-delete pattern consistent with other master data

```sql
-- From Story 1.4: Only super_admin can manage departments
CREATE POLICY "super_admin_manage_departments" ON departments
FOR ALL TO authenticated
USING (public.get_user_role() = 'super_admin')
WITH CHECK (public.get_user_role() = 'super_admin');
```

### Department Schema

```typescript
// src/schemas/master-data.schema.ts
export const departmentSchema = z.object({
  name: z
    .string()
    .min(2, 'Department name must be at least 2 characters')
    .max(100, 'Department name must be 100 characters or less')
    .trim(),
});

export type DepartmentInput = z.infer<typeof departmentSchema>;
```

### Server Actions Pattern

```typescript
// src/actions/master-data.ts

// Option A: Extend existing requireAdminAuth with parameter (PREFERRED)
// Check if requireAdminAuth in actions/master-data.ts can be extended:
async function requireAdminAuth(
  options?: { requireSuperAdmin?: boolean }
): Promise<ActionResult<{ userId: string }>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'Not authenticated' };

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  const requiredRole = options?.requireSuperAdmin ? 'super_admin' : 'admin';
  const validRoles = options?.requireSuperAdmin
    ? ['super_admin']
    : ['admin', 'super_admin'];

  if (!profile?.role || !validRoles.includes(profile.role)) {
    return {
      success: false,
      error: options?.requireSuperAdmin
        ? 'Super Admin access required'
        : 'Admin access required'
    };
  }

  return { success: true, data: { userId: user.id } };
}

// Usage for department actions:
const auth = await requireAdminAuth({ requireSuperAdmin: true });

export async function createDepartment(input: DepartmentInput): Promise<ActionResult<Department>> {
  const auth = await requireSuperAdminAuth();
  if (!auth.success) return auth;

  const supabase = await createClient();

  const parsed = departmentSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  const { data, error } = await supabase
    .from('departments')
    .insert({ name: parsed.data.name })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return { success: false, error: 'Department name already exists' };
    }
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/master-data');
  return { success: true, data };
}

export async function updateDepartment(
  id: string,
  input: DepartmentInput
): Promise<ActionResult<Department>> {
  const auth = await requireSuperAdminAuth();
  if (!auth.success) return auth;

  const supabase = await createClient();

  const parsed = departmentSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  const { data, error } = await supabase
    .from('departments')
    .update({ name: parsed.data.name })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return { success: false, error: 'Department name already exists' };
    }
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/master-data');
  return { success: true, data };
}

export async function toggleDepartmentActive(
  id: string,
  active: boolean
): Promise<ActionResult<Department>> {
  const auth = await requireSuperAdminAuth();
  if (!auth.success) return auth;

  const supabase = await createClient();

  const { data, error } = await supabase
    .from('departments')
    .update({ active })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/master-data');
  return { success: true, data };
}
```

### Role-Based Tab Visibility

```typescript
// src/app/(app)/admin/master-data/page.tsx
import { createClient } from '@/lib/supabase/server';

export default async function MasterDataPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let isSuperAdmin = false;
  if (user) {
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();
    isSuperAdmin = profile?.role === 'super_admin';
  }

  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Master Data Management</h1>

      <Tabs defaultValue="services">
        <TabsList>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="jobs">Jobs</TabsTrigger>
          {isSuperAdmin && (
            <TabsTrigger value="departments">Departments</TabsTrigger>
          )}
        </TabsList>

        {/* ... existing tab contents ... */}

        {isSuperAdmin && (
          <TabsContent value="departments">
            <DepartmentsList />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
```

### Database Schema

The `departments` table already exists (from Story 1.2):

```sql
CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

Note: `name` has UNIQUE constraint, so error code 23505 will be thrown for duplicates.

### UX Enhancements (Team Review Suggestions)
1. **Sort Order**: Active departments first, then inactive, alphabetically within each group
2. **User Count Display**: Show number of users in each department on list item (optional enhancement)
3. **Confirmation Dialog**: Consider adding confirmation before deactivating department with active users (future enhancement)

### Existing Departments (from Seed Data)

Per Story 1.5, these departments exist:
1. Audio Production
2. Video Production
3. Project Management
4. Quality Control
5. Administration

### Project Structure

```
src/
├── app/
│   └── (app)/
│       └── admin/
│           └── master-data/
│               ├── page.tsx                    # Updated with role check
│               ├── page.test.tsx               # Updated with mocks
│               └── components/
│                   ├── DepartmentsList.tsx     # NEW - Server Component
│                   └── DepartmentsListClient.tsx # NEW - Client wrapper (item rendered via DataTable)
├── components/
│   └── admin/
│       ├── AddDepartmentDialog.tsx             # NEW - Add dialog
│       ├── AddDepartmentDialog.test.tsx        # NEW - 15 unit tests
│       ├── EditDepartmentDialog.tsx            # NEW - Edit dialog
│       └── EditDepartmentDialog.test.tsx       # NEW - 14 unit tests
├── schemas/
│   └── master-data.schema.ts                   # Extended with departmentSchema
└── actions/
    └── master-data.ts                          # Extended with department actions
```

### Component Pattern

Follow the same pattern as other master data components:

- **DepartmentsList.tsx**: Server Component that fetches data
- **DepartmentsListClient.tsx**: Client wrapper with DataTable, search, filters, and optimistic toggle
- Department item is rendered inline via DataTable columns (no separate DepartmentItem.tsx)

### References

- [Source: _bmad-output/implementation-artifacts/1-2-database-schema-core-tables.md]
- [Source: _bmad-output/implementation-artifacts/1-4-rls-policies-for-all-roles.md]
- [Source: _bmad-output/implementation-artifacts/3-3-task-management.md]
- [Source: _bmad-output/project-context.md#Server Actions Pattern]

## Definition of Done

- [x] Super Admin can view Departments tab
- [x] Admin (non-super_admin) cannot see Departments tab
- [x] Super Admin can add new departments with unique names
- [x] Super Admin can edit existing department names
- [x] Super Admin can toggle active/inactive status
- [x] Inactive departments appear visually distinct (opacity-50, line-through)
- [x] Deactivating department does not affect existing users
- [x] Active departments sorted first, then inactive (alphabetically within groups)
- [x] Unique name validation works (client and server)
- [x] All actions use ActionResult<T> pattern
- [x] Toast notifications for success/error
- [x] Unit tests for schema, actions, and components
- [x] E2E tests for role-based visibility and CRUD operations
- [x] All text in English (per project-context.md)
- [x] No TypeScript errors
- [x] All existing tests pass

## Dev Agent Record

### Debug Log
N/A

### Implementation Plan
N/A

### Completion Notes

**Implementation Completed: 2026-01-05**

**Summary:**
Successfully implemented Department Management for super_admin users. The feature allows super_admin to:
- View, add, edit, and toggle active status of departments
- Departments tab is hidden from non-super_admin users

**Files Created:**
- `src/app/(app)/admin/master-data/components/DepartmentsList.tsx` - Server component
- `src/app/(app)/admin/master-data/components/DepartmentsListClient.tsx` - Client component with DataTable
- `src/app/(app)/admin/master-data/components/DepartmentsListClient.test.tsx` - 19 unit tests
- `src/components/admin/AddDepartmentDialog.tsx` - Dialog for adding departments
- `src/components/admin/AddDepartmentDialog.test.tsx` - 15 unit tests
- `src/components/admin/EditDepartmentDialog.tsx` - Dialog for editing departments
- `src/components/admin/EditDepartmentDialog.test.tsx` - 14 unit tests
- `test/e2e/admin/department-management.test.ts` - 15 E2E tests

**Files Modified:**
- `src/schemas/master-data.schema.ts` - Added departmentSchema
- `src/schemas/master-data.schema.test.ts` - Added department schema tests
- `src/actions/master-data.ts` - Added requireSuperAdminAuth + CRUD actions
- `src/actions/master-data.test.ts` - Added department action tests
- `src/app/(app)/admin/master-data/page.tsx` - Added Departments tab with role check
- `src/app/(app)/admin/master-data/page.test.tsx` - Added DepartmentsList mock + Supabase mock
- `vitest.config.ts` - Added @test alias, removed e2e exclusion

**Test Results:**
- Schema tests: 42 tests passed
- Action tests: 81 tests passed
- Component tests (dialogs): 29 tests passed
- DepartmentsListClient tests: 19 tests passed
- Page tests: 7 tests passed (updated with mocks)
- E2E tests: 15 tests passed
- Total: All tests passing

**Key Decisions:**
1. Used `requireSuperAdminAuth` function (separate from `requireAdminAuth`) for super_admin-only access
2. No confirmation dialog for deactivating departments (doesn't affect existing users)
3. Validation enforces min 2 characters (different from services/tasks which use min 1)
4. Tab order follows data hierarchy: Clients → Projects → Jobs → Services → Tasks → Departments

**Notes:**
- Database has UNIQUE constraint on department name for duplication prevention
- Deactivating a department does NOT cascade to users (historical data preserved)
- E2E tests use Vitest with Supabase client (not Playwright browser tests)

## File List

### New Files
- `src/app/(app)/admin/master-data/components/DepartmentsList.tsx` - Server component
- `src/app/(app)/admin/master-data/components/DepartmentsListClient.tsx` - Client component with DataTable
- `src/app/(app)/admin/master-data/components/DepartmentsListClient.test.tsx` - 19 unit tests
- `src/components/admin/AddDepartmentDialog.tsx` - Add dialog component
- `src/components/admin/AddDepartmentDialog.test.tsx` - 15 unit tests
- `src/components/admin/EditDepartmentDialog.tsx` - Edit dialog component
- `src/components/admin/EditDepartmentDialog.test.tsx` - 14 unit tests
- `test/e2e/admin/department-management.test.ts` - 15 E2E tests for department CRUD

### Modified Files
- `src/schemas/master-data.schema.ts` - Add departmentSchema
- `src/schemas/master-data.schema.test.ts` - Add department schema tests
- `src/actions/master-data.ts` - Add requireSuperAdminAuth + department CRUD actions
- `src/actions/master-data.test.ts` - Add department action tests
- `src/app/(app)/admin/master-data/page.tsx` - Add Departments tab with role check
- `src/app/(app)/admin/master-data/page.test.tsx` - Add DepartmentsList mock + Supabase mock
- `vitest.config.ts` - Add @test alias, remove e2e exclusion

## Change Log

| Date | Change |
|------|--------|
| 2026-01-05 | Story 3.7 created - Department Management for super_admin |
| 2026-01-05 | Team Review: Added Task 9 (E2E tests), deactivation behavior notes, UX enhancements, refactored requireAdminAuth pattern |
| 2026-01-05 | Code Review: Fixed page.test.tsx mocks, added DepartmentsListClient.test.tsx (19 tests), updated File List accuracy, added test-output.log to .gitignore |
