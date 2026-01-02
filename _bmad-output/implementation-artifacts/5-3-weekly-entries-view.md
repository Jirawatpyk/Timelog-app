# Story 5.3: Weekly Entries View

Status: done

## Story

As a **staff member**,
I want **to see all my entries for the current week**,
So that **I can review my weekly progress**.

## Acceptance Criteria

1. **AC1: Weekly Entries Display**
   - Given I am on the dashboard with "สัปดาห์นี้" selected
   - When the page loads
   - Then I see entries from Monday to Sunday of current week
   - And entries are sorted by date (newest first) then by created_at

2. **AC2: Date Group Headers**
   - Given I have entries across multiple days
   - When viewing weekly view
   - Then entries are grouped by date with date headers
   - And each date shows: "จันทร์ 30 ธ.ค." format
   - And headers show Thai day name + date

3. **AC3: Daily Subtotals**
   - Given I have entries across multiple days
   - When viewing weekly view
   - Then I see daily subtotals next to each date header
   - And subtotal shows hours (e.g., "4.5 ชม.")
   - And days with 0 hours show with muted styling

4. **AC4: Weekly Total**
   - Given I am viewing the weekly view
   - When stats display
   - Then I see weekly total at the top in StatsCard
   - And I see: "สัปดาห์นี้: XX ชม. (Y รายการ)"
   - And I see average per day: "เฉลี่ย X.X ชม./วัน"

5. **AC5: Empty Days Display**
   - Given some days in the week have no entries
   - When viewing weekly view
   - Then empty days are shown with muted styling
   - And empty day shows: "ไม่มี entry" or skipped entirely (design decision)

6. **AC6: Entry Tap Behavior**
   - Given I tap on an entry in weekly view
   - When the tap registers
   - Then the same bottom sheet from Story 5-2 opens
   - And I can edit or delete the entry

7. **AC7: Week Calculation**
   - Given the current date
   - When calculating week boundaries
   - Then week starts on Monday (ISO week)
   - And week ends on Sunday 23:59:59
   - And handles year boundaries correctly

## Tasks / Subtasks

- [x] **Task 1: Create Grouped Entry List Component** (AC: 1, 2)
  - [x] 1.1 Create `components/dashboard/GroupedEntryList.tsx`
  - [x] 1.2 Group entries by entry_date
  - [x] 1.3 Sort groups by date (newest first)
  - [x] 1.4 Add date header component

- [x] **Task 2: Create Date Header Component** (AC: 2, 3)
  - [x] 2.1 Create `components/dashboard/DateHeader.tsx`
  - [x] 2.2 Format English day name + date (Wed, Jan 15)
  - [x] 2.3 Display daily subtotal
  - [x] 2.4 Style muted for empty/zero days

- [x] **Task 3: Update Period Utils for Week** (AC: 7)
  - [x] 3.1 Ensure `getDateRangeForPeriod('week')` is correct
  - [x] 3.2 Create `getDaysInRange(start, end)` utility
  - [x] 3.3 Handle year boundary edge cases
  - [x] 3.4 Add unit tests for week calculation

- [x] **Task 4: Create Daily Subtotal Calculation** (AC: 3)
  - [x] 4.1 Create `groupEntriesByDate(entries)` utility
  - [x] 4.2 Calculate subtotal per day
  - [x] 4.3 Return with day info for header display

- [x] **Task 5: Update Stats Card for Weekly** (AC: 4)
  - [x] 5.1 Add average per day calculation
  - [x] 5.2 Show working days count (Mon-Fri or all 7)
  - [x] 5.3 Display average hours per day

- [x] **Task 6: Handle Empty Days** (AC: 5)
  - [x] 6.1 Decide: show empty days for week, skip for month
  - [x] 6.2 Show muted empty day rows in DashboardContent
  - [x] 6.3 Week view shows all 7 days, month skips empty

- [x] **Task 7: Wire Up Entry Interactions** (AC: 6)
  - [x] 7.1 Reuse EntryCard and EntryDetailsSheet from 5-2
  - [x] 7.2 Pass onTap handler to grouped list
  - [x] 7.3 Test edit/delete flow from weekly view

## Dev Notes

### Grouped Entry List Component

