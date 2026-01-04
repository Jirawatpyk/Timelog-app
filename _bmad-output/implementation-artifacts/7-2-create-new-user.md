# Story 7.2: Create New User

## Status: done

## Story

As an **admin**,
I want **to create new user accounts**,
So that **new employees can access the system**.

## Acceptance Criteria

### AC 1: Add User Button and Form
- **Given** I am on the user list page
- **When** I click "เพิ่มผู้ใช้" (Add User)
- **Then** I see a form with fields: Email, Display Name, Role, Department

### AC 2: Successful User Creation
- **Given** I fill in all required fields
- **When** I click "บันทึก"
- **Then** A new user record is created in the users table
- **And** User is created with is_active = true
- **And** I see success toast: "เพิ่มผู้ใช้สำเร็จ"
- **And** User appears in the list

### AC 3: Duplicate Email Validation
- **Given** I enter an email that already exists
- **When** I click "บันทึก"
- **Then** I see error: "Email นี้มีอยู่ในระบบแล้ว"
- **And** Form is not submitted

### AC 4: Super Admin Creation Restriction
- **Given** I try to create a super_admin as an admin
- **When** I select role = super_admin
- **Then** I see error: "ไม่สามารถสร้าง Super Admin ได้"
- **And** Only super_admin can create other super_admins

### AC 5: Email Format Validation
- **Given** I enter an invalid email format
- **When** Field loses focus
- **Then** I see error: "รูปแบบ Email ไม่ถูกต้อง"

### AC 6: Required Fields Validation
- **Given** I try to submit with empty required fields
- **When** I click "บันทึก"
- **Then** I see validation errors on empty fields
- **And** Form scrolls to first error

## Tasks

### Task 1: Create User Form Schema
**File:** `src/schemas/user.schema.ts`
- [x] Create `createUserSchema` with Zod
- [x] Validate email format
- [x] Validate display_name (required, min 2 chars)
- [x] Validate role (enum: staff, manager, admin, super_admin)
- [x] Validate department_id (required UUID)

