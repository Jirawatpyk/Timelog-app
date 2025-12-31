# Story 7.5: Assign Roles

## Status: ready-for-dev

## Story

As an **admin**,
I want **to assign roles to users**,
So that **they have appropriate access levels**.

## Acceptance Criteria

### AC 1: Role Dropdown Options for Admin
- **Given** I am editing a user as an admin
- **When** I view the Role dropdown
- **Then** I see options: staff, manager, admin
- **And** super_admin is NOT shown (only visible to super_admins)

### AC 2: Role Change Success
- **Given** I change a user's role from staff to manager
- **When** I save the change
- **Then** User's role is updated
- **And** User gains access to /team page
- **And** audit_log records the role change

### AC 3: Manager Department Prompt
- **Given** I change a user's role to manager
- **When** Save completes
- **Then** I see prompt: "ต้องการกำหนดแผนกที่ดูแลไหม?"
- **And** I can assign departments via manager_departments

### AC 4: Super Admin Role Visibility
- **Given** I am a super_admin
- **When** I edit roles
- **Then** I can see and assign super_admin role
- **And** I can edit other super_admins

### AC 5: Role Downgrade Handling
- **Given** I change a user from manager to staff
- **When** Save completes
- **Then** User's manager_departments entries are removed
- **And** User loses access to /team page

## Tasks

### Task 1: Update RoleSelect Component
**File:** `src/app/(app)/admin/users/components/RoleSelect.tsx`
- [ ] Accept currentUserRole prop
- [ ] Filter options based on current user's role
- [ ] Show super_admin only if currentUserRole === 'super_admin'
- [ ] Thai labels for all roles

### Task 2: Create Role Options Helper
**File:** `src/lib/roles.ts`
- [ ] Create `getRoleOptions(currentUserRole)` function
- [ ] Define role hierarchy and labels
- [ ] Export Thai labels mapping

### Task 3: Update Update User Server Action
**File:** `src/actions/user.ts`
- [ ] Check if role is changing
- [ ] Validate role assignment permission
- [ ] If changing to manager, return flag for department prompt
- [ ] If downgrading from manager, clean up manager_departments

### Task 4: Create Role Change Handler
**File:** `src/app/(app)/admin/users/components/UserForm.tsx`
- [ ] Track if role changed to manager
- [ ] Trigger department assignment prompt after save
- [ ] Handle role change side effects

### Task 5: Create Department Assignment Prompt
**File:** `src/app/(app)/admin/users/components/ManagerDeptPrompt.tsx`
- [ ] Show after successful role change to manager
- [ ] "ต้องการกำหนดแผนกที่ดูแลไหม?"
- [ ] Options: "กำหนดเลย" or "ภายหลัง"
- [ ] Link to Story 7.6 for department assignment

### Task 6: Clean Up Manager Departments on Downgrade
**File:** `src/actions/user.ts`
- [ ] Create `cleanupManagerDepartments(userId)` function
- [ ] Delete all manager_departments for user
- [ ] Call when role changes from manager to staff/admin

### Task 7: Validate Role Assignment Permissions
**File:** `src/actions/user.ts`
- [ ] Admin cannot assign super_admin role
- [ ] Admin cannot change super_admin's role
- [ ] Super Admin can assign any role
- [ ] Return specific error messages

### Task 8: Add Audit Log for Role Changes
**File:** `src/actions/user.ts`
- [ ] Database trigger handles audit_log automatically
- [ ] Ensure old_role and new_role captured in change
- [ ] Note: Already handled by Epic 1 audit trigger

### Task 9: Update User Form for Role Context
**File:** `src/app/(app)/admin/users/components/UserForm.tsx`
- [ ] Fetch current user's role on mount
- [ ] Pass to RoleSelect component
- [ ] Handle loading state for role fetch

### Task 10: Test Role-Based Access After Change
**File:** `test/e2e/admin/role-change.test.ts`
- [ ] Test staff → manager gains /team access
- [ ] Test manager → staff loses /team access
- [ ] Test admin cannot assign super_admin
- [ ] Test super_admin can assign any role

## Dev Notes