```typescript
// src/components/dashboard/GroupedEntryList.tsx
'use client';

import { useState, useMemo } from 'react';
import { DateHeader } from '@/components/dashboard/DateHeader';
import { EntryCard } from '@/components/dashboard/EntryCard';
import { EntryDetailsSheet } from '@/components/dashboard/EntryDetailsSheet';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { groupEntriesByDate } from '@/lib/dashboard/group-entries';
import type { TimeEntryWithRelations } from '@/types/domain';
import type { Period } from '@/types/dashboard';

interface GroupedEntryListProps {
  entries: TimeEntryWithRelations[];
  period: Period;
  showEmptyDays?: boolean;
}

export function GroupedEntryList({
  entries,
  period,
  showEmptyDays = false,
}: GroupedEntryListProps) {
  const [selectedEntry, setSelectedEntry] = useState<TimeEntryWithRelations | null>(null);

  const groupedEntries = useMemo(
    () => groupEntriesByDate(entries, period, showEmptyDays),
    [entries, period, showEmptyDays]
  );

  if (entries.length === 0) {
    return <EmptyState message="ยังไม่มี entry สัปดาห์นี้" />;
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        {groupedEntries.map((group) => (
          <div key={group.date} className="space-y-2">
            <DateHeader
              date={group.date}
              totalHours={group.totalHours}
              entryCount={group.entries.length}
              isEmpty={group.entries.length === 0}
            />

            {group.entries.length > 0 ? (
              <div className="flex flex-col gap-2 pl-2">
                {group.entries.map((entry) => (
                  <EntryCard
                    key={entry.id}
                    entry={entry}
                    onTap={setSelectedEntry}
                  />
                ))}
              </div>
            ) : showEmptyDays && (
              <p className="text-sm text-muted-foreground pl-2">ไม่มี entry</p>
            )}
          </div>
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

### Date Header Component

```typescript
// src/components/dashboard/DateHeader.tsx
import { cn } from '@/lib/utils';
import { formatThaiDayDate } from '@/lib/utils/thai-date';

interface DateHeaderProps {
  date: string; // ISO date string YYYY-MM-DD
  totalHours: number;
  entryCount: number;
  isEmpty?: boolean;
}

export function DateHeader({
  date,
  totalHours,
  entryCount,
  isEmpty = false,
}: DateHeaderProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between py-2 px-1',
        'border-b',
        isEmpty && 'opacity-50'
      )}
    >
      <div className="flex items-center gap-2">
        <span className={cn(
          'text-sm font-medium',
          isEmpty && 'text-muted-foreground'
        )}>
          {formatThaiDayDate(date)}
        </span>
        {!isEmpty && (
          <span className="text-xs text-muted-foreground">
            ({entryCount} รายการ)
          </span>
        )}
      </div>

      <span className={cn(
        'text-sm font-semibold',
        isEmpty ? 'text-muted-foreground' : 'text-primary'
      )}>
        {totalHours.toFixed(1)} ชม.
      </span>
    </div>
  );
}
```

### Thai Day + Date Formatting

```typescript
// src/lib/utils/thai-date.ts - Add this function

const THAI_DAYS = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
const THAI_DAYS_SHORT = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];
const THAI_MONTHS_SHORT = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
  'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
];

/**
 * Format date as Thai day + date: "จันทร์ 30 ธ.ค."
 */
export function formatThaiDayDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const dayName = THAI_DAYS_SHORT[d.getDay()];
  const dayNum = d.getDate();
  const month = THAI_MONTHS_SHORT[d.getMonth()];

  return `${dayName} ${dayNum} ${month}`;
}

/**
 * Format date as full Thai day + date: "วันจันทร์ที่ 30 ธันวาคม 2567"
 */
export function formatThaiFullDayDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const dayName = THAI_DAYS[d.getDay()];
  const dayNum = d.getDate();
  const month = THAI_MONTHS[d.getMonth()];
  const year = toBuddhistYear(d.getFullYear());

  return `วัน${dayName}ที่ ${dayNum} ${month} ${year}`;
}

/**
 * Check if date is today
 */
export function isToday(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  return d.toDateString() === today.toDateString();
}
```

### Group Entries Utility

```typescript
// src/lib/dashboard/group-entries.ts
import { getDateRangeForPeriod } from '@/lib/dashboard/period-utils';
import type { TimeEntryWithRelations } from '@/types/domain';
import type { Period } from '@/types/dashboard';

