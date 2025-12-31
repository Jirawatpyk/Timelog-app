# Story 4.5: Edit Own Time Entry

Status: ready-for-dev

## Story

As a **staff member**,
I want **to edit my own time entries**,
So that **I can correct mistakes or update information**.

## Acceptance Criteria

1. **AC1: Entry Details View**
   - Given I am viewing my entries on the dashboard
   - When I tap on an entry row
   - Then a bottom sheet slides up with entry details
   - And I see "แก้ไข" (Edit) and "ลบ" (Delete) buttons

2. **AC2: Edit Form Pre-Population**
   - Given I tap "แก้ไข"
   - When the edit form opens
   - Then all fields are pre-populated with current values
   - And cascading selectors maintain their hierarchy (Client → Project → Job)

3. **AC3: Edit Form Submission**
   - Given I modify any field and tap "บันทึก"
   - When the update succeeds
   - Then I see success toast: "อัพเดทเรียบร้อย"
   - And the entry list refreshes with updated data
   - And the bottom sheet closes

4. **AC4: Edit Restrictions (7-Day Limit)**
   - Given I try to edit an entry from more than 7 days ago
   - When the edit attempt is made
   - Then I see error: "ไม่สามารถแก้ไข entry เก่ากว่า 7 วัน"
   - And the edit button is disabled for old entries

5. **AC5: Audit Log**
   - Given I successfully update an entry
   - When the update is saved
   - Then audit_log records the change with old_data and new_data

6. **AC6: Optimistic Update**
   - Given I submit the edit form
   - When the request is in progress
   - Then the UI updates immediately (optimistic)
   - And reverts if the request fails

7. **AC7: Draft Preservation**
   - Given I am editing and navigate away accidentally
   - When I return to the edit form
   - Then my draft changes are preserved
   - And I can continue editing

## Tasks / Subtasks

- [ ] **Task 1: Create Entry Details Bottom Sheet** (AC: 1)
  - [ ] 1.1 Create `components/entry/EntryDetailsSheet.tsx`
  - [ ] 1.2 Use shadcn/ui Sheet component
  - [ ] 1.3 Display full entry details
  - [ ] 1.4 Add Edit and Delete buttons

- [ ] **Task 2: Create Edit Entry Form** (AC: 2)
  - [ ] 2.1 Create `components/entry/EditEntryForm.tsx`
  - [ ] 2.2 Pre-populate all fields from entry data
  - [ ] 2.3 Initialize cascading selectors correctly
  - [ ] 2.4 Use same components as create form

- [ ] **Task 3: Implement 7-Day Edit Restriction** (AC: 4)
  - [ ] 3.1 Create `canEditEntry(entryDate)` utility
  - [ ] 3.2 Disable edit button for old entries
  - [ ] 3.3 Show restriction message
  - [ ] 3.4 Enforce on server side too

- [ ] **Task 4: Create Update Entry Server Action** (AC: 3, 5)
  - [ ] 4.1 Create `updateTimeEntry` Server Action
  - [ ] 4.2 Validate ownership (RLS handles this)
  - [ ] 4.3 Validate 7-day restriction
  - [ ] 4.4 Return ActionResult<TimeEntry>

- [ ] **Task 5: Implement Optimistic Updates** (AC: 6)
  - [ ] 5.1 Use TanStack Query mutation
  - [ ] 5.2 Update cache optimistically
  - [ ] 5.3 Rollback on error

- [ ] **Task 6: Add Edit Draft Persistence** (AC: 7)
  - [ ] 6.1 Save edit draft to sessionStorage
  - [ ] 6.2 Key: `draft-entry-{id}`
  - [ ] 6.3 Restore on form mount
  - [ ] 6.4 Clear on success

- [ ] **Task 7: Integrate with Dashboard** (AC: 1)
  - [ ] 7.1 Add tap handler to entry rows
  - [ ] 7.2 Open bottom sheet with entry data
  - [ ] 7.3 Handle sheet close and refresh

## Dev Notes

### Entry Details Sheet Component

