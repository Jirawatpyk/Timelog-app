# Story 3.4: Soft Delete Protection

Status: complete

## Story

As an **admin**,
I want **the system to prevent hard deletion of master data that is referenced by time entries**,
So that **historical data integrity is preserved**.

## Acceptance Criteria

1. **AC1: Soft Delete via Active Flag**
   - Given a service/client/task has been used in time_entries
   - When I deactivate it (set active = false)
   - Then the operation succeeds
   - And the item is marked as inactive in the database

2. **AC2: Inactive Items Hidden from Dropdowns**
   - Given a service/client/task is inactive
   - When staff view the time entry form
   - Then the inactive item does NOT appear in the dropdown
   - And only items with active = true are shown

3. **AC3: Historical Entries Preserved**
   - Given a time entry references an inactive service/client/task
   - When I view the time entry details
   - Then the correct name is still displayed
   - And the historical data remains intact

4. **AC4: Items Can Be Reactivated**
   - Given a service/client/task was deactivated
   - When I toggle it back to active
   - Then the item appears in dropdowns again
   - And new entries can use this item

5. **AC5: Foreign Key Constraints**
   - Given the database schema has proper constraints
   - When I try to hard delete a service/task used in time_entries
   - Then the database prevents the deletion (FK RESTRICT)
   - And an error is returned

6. **AC6: Cascade Behavior for Client Hierarchy**
   - Given a client has projects and jobs
   - When the client is deactivated
   - Then the client's projects and jobs are still accessible for historical entries
   - But the entire hierarchy is hidden from new entry dropdowns

## Tasks / Subtasks

- [x] **Task 1: Verify RLS Policies Filter Inactive Items** (AC: 2)
  - [x] 1.1 Test services dropdown excludes inactive services for staff
  - [x] 1.2 Test clients dropdown excludes inactive clients for staff
  - [x] 1.3 Test tasks dropdown excludes inactive tasks for staff
  - [x] 1.4 Verify admin can still see inactive items in admin panel

- [x] **Task 2: Create Data Fetching Helpers** (AC: 2, 4)
  - [x] 2.1 Create `lib/queries/master-data.ts` with query functions
  - [x] 2.2 Implement `getActiveServices()` for time entry form
  - [x] 2.3 Implement `getActiveClients()` for time entry form
  - [x] 2.4 Implement `getActiveTasks()` for time entry form
  - [x] 2.5 Implement `getAllServices()` for admin panel (includes inactive)

- [x] **Task 3: Verify Foreign Key Constraints** (AC: 5)
  - [x] 3.1 Test FK RESTRICT on services (via time_entries.service_id)
  - [x] 3.2 Test FK RESTRICT on jobs (via time_entries.job_id)
  - [x] 3.3 Test FK SET NULL on tasks (via time_entries.task_id)
  - [x] 3.4 Document expected error handling

- [x] **Task 4: Implement Cascade Behavior for Clients** (AC: 6)
  - [x] 4.1 When fetching clients for dropdown, filter by active = true
  - [x] 4.2 When fetching projects, filter by parent client active AND project active
  - [x] 4.3 When fetching jobs, filter by parent project active AND job active
  - [x] 4.4 Verify cascading selector respects all active flags

- [x] **Task 5: Historical Entry Display** (AC: 3)
  - [x] 5.1 Ensure time entry queries JOIN to get names (not just IDs)
  - [x] 5.2 Create type for TimeEntryWithDetails including related names
  - [x] 5.3 Verify historical entries display correctly even with inactive references

- [x] **Task 6: Add Deactivation Confirmation** (AC: 1)
  - [x] 6.1 Add confirmation dialog before deactivating items with usage
  - [x] 6.2 Check if item is used in time_entries before deactivation
  - [x] 6.3 Show warning: "This item is used in X time entries. It will be hidden from new entries but historical data will be preserved."

- [x] **Task 7: Write E2E Tests** (AC: all)
  - [x] 7.1 Test deactivating unused item
  - [x] 7.2 Test deactivating item with time entries
  - [x] 7.3 Test reactivating an item
  - [x] 7.4 Test dropdown filtering for inactive items
  - [x] 7.5 Test historical entry display with inactive references

## Dev Notes

### Master Data Query Functions

