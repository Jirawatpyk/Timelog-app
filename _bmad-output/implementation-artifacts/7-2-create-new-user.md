# Story 7.2: Create New User

## Status: ready-for-dev

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
- [ ] Create `createUserSchema` with Zod
- [ ] Validate email format
- [ ] Validate display_name (required, min 2 chars)
- [ ] Validate role (enum: staff, manager, admin, super_admin)
- [ ] Validate department_id (required UUID)

### Task 2: Create Add User Server Action
**File:** `src/actions/user.ts`
- [ ] Create `createUser(data: CreateUserInput)` function
- [ ] Check for duplicate email
- [ ] Check role permission (admin can't create super_admin)
- [ ] Insert into users table
- [ ] Return `ActionResult<User>`

### Task 3: Create Add User Button
**File:** `src/app/(app)/admin/users/components/AddUserButton.tsx`
- [ ] Create button with "เพิ่มผู้ใช้" label
- [ ] Add Plus icon
- [ ] Open dialog/sheet on click

### Task 4: Create User Form Component
**File:** `src/app/(app)/admin/users/components/UserForm.tsx`
- [ ] Create form with React Hook Form + Zod
- [ ] Email input field
- [ ] Display Name input field
- [ ] Role select dropdown
- [ ] Department select dropdown
- [ ] Submit and Cancel buttons

### Task 5: Create Role Select Component
**File:** `src/app/(app)/admin/users/components/RoleSelect.tsx`
- [ ] Create select with role options
- [ ] Filter out super_admin for non-super_admin users
- [ ] Thai labels for roles
- [ ] Proper styling with shadcn Select

### Task 6: Create Department Select Component
**File:** `src/app/(app)/admin/users/components/DepartmentSelect.tsx`
- [ ] Fetch departments from database
- [ ] Create select with department options
- [ ] Show only active departments
- [ ] Handle loading state

### Task 7: Implement Duplicate Email Check
**File:** `src/actions/user.ts`
- [ ] Query users table for existing email
- [ ] Return specific error message if duplicate
- [ ] Case-insensitive comparison

### Task 8: Implement Role Permission Check
**File:** `src/actions/user.ts`
- [ ] Get current user's role
- [ ] If current user is admin, prevent super_admin creation
- [ ] Allow super_admin to create any role

### Task 9: Create User Form Dialog
**File:** `src/app/(app)/admin/users/components/UserFormDialog.tsx`
- [ ] Use Dialog component from shadcn
- [ ] Include UserForm inside
- [ ] Handle open/close state
- [ ] Close on successful submission

### Task 10: Add Form Validation Error Display
**File:** `src/app/(app)/admin/users/components/UserForm.tsx`
- [ ] Show inline errors under each field
- [ ] Scroll to first error on submit
- [ ] Clear errors when field is corrected

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

- [ ] Add User button displays on user list page
- [ ] Form opens in dialog on button click
- [ ] All fields validate correctly
- [ ] Duplicate email shows error
- [ ] Admin cannot create super_admin
- [ ] Super Admin can create any role
- [ ] Success toast displays after creation
- [ ] User appears in list after creation
- [ ] Form closes on successful submission
- [ ] No TypeScript errors
- [ ] All imports use @/ aliases
- [ ] Server Actions return ActionResult<T>