```typescript
// src/components/entry/EntryDetailsSheet.tsx
'use client';

import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import { formatThaiDate } from '@/lib/thai-date';
import { formatDuration } from '@/lib/duration';
import { canEditEntry } from '@/lib/entry-rules';
import type { TimeEntryWithDetails } from '@/types/domain';

interface EntryDetailsSheetProps {
  entry: TimeEntryWithDetails | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (entry: TimeEntryWithDetails) => void;
  onDelete: (entry: TimeEntryWithDetails) => void;
}

export function EntryDetailsSheet({
  entry,
  open,
  onOpenChange,
  onEdit,
  onDelete,
}: EntryDetailsSheetProps) {
  if (!entry) return null;

  const isEditable = canEditEntry(entry.entryDate);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-auto max-h-[80vh]">
        <SheetHeader>
          <SheetTitle>รายละเอียด Entry</SheetTitle>
        </SheetHeader>

        <div className="mt-4 space-y-4">
          {/* Entry details */}
          <div className="space-y-3">
            <DetailRow label="วันที่" value={formatThaiDate(entry.entryDate)} />
            <DetailRow
              label="Client"
              value={entry.job.project.client.name}
            />
            <DetailRow
              label="Project"
              value={entry.job.project.name}
            />
            <DetailRow
              label="Job"
              value={`${entry.job.jobNo ? `${entry.job.jobNo} - ` : ''}${entry.job.name}`}
            />
            <DetailRow label="Service" value={entry.service.name} />
            {entry.task && (
              <DetailRow label="Task" value={entry.task.name} />
            )}
            <DetailRow
              label="ระยะเวลา"
              value={formatDuration(entry.durationMinutes, 'long')}
            />
            {entry.notes && (
              <DetailRow label="หมายเหตุ" value={entry.notes} />
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              variant="outline"
              className="flex-1 min-h-[48px]"
              onClick={() => onEdit(entry)}
              disabled={!isEditable}
            >
              <Pencil className="mr-2 h-4 w-4" />
              แก้ไข
            </Button>
            <Button
              variant="destructive"
              className="flex-1 min-h-[48px]"
              onClick={() => onDelete(entry)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              ลบ
            </Button>
          </div>

          {/* Edit restriction message */}
          {!isEditable && (
            <p className="text-sm text-muted-foreground text-center">
              ไม่สามารถแก้ไข entry เก่ากว่า 7 วัน
            </p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  );
}
```

### Entry Rules Utility

```typescript
// src/lib/entry-rules.ts

const EDIT_WINDOW_DAYS = 7;

/**
 * Check if an entry can be edited (within 7-day window)
 * @param entryDate - ISO date string (YYYY-MM-DD)
 * @returns true if entry is within edit window
 */
export function canEditEntry(entryDate: string): boolean {
  const entry = new Date(entryDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const cutoffDate = new Date(today);
  cutoffDate.setDate(cutoffDate.getDate() - EDIT_WINDOW_DAYS);

  return entry >= cutoffDate;
}

/**
 * Get days remaining until entry becomes non-editable
 */
export function getDaysUntilLocked(entryDate: string): number {
  const entry = new Date(entryDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffTime = entry.getTime() - today.getTime() + (EDIT_WINDOW_DAYS * 24 * 60 * 60 * 1000);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return Math.max(0, diffDays);
}
```

### Edit Entry Form Component

