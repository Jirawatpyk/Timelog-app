# Story 7.3: Edit User Information

## Status: ready-for-dev

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
- [ ] Create `editUserSchema` with Zod
- [ ] Include all editable fields
- [ ] Make email optional for update check

### Task 2: Create Update User Server Action
**File:** `src/actions/user.ts`
- [ ] Create `updateUser(id: string, data: EditUserInput)` function
- [ ] Check permission (admin can't edit super_admin)
- [ ] Check for duplicate email (excluding current user)
- [ ] Update users table
- [ ] Return `ActionResult<User>`

### Task 3: Add Edit Button to UserRow
**File:** `src/app/(app)/admin/users/components/UserRow.tsx`
- [ ] Add Edit icon button
- [ ] Open edit dialog on click
- [ ] Pass user data to dialog

### Task 4: Create Edit User Dialog
**File:** `src/app/(app)/admin/users/components/EditUserDialog.tsx`
- [ ] Use Dialog component from shadcn
- [ ] Accept user prop for pre-population
- [ ] Include UserForm in edit mode
- [ ] Handle open/close state

### Task 5: Modify UserForm for Edit Mode
**File:** `src/app/(app)/admin/users/components/UserForm.tsx`
- [ ] Accept optional `user` prop for edit mode
- [ ] Pre-populate fields when user provided
- [ ] Change submit button text: "บันทึก" vs "สร้าง"
- [ ] Call updateUser vs createUser based on mode

### Task 6: Implement Super Admin Edit Check
**File:** `src/actions/user.ts`
- [ ] Get target user's role before update
- [ ] Get current user's role
- [ ] If target is super_admin and current is admin, reject

### Task 7: Implement Duplicate Email Check for Edit
**File:** `src/actions/user.ts`
- [ ] Query for existing email excluding current user's id
- [ ] Return specific error if duplicate found

### Task 8: Add Audit Log Entry
**File:** `src/actions/user.ts`
- [ ] Record old values before update
- [ ] Database trigger handles audit_log insert
- [ ] Ensure user_id is captured for audit

### Task 9: Handle Form State Management
**File:** `src/app/(app)/admin/users/components/EditUserDialog.tsx`
- [ ] Reset form when dialog opens with new user
- [ ] Prevent stale data display
- [ ] Handle loading state during submission

### Task 10: Add Confirmation for Unsaved Changes
**File:** `src/app/(app)/admin/users/components/EditUserDialog.tsx`
- [ ] Track if form has been modified (isDirty)
- [ ] Show confirmation when closing with unsaved changes
- [ ] "ยกเลิกการแก้ไข?" confirmation dialog

## Dev Notes

### Architecture Pattern
- Reuse UserForm component from Story 7.2
- Pass mode prop to differentiate create vs edit
- Server Action handles the update

### Edit Schema
```typescript
// src/schemas/user.schema.ts
export const editUserSchema = z.object({
  email: z.string().email('รูปแบบ Email ไม่ถูกต้อง'),
  displayName: z.string().min(2, 'ชื่อต้องมีอย่างน้อย 2 ตัวอักษร'),
  role: z.enum(['staff', 'manager', 'admin', 'super_admin']),
  departmentId: z.string().uuid('กรุณาเลือกแผนก'),
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
    return { success: false, error: 'ไม่สามารถแก้ไข Super Admin ได้' };
  }

  // Check duplicate email (excluding this user)
  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .ilike('email', data.email)
    .neq('id', id)
    .single();

  if (existing) {
    return { success: false, error: 'Email นี้มีอยู่ในระบบแล้ว' };
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
    return { success: false, error: 'ไม่สามารถอัพเดทผู้ใช้ได้' };
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
- Edit button has aria-label "แก้ไขผู้ใช้ [name]"
- Form fields maintain focus order
- Confirmation dialog is keyboard accessible
- Loading state announced to screen readers

## Definition of Done

- [ ] Edit button appears on each user row
- [ ] Edit dialog opens with pre-populated data
- [ ] All fields are editable
- [ ] Validation works correctly
- [ ] Duplicate email check works (excluding current user)
- [ ] Admin cannot edit super_admin users
- [ ] Super Admin can edit any user
- [ ] Success toast displays after update
- [ ] User list reflects changes immediately
- [ ] Unsaved changes confirmation works
- [ ] No TypeScript errors
- [ ] All imports use @/ aliases
- [ ] Server Actions return ActionResult<T>
