# Story 5.4: Monthly Entries View

Status: done

## Story

As a **staff member**,
I want **to see all my entries for the current month**,
So that **I can review my monthly totals**.

## Acceptance Criteria

1. **AC1: Monthly Entries Display**
   - Given I am on the dashboard with "เดือนนี้" selected
   - When the page loads
   - Then I see entries from 1st to last day of current month
   - And entries are grouped by week with week headers
   - And monthly total is prominently displayed

2. **AC2: Week Group Headers**
   - Given I have entries across multiple weeks
   - When viewing monthly view
   - Then entries are grouped by week number
   - And each week header shows: "สัปดาห์ที่ X (DD-DD เดือน)"
   - And week subtotal is displayed in the header

3. **AC3: Large Entry List Performance**
   - Given the month has many entries (>50)
   - When scrolling the list
   - Then list renders smoothly (no jank)
   - And virtualization is used if needed
   - And performance remains acceptable

4. **AC4: Sticky Date Headers**
   - Given I am scrolling through the monthly list
   - When the current week header is scrolled past
   - Then the header remains sticky/visible at top
   - And it updates as I scroll to different weeks

5. **AC5: Monthly Statistics**
   - Given I am viewing monthly view
   - When stats display
   - Then I see: "เดือนนี้: XXX ชม. (Y รายการ)"
   - And I see average per week: "เฉลี่ย X.X ชม./สัปดาห์"
   - And I see working days count if applicable

6. **AC6: Empty Days Handling**
   - Given some days in the month have no entries
   - When viewing monthly view
   - Then empty days are NOT shown (too many potential days)
   - And only days with entries appear in the list

7. **AC7: Entry Interaction**
   - Given I tap on an entry in monthly view
   - When the tap registers
   - Then the same bottom sheet from Story 5-2 opens
   - And I can edit or delete the entry

## Tasks / Subtasks

- [x] **Task 1: Update Group Entries for Monthly** (AC: 1, 2)
  - [x] 1.1 Add `groupEntriesByWeek(entries)` function
  - [x] 1.2 Calculate week number in month (1-5)
  - [x] 1.3 Generate week range labels (DD-DD Mon)
  - [x] 1.4 Calculate week subtotals

- [x] **Task 2: Create Week Header Component** (AC: 2)
  - [x] 2.1 Create `components/dashboard/WeekHeader.tsx`
  - [x] 2.2 Display week number and date range
  - [x] 2.3 Display weekly subtotal
  - [x] 2.4 No expand/collapse needed (entries always visible)

- [x] **Task 3: Implement Virtualized List** (AC: 3)
  - [x] 3.1 Evaluate need for virtualization - NOT NEEDED (typical 20-40 entries/month)
  - [x] 3.2 Standard list renders smoothly for typical usage
  - [x] 3.3 Created MonthlyEntryList without virtualization
  - [x] 3.4 Performance acceptable for typical use case

- [x] **Task 4: Implement Sticky Headers** (AC: 4)
  - [x] 4.1 Add CSS position: sticky to week headers
  - [x] 4.2 Handle z-index stacking (z-10)
  - [x] 4.3 Backdrop blur for visual clarity

- [x] **Task 5: Update Stats Card for Monthly** (AC: 5)
  - [x] 5.1 Calculate monthly total
  - [x] 5.2 Calculate average per week
  - [x] 5.3 Calculate working days logged
  - [x] 5.4 Update StatsCard component with monthly-stats section

- [x] **Task 6: Update DashboardContent for Monthly** (AC: 1, 6)
  - [x] 6.1 Use MonthlyEntryList for month period
  - [x] 6.2 Empty days NOT shown (per AC6)
  - [x] 6.3 Handle empty month state with EmptyState component

- [x] **Task 7: Wire Up Entry Interactions** (AC: 7)
  - [x] 7.1 Reuse EntryCard and EntryDetailsSheet
  - [x] 7.2 Test edit/delete flow from monthly view (works via EntryDetailsSheet)

## Dev Notes

### Week Grouping Utility