### Task 2: Create Add User Server Action
**File:** `src/actions/user.ts`
- [x] Create `createUser(data: CreateUserInput)` function
- [x] Check for duplicate email
- [x] Check role permission (admin can't create super_admin)
- [x] Insert into users table
- [x] Return `ActionResult<User>`

### Task 3: Create Add User Dialog (Combined Tasks 3-6, 9-10)
**File:** `src/app/(app)/admin/users/components/AddUserDialog.tsx`
- [x] Create button with "Add User" label (English UI per project-context.md)
- [x] Add Plus icon
- [x] Open dialog on click
- [x] Create form with React Hook Form + Zod
- [x] Email input field
- [x] Display Name input field
- [x] Role select dropdown with filtering (admin can't select super_admin)
- [x] Department select dropdown (fetches active departments)
- [x] Submit and Cancel buttons
- [x] Show inline errors under each field
- [x] Handle loading state

### Task 7: Implement Duplicate Email Check
**File:** `src/actions/user.ts`
- [x] Query users table for existing email
- [x] Return specific error message if duplicate
- [x] Case-insensitive comparison

### Task 8: Implement Role Permission Check
**File:** `src/actions/user.ts`
- [x] Get current user's role
- [x] If current user is admin, prevent super_admin creation
- [x] Allow super_admin to create any role

## Dev Notes

### Architecture Pattern
- Form uses React Hook Form with Zod validation
- Server Action handles creation
- Dialog pattern for add form

### Form Schema
```typescript
// src/schemas/user.schema.ts
import { z } from 'zod';

export const createUserSchema = z.object({
  email: z.string().email('รูปแบบ Email ไม่ถูกต้อง'),
  displayName: z.string().min(2, 'ชื่อต้องมีอย่างน้อย 2 ตัวอักษร'),
  role: z.enum(['staff', 'manager', 'admin', 'super_admin']),
  departmentId: z.string().uuid('กรุณาเลือกแผนก'),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
```

### Server Action Pattern
```typescript
// src/actions/user.ts
'use server';

export async function createUser(data: CreateUserInput): Promise<ActionResult<User>> {
  const supabase = await createClient();

  // Check current user's role
  const { data: currentUser } = await supabase
    .from('users')
    .select('role')
    .eq('id', (await supabase.auth.getUser()).data.user?.id)
    .single();

  // Prevent admin from creating super_admin
  if (currentUser?.role === 'admin' && data.role === 'super_admin') {
    return { success: false, error: 'ไม่สามารถสร้าง Super Admin ได้' };
  }

  // Check duplicate email
  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .ilike('email', data.email)
    .single();

  if (existing) {
    return { success: false, error: 'Email นี้มีอยู่ในระบบแล้ว' };
  }

  // Create user
  const { data: user, error } = await supabase
    .from('users')
    .insert({
      email: data.email,
      display_name: data.displayName,
      role: data.role,
      department_id: data.departmentId,
      is_active: true,
    })
    .select()
    .single();

  if (error) {
    return { success: false, error: 'ไม่สามารถสร้างผู้ใช้ได้' };
  }

  revalidatePath('/admin/users');
  return { success: true, data: user };
}
```

### Role Options
```typescript
const roleOptions = [
  { value: 'staff', label: 'พนักงาน' },
  { value: 'manager', label: 'หัวหน้า' },
  { value: 'admin', label: 'แอดมิน' },
  // Only show for super_admin
  { value: 'super_admin', label: 'ซุปเปอร์แอดมิน' },
];
```

### Component Dependencies
- Builds on UserTable from Story 7.1
- Uses Dialog from shadcn/ui
- Uses Form components from shadcn/ui
- React Hook Form + Zod for validation

### Import Convention
```typescript
import { createUser } from '@/actions/user';
import { createUserSchema, type CreateUserInput } from '@/schemas/user.schema';
import { UserFormDialog } from './components/UserFormDialog';
```

### Note on Auth User Creation
- This story creates a record in the `users` table only
- Actual Supabase Auth user creation is separate (magic link flow)
- User record is linked to auth.users via id when they first login

### Accessibility
- Form fields have proper labels
- Error messages are announced to screen readers
- Focus management on dialog open/close
- Submit button disabled during submission

## Definition of Done

- [x] Add User button displays on user list page
- [x] Form opens in dialog on button click
- [x] All fields validate correctly
- [x] Duplicate email shows error
- [x] Admin cannot create super_admin
- [x] Super Admin can create any role
- [x] Success toast displays after creation
- [x] User appears in list after creation (via revalidatePath)
- [x] Form closes on successful submission
- [x] No TypeScript errors
- [x] All imports use @/ aliases
- [x] Server Actions return ActionResult<T>

## Dev Agent Record

### Implementation Summary
- Created `user.schema.ts` with Zod validation schema
- Added `createUser`, `getActiveDepartments`, `getCurrentUserRole` to `user.ts`
- Created `AddUserDialog.tsx` component with full form functionality
- Integrated into UsersPage header

### Files Created
- `src/schemas/user.schema.ts` - Validation schema
- `src/schemas/user.schema.test.ts` - Schema unit tests (17 tests)
- `src/app/(app)/admin/users/components/AddUserDialog.tsx` - Dialog component
- `src/app/(app)/admin/users/components/AddUserDialog.test.tsx` - Component tests (13 tests)

### Files Modified
- `src/actions/user.ts` - Added createUser, getActiveDepartments, getCurrentUserRole
- `src/actions/user.test.ts` - Added action tests (18 tests)
- `src/app/(app)/admin/users/page.tsx` - Integrated AddUserDialog button

### Test Coverage
- Schema validation: 17 tests (100% pass)
- Server actions: 18 tests (100% pass)
- AddUserDialog component: 13 tests (100% pass)
- Total new tests: 48

### Notes
- UI is English per project-context.md guidelines
- Role options filter based on current user's role
- Department select fetches active departments on dialog open
- Form resets on dialog close

---

## Code Review Record

### Review Date: 2026-01-04

### Issues Found: 7 (3 HIGH, 2 MEDIUM, 2 LOW)

### Fixes Applied

| Issue | Severity | Description | Fix |
|-------|----------|-------------|-----|
| #1 | HIGH | AC 5: Form mode was `onSubmit`, should be `onBlur` for email validation on blur | Changed to `mode: 'onBlur'` |
| #2 | HIGH | Department ID not validated before insert | Added department existence check in `createUser()` |
| #3 | HIGH | Race condition on duplicate email | Already mitigated by unique constraint handling (code 23505) |
| #4 | MEDIUM | No error state when dept/role fetch fails | Added `fetchError` state and error UI |
| #5 | MEDIUM | Missing test for loading state | Added test `shows loading spinner while fetching data` |
| #6 | LOW | AC 6: No scroll to first error | Added `useEffect` with `scrollIntoView` and `formRef` |
| #7 | LOW | Missing test for cancel button reset | Added test `resets form when cancel is clicked` |

### Code Changes

**`AddUserDialog.tsx`:**
- Line 10: Added `useRef` import
- Line 62: Added `fetchError` state
- Line 63: Added `formRef` for scroll to error
- Line 71: Changed form mode to `onBlur`
- Line 79-95: Enhanced error handling in useEffect
- Line 101-112: Added scroll to first error useEffect
- Line 134: Reset fetchError on dialog close
- Line 153-163: Added error state UI with Close button
- Line 180: Added `ref={formRef}` to form

**`user.ts`:**
- Line 182-192: Added department validation before insert

**`AddUserDialog.test.tsx`:**
- Added 4 new tests: loading spinner, error state, cancel reset, email blur validation

**`user.test.ts`:**
- Added `validDepartment` option to mock setup
- Added test for invalid department rejection
- Total: 18 tests (was 17)

### Final Test Count
- AddUserDialog: 13 tests ✅
- user.ts actions: 18 tests ✅
- user.schema: 17 tests ✅
- **Total: 48 tests** (was 43)

### Known Limitation
⚠️ **Auth Gap**: Story 7.2 creates user in `public.users` table only. Supabase Auth user (`auth.users`) is NOT created. New users cannot login until:
1. Story 7.7 (First-time user flow) implements invite/magic-link, OR
2. Admin API is used to create auth user with invite email
