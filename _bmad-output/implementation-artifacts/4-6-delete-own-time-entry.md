# Story 4.6: Delete Own Time Entry

Status: done

## Story

As a **staff member**,
I want **to delete my own time entries**,
So that **I can remove incorrect entries**.

## Acceptance Criteria

1. **AC1: Delete Button Visibility**
   - Given I am viewing entry details in the bottom sheet
   - When I see the action buttons
   - Then I see "ลบ" (Delete) button in destructive style
   - And it's visible for all my own entries

2. **AC2: Delete Confirmation Dialog**
   - Given I tap "ลบ" (Delete)
   - When the dialog appears
   - Then I see confirmation: "ต้องการลบ entry นี้?"
   - And I see entry summary (date, client, duration)
   - And I see options "ยกเลิก" and "ลบ"

3. **AC3: Delete Success**
   - Given I confirm deletion
   - When the delete succeeds
   - Then I see toast: "ลบเรียบร้อย"
   - And the entry is removed from the list
   - And the bottom sheet closes automatically

4. **AC4: Delete Cancellation**
   - Given I tap "ยกเลิก"
   - When the dialog closes
   - Then the entry remains unchanged
   - And the details sheet stays open

5. **AC5: Audit Log**
   - Given I successfully delete an entry
   - When the deletion is recorded
   - Then audit_log records action='DELETE' with old_data

6. **AC6: Soft Delete Implementation**
   - Given an entry is deleted
   - When checking the database
   - Then the entry has deleted_at timestamp set (soft delete)
   - And the entry no longer appears in queries
   - And historical data is preserved

7. **AC7: Delete Animation**
   - Given I confirm deletion
   - When the entry is removed
   - Then it animates out smoothly (slide + fade)
   - And the list reflows without jarring

## Tasks / Subtasks

- [x] **Task 1: Create Delete Confirmation Dialog** (AC: 2, 4)
  - [x] 1.1 Create `components/entry/DeleteConfirmDialog.tsx`
  - [x] 1.2 Use shadcn/ui AlertDialog
  - [x] 1.3 Show entry summary in dialog
  - [x] 1.4 Handle confirm and cancel actions

- [x] **Task 2: Create Delete Entry Server Action** (AC: 3, 5, 6)
  - [x] 2.1 Create `deleteTimeEntry` Server Action
  - [x] 2.2 Implement soft delete (set deleted_at)
  - [x] 2.3 Validate ownership via RLS
  - [x] 2.4 Return ActionResult<void>

- [x] **Task 3: Add deleted_at Column** (AC: 6)
  - [x] 3.1 Create migration for deleted_at column
  - [x] 3.2 Update RLS policies to filter deleted entries
  - [x] 3.3 Add index for query performance

- [x] **Task 4: Implement Delete Animation** (AC: 7)
  - [x] 4.1 Use framer-motion AnimatePresence
  - [x] 4.2 Create slide-out animation
  - [x] 4.3 Handle list reflow smoothly

- [x] **Task 5: Integrate with Entry Details Sheet** (AC: 1, 3)
  - [x] 5.1 Wire up delete button handler
  - [x] 5.2 Show confirmation dialog on click
  - [x] 5.3 Close sheet on successful delete
  - [x] 5.4 Invalidate queries to refresh list

- [x] **Task 6: Add Haptic Feedback** (AC: 3)
  - [x] 6.1 Add haptic on delete confirmation
  - [x] 6.2 Use different haptic pattern for delete vs save

## Dev Notes

### Delete Confirmation Dialog

```typescript
// src/components/entry/DeleteConfirmDialog.tsx
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
import { Loader2 } from 'lucide-react';
import { formatThaiDate } from '@/lib/thai-date';
import { formatDuration } from '@/lib/duration';
import type { TimeEntryWithDetails } from '@/types/domain';

interface DeleteConfirmDialogProps {
  entry: TimeEntryWithDetails | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

export function DeleteConfirmDialog({
  entry,
  open,
  onOpenChange,
  onConfirm,
  isDeleting,
}: DeleteConfirmDialogProps) {
  if (!entry) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>ต้องการลบ entry นี้?</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-2">
              <p>Entry นี้จะถูกลบอย่างถาวร</p>
              <div className="rounded-lg bg-muted p-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">วันที่</span>
                  <span className="font-medium">{formatThaiDate(entry.entryDate)}</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-muted-foreground">Client</span>
                  <span className="font-medium">{entry.job.project.client.name}</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-muted-foreground">ระยะเวลา</span>
                  <span className="font-medium">{formatDuration(entry.durationMinutes)}</span>
                </div>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>ยกเลิก</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault(); // Prevent auto-close
              onConfirm();
            }}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                กำลังลบ...
              </>
            ) : (
              'ลบ'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

### Delete Entry Server Action

```typescript
// src/actions/entry.ts (additions)