export interface EntryGroup {
  date: string; // YYYY-MM-DD
  entries: TimeEntryWithRelations[];
  totalHours: number;
}

export function groupEntriesByDate(
  entries: TimeEntryWithRelations[],
  period: Period,
  includeEmptyDays: boolean = false
): EntryGroup[] {
  // Create a map of date -> entries
  const groupMap = new Map<string, TimeEntryWithRelations[]>();

  // Group entries by date
  entries.forEach((entry) => {
    const dateKey = entry.entry_date; // Already YYYY-MM-DD from DB
    if (!groupMap.has(dateKey)) {
      groupMap.set(dateKey, []);
    }
    groupMap.get(dateKey)!.push(entry);
  });

  // Get all dates in range if we need to show empty days
  let allDates: string[];
  if (includeEmptyDays && period !== 'today') {
    allDates = getDatesInPeriod(period);
  } else {
    allDates = Array.from(groupMap.keys());
  }

  // Sort dates descending (newest first)
  allDates.sort((a, b) => b.localeCompare(a));

  // Build result array
  return allDates.map((date) => {
    const dayEntries = groupMap.get(date) || [];
    // Sort entries within day by created_at descending
    dayEntries.sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    const totalMinutes = dayEntries.reduce(
      (sum, e) => sum + e.duration_minutes,
      0
    );

    return {
      date,
      entries: dayEntries,
      totalHours: totalMinutes / 60,
    };
  });
}

/**
 * Get all dates in a period as YYYY-MM-DD strings
 */
function getDatesInPeriod(period: Period): string[] {
  const { start, end } = getDateRangeForPeriod(period);
  const dates: string[] = [];
  const current = new Date(start);

  while (current <= end) {
    dates.push(current.toISOString().split('T')[0]);
    current.setDate(current.getDate() + 1);
  }

  return dates;
}
```

### Enhanced Stats Card for Weekly

```typescript
// src/components/dashboard/StatsCard.tsx - Add weekly average

interface StatsCardProps {
  stats: DashboardStats;
  period: Period;
}

// Inside StatsCard component, add this section for weekly:
{period === 'week' && (
  <div className="mt-2 pt-2 border-t">
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">เฉลี่ยต่อวัน</span>
      <span className="font-medium">
        {(stats.totalHours / 7).toFixed(1)} ชม.
      </span>
    </div>
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">วันทำงาน (จ-ศ)</span>
      <span className="font-medium">
        {(stats.totalHours / 5).toFixed(1)} ชม./วัน
      </span>
    </div>
  </div>
)}
```

### Dashboard Content Update

```typescript
// src/components/dashboard/DashboardContent.tsx - Update for weekly
import { GroupedEntryList } from '@/components/dashboard/GroupedEntryList';
import { EntryList } from '@/components/dashboard/EntryList';

