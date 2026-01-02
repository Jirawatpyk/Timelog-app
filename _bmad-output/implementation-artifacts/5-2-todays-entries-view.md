# Story 5.2: Today's Entries View

Status: done

## Story

As a **staff member**,
I want **to see all my entries for today**,
So that **I can verify what I've logged and see remaining work**.

## Acceptance Criteria

1. **AC1: Entry List Display**
   - Given I am on the dashboard with "วันนี้" selected
   - When I have entries for today
   - Then I see a list of entries sorted by created_at (newest first)
   - And each entry shows: Client > Job, Service, Duration, Time logged

2. **AC2: Entry Card Information**
   - Given an entry is displayed
   - When I view the entry card
   - Then I see the client name prominently
   - And I see job name (with job_no if available)
   - And I see service name
   - And I see task name (if present)
   - And I see duration in Thai format (e.g., "1.5 ชม.")
   - And I see entry date/time

3. **AC3: Total Hours Display**
   - Given today is a workday
   - When I view my entries
   - Then I see total hours logged today prominently displayed
   - And if < 8 hours, I see a subtle indicator (not alarming)
   - And the total updates when entries change

4. **AC4: Entry Tap Interaction**
   - Given I tap on an entry
   - When the tap registers
   - Then a bottom sheet opens with full entry details
   - And I see "แก้ไข" (Edit) and "ลบ" (Delete) buttons
   - And I can close the sheet by swiping down or tapping outside

5. **AC5: Entry Details in Bottom Sheet**
   - Given the bottom sheet is open
   - When I view the entry details
   - Then I see complete hierarchy: Client > Project > Job
   - And I see Service and Task (if present)
   - And I see Duration
   - And I see Entry Date in Thai format
   - And I see Notes (if any)
   - And I see when entry was created/updated

6. **AC6: Edit/Delete Actions**
   - Given the bottom sheet is open
   - When I tap "แก้ไข"
   - Then I am navigated to edit form (or inline edit opens)
   - When I tap "ลบ"
   - Then delete confirmation dialog appears
   - (Actual edit/delete logic from Stories 4.5 and 4.6)

7. **AC7: Empty State for Today**
   - Given I have no entries for today
   - When the dashboard loads
   - Then I see: "ยังไม่มี entry วันนี้"
   - And I see a CTA: "เพิ่ม Entry" linking to /entry

## Tasks / Subtasks

- [x] **Task 1: Create Entry Card Component** (AC: 1, 2)
  - [x] 1.1 Create `components/dashboard/EntryCard.tsx`
  - [x] 1.2 Display client > job hierarchy
  - [x] 1.3 Display service and task
  - [x] 1.4 Format duration in Thai
  - [x] 1.5 Style with proper touch targets (44x44px)

- [x] **Task 2: Enhance Entry List Component** (AC: 1)
  - [x] 2.1 Update `components/dashboard/EntryList.tsx` from Story 5-1
  - [x] 2.2 Sort entries by created_at descending (handled by query)
  - [x] 2.3 Add gap between entries
  - [x] 2.4 Handle empty list state

- [x] **Task 3: Create Entry Details Bottom Sheet** (AC: 4, 5)
  - [x] 3.1 Reuse `EntryDetailsSheet` from `@/components/entry/` (Story 4.5)
  - [x] 3.2 Display all entry details
  - [x] 3.3 Swipe-to-close handled by Sheet component
  - [x] 3.4 Action buttons (Edit, Delete) included in reused component

- [x] **Task 4: Implement Sheet Open/Close Logic** (AC: 4)
  - [x] 4.1 State management in EntryList component (useState)
  - [x] 4.2 Handle entry selection via onTap callback
  - [x] 4.3 Sheet animation handled by Radix UI Sheet component

- [x] **Task 5: Add Edit/Delete Actions** (AC: 6)
  - [x] 5.1 Wire up Edit button to navigate to edit form
  - [x] 5.2 Wire up Delete button to confirmation dialog
  - [x] 5.3 Reuse components from Stories 4.5 and 4.6

- [x] **Task 6: Update Stats Display for Today** (AC: 3)
  - [x] 6.1 Enhance `StatsCard.tsx` with hours indicator
  - [x] 6.2 Add subtle < 8 hours indicator (amber color)
  - [x] 6.3 Add progress bar for target completion