```typescript
// src/components/entry/EditEntryForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { ClientSelector } from '@/components/entry/ClientSelector';
import { ProjectSelector } from '@/components/entry/ProjectSelector';
import { JobSelector } from '@/components/entry/JobSelector';
import { ServiceSelector } from '@/components/entry/ServiceSelector';
import { TaskSelector } from '@/components/entry/TaskSelector';
import { DurationInput } from '@/components/entry/DurationInput';
import { DatePicker } from '@/components/entry/DatePicker';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

import { timeEntrySchema, type TimeEntryInput } from '@/schemas/time-entry.schema';
import { updateTimeEntry } from '@/actions/entry';
import { minutesToHours } from '@/lib/duration';
import { DRAFT_KEYS } from '@/constants/storage';
import type { TimeEntryWithDetails } from '@/types/domain';

interface EditEntryFormProps {
  entry: TimeEntryWithDetails;
  onSuccess: () => void;
  onCancel: () => void;
}

export function EditEntryForm({ entry, onSuccess, onCancel }: EditEntryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize cascading state from entry data
  const [clientId, setClientId] = useState<string>(entry.job.project.client.id);
  const [projectId, setProjectId] = useState<string>(entry.job.project.id);

  const form = useForm<TimeEntryInput>({
    resolver: zodResolver(timeEntrySchema),
    defaultValues: {
      clientId: entry.job.project.client.id,
      projectId: entry.job.project.id,
      jobId: entry.job.id,
      serviceId: entry.service.id,
      taskId: entry.task?.id ?? null,
      durationHours: minutesToHours(entry.durationMinutes),
      entryDate: entry.entryDate,
      notes: entry.notes ?? '',
    },
  });

  // Draft persistence for edit form
  const draftKey = DRAFT_KEYS.editEntry(entry.id);

  useEffect(() => {
    // Restore draft on mount
    const savedDraft = sessionStorage.getItem(draftKey);
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        form.reset(parsed.data);
        setClientId(parsed.data.clientId);
        setProjectId(parsed.data.projectId);
        toast.info('พบแบบร่างที่แก้ไขค้างไว้');
      } catch {
        sessionStorage.removeItem(draftKey);
      }
    }
  }, [draftKey, form]);

  useEffect(() => {
    // Save draft on form changes
    const subscription = form.watch((data) => {
      sessionStorage.setItem(draftKey, JSON.stringify({ data }));
    });
    return () => subscription.unsubscribe();
  }, [form, draftKey]);

  // Cascading handlers
  const handleClientChange = (id: string) => {
    setClientId(id);
    setProjectId('');
    form.setValue('clientId', id);
    form.setValue('projectId', '');
    form.setValue('jobId', '');
  };

  const handleProjectChange = (id: string) => {
    setProjectId(id);
    form.setValue('projectId', id);
    form.setValue('jobId', '');
  };

  const handleJobChange = (id: string) => {
    form.setValue('jobId', id);
  };

  const onSubmit = async (data: TimeEntryInput) => {
    setIsSubmitting(true);

    try {
      const result = await updateTimeEntry(entry.id, {
        jobId: data.jobId,
        serviceId: data.serviceId,
        taskId: data.taskId ?? null,
        durationHours: data.durationHours,
        entryDate: data.entryDate,
        notes: data.notes,
      });

      if (!result.success) {
        toast.error(result.error);
        setIsSubmitting(false);
        return;
      }

      // Clear draft
      sessionStorage.removeItem(draftKey);

      toast.success('อัพเดทเรียบร้อย');
      onSuccess();
    } catch (error) {
      toast.error('ไม่สามารถอัพเดทได้ กรุณาลองอีกครั้ง');
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Cascading Selectors */}
      <fieldset disabled={isSubmitting} className="space-y-4">
        <ClientSelector
          value={form.watch('clientId')}
          onChange={handleClientChange}
          error={form.formState.errors.clientId?.message}
        />

        <ProjectSelector
          clientId={clientId}
          value={form.watch('projectId')}
          onChange={handleProjectChange}
          disabled={!clientId}
          error={form.formState.errors.projectId?.message}
        />

        <JobSelector
          projectId={projectId}
          value={form.watch('jobId')}
          onChange={handleJobChange}
          disabled={!projectId}
          error={form.formState.errors.jobId?.message}
        />
      </fieldset>

      <div className="border-t" />

      {/* Service & Task */}
      <fieldset disabled={isSubmitting} className="space-y-4">
        <ServiceSelector
          value={form.watch('serviceId')}
          onChange={(val) => form.setValue('serviceId', val)}
          error={form.formState.errors.serviceId?.message}
        />

        <TaskSelector
          value={form.watch('taskId') ?? null}
          onChange={(val) => form.setValue('taskId', val)}
          error={form.formState.errors.taskId?.message}
        />
      </fieldset>

      <div className="border-t" />

      {/* Duration & Date */}
      <fieldset disabled={isSubmitting} className="space-y-4">
        <DurationInput
          value={form.watch('durationHours')}
          onChange={(val) => form.setValue('durationHours', val)}
          error={form.formState.errors.durationHours?.message}
        />

        <DatePicker
          value={form.watch('entryDate')}
          onChange={(val) => form.setValue('entryDate', val)}
          error={form.formState.errors.entryDate?.message}
        />
      </fieldset>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          className="flex-1 min-h-[48px]"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          ยกเลิก
        </Button>
        <Button
          type="submit"
          className="flex-1 min-h-[48px]"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              กำลังบันทึก...
            </>
          ) : (
            'บันทึก'
          )}
        </Button>
      </div>
    </form>
  );
}
```