export async function DashboardContent({ period }: DashboardContentProps) {
  const dateRange = getDateRangeForPeriod(period);

  const [entries, stats] = await Promise.all([
    getUserEntries(dateRange),
    getDashboardStats(dateRange, period),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <StatsCard stats={stats} period={period} />

      {/* Use different list component based on period */}
      {period === 'today' ? (
        <EntryList entries={entries} />
      ) : (
        <GroupedEntryList
          entries={entries}
          period={period}
          showEmptyDays={period === 'week'}
        />
      )}
    </div>
  );
}
```

### Week Calculation Unit Tests

```typescript
// src/lib/dashboard/__tests__/period-utils.test.ts
import { describe, it, expect } from 'vitest';
import { getDateRangeForPeriod } from '../period-utils';

describe('getDateRangeForPeriod - week', () => {
  it('returns Monday to Sunday for week period', () => {
    // Mock current date as Wednesday Dec 31, 2025
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-12-31T12:00:00'));

    const { start, end } = getDateRangeForPeriod('week');

    // Week of Dec 29, 2025 (Mon) to Jan 4, 2026 (Sun)
    expect(start.toISOString().split('T')[0]).toBe('2025-12-29');
    expect(end.toISOString().split('T')[0]).toBe('2026-01-04');

    vi.useRealTimers();
  });

  it('handles week starting on Sunday correctly', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-12-28T12:00:00')); // Sunday

    const { start, end } = getDateRangeForPeriod('week');

    // Previous week's Monday to this Sunday
    expect(start.toISOString().split('T')[0]).toBe('2025-12-22');
    expect(end.toISOString().split('T')[0]).toBe('2025-12-28');

    vi.useRealTimers();
  });

  it('handles week starting on Monday correctly', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-12-29T12:00:00')); // Monday

    const { start, end } = getDateRangeForPeriod('week');

    expect(start.toISOString().split('T')[0]).toBe('2025-12-29');
    expect(end.toISOString().split('T')[0]).toBe('2026-01-04');

    vi.useRealTimers();
  });
});
```

### Project Structure Update

```
src/
├── components/
│   └── dashboard/
│       ├── PeriodSelector.tsx        # From 5-1
│       ├── DashboardContent.tsx      # MODIFY
│       ├── StatsCard.tsx             # ENHANCE (weekly average)
│       ├── EntryList.tsx             # From 5-2
│       ├── EntryCard.tsx             # From 5-2
│       ├── GroupedEntryList.tsx      # NEW
│       ├── DateHeader.tsx            # NEW
│       ├── EntryDetailsSheet.tsx     # From 5-2
│       ├── EmptyState.tsx            # From 5-2
│       └── DashboardSkeleton.tsx     # From 5-1
├── lib/
│   ├── dashboard/
│   │   ├── period-utils.ts           # From 5-1
│   │   ├── group-entries.ts          # NEW
│   │   └── __tests__/
│   │       └── period-utils.test.ts  # NEW
│   └── utils/
│       └── thai-date.ts              # ENHANCE (add formatThaiDayDate)
```

### Design Decision: Empty Days

**Option A: Show empty days (Recommended)**
- More context about which days are missing
- Clear visual of week progress
- Better for compliance tracking

**Option B: Skip empty days**
- Cleaner list
- Less scrolling
- Focus on what exists

**Recommendation:** Show empty days for week view, skip for month view (too many potential empty days).

### Performance Considerations

1. **Grouping**: Done on client with useMemo to avoid re-computation
2. **Rendering**: Each group renders independently
3. **Empty days**: Pre-computed based on period range

### Accessibility

- Date headers are semantic `<h3>` or have appropriate role
- Groups are visually and semantically distinct
- Screen readers announce: "จันทร์ 30 ธ.ค., 4.5 ชั่วโมง, 3 รายการ"

### Testing Considerations

```typescript
// test/e2e/dashboard/weekly-entries.test.ts
import { test, expect } from '@playwright/test';