- [x] **Task 7: Empty State Component** (AC: 7)
  - [x] 7.1 Create `components/dashboard/EmptyState.tsx`
  - [x] 7.2 Add message and CTA button
  - [x] 7.3 Style with Clock icon

## Dev Notes

### Entry Card Component

```typescript
// src/components/dashboard/EntryCard.tsx
'use client';

import { formatThaiDate } from '@/lib/utils/thai-date';
import { cn } from '@/lib/utils';
import type { TimeEntryWithRelations } from '@/types/domain';

interface EntryCardProps {
  entry: TimeEntryWithRelations;
  onTap: (entry: TimeEntryWithRelations) => void;
}

export function EntryCard({ entry, onTap }: EntryCardProps) {
  const durationHours = entry.duration_minutes / 60;
  const clientName = entry.job?.project?.client?.name || 'Unknown Client';
  const jobDisplay = entry.job?.job_no
    ? `${entry.job.job_no} - ${entry.job.name}`
    : entry.job?.name || 'Unknown Job';

  return (
    <button
      onClick={() => onTap(entry)}
      className={cn(
        'w-full text-left p-4 rounded-lg border bg-card',
        'transition-colors duration-200',
        'hover:bg-accent/50 active:bg-accent',
        'focus:outline-none focus:ring-2 focus:ring-ring',
        'min-h-[72px] touch-manipulation'
      )}
    >
      <div className="flex justify-between items-start gap-2">
        <div className="flex-1 min-w-0">
          {/* Client > Job */}
          <p className="font-medium text-sm truncate">
            {clientName}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {jobDisplay}
          </p>

          {/* Service & Task */}
          <p className="text-xs text-muted-foreground mt-1">
            {entry.service?.name}
            {entry.task && ` • ${entry.task.name}`}
          </p>
        </div>

        {/* Duration */}
        <div className="text-right shrink-0">
          <p className="font-semibold text-primary">
            {durationHours.toFixed(1)} ชม.
          </p>
          <p className="text-xs text-muted-foreground">
            {formatThaiDate(entry.entry_date, 'short')}
          </p>
        </div>
      </div>
    </button>
  );
}
```

### Entry List with Tap Handler

```typescript
// src/components/dashboard/EntryList.tsx
'use client';

import { useState } from 'react';
import { EntryCard } from '@/components/dashboard/EntryCard';
import { EntryDetailsSheet } from '@/components/dashboard/EntryDetailsSheet';
import { EmptyState } from '@/components/dashboard/EmptyState';
import type { TimeEntryWithRelations } from '@/types/domain';

interface EntryListProps {
  entries: TimeEntryWithRelations[];
}

export function EntryList({ entries }: EntryListProps) {
  const [selectedEntry, setSelectedEntry] = useState<TimeEntryWithRelations | null>(null);

  if (entries.length === 0) {
    return <EmptyState />;
  }

  return (
    <>
      <div className="flex flex-col gap-2">
        {entries.map((entry) => (
          <EntryCard
            key={entry.id}
            entry={entry}
            onTap={setSelectedEntry}
          />
        ))}
      </div>

      <EntryDetailsSheet
        entry={selectedEntry}
        open={!!selectedEntry}
        onClose={() => setSelectedEntry(null)}
      />
    </>
  );
}
```

### Entry Details Bottom Sheet