export async function deleteTimeEntry(
  entryId: string
): Promise<ActionResult<void>> {
  const supabase = await createClient();

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'ไม่ได้เข้าสู่ระบบ' };
  }

  // Soft delete: set deleted_at timestamp
  // RLS policy ensures user can only delete their own entries
  const { error } = await supabase
    .from('time_entries')
    .update({
      deleted_at: new Date().toISOString(),
    })
    .eq('id', entryId)
    .eq('user_id', user.id); // Extra safety check

  if (error) {
    console.error('Failed to delete time entry:', error);
    return { success: false, error: 'ไม่สามารถลบได้ กรุณาลองอีกครั้ง' };
  }

  // Note: audit_log trigger captures DELETE with old_data automatically

  revalidatePath('/dashboard');
  revalidatePath('/entry');

  return { success: true, data: undefined };
}
```

### Database Migration for Soft Delete

```sql
-- supabase/migrations/XXXXXX_add_soft_delete.sql

-- Add deleted_at column for soft delete
ALTER TABLE time_entries
ADD COLUMN deleted_at TIMESTAMPTZ DEFAULT NULL;

-- Create index for filtering non-deleted entries
CREATE INDEX idx_time_entries_deleted_at ON time_entries (deleted_at)
WHERE deleted_at IS NULL;

-- Update RLS policies to exclude deleted entries
DROP POLICY IF EXISTS "users_read_own_entries" ON time_entries;
CREATE POLICY "users_read_own_entries" ON time_entries
FOR SELECT TO authenticated
USING (
  user_id = auth.uid()
  AND deleted_at IS NULL
);

DROP POLICY IF EXISTS "managers_read_dept_entries" ON time_entries;
CREATE POLICY "managers_read_dept_entries" ON time_entries
FOR SELECT TO authenticated
USING (
  deleted_at IS NULL
  AND (
    user_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM manager_departments md
      WHERE md.manager_id = auth.uid()
      AND md.department_id = time_entries.department_id
    )
    AND (SELECT role FROM users WHERE id = auth.uid()) = 'manager'
  )
);

-- Update audit_log trigger to capture soft deletes
CREATE OR REPLACE FUNCTION log_time_entry_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO audit_logs (table_name, record_id, action, new_data, user_id)
    VALUES ('time_entries', NEW.id, 'INSERT', row_to_json(NEW), NEW.user_id);
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Check if this is a soft delete (deleted_at changed from NULL)
    IF OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL THEN
      INSERT INTO audit_logs (table_name, record_id, action, old_data, user_id)
      VALUES ('time_entries', OLD.id, 'DELETE', row_to_json(OLD), OLD.user_id);
    ELSE
      INSERT INTO audit_logs (table_name, record_id, action, old_data, new_data, user_id)
      VALUES ('time_entries', OLD.id, 'UPDATE', row_to_json(OLD), row_to_json(NEW), OLD.user_id);
    END IF;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;
```

### Entry List with Delete Animation

```typescript
// src/components/dashboard/EntryList.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { TimeEntryWithDetails } from '@/types/domain';

interface EntryListProps {
  entries: TimeEntryWithDetails[];
  onEntryClick: (entry: TimeEntryWithDetails) => void;
}

