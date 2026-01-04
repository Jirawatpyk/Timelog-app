# Story 7.3: Edit User Information

## Status: done

## Story

As an **admin**,
I want **to edit existing user information**,
So that **I can update user details when needed**.

## Acceptance Criteria

### AC 1: Edit Button and Form Access
- **Given** I am on the user list
- **When** I click Edit on a user row
- **Then** I see an edit form pre-populated with user's current data

### AC 2: Successful User Update
- **Given** I modify any field and click "บันทึก"
- **When** Update succeeds
- **Then** I see success toast: "อัพเดทผู้ใช้สำเร็จ"
- **And** User list reflects the changes
- **And** audit_log records the change

### AC 3: Super Admin Edit Restriction
- **Given** I try to edit a super_admin as an admin
- **When** I attempt to modify their record
- **Then** I see error: "ไม่สามารถแก้ไข Super Admin ได้"
- **And** Only super_admins can edit other super_admins

### AC 4: Email Change Validation
- **Given** I change user's email to one that already exists
- **When** I click "บันทึก"
- **Then** I see error: "Email นี้มีอยู่ในระบบแล้ว"

### AC 5: Form Cancellation
- **Given** I have made changes to the form
- **When** I click "ยกเลิก"
- **Then** Dialog closes without saving
- **And** Original data remains unchanged

## Tasks

### Task 1: Create Edit User Schema
**File:** `src/schemas/user.schema.ts`
- [x] Create `editUserSchema` with Zod
- [x] Include all editable fields
- [x] Make email optional for update check