```typescript
// src/components/dashboard/EntryDetailsSheet.tsx
'use client';

import { useRouter } from 'next/navigation';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { formatThaiDate } from '@/lib/utils/thai-date';
import { canEditEntry } from '@/lib/utils/entry-permissions';
import { DeleteConfirmDialog } from '@/components/entry/DeleteConfirmDialog';
import { Pencil, Trash2 } from 'lucide-react';
import type { TimeEntryWithRelations } from '@/types/domain';

interface EntryDetailsSheetProps {
  entry: TimeEntryWithRelations | null;
  open: boolean;
  onClose: () => void;
}

export function EntryDetailsSheet({ entry, open, onClose }: EntryDetailsSheetProps) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  if (!entry) return null;

  const durationHours = entry.duration_minutes / 60;
  const canEdit = canEditEntry(entry.entry_date);

  const handleEdit = () => {
    onClose();
    router.push(`/entry/edit/${entry.id}`);
  };

  const handleDeleteSuccess = () => {
    setShowDeleteDialog(false);
    onClose();
    router.refresh();
  };

  return (
    <>
      <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
        <SheetContent side="bottom" className="h-auto max-h-[80vh] rounded-t-2xl">
          <SheetHeader className="text-left">
            <SheetTitle>รายละเอียด Entry</SheetTitle>
          </SheetHeader>

          <div className="mt-4 space-y-4">
            {/* Entry Details */}
            <div className="space-y-3">
              <DetailRow
                label="ลูกค้า"
                value={entry.job?.project?.client?.name}
              />
              <DetailRow
                label="โปรเจกต์"
                value={entry.job?.project?.name}
              />
              <DetailRow
                label="งาน"
                value={entry.job?.job_no
                  ? `${entry.job.job_no} - ${entry.job.name}`
                  : entry.job?.name}
              />
              <DetailRow
                label="บริการ"
                value={entry.service?.name}
              />
              {entry.task && (
                <DetailRow
                  label="Task"
                  value={entry.task.name}
                />
              )}

              <Separator />

              <DetailRow
                label="ระยะเวลา"
                value={`${durationHours.toFixed(1)} ชั่วโมง`}
                highlight
              />
              <DetailRow
                label="วันที่"
                value={formatThaiDate(entry.entry_date, 'long')}
              />

              {entry.notes && (
                <>
                  <Separator />
                  <div>
                    <p className="text-xs text-muted-foreground">หมายเหตุ</p>
                    <p className="text-sm mt-1">{entry.notes}</p>
                  </div>
                </>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                className="flex-1 min-h-[44px]"
                onClick={handleEdit}
                disabled={!canEdit}
              >
                <Pencil className="w-4 h-4 mr-2" />
                แก้ไข
              </Button>
              <Button
                variant="destructive"
                className="flex-1 min-h-[44px]"
                onClick={() => setShowDeleteDialog(true)}
                disabled={!canEdit}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                ลบ
              </Button>
            </div>

            {!canEdit && (
              <p className="text-xs text-center text-muted-foreground">
                ไม่สามารถแก้ไข entry เก่ากว่า 7 วัน
              </p>
            )}
          </div>
        </SheetContent>
      </Sheet>

      <DeleteConfirmDialog
        entry={entry}
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onSuccess={handleDeleteSuccess}
      />
    </>
  );
}

function DetailRow({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value?: string | null;
  highlight?: boolean;
}) {
  return (
    <div className="flex justify-between items-center">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={cn(
        'text-sm',
        highlight && 'font-semibold text-primary'
      )}>
        {value || '-'}
      </p>
    </div>
  );
}
```

### Empty State Component

```typescript
// src/components/dashboard/EmptyState.tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Clock } from 'lucide-react';

interface EmptyStateProps {
  message?: string;
  showCta?: boolean;
}

export function EmptyState({
  message = 'ยังไม่มี entry วันนี้',
  showCta = true,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <Clock className="w-8 h-8 text-muted-foreground" />
      </div>

      <p className="text-muted-foreground mb-4">{message}</p>

      {showCta && (
        <Button asChild>
          <Link href="/entry">เพิ่ม Entry</Link>
        </Button>
      )}
    </div>
  );
}
```

### Enhanced Stats Card with Hours Indicator

