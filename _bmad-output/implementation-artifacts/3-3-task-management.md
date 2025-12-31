# Story 3.3: Task Management

Status: ready-for-dev

## Story

As an **admin**,
I want **to manage tasks (add, edit, deactivate)**,
So that **staff have accurate task options when logging time**.

## Acceptance Criteria

1. **AC1: View All Tasks**
   - Given I am logged in as admin or super_admin
   - When I navigate to /admin/master-data and select the Tasks tab
   - Then I see a list of all tasks (active and inactive)
   - And the list shows task name and status

2. **AC2: Add New Task**
   - Given I am on the master data page, Tasks tab
   - When I click "Add Task" button
   - Then a form/dialog appears for entering task name
   - And I can submit to create the task
   - And the new task appears in the list

3. **AC3: Unique Task Names**
   - Given I am adding or editing a task
   - When I enter a name that already exists
   - Then validation fails with "Task name already exists"
   - And the form is not submitted

4. **AC4: Edit Task Name**
   - Given I am viewing the tasks list
   - When I click edit on a task
   - Then I can modify the task name
   - And save changes successfully
   - And the updated name appears in the list

5. **AC5: Toggle Active Status (Soft Delete)**
   - Given I am viewing the tasks list
   - When I toggle a task's active status
   - Then the task is marked as inactive (or active)
   - And the change persists in the database
   - And a confirmation may be shown for deactivation

6. **AC6: Visual Distinction for Inactive**
   - Given there are inactive tasks
   - When I view the tasks list
   - Then inactive tasks appear grayed out or visually distinct
   - And they are clearly identifiable as inactive

7. **AC7: Inactive Hidden from Time Entry**
   - Given a task is marked as inactive
   - When staff use the time entry form
   - Then the inactive task does NOT appear in the dropdown
   - And only active tasks are selectable

## Tasks / Subtasks

- [ ] **Task 1: Add Task Schema** (AC: 3)
  - [ ] 1.1 Add `taskSchema` to `schemas/master-data.schema.ts`
  - [ ] 1.2 Define name validation (min 1, max 100 characters)
  - [ ] 1.3 Export `TaskInput` type

- [ ] **Task 2: Create Task Server Actions** (AC: 2, 4, 5)
  - [ ] 2.1 Add `createTask` action to `actions/master-data.ts`
  - [ ] 2.2 Add `updateTask` action
  - [ ] 2.3 Add `toggleTaskActive` action
  - [ ] 2.4 Handle unique constraint errors (code 23505)

- [ ] **Task 3: Create Tasks List Component** (AC: 1, 6)
  - [ ] 3.1 Create `app/(app)/admin/master-data/components/TasksList.tsx`
  - [ ] 3.2 Fetch tasks using Server Component
  - [ ] 3.3 Display name and active status
  - [ ] 3.4 Style inactive tasks with opacity or strikethrough

- [ ] **Task 4: Create Task Item Component** (AC: 5, 6)
  - [ ] 4.1 Create `app/(app)/admin/master-data/components/TaskItem.tsx`
  - [ ] 4.2 Add toggle switch for active status
  - [ ] 4.3 Implement optimistic UI update
  - [ ] 4.4 Add edit button

- [ ] **Task 5: Create Add Task Dialog** (AC: 2, 3)
  - [ ] 5.1 Create `components/admin/AddTaskDialog.tsx`
  - [ ] 5.2 Use shadcn Dialog component
  - [ ] 5.3 Add form with React Hook Form + Zod
  - [ ] 5.4 Handle submission and errors

- [ ] **Task 6: Create Edit Task Dialog** (AC: 4, 3)
  - [ ] 6.1 Create `components/admin/EditTaskDialog.tsx`
  - [ ] 6.2 Pre-populate form with existing data
  - [ ] 6.3 Handle update and unique constraint errors

- [ ] **Task 7: Integrate Tasks Tab** (AC: 1)
  - [ ] 7.1 Update master-data page to render TasksList in Tasks tab
  - [ ] 7.2 Remove "Coming soon..." placeholder

- [ ] **Task 8: Verify RLS & Time Entry Filtering** (AC: 7)
  - [ ] 8.1 Confirm RLS policy filters inactive tasks for non-admin
  - [ ] 8.2 Test time entry dropdown only shows active tasks
  - [ ] 8.3 Test admin can still see inactive in admin panel

## Dev Notes

### Task Schema

```typescript
// src/schemas/master-data.schema.ts
import { z } from 'zod';

// Existing service and client schemas...

export const taskSchema = z.object({
  name: z
    .string()
    .min(1, 'Task name is required')
    .max(100, 'Task name must be 100 characters or less')
    .trim(),
});

export type TaskInput = z.infer<typeof taskSchema>;
```

### Server Actions