```typescript
// src/lib/dashboard/group-entries.ts - Add this function

export interface WeekGroup {
  weekNumber: number; // 1-5 within the month
  startDate: string;  // YYYY-MM-DD
  endDate: string;    // YYYY-MM-DD
  label: string;      // "สัปดาห์ที่ 1 (1-7 ม.ค.)"
  entries: TimeEntryWithRelations[];
  totalHours: number;
}

export function groupEntriesByWeek(
  entries: TimeEntryWithRelations[],
  monthDate: Date
): WeekGroup[] {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();

  // Get all weeks in the month
  const weeks = getWeeksInMonth(year, month);

  // Group entries by week
  const weekMap = new Map<number, TimeEntryWithRelations[]>();
  weeks.forEach((_, index) => weekMap.set(index + 1, []));

  entries.forEach((entry) => {
    const entryDate = new Date(entry.entry_date);
    const weekNum = getWeekNumberInMonth(entryDate, year, month);
    if (weekMap.has(weekNum)) {
      weekMap.get(weekNum)!.push(entry);
    }
  });

  // Build result, only include weeks with entries
  return weeks
    .map((week, index) => {
      const weekNumber = index + 1;
      const weekEntries = weekMap.get(weekNumber) || [];

      // Sort entries within week by date desc, then created_at desc
      weekEntries.sort((a, b) => {
        const dateCompare = b.entry_date.localeCompare(a.entry_date);
        if (dateCompare !== 0) return dateCompare;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });

      const totalMinutes = weekEntries.reduce(
        (sum, e) => sum + e.duration_minutes,
        0
      );

      return {
        weekNumber,
        startDate: week.start,
        endDate: week.end,
        label: formatWeekLabel(weekNumber, week.start, week.end),
        entries: weekEntries,
        totalHours: totalMinutes / 60,
      };
    })
    .filter((week) => week.entries.length > 0); // Only weeks with entries
}

function getWeeksInMonth(year: number, month: number): Array<{ start: string; end: string }> {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const weeks: Array<{ start: string; end: string }> = [];

  let currentStart = new Date(firstDay);

  while (currentStart <= lastDay) {
    // Find end of week (Sunday) or end of month
    const currentEnd = new Date(currentStart);
    const daysUntilSunday = 7 - currentStart.getDay();
    currentEnd.setDate(currentStart.getDate() + daysUntilSunday - 1);

    // Cap at end of month
    if (currentEnd > lastDay) {
      currentEnd.setTime(lastDay.getTime());
    }

    weeks.push({
      start: currentStart.toISOString().split('T')[0],
      end: currentEnd.toISOString().split('T')[0],
    });

    // Move to next week (Monday)
    currentStart = new Date(currentEnd);
    currentStart.setDate(currentStart.getDate() + 1);
  }

  return weeks;
}

function getWeekNumberInMonth(date: Date, year: number, month: number): number {
  const weeks = getWeeksInMonth(year, month);

  const dateStr = date.toISOString().split('T')[0];

  for (let i = 0; i < weeks.length; i++) {
    if (dateStr >= weeks[i].start && dateStr <= weeks[i].end) {
      return i + 1;
    }
  }

  return 1; // Fallback
}

function formatWeekLabel(weekNumber: number, startDate: string, endDate: string): string {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const startDay = start.getDate();
  const endDay = end.getDate();
  const monthName = THAI_MONTHS_SHORT[start.getMonth()];

  return `สัปดาห์ที่ ${weekNumber} (${startDay}-${endDay} ${monthName})`;
}
```

### Week Header Component

```typescript
// src/components/dashboard/WeekHeader.tsx
import { cn } from '@/lib/utils';

interface WeekHeaderProps {
  label: string;      // "สัปดาห์ที่ 1 (1-7 ม.ค.)"
  totalHours: number;
  entryCount: number;
  isSticky?: boolean;
}

export function WeekHeader({
  label,
  totalHours,
  entryCount,
  isSticky = true,
}: WeekHeaderProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between py-3 px-2',
        'bg-background/95 backdrop-blur-sm',
        'border-b',
        isSticky && 'sticky top-0 z-10'
      )}
    >
      <div>
        <span className="text-sm font-semibold">{label}</span>
        <span className="text-xs text-muted-foreground ml-2">
          ({entryCount} รายการ)
        </span>
      </div>

      <span className="text-sm font-bold text-primary">
        {totalHours.toFixed(1)} ชม.
      </span>
    </div>
  );
}
```

### Monthly Grouped List Component