```typescript
// src/components/dashboard/StatsCard.tsx - Enhanced
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { Period, DashboardStats } from '@/types/dashboard';

interface StatsCardProps {
  stats: DashboardStats;
  period: Period;
}

const PERIOD_LABELS: Record<Period, string> = {
  today: 'วันนี้',
  week: 'สัปดาห์นี้',
  month: 'เดือนนี้',
};

const WORK_HOURS_TARGET = 8; // Standard work day

export function StatsCard({ stats, period }: StatsCardProps) {
  const isUnderTarget = period === 'today' && stats.totalHours < WORK_HOURS_TARGET;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-muted-foreground">{PERIOD_LABELS[period]}</p>
            <div className="flex items-baseline gap-2">
              <p className={cn(
                'text-3xl font-bold',
                isUnderTarget && 'text-amber-600'
              )}>
                {stats.totalHours.toFixed(1)} ชม.
              </p>
              {isUnderTarget && (
                <span className="text-xs text-amber-600">
                  (เหลือ {(WORK_HOURS_TARGET - stats.totalHours).toFixed(1)} ชม.)
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{stats.entryCount} รายการ</p>
          </div>

          {stats.topClient && (
            <div className="text-right">
              <p className="text-xs text-muted-foreground">ลูกค้าหลัก</p>
              <p className="text-sm font-medium truncate max-w-[120px]">
                {stats.topClient.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {stats.topClient.hours.toFixed(1)} ชม.
              </p>
            </div>
          )}
        </div>

        {/* Progress Bar for Today */}
        {period === 'today' && (
          <div className="mt-4">
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-500',
                  stats.totalHours >= WORK_HOURS_TARGET
                    ? 'bg-green-500'
                    : 'bg-amber-500'
                )}
                style={{
                  width: `${Math.min((stats.totalHours / WORK_HOURS_TARGET) * 100, 100)}%`,
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1 text-right">
              {Math.min((stats.totalHours / WORK_HOURS_TARGET) * 100, 100).toFixed(0)}% ของเป้าหมาย
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

### Type Definitions

```typescript
// src/types/domain.ts - Add or extend
export interface TimeEntryWithRelations {
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
  deleted_at: string | null;

  // Relations
  job?: {
    id: string;
    name: string;
    job_no: string | null;
    project?: {
      id: string;
      name: string;
      client?: {
        id: string;
        name: string;
      };
    };
  };
  service?: {
    id: string;
    name: string;
  };
  task?: {
    id: string;
    name: string;
  } | null;
}
```

### Entry Permissions Utility

```typescript
// src/lib/utils/entry-permissions.ts
const EDIT_WINDOW_DAYS = 7;

