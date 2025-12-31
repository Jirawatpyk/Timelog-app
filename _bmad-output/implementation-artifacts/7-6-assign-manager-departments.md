# Story 7.6: Assign Manager Departments

## Status: ready-for-dev

## Story

As an **admin**,
I want **to assign departments to managers**,
So that **they can view their team's entries**.

## Acceptance Criteria

### AC 1: Department Assignment Section Display
- **Given** I am editing a user with role = manager
- **When** I view the department assignment section
- **Then** I see a multi-select for departments
- **And** Current assignments are pre-selected

### AC 2: Assign Multiple Departments
- **Given** I select 2 departments for a manager
- **When** I save
- **Then** manager_departments records are created/updated
- **And** Manager can now see both departments in /team
- **And** RLS allows manager to read entries from both departments

### AC 3: Remove Department Assignment
- **Given** I remove a department from a manager
- **When** I save
- **Then** The manager_departments record is deleted
- **And** Manager can no longer see that department's entries

### AC 4: Non-Manager Role Handling
- **Given** User role is not manager
- **When** Viewing their edit form
- **Then** Department assignment section is hidden

### AC 5: At Least One Department Required
- **Given** Manager has no departments assigned
- **When** Viewing the team dashboard
- **Then** Manager sees empty state with message
- **And** Admin is prompted to assign departments

## Tasks

### Task 1: Create Department Multi-Select Component
**File:** `src/app/(app)/admin/users/components/DepartmentMultiSelect.tsx`
- [ ] Create multi-select using Checkbox or MultiSelect pattern
- [ ] Fetch all active departments
- [ ] Show checkboxes for each department
- [ ] Pre-select current assignments

### Task 2: Create Get Manager Departments Action
**File:** `src/actions/user.ts`
- [ ] Create `getManagerDepartments(managerId: string)` function
- [ ] Query manager_departments joined with departments
- [ ] Return `ActionResult<Department[]>`

### Task 3: Create Update Manager Departments Action
**File:** `src/actions/user.ts`
- [ ] Create `updateManagerDepartments(managerId: string, departmentIds: string[])` function
- [ ] Delete all existing assignments for manager
- [ ] Insert new assignments
- [ ] Use transaction for atomicity
- [ ] Return `ActionResult<Department[]>`

### Task 4: Add Department Assignment to Edit Form
**File:** `src/app/(app)/admin/users/components/UserForm.tsx`
- [ ] Conditionally render DepartmentMultiSelect when role = manager
- [ ] Load current assignments on mount
- [ ] Include in form submission

### Task 5: Create Department Chip Display
**File:** `src/app/(app)/admin/users/components/DepartmentChips.tsx`
- [ ] Display assigned departments as chips/badges
- [ ] Show in user list row for managers
- [ ] Compact display for table view

### Task 6: Handle Assignment from Role Change Prompt
**File:** `src/app/(app)/admin/users/components/ManagerDeptPrompt.tsx`
- [ ] When user clicks "กำหนดเลย" from Story 7.5
- [ ] Open department assignment dialog
- [ ] Save and close on confirm

### Task 7: Create Standalone Assignment Dialog
**File:** `src/app/(app)/admin/users/components/DepartmentAssignDialog.tsx`
- [ ] Reusable dialog for department assignment
- [ ] Accept managerId prop
- [ ] Load and save departments
- [ ] Success toast on save

### Task 8: Validate Manager Has Departments
**File:** `src/app/(app)/team/page.tsx`
- [ ] Check if manager has any departments assigned
- [ ] Show empty state if none: "ยังไม่มีแผนกที่ดูแล"
- [ ] Link to admin to request assignment

### Task 9: Update User Row to Show Departments
**File:** `src/app/(app)/admin/users/components/UserRow.tsx`
- [ ] For managers, show department chips
- [ ] Truncate if more than 2 (show "+1 more")
- [ ] Tooltip for full list

### Task 10: Add E2E Test for Multi-Department
**File:** `test/e2e/admin/manager-departments.test.ts`
- [ ] Test assigning 2 departments
- [ ] Test removing 1 department
- [ ] Test RLS access after assignment change

## Dev Notes

### Architecture Pattern
- Multi-select for department assignment
- Junction table manager_departments
- Real-time RLS effect after save