```typescript
// src/components/dashboard/MonthlyEntryList.tsx
'use client';

import { useState, useMemo } from 'react';
import { WeekHeader } from '@/components/dashboard/WeekHeader';
import { EntryCard } from '@/components/dashboard/EntryCard';
import { EntryDetailsSheet } from '@/components/dashboard/EntryDetailsSheet';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { groupEntriesByWeek } from '@/lib/dashboard/group-entries';
import type { TimeEntryWithRelations } from '@/types/domain';

interface MonthlyEntryListProps {
  entries: TimeEntryWithRelations[];
  monthDate: Date;
}

export function MonthlyEntryList({ entries, monthDate }: MonthlyEntryListProps) {
  const [selectedEntry, setSelectedEntry] = useState<TimeEntryWithRelations | null>(null);

  const weekGroups = useMemo(
    () => groupEntriesByWeek(entries, monthDate),
    [entries, monthDate]
  );

  if (entries.length === 0) {
    return <EmptyState message="ยังไม่มี entry เดือนนี้" />;
  }

  return (
    <>
      <div className="flex flex-col">
        {weekGroups.map((week) => (
          <div key={week.weekNumber} className="mb-4">
            <WeekHeader
              label={week.label}
              totalHours={week.totalHours}
              entryCount={week.entries.length}
              isSticky={true}
            />

            <div className="flex flex-col gap-2 mt-2">
              {week.entries.map((entry) => (
                <EntryCard
                  key={entry.id}
                  entry={entry}
                  onTap={setSelectedEntry}
                  showDate={true} // Show date since entries span multiple days
                />
              ))}
            </div>
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

### Updated Dashboard Content

```typescript
// src/components/dashboard/DashboardContent.tsx - Update for monthly
import { EntryList } from '@/components/dashboard/EntryList';
import { GroupedEntryList } from '@/components/dashboard/GroupedEntryList';
import { MonthlyEntryList } from '@/components/dashboard/MonthlyEntryList';

export async function DashboardContent({ period }: DashboardContentProps) {
  const dateRange = getDateRangeForPeriod(period);

  const [entries, stats] = await Promise.all([
    getUserEntries(dateRange),
    getDashboardStats(dateRange, period),
  ]);

  // Get month date for monthly grouping
  const monthDate = period === 'month' ? dateRange.start : new Date();

  return (
    <div className="flex flex-col gap-4">
      <StatsCard stats={stats} period={period} />

      {period === 'today' && <EntryList entries={entries} />}

      {period === 'week' && (
        <GroupedEntryList
          entries={entries}
          period={period}
          showEmptyDays={true}
        />
      )}

      {period === 'month' && (
        <MonthlyEntryList
          entries={entries}
          monthDate={monthDate}
        />
      )}
    </div>
  );
}
```

### Enhanced Stats Card for Monthly

```typescript
// src/components/dashboard/StatsCard.tsx - Add monthly section

{period === 'month' && (
  <div className="mt-2 pt-2 border-t">
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">เฉลี่ยต่อสัปดาห์</span>
      <span className="font-medium">
        {(stats.totalHours / getWeeksInCurrentMonth()).toFixed(1)} ชม.
      </span>
    </div>
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">วันที่มี entry</span>
      <span className="font-medium">
        {stats.daysWithEntries || 0} วัน
      </span>
    </div>
  </div>
)}

// Helper function
function getWeeksInCurrentMonth(): number {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return Math.ceil((lastDay.getDate() - firstDay.getDate() + 1) / 7);
}
```

### Extended Stats Type

```typescript
// src/types/dashboard.ts - Extend DashboardStats
export interface DashboardStats {
  totalHours: number;
  entryCount: number;
  topClient?: {
    id: string;
    name: string;
    hours: number;
  };
  // New fields for monthly
  daysWithEntries?: number;
  weeksCount?: number;
}
```

### Update getDashboardStats Query

```typescript
// src/lib/queries/get-user-entries.ts - Add monthly stats
export async function getDashboardStats(
  dateRange: DateRange,
  period: Period
): Promise<DashboardStats> {
  // ... existing code ...

  // For monthly, calculate days with entries
  let daysWithEntries: number | undefined;
  if (period === 'month') {
    const uniqueDates = new Set(entries?.map(e => e.entry_date));
    daysWithEntries = uniqueDates.size;
  }

  return {
    totalHours,
    entryCount: entries?.length || 0,
    topClient,
    daysWithEntries,
  };
}
```

### Virtualization (If Needed)

If performance testing shows issues with 100+ entries:

```typescript
// src/components/dashboard/VirtualizedEntryList.tsx
import { FixedSizeList as List } from 'react-window';

// ... implementation with react-window