export function canEditEntry(entryDate: string): boolean {
  const entry = new Date(entryDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const cutoffDate = new Date(today);
  cutoffDate.setDate(cutoffDate.getDate() - EDIT_WINDOW_DAYS);

  return entry >= cutoffDate;
}

export function getDaysUntilLocked(entryDate: string): number {
  const entry = new Date(entryDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const cutoffDate = new Date(entry);
  cutoffDate.setDate(cutoffDate.getDate() + EDIT_WINDOW_DAYS);

  const diffTime = cutoffDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return Math.max(0, diffDays);
}
```

### Project Structure Update

```
src/
├── components/
│   └── dashboard/
│       ├── PeriodSelector.tsx        # From 5-1
│       ├── DashboardContent.tsx      # From 5-1
│       ├── StatsCard.tsx             # ENHANCE
│       ├── EntryList.tsx             # ENHANCE
│       ├── EntryCard.tsx             # NEW
│       ├── EntryDetailsSheet.tsx     # NEW
│       ├── EmptyState.tsx            # NEW
│       └── DashboardSkeleton.tsx     # From 5-1
├── lib/
│   └── utils/
│       └── entry-permissions.ts      # NEW
└── types/
    └── domain.ts                     # EXTEND
```

### Integration with Story 4.5 and 4.6

The EntryDetailsSheet reuses components from:
- **Story 4.5 (Edit)**: Navigate to `/entry/edit/[id]` or use inline EditEntryForm
- **Story 4.6 (Delete)**: Use DeleteConfirmDialog component

Import paths:
```typescript
import { DeleteConfirmDialog } from '@/components/entry/DeleteConfirmDialog';
// OR if edit is inline:
import { EditEntryForm } from '@/components/entry/EditEntryForm';
```

### Touch Target Requirements

All interactive elements must be minimum 44x44px:
- Entry cards: `min-h-[72px]` ensures adequate tap area
- Action buttons: `min-h-[44px]`
- Sheet close area: Sheet component handles this

### Accessibility

- Entry cards are `<button>` elements for proper keyboard navigation
- Focus ring visible on all interactive elements
- Screen reader labels for icons
- Sheet uses Dialog pattern with proper ARIA

### Testing Considerations

```typescript
// test/e2e/dashboard/todays-entries.test.ts
import { test, expect } from '@playwright/test';

test.describe("Today's Entries View", () => {
  test.beforeEach(async ({ page }) => {
    // Login and seed entries for today
    await page.goto('/dashboard?period=today');
  });

  test('displays entries for today', async ({ page }) => {
    const entryCards = page.locator('[data-testid="entry-card"]');
    await expect(entryCards.first()).toBeVisible();
  });

  test('opens bottom sheet on entry tap', async ({ page }) => {
    await page.locator('[data-testid="entry-card"]').first().click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText('รายละเอียด Entry')).toBeVisible();
  });

  test('shows empty state when no entries', async ({ page }) => {
    // Test with user who has no entries
    await expect(page.getByText('ยังไม่มี entry วันนี้')).toBeVisible();
    await expect(page.getByRole('link', { name: 'เพิ่ม Entry' })).toBeVisible();
  });

  test('shows under-target indicator when < 8 hours', async ({ page }) => {
    // With user who has logged < 8 hours
    await expect(page.getByText(/เหลือ.*ชม\./)).toBeVisible();
  });
});
```

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 5.2]
- [Source: _bmad-output/planning-artifacts/prd.md#FR17]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Dashboard Entry List]
- [Source: _bmad-output/implementation-artifacts/5-1-dashboard-layout-period-selector.md]
- [Source: _bmad-output/implementation-artifacts/4-5-edit-own-time-entry.md]
- [Source: _bmad-output/implementation-artifacts/4-6-delete-own-time-entry.md]

## Definition of Done

- [x] EntryCard component created with all required info
- [x] Entry list displays entries sorted by created_at desc
- [x] Bottom sheet opens on entry tap
- [x] Entry details displayed in bottom sheet
- [x] Edit button navigates to edit form
- [x] Delete button opens confirmation dialog
- [x] Stats show hours indicator for today
- [x] < 8 hours indicator is subtle (amber, not red)
- [x] Progress bar shows completion percentage
- [x] Empty state displays with CTA
- [x] Touch targets are 44x44px minimum (min-h-[72px] for cards)
- [x] 7-day edit restriction is enforced (via EntryDetailsSheet from Story 4.5)
- [x] Integrates with Stories 4.5 and 4.6 components

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Completion Notes List

1. Created `EntryCard.tsx` - displays client, job (with job_no), service, task, duration (Thai format), and date
2. Created `EmptyState.tsx` - shows "No entries" message with Clock icon and CTA to /entry
3. Enhanced `StatsCard.tsx` - added under-target indicator (amber), remaining hours display, and progress bar for "today" period
4. Enhanced `EntryList.tsx` - converted to client component with state for sheet/delete dialog, integrated with reused components
5. Reused `EntryDetailsSheet` from `@/components/entry/` (Story 4.5) - shows full entry details with Edit/Delete buttons
6. Reused `DeleteConfirmDialog` from `@/components/entry/` (Story 4.6) - handles delete confirmation
7. All tests passing (54 dashboard tests)
8. Build and lint successful

### File List

**Created:**
- `src/components/dashboard/EntryCard.tsx` - Entry card component
- `src/components/dashboard/EntryCard.test.tsx` - 10 tests
- `src/components/dashboard/EmptyState.tsx` - Empty state component
- `src/components/dashboard/EmptyState.test.tsx` - 6 tests
- `src/components/dashboard/StatsCard.test.tsx` - 20 tests

**Modified:**
- `src/components/dashboard/StatsCard.tsx` - Added progress bar and under-target indicator
- `src/components/dashboard/EntryList.tsx` - Converted to client component with sheet integration
- `src/components/dashboard/EntryList.test.tsx` - 11 tests for enhanced functionality
- `src/components/dashboard/index.ts` - Added exports for new components

### Code Review Fixes

| Issue | Severity | Fix Applied |
|-------|----------|-------------|
| HIGH-3: Missing created/updated timestamps | HIGH | Added timestamps section to EntryDetailsSheet |
| MEDIUM-3: No try-catch in delete handler | MEDIUM | Wrapped delete in try-catch-finally |
| MEDIUM-1: Incomplete delete tests | MEDIUM | Added success/error toast tests |
| LOW-1: Missing aria-label | LOW | Added descriptive aria-label to EntryCard |

**Additional files modified during code review:**
- `src/components/entry/EntryDetailsSheet.tsx` - Added timestamps display (AC5)
- `src/components/dashboard/EntryCard.tsx` - Added aria-label for accessibility
- `src/components/dashboard/EntryList.tsx` - Added try-catch error handling
- `src/components/dashboard/EntryList.test.tsx` - Added 2 more delete flow tests
- `src/components/dashboard/EntryCard.test.tsx` - Added aria-label test