test.describe('Weekly Entries View', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard?period=week');
  });

  test('displays entries grouped by date', async ({ page }) => {
    const dateHeaders = page.locator('[data-testid="date-header"]');
    await expect(dateHeaders.first()).toBeVisible();
    await expect(dateHeaders.first()).toContainText(/ชม\./);
  });

  test('shows Thai day names in headers', async ({ page }) => {
    const header = page.locator('[data-testid="date-header"]').first();
    await expect(header).toContainText(/จ\.|อ\.|พ\.|พฤ\.|ศ\.|ส\.|อา\./);
  });

  test('shows weekly average in stats', async ({ page }) => {
    await expect(page.getByText('เฉลี่ยต่อวัน')).toBeVisible();
  });

  test('opens bottom sheet on entry tap', async ({ page }) => {
    await page.locator('[data-testid="entry-card"]').first().click();
    await expect(page.getByRole('dialog')).toBeVisible();
  });
});
```

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 5.3]
- [Source: _bmad-output/planning-artifacts/prd.md#FR18]
- [Source: _bmad-output/implementation-artifacts/5-1-dashboard-layout-period-selector.md]
- [Source: _bmad-output/implementation-artifacts/5-2-todays-entries-view.md]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Weekly View]

## Definition of Done

- [x] GroupedEntryList component created
- [x] DateHeader component with Thai day + date format
- [x] Entries grouped by date (newest first)
- [x] Daily subtotals displayed in headers
- [x] Weekly total and average shown in StatsCard
- [x] Empty days shown with muted styling (for week view)
- [x] Week calculation is Monday-Sunday (ISO week)
- [x] Entry tap opens bottom sheet (reuse from 5-2)
- [x] Year boundary edge cases handled
- [x] Unit tests for week calculation
- [x] Mobile-optimized layout

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Completion Notes List

1. **TDD Approach**: All features implemented using Red-Green-Refactor cycle
2. **Date Formatting**: Used English format (e.g., "Wed, Jan 15") for international consistency
3. **Empty Days**: Week view shows all 7 days including empty ones; month view skips empty days
4. **Year Boundary**: getDaysInRange utility handles cross-year weeks correctly (AC7)
5. **Component Reuse**: Leveraged EntryCard, EntryDetailsSheet, and DeleteConfirmDialog from Story 5-2
6. **Weekly Stats**: Added average per day (÷7) and workday average (÷5) calculations
7. **Performance**: groupEntriesByDate uses useMemo for efficient re-computation

### File List

**Created:**
- `src/components/dashboard/GroupedEntryList.tsx` - Client component for grouped entry display
- `src/components/dashboard/GroupedEntryList.test.tsx` - 9 unit tests
- `src/components/dashboard/DateHeader.tsx` - Date header with subtotal
- `src/components/dashboard/DateHeader.test.tsx` - 10 unit tests
- `src/lib/dashboard/group-entries.ts` - Entry grouping utility
- `src/lib/dashboard/group-entries.test.ts` - 10 unit tests

**Modified:**
- `src/lib/dashboard/period-utils.ts` - Added getDaysInRange function
- `src/lib/dashboard/period-utils.test.ts` - Added 5 tests for getDaysInRange
- `src/components/dashboard/StatsCard.tsx` - Added weekly average display with named constants
- `src/components/dashboard/StatsCard.test.tsx` - Added 5 tests for weekly stats
- `src/components/dashboard/DashboardContent.tsx` - Integrated GroupedEntryList for week/month
- `src/components/dashboard/index.ts` - Added exports for new components
- `src/constants/business.ts` - Added DAYS_PER_WEEK and WORK_DAYS_PER_WEEK constants

## Senior Developer Review (AI)

**Reviewer:** Claude Opus 4.5 (Adversarial Code Review)
**Date:** 2026-01-03

### Review Summary

| Category | Count | Fixed |
|----------|-------|-------|
| CRITICAL | 0 | - |
| HIGH | 0 | - |
| MEDIUM | 3 | 2 fixed, 1 dismissed |
| LOW | 3 | 3 fixed |

### Issues Found & Resolution

**MEDIUM:**
1. **[DISMISSED] AC2 Date Format** - Story AC specifies Thai format "จันทร์ 30 ธ.ค." but English format used. User confirmed English is correct for international consistency.
2. **[FIXED] Incomplete File List** - Updated File List to include `business.ts` modification.
3. **[FIXED] Untracked business.ts** - File staged for commit.

**LOW:**
1. **[FIXED] Magic Numbers in StatsCard** - Replaced hardcoded `7` and `5` with named constants `DAYS_PER_WEEK` and `WORK_DAYS_PER_WEEK` in `src/constants/business.ts`.
2. **[FIXED] No Semantic Heading in DateHeader** - Added `role="heading"` and `aria-level={3}` to DateHeader for screen reader accessibility. Added test.
3. **[FIXED] React forwardRef Warnings** - Fixed `SheetOverlay` and `AlertDialogOverlay` to use `React.forwardRef` to eliminate console warnings in tests.

### Files Modified During Review

- `src/constants/business.ts` - Added DAYS_PER_WEEK, WORK_DAYS_PER_WEEK constants
- `src/components/dashboard/StatsCard.tsx` - Use named constants
- `src/components/dashboard/DateHeader.tsx` - Added semantic heading role
- `src/components/dashboard/DateHeader.test.tsx` - Added accessibility test
- `src/components/ui/sheet.tsx` - Fixed SheetOverlay forwardRef
- `src/components/ui/alert-dialog.tsx` - Fixed AlertDialogOverlay forwardRef

### Verification

- ✅ All 82 dashboard tests pass (including new accessibility test)
- ✅ ESLint passes with no warnings
- ✅ All tasks and subtasks verified as complete
- ✅ All ACs implemented correctly
- ✅ Console warnings eliminated

### Outcome: **APPROVED**