### Update Entry Server Action

```typescript
// src/actions/entry.ts (additions)

interface UpdateTimeEntryInput {
  jobId: string;
  serviceId: string;
  taskId: string | null;
  durationHours: number;
  entryDate: string;
  notes?: string;
}

export async function updateTimeEntry(
  entryId: string,
  input: UpdateTimeEntryInput
): Promise<ActionResult<TimeEntry>> {
  const supabase = await createClient();

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'ไม่ได้เข้าสู่ระบบ' };
  }

  // Get existing entry (RLS will ensure ownership)
  const { data: existingEntry, error: fetchError } = await supabase
    .from('time_entries')
    .select('*')
    .eq('id', entryId)
    .single();

  if (fetchError || !existingEntry) {
    return { success: false, error: 'ไม่พบ entry นี้' };
  }

  // Check 7-day edit restriction
  const entryDate = new Date(existingEntry.entry_date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const cutoffDate = new Date(today);
  cutoffDate.setDate(cutoffDate.getDate() - 7);

  if (entryDate < cutoffDate) {
    return { success: false, error: 'ไม่สามารถแก้ไข entry เก่ากว่า 7 วัน' };
  }

  // Convert hours to minutes
  const durationMinutes = hoursToMinutes(input.durationHours);

  // Update entry
  const { data: updatedEntry, error: updateError } = await supabase
    .from('time_entries')
    .update({
      job_id: input.jobId,
      service_id: input.serviceId,
      task_id: input.taskId,
      duration_minutes: durationMinutes,
      entry_date: input.entryDate,
      notes: input.notes ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', entryId)
    .select()
    .single();

  if (updateError) {
    console.error('Failed to update time entry:', updateError);
    return { success: false, error: 'ไม่สามารถอัพเดทได้ กรุณาลองอีกครั้ง' };
  }

  // Note: audit_log is handled by database trigger (Story 8.6)

  revalidatePath('/dashboard');
  revalidatePath('/entry');

  return { success: true, data: updatedEntry };
}
```

### Edit Entry Sheet (Full Screen Mode)

```typescript
// src/components/entry/EditEntrySheet.tsx
'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { EditEntryForm } from '@/components/entry/EditEntryForm';
import type { TimeEntryWithDetails } from '@/types/domain';

interface EditEntrySheetProps {
  entry: TimeEntryWithDetails | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function EditEntrySheet({
  entry,
  open,
  onOpenChange,
  onSuccess,
}: EditEntrySheetProps) {
  if (!entry) return null;

  const handleSuccess = () => {
    onOpenChange(false);
    onSuccess();
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>แก้ไข Entry</SheetTitle>
        </SheetHeader>

        <div className="mt-4">
          <EditEntryForm
            entry={entry}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
```

### TimeEntryWithDetails Type

```typescript
// src/types/domain.ts (additions or confirmation from Story 3.4)

export interface TimeEntryWithDetails {
  id: string;
  userId: string;
  durationMinutes: number;
  entryDate: string;
  notes: string | null;
  departmentId: string;
  createdAt: string;
  updatedAt: string;
  job: {
    id: string;
    name: string;
    jobNo: string | null;
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

### Fetch Entry with Details Query

```typescript
// src/hooks/use-entry-data.ts (additions)