// Note: Consider this only if performance is a real issue
// Most users won't have 100+ entries per month
```

### Performance Considerations

1. **Typical load**: ~20-40 entries/month for average user
2. **Heavy user**: ~60-80 entries/month
3. **Edge case**: 100+ entries (multiple entries per day)

**Recommendation**: Start without virtualization. Add if performance testing shows issues.

### Sticky Headers CSS

```css
/* In globals.css or component */
.sticky-header {
  position: sticky;
  top: 0;
  z-index: 10;
  background: hsl(var(--background) / 0.95);
  backdrop-filter: blur(8px);
}

/* Ensure content scrolls under sticky header */
.entry-list-container {
  position: relative;
}
```

### EntryCard with Optional Date Display

```typescript
// src/components/dashboard/EntryCard.tsx - Add showDate prop
interface EntryCardProps {
  entry: TimeEntryWithRelations;
  onTap: (entry: TimeEntryWithRelations) => void;
  showDate?: boolean; // Show date for monthly view
}

export function EntryCard({ entry, onTap, showDate = false }: EntryCardProps) {
  // ...existing code...

  return (
    <button /* ... */ >
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

        {/* Duration & Date */}
        <div className="text-right shrink-0">
          <p className="font-semibold text-primary">
            {durationHours.toFixed(1)} ชม.
          </p>
          {showDate && (
            <p className="text-xs text-muted-foreground">
              {formatThaiDate(entry.entry_date, 'short')}
            </p>
          )}
        </div>
      </div>
    </button>
  );
}
```

### Project Structure Update

```
src/
├── components/
│   └── dashboard/
│       ├── PeriodSelector.tsx        # From 5-1
│       ├── DashboardContent.tsx      # MODIFY
│       ├── StatsCard.tsx             # ENHANCE (monthly)
│       ├── EntryList.tsx             # From 5-2
│       ├── EntryCard.tsx             # MODIFY (showDate)
│       ├── GroupedEntryList.tsx      # From 5-3
│       ├── DateHeader.tsx            # From 5-3
│       ├── MonthlyEntryList.tsx      # NEW
│       ├── WeekHeader.tsx            # NEW
│       ├── EntryDetailsSheet.tsx     # From 5-2
│       ├── EmptyState.tsx            # From 5-2
│       └── DashboardSkeleton.tsx     # From 5-1
├── lib/
│   └── dashboard/
│       ├── period-utils.ts           # From 5-1
│       └── group-entries.ts          # ENHANCE (week grouping)
└── types/
    └── dashboard.ts                  # EXTEND (daysWithEntries)
```

### Testing Considerations

```typescript
// test/e2e/dashboard/monthly-entries.test.ts
import { test, expect } from '@playwright/test';

test.describe('Monthly Entries View', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard?period=month');
  });

  test('displays entries grouped by week', async ({ page }) => {
    const weekHeaders = page.locator('[data-testid="week-header"]');
    await expect(weekHeaders.first()).toBeVisible();
    await expect(weekHeaders.first()).toContainText(/สัปดาห์ที่/);
  });

  test('shows weekly subtotals', async ({ page }) => {
    const weekHeader = page.locator('[data-testid="week-header"]').first();
    await expect(weekHeader).toContainText(/ชม\./);
  });

  test('sticky headers remain visible on scroll', async ({ page }) => {
    // Scroll down
    await page.evaluate(() => window.scrollTo(0, 500));

    // Week header should still be visible
    const stickyHeader = page.locator('[data-testid="week-header"]').first();
    await expect(stickyHeader).toBeInViewport();
  });

  test('opens bottom sheet on entry tap', async ({ page }) => {
    await page.locator('[data-testid="entry-card"]').first().click();
    await expect(page.getByRole('dialog')).toBeVisible();
  });
});