### Task 2: Create Update User Server Action
**File:** `src/actions/user.ts`
- [x] Create `updateUser(id: string, data: EditUserInput)` function
- [x] Check permission (admin can't edit super_admin)
- [x] Check for duplicate email (excluding current user)
- [x] Update users table
- [x] Return `ActionResult<User>`

### Task 3: Add Edit Button to UserTable
**File:** `src/app/(app)/admin/users/components/UserTable.tsx`
- [x] Add Edit icon button (Pencil icon)
- [x] Open edit dialog on click
- [x] Pass user data to dialog

### Task 4: Create Edit User Dialog
**File:** `src/app/(app)/admin/users/components/EditUserDialog.tsx`
- [x] Use Dialog component from shadcn
- [x] Accept user prop for pre-population
- [x] Include form with all editable fields
- [x] Handle open/close state

### Task 5: Edit Form in EditUserDialog
**File:** `src/app/(app)/admin/users/components/EditUserDialog.tsx`
- [x] Built-in form with React Hook Form + zodResolver
- [x] Pre-populate fields with user data on dialog open
- [x] Submit button shows "Save" (English per project-context.md)
- [x] Call updateUser server action on submit

### Task 6: Implement Super Admin Edit Check
**File:** `src/actions/user.ts`
- [x] Get target user's role before update
- [x] Get current user's role
- [x] If target is super_admin and current is admin, reject

### Task 7: Implement Duplicate Email Check for Edit
**File:** `src/actions/user.ts`
- [x] Query for existing email excluding current user's id
- [x] Return specific error if duplicate found

### Task 8: Add Audit Log Entry
**File:** `src/actions/user.ts`
- [x] Record old values before update
- [x] Database trigger handles audit_log insert (no code needed)
- [x] Ensure user_id is captured for audit

### Task 9: Handle Form State Management
**File:** `src/app/(app)/admin/users/components/EditUserDialog.tsx`
- [x] Reset form when dialog opens with new user (useEffect on user.id change)
- [x] Prevent stale data display
- [x] Handle loading state during submission (Loader2 spinner)

### Task 10: Add Confirmation for Unsaved Changes
**File:** `src/app/(app)/admin/users/components/EditUserDialog.tsx`
- [x] Track if form has been modified (isDirty)
- [x] Show confirmation when closing with unsaved changes
- [x] AlertDialog confirmation: "Discard changes?" (English per project-context.md)

## Dev Notes

### Architecture Pattern
- Reuse UserForm component from Story 7.2
- Pass mode prop to differentiate create vs edit
- Server Action handles the update

### Edit Schema
```typescript
// src/schemas/user.schema.ts
export const editUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  displayName: z.string().trim().min(2, 'Display name must be at least 2 characters'),
  role: z.enum(['staff', 'manager', 'admin', 'super_admin']),
  departmentId: z.string().uuid('Please select a department'),
});

export type EditUserInput = z.infer<typeof editUserSchema>;
```

### Server Action Pattern
```typescript
// src/actions/user.ts
'use server';

export async function updateUser(
  id: string,
  data: EditUserInput
): Promise<ActionResult<User>> {
  const supabase = await createClient();

  // Get current user's role
  const { data: currentUser } = await supabase
    .from('users')
    .select('role')
    .eq('id', (await supabase.auth.getUser()).data.user?.id)
    .single();

  // Get target user's role
  const { data: targetUser } = await supabase
    .from('users')
    .select('role')
    .eq('id', id)
    .single();

  // Prevent admin from editing super_admin
  if (targetUser?.role === 'super_admin' && currentUser?.role !== 'super_admin') {
    return { success: false, error: 'Cannot edit Super Admin' };
  }

  // Check duplicate email (excluding this user)
  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .ilike('email', data.email)
    .neq('id', id)
    .single();

  if (existing) {
    return { success: false, error: 'Email already exists' };
  }

  // Update user
  const { data: user, error } = await supabase
    .from('users')
    .update({
      email: data.email,
      display_name: data.displayName,
      role: data.role,
      department_id: data.departmentId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return { success: false, error: 'Failed to update user' };
  }

  revalidatePath('/admin/users');
  return { success: true, data: user };
}
```

### Form Mode Pattern
```typescript
// UserForm.tsx
interface UserFormProps {
  user?: User;  // If provided, edit mode
  onSuccess: () => void;
  onCancel: () => void;
}

function UserForm({ user, onSuccess, onCancel }: UserFormProps) {
  const isEditMode = !!user;

  const form = useForm({
    resolver: zodResolver(isEditMode ? editUserSchema : createUserSchema),
    defaultValues: user ? {
      email: user.email,
      displayName: user.display_name,
      role: user.role,
      departmentId: user.department_id,
    } : undefined,
  });

  // ...
}
```

### Component Dependencies
- Reuses UserForm from Story 7.2
- Uses Dialog from shadcn/ui
- Uses AlertDialog for unsaved changes confirmation

### Import Convention
```typescript
import { updateUser } from '@/actions/user';
import { editUserSchema, type EditUserInput } from '@/schemas/user.schema';
import { EditUserDialog } from './components/EditUserDialog';
```

### Audit Log Note
- Database trigger (from Epic 1) handles audit_log insertion
- No additional code needed for audit logging
- Trigger captures old_data and new_data automatically

### Accessibility
- Edit button has aria-label "Edit [displayName or email]"
- Form fields maintain focus order
- Confirmation dialog is keyboard accessible
- Loading state announced to screen readers

## Definition of Done

- [x] Edit button appears on each user row
- [x] Edit dialog opens with pre-populated data
- [x] All fields are editable
- [x] Validation works correctly
- [x] Duplicate email check works (excluding current user)
- [x] Admin cannot edit super_admin users
- [x] Super Admin can edit any user
- [x] Success toast displays after update
- [x] User list reflects changes immediately
- [x] Unsaved changes confirmation works
- [x] No TypeScript errors
- [x] All imports use @/ aliases
- [x] Server Actions return ActionResult<T>

## File List

### Modified Files
| File | Change |
|------|--------|
| `src/schemas/user.schema.ts` | Added editUserSchema and EditUserInput type |
| `src/schemas/user.schema.test.ts` | Added 17 tests for editUserSchema validation |
| `src/actions/user.ts` | Added updateUser server action with all validations |
| `src/actions/user.test.ts` | Added 8 tests for updateUser function |
| `src/app/(app)/admin/users/components/UserTable.tsx` | Added Edit button and EditUserDialog integration |

### New Files
| File | Purpose |
|------|---------|
| `src/app/(app)/admin/users/components/EditUserDialog.tsx` | Edit user dialog with form, validation, unsaved changes confirmation |
| `src/app/(app)/admin/users/components/EditUserDialog.test.tsx` | 8 unit tests for EditUserDialog component |
| `test/e2e/admin/edit-user.test.ts` | E2E tests for edit user functionality (10 scenarios) |

## Dev Agent Record

**Completed:** 2026-01-04
**Agent:** Claude Opus 4.5

### Implementation Summary
All 10 tasks completed using TDD (Red-Green-Refactor) approach:

1. **Schema (Task 1):** Created `editUserSchema` with Zod validation for email, displayName, role, departmentId
2. **Server Action (Tasks 2, 6, 7, 8):** Implemented `updateUser()` with:
   - Input validation
   - Authentication check
   - Super admin protection (admin cannot edit super_admin)
   - Duplicate email check (excluding current user)
   - Audit log via database trigger
3. **UI Components (Tasks 3, 4, 5, 9, 10):**
   - Edit button (Pencil icon) in UserTable for both desktop table and mobile cards
   - EditUserDialog with built-in React Hook Form
   - Pre-populated form data on open
   - Loading states with Loader2 spinner
   - Unsaved changes confirmation via AlertDialog

### Language Note
Per project-context.md, UI text uses **English** instead of Thai specified in original ACs:
- "Save" (not "บันทึก")
- "User updated successfully" (not "อัพเดทผู้ใช้สำเร็จ")
- "Cannot edit Super Admin" (not "ไม่สามารถแก้ไข Super Admin ได้")
- "Email already exists" (not "Email นี้มีอยู่ในระบบแล้ว")
- "Discard changes?" (not "ยกเลิกการแก้ไข?")

### Test Coverage
- **Unit Tests:** 1738 tests across 146 files (all passing)
- **E2E Tests:** 10 scenarios for edit user functionality
- **Story-specific tests:**
  - editUserSchema: 17 tests
  - updateUser: 8 tests
  - EditUserDialog: 8 tests
  - E2E edit-user: 10 tests