export function useEntryDetails(entryId: string | null) {
  return useQuery({
    queryKey: ['entry', entryId],
    queryFn: async () => {
      if (!entryId) return null;
      const result = await getEntryWithDetails(entryId);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    enabled: !!entryId,
  });
}
```

### Server Action for Entry Details

```typescript
// src/actions/entry.ts (additions)

export async function getEntryWithDetails(
  entryId: string
): Promise<ActionResult<TimeEntryWithDetails>> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  const { data, error } = await supabase
    .from('time_entries')
    .select(`
      *,
      job:jobs (
        id,
        name,
        job_no,
        project:projects (
          id,
          name,
          client:clients (
            id,
            name
          )
        )
      ),
      service:services (
        id,
        name
      ),
      task:tasks (
        id,
        name
      )
    `)
    .eq('id', entryId)
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  // Transform snake_case to camelCase
  const transformed: TimeEntryWithDetails = {
    id: data.id,
    userId: data.user_id,
    durationMinutes: data.duration_minutes,
    entryDate: data.entry_date,
    notes: data.notes,
    departmentId: data.department_id,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    job: {
      id: data.job.id,
      name: data.job.name,
      jobNo: data.job.job_no,
      project: {
        id: data.job.project.id,
        name: data.job.project.name,
        client: {
          id: data.job.project.client.id,
          name: data.job.project.client.name,
        },
      },
    },
    service: {
      id: data.service.id,
      name: data.service.name,
    },
    task: data.task ? {
      id: data.task.id,
      name: data.task.name,
    } : null,
  };

  return { success: true, data: transformed };
}
```

### Project Structure

```
src/
├── components/
│   └── entry/
│       ├── EntryDetailsSheet.tsx   # NEW
│       ├── EditEntrySheet.tsx      # NEW
│       └── EditEntryForm.tsx       # NEW
├── lib/
│   └── entry-rules.ts              # NEW
├── hooks/
│   └── use-entry-data.ts           # MODIFIED - Add useEntryDetails
├── actions/
│   └── entry.ts                    # MODIFIED - Add updateTimeEntry, getEntryWithDetails
└── types/
    └── domain.ts                   # MODIFIED - Add TimeEntryWithDetails
```

### UX Flow

```
Dashboard Entry List
    ↓ tap entry
Entry Details Sheet (bottom sheet)
    ↓ tap "แก้ไข"
Edit Entry Sheet (near full-screen bottom sheet)
    ↓ modify fields → tap "บันทึก"
Success Toast → Close sheets → Refresh list
```

### Mobile UX Considerations

- Bottom sheet slides up from bottom (mobile-native feel)
- Edit form is near full-screen (90vh) for easy input
- All buttons are 48px tall (touch-friendly)
- Cancel button is clearly available
- Draft auto-saves prevent data loss

### Edit Restrictions

| Entry Age | Can Edit? | Message |
|-----------|-----------|---------|
| Today - 6 days ago | ✅ Yes | - |
| 7+ days ago | ❌ No | "ไม่สามารถแก้ไข entry เก่ากว่า 7 วัน" |

### Testing Considerations

```typescript
// test/e2e/entry/edit-entry.test.ts
import { test, expect } from '@playwright/test';

test.describe('Edit Time Entry', () => {
  test('can edit entry within 7-day window', async ({ page }) => {
    // Create entry for today
    // Tap entry → Tap Edit → Modify → Save
    // Verify success toast
    // Verify entry updated in list
  });

  test('cannot edit entry older than 7 days', async ({ page }) => {
    // Navigate to old entry
    // Verify Edit button is disabled
    // Verify restriction message shown
  });

  test('preserves edit draft on navigation', async ({ page }) => {
    // Start editing
    // Navigate away
    // Return to edit
    // Verify draft restored
  });
});
```

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#Time Entry]
- [Source: _bmad-output/planning-artifacts/epics.md#Story 4.5]
- [Source: _bmad-output/project-context.md#Server Actions Pattern]
- [Source: _bmad-output/implementation-artifacts/4-4-time-entry-form-date-selection-submission.md]
- [Source: _bmad-output/implementation-artifacts/3-4-soft-delete-protection.md#TimeEntryWithDetails]

## Definition of Done

- [ ] Entry details bottom sheet opens on tap
- [ ] Edit and Delete buttons visible in sheet
- [ ] Edit form pre-populates all fields correctly
- [ ] Cascading selectors work in edit mode
- [ ] 7-day edit restriction enforced (client + server)
- [ ] Restriction message displays for old entries
- [ ] Update Server Action works correctly
- [ ] Success toast shows on save
- [ ] Entry list refreshes after edit
- [ ] Edit draft persists in sessionStorage
- [ ] Draft clears on successful save
- [ ] All buttons have 48px touch targets

## Dev Agent Record

### Agent Model Used

_To be filled by dev agent_

### Completion Notes List

_To be filled during implementation_

### File List

_To be filled with all created/modified files_