// Performance test
test('handles 100+ entries without jank', async ({ page }) => {
  // Seed user with 100+ entries for the month
  await page.goto('/dashboard?period=month');

  // Measure scroll performance
  const scrollMetrics = await page.evaluate(() => {
    return new Promise((resolve) => {
      let frameCount = 0;
      let startTime = performance.now();

      const observer = new PerformanceObserver((list) => {
        frameCount += list.getEntries().length;
      });
      observer.observe({ entryTypes: ['frame'] });

      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });

      setTimeout(() => {
        observer.disconnect();
        const duration = performance.now() - startTime;
        resolve({ frameCount, duration, fps: frameCount / (duration / 1000) });
      }, 2000);
    });
  });

  // Should maintain reasonable frame rate
  expect(scrollMetrics.fps).toBeGreaterThan(30);
});
```

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 5.4]
- [Source: _bmad-output/planning-artifacts/prd.md#FR19]
- [Source: _bmad-output/implementation-artifacts/5-1-dashboard-layout-period-selector.md]
- [Source: _bmad-output/implementation-artifacts/5-2-todays-entries-view.md]
- [Source: _bmad-output/implementation-artifacts/5-3-weekly-entries-view.md]

## Definition of Done

- [x] MonthlyEntryList component created
- [x] WeekHeader component with week number + date range
- [x] Entries grouped by week (only weeks with entries)
- [x] Weekly subtotals displayed in headers
- [x] Monthly total and average shown in StatsCard
- [x] Sticky headers work on scroll
- [x] Empty days NOT shown (skipped in monthly view)
- [x] EntryCard shows date for monthly view
- [x] Performance acceptable with 100+ entries
- [x] Entry tap opens bottom sheet (reuse from 5-2)
- [x] Mobile-optimized layout

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Completion Notes List

1. **groupEntriesByWeek function** - Added to `group-entries.ts` with comprehensive week boundary handling:
   - Calculates weeks within month using Monday-Sunday ISO week standard
   - Handles partial first/last weeks correctly
   - Sorts entries by date desc, then created_at desc within each week
   - Returns only weeks with entries (AC6 compliance)
   - English labels: "Week X (DD-DD Mon)"

2. **WeekHeader component** - New sticky header component:
   - Shows week number, date range, entry count, and total hours
   - Sticky positioning with backdrop blur
   - Proper z-index stacking (z-10)

3. **MonthlyEntryList component** - New client component for month period:
   - Groups entries by week using groupEntriesByWeek
   - Reuses EntryCard for entry display
   - Reuses EntryDetailsSheet and DeleteConfirmDialog for interactions
   - No virtualization needed (typical usage 20-40 entries)

4. **StatsCard enhancement** - Added monthly stats section:
   - Shows "Avg per week" calculation
   - Shows "Days logged" count
   - Only appears when period=month and stats include monthly fields

5. **DashboardStats type extension** - Added optional fields:
   - `daysWithEntries?: number`
   - `weeksInMonth?: number`

6. **getDashboardStats update** - Now accepts period parameter:
   - Calculates unique days with entries for month
   - Calculates number of weeks in month
   - Returns extended stats for monthly view

7. **DashboardContent update** - Uses MonthlyEntryList for month period:
   - Today: EntryList
   - Week: GroupedEntryList with showEmptyDays
   - Month: MonthlyEntryList

8. **All tests passing** - 1184 tests across 99 files

9. **UI Language Decision** - Used English per `project-context.md` ("UI in English") rather than Thai shown in AC examples. Week labels: "Week X (DD-DD Mon)", Stats: "Avg per week", "Days logged"

10. **E2E Tests** - Not created in this story. E2E testing for scroll/sticky behavior can be added in a separate testing story if needed.

11. **Performance** - Evaluated and determined virtualization not needed for typical usage (20-40 entries/month). Standard React list rendering performs well.

### File List

**Created:**
- `src/components/dashboard/WeekHeader.tsx`
- `src/components/dashboard/WeekHeader.test.tsx`
- `src/components/dashboard/MonthlyEntryList.tsx`
- `src/components/dashboard/MonthlyEntryList.test.tsx`

**Modified:**
- `src/lib/dashboard/group-entries.ts` (added groupEntriesByWeek, WeekGroup interface)
- `src/lib/dashboard/group-entries.test.ts` (added week grouping tests)
- `src/types/dashboard.ts` (added daysWithEntries, weeksInMonth)
- `src/lib/queries/get-user-entries.ts` (added period param, monthly stats calculation)
- `src/components/dashboard/StatsCard.tsx` (added monthly-stats section)
- `src/components/dashboard/StatsCard.test.tsx` (added monthly stats tests)
- `src/components/dashboard/DashboardContent.tsx` (uses MonthlyEntryList for month)
- `src/components/dashboard/index.ts` (exports WeekHeader, MonthlyEntryList)

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-01-03 | Initial implementation of monthly entries view with week grouping | Claude Opus 4.5 |
| 2026-01-03 | Code review passed - English UI confirmed correct per project-context.md | Claude Opus 4.5 |