```typescript
// src/lib/queries/master-data.ts
import { createClient } from '@/lib/supabase/server';
import type { Service, Client, Task, Project, Job } from '@/types/domain';

/**
 * Get active services for time entry form
 * RLS already filters for non-admin users, but we explicitly filter here for clarity
 */
export async function getActiveServices(): Promise<Service[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('active', true)
    .order('name');

  if (error) throw error;
  return data ?? [];
}

/**
 * Get all services for admin panel (includes inactive)
 */
export async function getAllServices(): Promise<Service[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('services')
    .select('*')
    .order('name');

  if (error) throw error;
  return data ?? [];
}

/**
 * Get active clients for time entry form
 */
export async function getActiveClients(): Promise<Client[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('active', true)
    .order('name');

  if (error) throw error;
  return data ?? [];
}

/**
 * Get active projects for a specific client
 */
export async function getActiveProjectsByClient(clientId: string): Promise<Project[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('client_id', clientId)
    .eq('active', true)
    .order('name');

  if (error) throw error;
  return data ?? [];
}

/**
 * Get active jobs for a specific project
 */
export async function getActiveJobsByProject(projectId: string): Promise<Job[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('project_id', projectId)
    .eq('active', true)
    .order('job_no', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

/**
 * Get active tasks for time entry form
 */
export async function getActiveTasks(): Promise<Task[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('active', true)
    .order('name');

  if (error) throw error;
  return data ?? [];
}
```

### Time Entry with Details Type

```typescript
// src/types/domain.ts

// Extended time entry type with joined data for display
export interface TimeEntryWithDetails {
  id: string;
  user_id: string;
  job_id: string;
  service_id: string;
  task_id: string | null;
  duration_minutes: number;
  entry_date: string;
  notes: string | null;
  department_id: string;
  created_at: string;
  updated_at: string;
  // Joined data
  job: {
    id: string;
    name: string;
    job_no: string | null;
    project: {
      id: string;
      name: string;
      client: {
        id: string;
        name: string;
      };
    };
  };
  service: {
    id: string;
    name: string;
  };
  task: {
    id: string;
    name: string;
  } | null;
}
```

### Query for Time Entry with Details

```typescript
// src/lib/queries/time-entries.ts
import { createClient } from '@/lib/supabase/server';
import type { TimeEntryWithDetails } from '@/types/domain';

export async function getTimeEntryWithDetails(id: string): Promise<TimeEntryWithDetails | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('time_entries')
    .select(`
      *,
      job:jobs!inner(
        id,
        name,
        job_no,
        project:projects!inner(
          id,
          name,
          client:clients!inner(
            id,
            name
          )
        )
      ),
      service:services!inner(
        id,
        name
      ),
      task:tasks(
        id,
        name
      )
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as TimeEntryWithDetails;
}

export async function getUserTimeEntries(
  userId: string,
  startDate: string,
  endDate: string
): Promise<TimeEntryWithDetails[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('time_entries')
    .select(`
      *,
      job:jobs!inner(
        id,
        name,
        job_no,
        project:projects!inner(
          id,
          name,
          client:clients!inner(
            id,
            name
          )
        )
      ),
      service:services!inner(
        id,
        name
      ),
      task:tasks(
        id,
        name
      )
    `)
    .eq('user_id', userId)
    .gte('entry_date', startDate)
    .lte('entry_date', endDate)
    .order('entry_date', { ascending: false });

  if (error) throw error;
  return (data ?? []) as TimeEntryWithDetails[];
}
```

### Deactivation Check Before Toggle

```typescript
// src/actions/master-data.ts

export async function checkItemUsage(
  tableName: 'services' | 'tasks',
  itemId: string
): Promise<{ used: boolean; count: number }> {
  const supabase = await createClient();

  const column = tableName === 'services' ? 'service_id' : 'task_id';

  const { count, error } = await supabase
    .from('time_entries')
    .select('*', { count: 'exact', head: true })
    .eq(column, itemId);

  if (error) {
    return { used: false, count: 0 };
  }

  return { used: (count ?? 0) > 0, count: count ?? 0 };
}

// Enhanced toggle with usage check
export async function toggleServiceActiveWithCheck(
  id: string,
  active: boolean
): Promise<ActionResult<{ service: Service; usageCount: number }>> {
  const supabase = await createClient();

  // Auth check...

  // Check usage if deactivating
  let usageCount = 0;
  if (!active) {
    const usage = await checkItemUsage('services', id);
    usageCount = usage.count;
  }

  const { data, error } = await supabase
    .from('services')
    .update({ active })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/master-data');
  return { success: true, data: { service: data, usageCount } };
}
```

### Confirmation Dialog Component

```typescript
// src/components/admin/DeactivateConfirmDialog.tsx
'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface DeactivateConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemName: string;
  usageCount: number;
  onConfirm: () => void;
  isPending: boolean;
}