```typescript
// src/actions/master-data.ts
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import {
  taskSchema,
  type TaskInput
} from '@/schemas/master-data.schema';
import type { Task } from '@/types/domain';

// Existing service and client actions...

export async function createTask(input: TaskInput): Promise<ActionResult<Task>> {
  const supabase = await createClient();

  // Check admin role
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile?.role || !['admin', 'super_admin'].includes(profile.role)) {
    return { success: false, error: 'Not authorized' };
  }

  // Validate input
  const parsed = taskSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  // Insert task
  const { data, error } = await supabase
    .from('tasks')
    .insert({ name: parsed.data.name })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') { // Unique violation
      return { success: false, error: 'Task name already exists' };
    }
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/master-data');
  return { success: true, data };
}

export async function updateTask(
  id: string,
  input: TaskInput
): Promise<ActionResult<Task>> {
  const supabase = await createClient();

  // Auth check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile?.role || !['admin', 'super_admin'].includes(profile.role)) {
    return { success: false, error: 'Not authorized' };
  }

  const parsed = taskSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  const { data, error } = await supabase
    .from('tasks')
    .update({ name: parsed.data.name })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return { success: false, error: 'Task name already exists' };
    }
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/master-data');
  return { success: true, data };
}

export async function toggleTaskActive(
  id: string,
  active: boolean
): Promise<ActionResult<Task>> {
  const supabase = await createClient();

  // Auth check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile?.role || !['admin', 'super_admin'].includes(profile.role)) {
    return { success: false, error: 'Not authorized' };
  }

  const { data, error } = await supabase
    .from('tasks')
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

### Tasks List Component

```typescript
// src/app/(app)/admin/master-data/components/TasksList.tsx
import { createClient } from '@/lib/supabase/server';
import { TaskItem } from './TaskItem';
import { AddTaskDialog } from '@/components/admin/AddTaskDialog';

export async function TasksList() {
  const supabase = await createClient();

  const { data: tasks } = await supabase
    .from('tasks')
    .select('*')
    .order('name');

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Tasks</h2>
        <AddTaskDialog />
      </div>

      <div className="space-y-2">
        {tasks?.map((task) => (
          <TaskItem key={task.id} task={task} />
        ))}
        {(!tasks || tasks.length === 0) && (
          <p className="text-muted-foreground text-center py-8">
            No tasks found. Add your first task.
          </p>
        )}
      </div>
    </div>
  );
}
```

### Task Item Component

```typescript
// src/app/(app)/admin/master-data/components/TaskItem.tsx
'use client';

import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { toggleTaskActive } from '@/actions/master-data';
import { EditTaskDialog } from '@/components/admin/EditTaskDialog';
import type { Task } from '@/types/domain';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Pencil } from 'lucide-react';

interface TaskItemProps {
  task: Task;
}

export function TaskItem({ task }: TaskItemProps) {
  const [isActive, setIsActive] = useState(task.active);
  const [isPending, setIsPending] = useState(false);

  const handleToggle = async () => {
    setIsPending(true);
    setIsActive(!isActive); // Optimistic update

    const result = await toggleTaskActive(task.id, !isActive);

    if (!result.success) {
      setIsActive(isActive); // Revert on error
      toast.error(result.error);
    } else {
      toast.success(isActive ? 'Task deactivated' : 'Task activated');
    }
    setIsPending(false);
  };

  return (
    <div
      className={cn(
        'flex items-center justify-between p-3 border rounded-lg',
        !isActive && 'opacity-50 bg-muted'
      )}
    >
      <span className={cn(!isActive && 'line-through')}>
        {task.name}
      </span>

      <div className="flex items-center gap-2">
        <EditTaskDialog task={task} />
        <Switch
          checked={isActive}
          onCheckedChange={handleToggle}
          disabled={isPending}
          aria-label={`Toggle ${task.name} active status`}
        />
      </div>
    </div>
  );
}
```

### Add Task Dialog

```typescript
// src/components/admin/AddTaskDialog.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createTask } from '@/actions/master-data';
import { taskSchema, type TaskInput } from '@/schemas/master-data.schema';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';