### Database Schema
```sql
-- manager_departments junction table (from Epic 1)
CREATE TABLE manager_departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  manager_id UUID REFERENCES users(id) ON DELETE CASCADE,
  department_id UUID REFERENCES departments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(manager_id, department_id)
);
```

### Server Action Pattern
```typescript
// src/actions/user.ts
export async function updateManagerDepartments(
  managerId: string,
  departmentIds: string[]
): Promise<ActionResult<Department[]>> {
  const supabase = await createClient();

  // Verify user is a manager
  const { data: user } = await supabase
    .from('users')
    .select('role')
    .eq('id', managerId)
    .single();

  if (user?.role !== 'manager') {
    return { success: false, error: 'ผู้ใช้ไม่ใช่หัวหน้า' };
  }

  // Delete existing assignments
  await supabase
    .from('manager_departments')
    .delete()
    .eq('manager_id', managerId);

  // Insert new assignments
  if (departmentIds.length > 0) {
    const { error: insertError } = await supabase
      .from('manager_departments')
      .insert(
        departmentIds.map(deptId => ({
          manager_id: managerId,
          department_id: deptId,
        }))
      );

    if (insertError) {
      return { success: false, error: 'ไม่สามารถบันทึกแผนกได้' };
    }
  }

  // Fetch updated departments
  const { data: departments } = await supabase
    .from('manager_departments')
    .select('department:departments(id, name)')
    .eq('manager_id', managerId);

  revalidatePath('/admin/users');
  revalidatePath('/team');

  return {
    success: true,
    data: departments?.map(d => d.department) || [],
  };
}
```

### Multi-Select Pattern
```typescript
// DepartmentMultiSelect.tsx
interface DepartmentMultiSelectProps {
  value: string[];
  onChange: (ids: string[]) => void;
  departments: Department[];
}

function DepartmentMultiSelect({ value, onChange, departments }: DepartmentMultiSelectProps) {
  return (
    <div className="space-y-2">
      <Label>แผนกที่ดูแล</Label>
      <div className="grid grid-cols-2 gap-2">
        {departments.map(dept => (
          <label key={dept.id} className="flex items-center gap-2">
            <Checkbox
              checked={value.includes(dept.id)}
              onCheckedChange={(checked) => {
                if (checked) {
                  onChange([...value, dept.id]);
                } else {
                  onChange(value.filter(id => id !== dept.id));
                }
              }}
            />
            {dept.name}
          </label>
        ))}
      </div>
    </div>
  );
}
```

### Department Chips Pattern
```typescript
// DepartmentChips.tsx
function DepartmentChips({ departments, maxShow = 2 }: { departments: Department[]; maxShow?: number }) {
  const visible = departments.slice(0, maxShow);
  const remaining = departments.length - maxShow;

  return (
    <div className="flex gap-1 flex-wrap">
      {visible.map(dept => (
        <Badge key={dept.id} variant="secondary" className="text-xs">
          {dept.name}
        </Badge>
      ))}
      {remaining > 0 && (
        <Badge variant="outline" className="text-xs">
          +{remaining}
        </Badge>
      )}
    </div>
  );
}
```

### Component Dependencies
- Builds on UserForm from Stories 7.2, 7.3
- Connected to ManagerDeptPrompt from Story 7.5
- Uses Checkbox from shadcn/ui
- Uses Badge from shadcn/ui

### Import Convention
```typescript
import { getManagerDepartments, updateManagerDepartments } from '@/actions/user';
import { DepartmentMultiSelect } from './components/DepartmentMultiSelect';
import { DepartmentChips } from './components/DepartmentChips';
```

### RLS Integration
- Changes to manager_departments take effect immediately
- RLS policy on time_entries checks manager_departments
- No additional cache invalidation needed

### Accessibility
- Checkboxes have proper labels
- Multi-select is keyboard navigable
- Department list is screen reader friendly
- Focus management in dialog

## Definition of Done

- [ ] Department multi-select displays for managers
- [ ] Current assignments are pre-selected
- [ ] Can assign multiple departments
- [ ] Can remove departments
- [ ] Non-managers don't see assignment section
- [ ] Department chips show in user list
- [ ] Changes reflect in /team immediately
- [ ] Empty state shows when no departments
- [ ] No TypeScript errors
- [ ] All imports use @/ aliases
- [ ] Server Actions return ActionResult<T>