export function DeactivateConfirmDialog({
  open,
  onOpenChange,
  itemName,
  usageCount,
  onConfirm,
  isPending,
}: DeactivateConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Deactivate {itemName}?</AlertDialogTitle>
          <AlertDialogDescription>
            {usageCount > 0 ? (
              <>
                This item is used in <strong>{usageCount}</strong> time{' '}
                {usageCount === 1 ? 'entry' : 'entries'}. It will be hidden from
                new entries but historical data will be preserved.
              </>
            ) : (
              <>
                This item is not currently used in any time entries. It can be
                reactivated later if needed.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending ? 'Deactivating...' : 'Deactivate'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

### Database Constraint Summary

From Story 1.2 and 1.3, these constraints exist:

| Table | Column | Constraint | Behavior |
|-------|--------|------------|----------|
| time_entries | service_id | FK RESTRICT | Cannot delete service if used |
| time_entries | job_id | FK RESTRICT | Cannot delete job if used |
| time_entries | task_id | FK SET NULL | Can delete task, entry keeps null |
| projects | client_id | FK CASCADE | Delete client → delete projects |
| jobs | project_id | FK CASCADE | Delete project → delete jobs |

**Important:** The CASCADE on client→project→job means:
- If you delete a client, ALL its projects and jobs are deleted
- This is why soft delete (active flag) is preferred over hard delete

### RLS Policy Review

From Story 1.4, master data tables have policies like:

```sql
-- Services: Staff see only active, admin sees all
CREATE POLICY "authenticated_read_services" ON services
FOR SELECT TO authenticated
USING (
  active = true
  OR public.get_user_role() IN ('admin', 'super_admin')
);
```

This means:
- RLS automatically filters inactive items for non-admin users
- Admin users see all items including inactive ones
- The explicit `active = true` filter in queries is for clarity and API consistency

### E2E Test Examples

```typescript
// test/e2e/admin/soft-delete.test.ts
import { test, expect } from '@playwright/test';

test.describe('Soft Delete Protection', () => {
  test('deactivating service hides it from time entry form', async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    await page.fill('[name="email"]', 'admin@company.com');
    await page.fill('[name="password"]', 'password');
    await page.click('button[type="submit"]');

    // Deactivate a service
    await page.goto('/admin/master-data');
    await page.click('[data-testid="services-tab"]');
    const serviceRow = page.locator('[data-testid="service-item"]').first();
    const serviceName = await serviceRow.locator('[data-testid="service-name"]').textContent();
    await serviceRow.locator('[data-testid="toggle-active"]').click();

    // Verify it's hidden in time entry form
    await page.goto('/entry');
    const serviceDropdown = page.locator('[data-testid="service-select"]');
    await serviceDropdown.click();
    await expect(page.getByText(serviceName!)).not.toBeVisible();
  });

  test('historical entries still show inactive item names', async ({ page }) => {
    // Create entry with service, then deactivate service
    // Verify entry still displays service name
  });

  test('can reactivate item and it appears in dropdowns', async ({ page }) => {
    // Deactivate then reactivate
    // Verify it appears in dropdown again
  });
});
```

### Project Structure

```
src/
├── lib/
│   └── queries/
│       ├── master-data.ts          # NEW - getActive* functions
│       └── time-entries.ts         # NEW - queries with joins
├── components/
│   └── admin/
│       └── DeactivateConfirmDialog.tsx  # NEW
├── actions/
│   └── master-data.ts              # Extended with checkItemUsage
└── types/
    └── domain.ts                   # Extended with TimeEntryWithDetails
```

### Note on Client/Project/Job Hierarchy

The Client → Project → Job hierarchy uses CASCADE delete:
- This is intentional for data consistency
- If client is deleted, all related projects and jobs are deleted
- **Recommendation:** Never hard delete clients in production
- Use soft delete (active flag) exclusively for master data

For cascading dropdown filtering:
1. Show only active clients
2. When client selected, show only active projects for that client
3. When project selected, show only active jobs for that project

This is implemented in Story 4.2 (Time Entry Form - Cascading Selectors).

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#Master Data RLS]
- [Source: _bmad-output/planning-artifacts/epics.md#Story 3.4]
- [Source: _bmad-output/implementation-artifacts/1-2-database-schema-core-tables.md]
- [Source: _bmad-output/implementation-artifacts/1-3-database-schema-time-entry-supporting-tables.md]
- [Source: _bmad-output/implementation-artifacts/1-4-rls-policies-for-all-roles.md]

## Definition of Done

- [x] Deactivating items with time entries works (soft delete)
- [x] Inactive items hidden from time entry dropdowns
- [x] Historical entries display correct names for inactive items
- [x] Items can be reactivated and appear in dropdowns again
- [x] FK RESTRICT prevents hard delete of used services/jobs
- [x] Client hierarchy properly filtered by active status
- [x] Confirmation dialog shows usage count before deactivation
- [x] Query helper functions created for active items
- [x] TimeEntryWithDetails type created for joined queries
- [x] E2E tests verify soft delete behavior

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Completion Notes List

1. **RLS Policies Verified**: Existing RLS policies correctly filter inactive items for staff while allowing admin/super_admin to see all items.

2. **Data Fetching Helpers Created**: `src/lib/queries/master-data.ts` implements:
   - `getActiveServices()`, `getAllServices()` for services
   - `getActiveClients()`, `getAllClients()` for clients
   - `getActiveTasks()`, `getAllTasks()` for tasks
   - `getActiveProjectsWithCascade()` - filters by parent client active status
   - `getActiveJobsWithCascade()` - filters by full hierarchy active status

3. **FK Constraints Verified**:
   - Services/Jobs: FK RESTRICT prevents deletion when used in time_entries
   - Tasks: FK SET NULL allows deletion, sets time_entry.task_id to null
   - Tests confirm proper constraint behavior

4. **Cascade Behavior**: RLS does NOT cascade (intentional for historical access). Application-level cascade filtering implemented in query functions.

5. **Historical Entry Display**: `TimeEntryWithDetails` type and query functions created in `src/lib/queries/time-entries.ts` to support JOINed queries that preserve names.

6. **Deactivation Confirmation**:
   - Added `checkServiceUsage`, `checkTaskUsage`, `checkClientUsage` functions
   - Created `DeactivateConfirmDialog` component
   - Integrated into ServiceItem, ClientItem, TaskItem components

7. **E2E Tests**: 33 tests covering all ACs:
   - `soft-delete.test.ts` - 9 tests (RLS filtering)
   - `fk-constraints.test.ts` - 7 tests (FK behavior)
   - `cascade-filtering.test.ts` - 11 tests (cascade behavior)
   - `historical-entries.test.ts` - 6 tests (historical access)

### File List

**Created Files:**
- `src/lib/queries/master-data.ts` - Query helper functions for master data
- `src/lib/queries/master-data.test.ts` - Unit tests for query functions
- `src/lib/queries/time-entries.ts` - Query functions with JOINs for time entries
- `src/lib/queries/time-entries.test.ts` - Unit tests for time entry queries
- `src/components/admin/DeactivateConfirmDialog.tsx` - Confirmation dialog component
- `src/components/ui/alert-dialog.tsx` - shadcn AlertDialog component (via npx shadcn)
- `src/app/(app)/admin/master-data/components/TaskItem.test.tsx` - Tests for TaskItem with confirmation dialog
- `test/e2e/rls/soft-delete.test.ts` - E2E tests for soft delete RLS behavior
- `test/e2e/rls/fk-constraints.test.ts` - E2E tests for FK constraints
- `test/e2e/rls/cascade-filtering.test.ts` - E2E tests for cascade filtering
- `test/e2e/rls/historical-entries.test.ts` - E2E tests for historical entry display

**Modified Files:**
- `src/types/domain.ts` - Added `TimeEntryWithDetails` interface
- `src/actions/master-data.ts` - Added `checkServiceUsage`, `checkTaskUsage`, `checkClientUsage` actions
- `src/actions/master-data.test.ts` - Added tests for usage check actions
- `src/app/(app)/admin/master-data/components/ServiceItem.tsx` - Integrated confirmation dialog
- `src/app/(app)/admin/master-data/components/ServiceItem.test.tsx` - Updated tests for new behavior
- `src/app/(app)/admin/master-data/components/ClientItem.tsx` - Integrated confirmation dialog
- `src/app/(app)/admin/master-data/components/ClientItem.test.tsx` - Updated tests for new behavior
- `src/app/(app)/admin/master-data/components/TaskItem.tsx` - Integrated confirmation dialog
- `package.json` - Added @radix-ui/react-alert-dialog dependency
- `package-lock.json` - Updated lockfile