### Architecture Pattern
- Role selection is part of UserForm (Stories 7.2, 7.3)
- This story adds role-specific logic and validation
- Department assignment prompt leads to Story 7.6

### Role Hierarchy
```typescript
// src/lib/roles.ts
export const ROLES = {
  staff: { label: 'พนักงาน', level: 1 },
  manager: { label: 'หัวหน้า', level: 2 },
  admin: { label: 'แอดมิน', level: 3 },
  super_admin: { label: 'ซุปเปอร์แอดมิน', level: 4 },
} as const;

export function getRoleOptions(currentUserRole: string) {
  const options = [
    { value: 'staff', label: 'พนักงาน' },
    { value: 'manager', label: 'หัวหน้า' },
    { value: 'admin', label: 'แอดมิน' },
  ];

  if (currentUserRole === 'super_admin') {
    options.push({ value: 'super_admin', label: 'ซุปเปอร์แอดมิน' });
  }

  return options;
}
```

### Server Action Pattern
```typescript
// src/actions/user.ts
export async function updateUserRole(
  userId: string,
  newRole: string
): Promise<ActionResult<{ user: User; promptDepartment: boolean }>> {
  const supabase = await createClient();

  // Get current user's role for permission check
  const { data: { user: authUser } } = await supabase.auth.getUser();
  const { data: currentUser } = await supabase
    .from('users')
    .select('role')
    .eq('id', authUser?.id)
    .single();

  // Get target user's current role
  const { data: targetUser } = await supabase
    .from('users')
    .select('role')
    .eq('id', userId)
    .single();

  // Permission checks
  if (newRole === 'super_admin' && currentUser?.role !== 'super_admin') {
    return { success: false, error: 'ไม่มีสิทธิ์กำหนด Super Admin' };
  }

  if (targetUser?.role === 'super_admin' && currentUser?.role !== 'super_admin') {
    return { success: false, error: 'ไม่สามารถเปลี่ยน role ของ Super Admin ได้' };
  }

  // Clean up manager_departments if downgrading from manager
  if (targetUser?.role === 'manager' && newRole !== 'manager') {
    await supabase
      .from('manager_departments')
      .delete()
      .eq('manager_id', userId);
  }

  // Update role
  const { data: user, error } = await supabase
    .from('users')
    .update({ role: newRole, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    return { success: false, error: 'ไม่สามารถอัพเดท role ได้' };
  }

  revalidatePath('/admin/users');

  return {
    success: true,
    data: {
      user,
      promptDepartment: newRole === 'manager' && targetUser?.role !== 'manager',
    },
  };
}
```

### Manager Department Prompt
```typescript
// After successful role change to manager
{showDeptPrompt && (
  <AlertDialog>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>กำหนดแผนกที่ดูแล</AlertDialogTitle>
        <AlertDialogDescription>
          ต้องการกำหนดแผนกที่ดูแลไหม?
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel onClick={handleLater}>ภายหลัง</AlertDialogCancel>
        <AlertDialogAction onClick={handleAssignNow}>
          กำหนดเลย
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
)}
```

### Component Dependencies
- Builds on UserForm from Stories 7.2, 7.3
- Leads to Story 7.6 for department assignment
- Uses AlertDialog from shadcn/ui

### Import Convention
```typescript
import { getRoleOptions, ROLES } from '@/lib/roles';
import { updateUserRole } from '@/actions/user';
import { ManagerDeptPrompt } from './components/ManagerDeptPrompt';
```

### Access Control After Role Change
- Middleware checks role on each request
- Role change takes effect immediately
- No session invalidation needed (role checked from DB)

### Accessibility
- Role dropdown has proper label
- Role descriptions for screen readers
- Prompt dialog has proper focus management

## Definition of Done

- [ ] Role dropdown shows correct options based on current user
- [ ] Admin cannot see/assign super_admin role
- [ ] Super Admin can assign any role
- [ ] Role change saves correctly
- [ ] Manager→Staff cleans up manager_departments
- [ ] Staff→Manager shows department prompt
- [ ] Access control reflects new role immediately
- [ ] Audit log captures role changes
- [ ] No TypeScript errors
- [ ] All imports use @/ aliases
- [ ] Server Actions return ActionResult<T>