export function AddTaskDialog() {
  const [open, setOpen] = useState(false);

  const form = useForm<TaskInput>({
    resolver: zodResolver(taskSchema),
    defaultValues: { name: '' },
  });

  const onSubmit = async (data: TaskInput) => {
    const result = await createTask(data);

    if (result.success) {
      toast.success('Task created');
      form.reset();
      setOpen(false);
    } else {
      form.setError('name', { message: result.error });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Task Name</Label>
            <Input
              id="name"
              placeholder="Enter task name"
              {...form.register('name')}
            />
            {form.formState.errors.name && (
              <p className="text-destructive text-sm">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Creating...' : 'Create Task'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

### Edit Task Dialog

```typescript
// src/components/admin/EditTaskDialog.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updateTask } from '@/actions/master-data';
import { taskSchema, type TaskInput } from '@/schemas/master-data.schema';
import type { Task } from '@/types/domain';
import { toast } from 'sonner';
import { Pencil } from 'lucide-react';

interface EditTaskDialogProps {
  task: Task;
}

export function EditTaskDialog({ task }: EditTaskDialogProps) {
  const [open, setOpen] = useState(false);

  const form = useForm<TaskInput>({
    resolver: zodResolver(taskSchema),
    defaultValues: { name: task.name },
  });

  const onSubmit = async (data: TaskInput) => {
    const result = await updateTask(task.id, data);

    if (result.success) {
      toast.success('Task updated');
      setOpen(false);
    } else {
      form.setError('name', { message: result.error });
    }
  };

  // Reset form when dialog opens
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      form.reset({ name: task.name });
    }
    setOpen(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Pencil className="h-4 w-4" />
          <span className="sr-only">Edit {task.name}</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Task Name</Label>
            <Input
              id="edit-name"
              placeholder="Enter task name"
              {...form.register('name')}
            />
            {form.formState.errors.name && (
              <p className="text-destructive text-sm">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

### Update Master Data Page

```typescript
// src/app/(app)/admin/master-data/page.tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ServicesList } from './components/ServicesList';
import { ClientsList } from './components/ClientsList';
import { TasksList } from './components/TasksList';

export default function MasterDataPage() {
  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Master Data Management</h1>

      <Tabs defaultValue="services">
        <TabsList>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
        </TabsList>

        <TabsContent value="services">
          <ServicesList />
        </TabsContent>

        <TabsContent value="clients">
          <ClientsList />
        </TabsContent>

        <TabsContent value="tasks">
          <TasksList />
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

### RLS Policy Reminder

From Story 1.4, tasks have this RLS policy:
```sql
-- Staff/Manager see only active tasks
CREATE POLICY "authenticated_read_active_tasks" ON tasks
FOR SELECT TO authenticated
USING (active = true OR public.get_user_role() IN ('admin', 'super_admin'));

-- Admin can insert/update
CREATE POLICY "admin_manage_tasks" ON tasks
FOR ALL TO authenticated
USING (public.get_user_role() IN ('admin', 'super_admin'))
WITH CHECK (public.get_user_role() IN ('admin', 'super_admin'));
```

This ensures:
- Admin/Super Admin see all tasks (active + inactive) for management
- Staff/Manager only see active tasks in time entry dropdowns

### Database Schema

The `tasks` table already has UNIQUE constraint on `name` (from Story 1.2):
```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

This means unique constraint errors (code 23505) will be thrown by the database automatically.

### Project Structure

```
src/
├── app/
│   └── (app)/
│       └── admin/
│           └── master-data/
│               ├── page.tsx              # Main page with tabs (updated)
│               └── components/
│                   ├── ServicesList.tsx  # From Story 3.1
│                   ├── ServiceItem.tsx   # From Story 3.1
│                   ├── ClientsList.tsx   # From Story 3.2
│                   ├── ClientItem.tsx    # From Story 3.2
│                   ├── TasksList.tsx     # NEW
│                   └── TaskItem.tsx      # NEW
├── components/
│   └── admin/
│       ├── AddServiceDialog.tsx          # From Story 3.1
│       ├── EditServiceDialog.tsx         # From Story 3.1
│       ├── AddClientDialog.tsx           # From Story 3.2
│       ├── EditClientDialog.tsx          # From Story 3.2
│       ├── AddTaskDialog.tsx             # NEW
│       └── EditTaskDialog.tsx            # NEW
├── actions/
│   └── master-data.ts                    # Extended with task actions
└── schemas/
    └── master-data.schema.ts             # Extended with taskSchema
```

### Existing Tasks (from Seed Data)

Per Story 1.5, these tasks exist:
1. Translation
2. Review
3. Editing
4. Recording
5. Mixing
6. Quality Check
7. Delivery
8. Script Prep
9. Spotting
10. Lip Sync

### Optional: Task vs Service Clarification

Note: Tasks and Services are both standalone lookup tables. The key difference:
- **Services**: What type of work (Dubbing, Subtitling, QC, etc.)
- **Tasks**: What phase/activity within the work (Translation, Review, Editing, etc.)

In time entries:
- `service_id` is REQUIRED
- `task_id` is OPTIONAL (nullable)

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#Master Data RLS]
- [Source: _bmad-output/planning-artifacts/epics.md#Story 3.3]
- [Source: _bmad-output/project-context.md#Server Actions Pattern]
- [Source: _bmad-output/implementation-artifacts/3-1-service-type-management.md]
- [Source: _bmad-output/implementation-artifacts/3-2-client-management.md]
- [Source: _bmad-output/implementation-artifacts/1-4-rls-policies-for-all-roles.md]

## Definition of Done

- [ ] Admin can view all tasks (active and inactive)
- [ ] Admin can add new tasks with unique names
- [ ] Admin can edit existing task names
- [ ] Admin can toggle active/inactive status
- [ ] Inactive tasks appear visually distinct
- [ ] Unique name validation works (client and server)
- [ ] Time entry dropdown only shows active tasks
- [ ] All actions use ActionResult<T> pattern
- [ ] Toast notifications for success/error
- [ ] Components follow same patterns as Story 3.1 and 3.2

## Dev Agent Record

### Agent Model Used

_To be filled by dev agent_

### Completion Notes List

_To be filled during implementation_

### File List

_To be filled with all created/modified files_