export function EntryList({ entries, onEntryClick }: EntryListProps) {
  return (
    <div className="space-y-2">
      <AnimatePresence mode="popLayout">
        {entries.map((entry) => (
          <motion.div
            key={entry.id}
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{
              opacity: 0,
              x: -100,
              transition: { duration: 0.2 },
            }}
            transition={{
              opacity: { duration: 0.2 },
              layout: { duration: 0.3 },
            }}
          >
            <EntryCard entry={entry} onClick={() => onEntryClick(entry)} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

interface EntryCardProps {
  entry: TimeEntryWithDetails;
  onClick: () => void;
}

function EntryCard({ entry, onClick }: EntryCardProps) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left p-4 rounded-lg border bg-card hover:bg-accent transition-colors"
    >
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <p className="font-medium">
            {entry.job.project.client.name} › {entry.job.name}
          </p>
          <p className="text-sm text-muted-foreground">
            {entry.service.name}
            {entry.task && ` • ${entry.task.name}`}
          </p>
        </div>
        <div className="text-right">
          <p className="font-semibold">
            {formatDuration(entry.durationMinutes)}
          </p>
        </div>
      </div>
    </button>
  );
}
```

### Updated Entry Details Sheet with Delete

```typescript
// src/components/entry/EntryDetailsSheet.tsx (updated)
'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import { DeleteConfirmDialog } from '@/components/entry/DeleteConfirmDialog';
import { deleteTimeEntry } from '@/actions/entry';
import { formatThaiDate } from '@/lib/thai-date';
import { formatDuration } from '@/lib/duration';
import { canEditEntry } from '@/lib/entry-rules';
import type { TimeEntryWithDetails } from '@/types/domain';

interface EntryDetailsSheetProps {
  entry: TimeEntryWithDetails | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (entry: TimeEntryWithDetails) => void;
}

export function EntryDetailsSheet({
  entry,
  open,
  onOpenChange,
  onEdit,
}: EntryDetailsSheetProps) {
  const queryClient = useQueryClient();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!entry) return null;

  const isEditable = canEditEntry(entry.entryDate);

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const result = await deleteTimeEntry(entry.id);

      if (!result.success) {
        toast.error(result.error);
        setIsDeleting(false);
        return;
      }

      // Haptic feedback for delete
      if ('vibrate' in navigator) {
        navigator.vibrate([50, 50, 50]); // Different pattern for delete
      }

      toast.success('ลบเรียบร้อย');

      // Close dialogs
      setShowDeleteDialog(false);
      onOpenChange(false);

      // Invalidate queries to refresh list
      queryClient.invalidateQueries({ queryKey: ['entries'] });
      queryClient.invalidateQueries({ queryKey: ['recentCombinations'] });

    } catch (error) {
      toast.error('ไม่สามารถลบได้ กรุณาลองอีกครั้ง');
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-auto max-h-[80vh]">
          <SheetHeader>
            <SheetTitle>รายละเอียด Entry</SheetTitle>
          </SheetHeader>

          <div className="mt-4 space-y-4">
            {/* Entry details */}
            <div className="space-y-3">
              <DetailRow label="วันที่" value={formatThaiDate(entry.entryDate)} />
              <DetailRow label="Client" value={entry.job.project.client.name} />
              <DetailRow label="Project" value={entry.job.project.name} />
              <DetailRow
                label="Job"
                value={`${entry.job.jobNo ? `${entry.job.jobNo} - ` : ''}${entry.job.name}`}
              />
              <DetailRow label="Service" value={entry.service.name} />
              {entry.task && <DetailRow label="Task" value={entry.task.name} />}
              <DetailRow
                label="ระยะเวลา"
                value={formatDuration(entry.durationMinutes, 'long')}
              />
              {entry.notes && <DetailRow label="หมายเหตุ" value={entry.notes} />}
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
                onClick={() => setShowDeleteDialog(true)}
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

      {/* Delete confirmation dialog */}
      <DeleteConfirmDialog
        entry={entry}
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />
    </>
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

### Haptic Feedback Utility

```typescript
// src/lib/haptic.ts

/**
 * Trigger haptic feedback if supported
 * @param pattern - 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error'
 */
export function hapticFeedback(
  pattern: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' = 'light'
) {
  if (!('vibrate' in navigator)) return;

  const patterns: Record<string, number | number[]> = {
    light: 10,
    medium: 50,
    heavy: 100,
    success: 50,
    warning: [50, 50],
    error: [50, 50, 50],
  };

  navigator.vibrate(patterns[pattern]);
}
```

### Project Structure

```
src/
├── components/
│   ├── entry/
│   │   ├── EntryDetailsSheet.tsx     # MODIFIED - Add delete handling
│   │   └── DeleteConfirmDialog.tsx   # NEW
│   └── dashboard/
│       └── EntryList.tsx             # NEW or MODIFIED - Add animations
├── lib/
│   └── haptic.ts                     # NEW
├── actions/
│   └── entry.ts                      # MODIFIED - Add deleteTimeEntry
└── supabase/
    └── migrations/
        └── XXXXXX_add_soft_delete.sql  # NEW
```

### Delete Flow Sequence

```
User taps "ลบ" button
    ↓
DeleteConfirmDialog opens
    ↓ User taps "ลบ"
setIsDeleting(true) → Show loading
    ↓
Call deleteTimeEntry Server Action
    ↓ (success)
Haptic feedback (error pattern)
Toast "ลบเรียบร้อย"
Close dialog + sheet
Invalidate queries → List refreshes with animation
    ↓ (failure)
Toast error message
Keep dialog open for retry
```

### Soft Delete vs Hard Delete

| Approach | Pros | Cons |
|----------|------|------|
| Soft Delete | Data recovery, audit trail | Queries need WHERE clause |
| Hard Delete | Simpler queries | No recovery, no history |

**Decision: Soft Delete**
- Preserves audit trail
- Allows potential recovery
- Maintains data integrity for analytics
- deleted_at column with index for performance

### Animation Timing

| Action | Duration | Easing |
|--------|----------|--------|
| Entry slide out | 200ms | ease-out |
| List reflow | 300ms | spring |
| Dialog fade | 150ms | ease |

### Testing Considerations

```typescript
// test/e2e/entry/delete-entry.test.ts
import { test, expect } from '@playwright/test';

test.describe('Delete Time Entry', () => {
  test('shows confirmation dialog before delete', async ({ page }) => {
    // Navigate to entry
    // Tap Delete
    // Verify dialog appears with entry summary
    // Verify cancel and confirm buttons visible
  });

  test('deletes entry on confirm', async ({ page }) => {
    // Create test entry
    // Open details → Tap Delete → Confirm
    // Verify success toast
    // Verify entry removed from list
  });

  test('cancels delete and keeps entry', async ({ page }) => {
    // Open details → Tap Delete → Cancel
    // Verify dialog closes
    // Verify entry still in list
  });

  test('entry animates out on delete', async ({ page }) => {
    // Delete entry
    // Verify slide-out animation plays
    // Verify no layout jump
  });
});
```

### Accessibility

- AlertDialog traps focus appropriately
- Cancel button is first in tab order
- Destructive action clearly styled
- Screen readers announce dialog content
- Escape key closes dialog (cancel action)

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#Soft Delete]
- [Source: _bmad-output/planning-artifacts/epics.md#Story 4.6]
- [Source: _bmad-output/project-context.md#Server Actions Pattern]
- [Source: _bmad-output/implementation-artifacts/4-5-edit-own-time-entry.md]
- [Source: _bmad-output/implementation-artifacts/3-4-soft-delete-protection.md]

## Definition of Done

- [x] Delete button visible in entry details sheet
- [x] Confirmation dialog shows entry summary
- [x] Cancel closes dialog without deleting
- [x] Confirm deletes entry with loading state
- [x] Success toast displays on delete
- [x] Entry animates out of list
- [x] List reflows smoothly
- [x] Soft delete sets deleted_at timestamp
- [x] RLS policies filter deleted entries
- [x] Audit log records DELETE action
- [x] Haptic feedback on delete
- [x] All buttons have 48px touch targets

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Completion Notes List

1. **Task 1 (Delete Confirmation Dialog):** Created `DeleteConfirmDialog.tsx` with AlertDialog, entry summary (date, client, duration), and loading state. 7 unit tests pass.

2. **Task 3 (deleted_at Column):** Created migration `009_add_soft_delete.sql` with:
   - Added `deleted_at` column to `time_entries`
   - Created partial index `idx_time_entries_not_deleted` for query performance
   - Updated RLS policies to filter deleted entries
   - Created audit trigger `log_time_entry_changes()` that records soft deletes as 'DELETE' action
   - Applied to Supabase Cloud successfully

3. **Task 2 (Server Action):** Updated `deleteTimeEntry` to use soft delete (setting `deleted_at`) instead of hard delete. Includes ownership validation and 7-day edit restriction.

4. **Task 4 (Delete Animation):** Added AnimatePresence with popLayout mode to entry list. Exit animation: slide left + fade out (200ms).

5. **Task 5 (Integration):** Replaced inline AlertDialog in RecentEntries with new DeleteConfirmDialog component. Delete flow closes dialog and refreshes list.

6. **Task 6 (Haptic Feedback):** Added navigator.vibrate([50, 50, 50]) on successful delete - distinct pattern from save actions.

### File List

**New Files:**
- `src/components/entry/DeleteConfirmDialog.tsx` - Delete confirmation dialog component
- `src/components/entry/DeleteConfirmDialog.test.tsx` - Unit tests (7 tests)
- `supabase/migrations/20260102021926_009_add_soft_delete.sql` - Soft delete migration
- `src/lib/haptic.ts` - Haptic feedback utility (added in code review)
- `test/e2e/entry/delete-entry.test.ts` - E2E tests for delete functionality (added in code review)

**Modified Files:**
- `src/components/entry/index.ts` - Added DeleteConfirmDialog export
- `src/actions/entry.ts` - Changed deleteTimeEntry to soft delete, added row verification
- `src/app/(app)/entry/components/RecentEntries.tsx` - AnimatePresence, haptic, optimistic update
- `src/types/database.types.ts` - Added deleted_at field to time_entries
- `src/components/entry/EntryDetailsSheet.tsx` - Removed 7-day restriction for delete button

## Code Review Fixes Applied

1. **[HIGH] Removed 7-day delete restriction** - Delete now allowed for entries of any age (per AC1)
2. **[HIGH] Added row count verification** - Server action now verifies update affected a row
3. **[HIGH] Race condition fix** - Added `eq('deleted_at', null)` to prevent double-delete
4. **[MEDIUM] Created E2E tests** - Added comprehensive E2E tests for delete RLS and audit
5. **[MEDIUM] Extracted haptic utility** - Created reusable `src/lib/haptic.ts`
6. **[MEDIUM] Implemented optimistic delete** - Proper exit animation via cache update

## Change Log

- 2026-01-02: Implemented Story 4.6 - Delete Own Time Entry (soft delete with animation)
- 2026-01-02: Code review fixes applied - removed 7-day restriction, added E2E tests, haptic utility
