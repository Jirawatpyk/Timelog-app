# Story 5.3: Weekly Entries View

Status: ready-for-dev

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

- [ ] **Task 1: Create Grouped Entry List Component** (AC: 1, 2)
  - [ ] 1.1 Create `components/dashboard/GroupedEntryList.tsx`
  - [ ] 1.2 Group entries by entry_date
  - [ ] 1.3 Sort groups by date (newest first)
  - [ ] 1.4 Add date header component

- [ ] **Task 2: Create Date Header Component** (AC: 2, 3)
  - [ ] 2.1 Create `components/dashboard/DateHeader.tsx`
  - [ ] 2.2 Format Thai day name + date
  - [ ] 2.3 Display daily subtotal
  - [ ] 2.4 Style muted for empty/zero days

- [ ] **Task 3: Update Period Utils for Week** (AC: 7)
  - [ ] 3.1 Ensure `getDateRangeForPeriod('week')` is correct
  - [ ] 3.2 Create `getDaysInRange(start, end)` utility
  - [ ] 3.3 Handle year boundary edge cases
  - [ ] 3.4 Add unit tests for week calculation

- [ ] **Task 4: Create Daily Subtotal Calculation** (AC: 3)
  - [ ] 4.1 Create `groupEntriesByDate(entries)` utility
  - [ ] 4.2 Calculate subtotal per day
  - [ ] 4.3 Return with day info for header display

- [ ] **Task 5: Update Stats Card for Weekly** (AC: 4)
  - [ ] 5.1 Add average per day calculation
  - [ ] 5.2 Show working days count (Mon-Fri or all 7)
  - [ ] 5.3 Display average hours per day

- [ ] **Task 6: Handle Empty Days** (AC: 5)
  - [ ] 6.1 Decide: show empty days or skip them
  - [ ] 6.2 If showing, add muted empty day rows
  - [ ] 6.3 If skipping, ensure gaps don't confuse users

- [ ] **Task 7: Wire Up Entry Interactions** (AC: 6)
  - [ ] 7.1 Reuse EntryCard and EntryDetailsSheet from 5-2
  - [ ] 7.2 Pass onTap handler to grouped list
  - [ ] 7.3 Test edit/delete flow from weekly view

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

- [ ] GroupedEntryList component created
- [ ] DateHeader component with Thai day + date format
- [ ] Entries grouped by date (newest first)
- [ ] Daily subtotals displayed in headers
- [ ] Weekly total and average shown in StatsCard
- [ ] Empty days shown with muted styling (for week view)
- [ ] Week calculation is Monday-Sunday (ISO week)
- [ ] Entry tap opens bottom sheet (reuse from 5-2)
- [ ] Year boundary edge cases handled
- [ ] Unit tests for week calculation
- [ ] Mobile-optimized layout

## Dev Agent Record

### Agent Model Used

_To be filled by dev agent_

### Completion Notes List

_To be filled during implementation_

### File List

_To be filled with all created/modified files_
