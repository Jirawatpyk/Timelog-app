# Story 5.5: Total Hours Statistics

Status: ready-for-dev

## Story

As a **staff member**,
I want **to see aggregated statistics for my time entries**,
So that **I can understand my work patterns at a glance**.

## Acceptance Criteria

1. **AC1: Stats Card Display**
   - Given I am on the dashboard
   - When viewing any period (today, week, month)
   - Then I see a stats card at the top showing:
     - Total hours for the period
     - Number of entries
     - Most used Client (if data exists)

2. **AC2: Today's Period Stats**
   - Given period is "วันนี้" (today)
   - When stats display
   - Then I see: "วันนี้: X ชม. (Y รายการ)"
   - And total hours is prominently displayed
   - And entry count is shown in secondary text

3. **AC3: Weekly Period Stats**
   - Given period is "สัปดาห์นี้" (this week)
   - When stats display
   - Then I see: "สัปดาห์นี้: X ชม. (Y รายการ)"
   - And I see average per day: "เฉลี่ย X.X ชม./วัน"
   - And days are counted from entries, not calendar days

4. **AC4: Monthly Period Stats**
   - Given period is "เดือนนี้" (this month)
   - When stats display
   - Then I see: "เดือนนี้: XXX ชม. (Y รายการ)"
   - And I see average per week: "เฉลี่ย X.X ชม./สัปดาห์"
   - And I see days with entries count

5. **AC5: Most Used Client Display**
   - Given I have entries in the period
   - When stats display
   - Then I see the most frequently used client name
   - And I see hours logged for that client
   - And if no entries, this section is hidden

6. **AC6: Visual Progress Indicator (Optional Enhancement)**
   - Given period is "วันนี้"
   - When I have logged < 8 hours
   - Then I see a subtle progress indicator (not alarming)
   - And when I reach 8+ hours, I see "Done for today! ✓"

7. **AC7: Stats Responsiveness**
   - Given I save a new entry
   - When returning to dashboard
   - Then stats update immediately to reflect new data
   - And no manual refresh required

## Tasks / Subtasks

- [ ] **Task 1: Define Stats Types and Interfaces** (AC: 1)
  - [ ] 1.1 Create `DashboardStats` interface in `src/types/dashboard.ts`
  - [ ] 1.2 Define `Period` type ('today' | 'week' | 'month')
  - [ ] 1.3 Add `TopClient` interface for most used client

- [ ] **Task 2: Implement Stats Query Function** (AC: 1, 5)
  - [ ] 2.1 Create `getDashboardStats()` in `src/lib/queries/dashboard.ts`
  - [ ] 2.2 Calculate total hours from duration_minutes
  - [ ] 2.3 Count unique entries
  - [ ] 2.4 Query most used client with aggregation
  - [ ] 2.5 Add period-specific calculations (avg/day, avg/week)

- [ ] **Task 3: Create StatsCard Component** (AC: 1, 2, 3, 4)
  - [ ] 3.1 Create `src/components/dashboard/StatsCard.tsx`
  - [ ] 3.2 Display total hours prominently (large font)
  - [ ] 3.3 Display entry count in secondary text
  - [ ] 3.4 Conditional display based on period (daily/weekly/monthly)
  - [ ] 3.5 Style with shadcn/ui Card component

- [ ] **Task 4: Implement Period-Specific Stats** (AC: 2, 3, 4)
  - [ ] 4.1 Today: Total hours + entry count
  - [ ] 4.2 Week: Total + avg per day + days with entries
  - [ ] 4.3 Month: Total + avg per week + days with entries

- [ ] **Task 5: Add Most Used Client Section** (AC: 5)
  - [ ] 5.1 Create TopClientDisplay sub-component
  - [ ] 5.2 Query client with highest total hours
  - [ ] 5.3 Handle empty state (no entries)

- [ ] **Task 6: Optional: Progress Indicator** (AC: 6)
  - [ ] 6.1 Add progress bar for today's hours
  - [ ] 6.2 Show "Done for today! ✓" at 8+ hours
  - [ ] 6.3 Keep indicator subtle (per UX spec)

- [ ] **Task 7: Integrate StatsCard in Dashboard** (AC: 7)
  - [ ] 7.1 Add StatsCard to DashboardContent component
  - [ ] 7.2 Pass stats data as props
  - [ ] 7.3 Ensure real-time update via revalidatePath

- [ ] **Task 8: Unit Tests** (AC: All)
  - [ ] 8.1 Test getDashboardStats calculations
  - [ ] 8.2 Test StatsCard rendering for each period
  - [ ] 8.3 Test empty state handling

## Dev Notes

### Architecture Compliance

**Required Patterns:**
- Server Component for StatsCard (no TanStack Query on Dashboard)
- Use `revalidatePath('/dashboard')` after entry mutations
- Return `ActionResult<T>` from any Server Actions
- Use `@/` import aliases only

**File Locations:**
- Component: `src/components/dashboard/StatsCard.tsx`
- Types: `src/types/dashboard.ts`
- Query: `src/lib/queries/dashboard.ts` or `src/lib/queries/get-user-entries.ts`

### Types Definition

```typescript
// src/types/dashboard.ts

export type Period = 'today' | 'week' | 'month';

export interface TopClient {
  id: string;
  name: string;
  hours: number;
}

export interface DashboardStats {
  totalHours: number;
  entryCount: number;
  topClient?: TopClient;
  // Period-specific
  averagePerDay?: number;      // For week/month
  averagePerWeek?: number;     // For month
  daysWithEntries?: number;    // For week/month
  weeksWithEntries?: number;   // For month
}

export interface DateRange {
  start: Date;
  end: Date;
}
```

### Stats Query Implementation

```typescript
// src/lib/queries/dashboard.ts
import { createClient } from '@/lib/supabase/server';
import type { DashboardStats, Period, DateRange } from '@/types/dashboard';

export async function getDashboardStats(
  dateRange: DateRange,
  period: Period
): Promise<DashboardStats> {
  const supabase = await createClient();

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Format dates for query
  const startDate = dateRange.start.toISOString().split('T')[0];
  const endDate = dateRange.end.toISOString().split('T')[0];

  // Query entries for period
  const { data: entries, error } = await supabase
    .from('time_entries')
    .select(`
      id,
      duration_minutes,
      entry_date,
      job:jobs!inner(
        project:projects!inner(
          client:clients!inner(id, name)
        )
      )
    `)
    .eq('user_id', user.id)
    .gte('entry_date', startDate)
    .lte('entry_date', endDate);

  if (error) throw error;

  // Calculate total hours
  const totalMinutes = entries?.reduce((sum, e) => sum + e.duration_minutes, 0) || 0;
  const totalHours = totalMinutes / 60;

  // Calculate entry count
  const entryCount = entries?.length || 0;

  // Find most used client
  let topClient: TopClient | undefined;
  if (entries && entries.length > 0) {
    const clientHours = new Map<string, { name: string; hours: number }>();

    entries.forEach((entry) => {
      const clientId = entry.job?.project?.client?.id;
      const clientName = entry.job?.project?.client?.name;
      if (clientId && clientName) {
        const current = clientHours.get(clientId) || { name: clientName, hours: 0 };
        current.hours += entry.duration_minutes / 60;
        clientHours.set(clientId, current);
      }
    });

    // Find max
    let maxHours = 0;
    clientHours.forEach((value, key) => {
      if (value.hours > maxHours) {
        maxHours = value.hours;
        topClient = { id: key, name: value.name, hours: value.hours };
      }
    });
  }

  // Calculate period-specific stats
  let averagePerDay: number | undefined;
  let averagePerWeek: number | undefined;
  let daysWithEntries: number | undefined;

  if (period === 'week' || period === 'month') {
    const uniqueDates = new Set(entries?.map((e) => e.entry_date));
    daysWithEntries = uniqueDates.size;

    if (daysWithEntries > 0) {
      averagePerDay = totalHours / daysWithEntries;
    }
  }

  if (period === 'month') {
    // Calculate weeks in period
    const weeksInMonth = getWeeksInMonth(dateRange.start);
    if (weeksInMonth > 0) {
      averagePerWeek = totalHours / weeksInMonth;
    }
  }

  return {
    totalHours,
    entryCount,
    topClient,
    averagePerDay,
    averagePerWeek,
    daysWithEntries,
  };
}

function getWeeksInMonth(date: Date): number {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return Math.ceil((lastDay.getDate() - firstDay.getDate() + 1) / 7);
}
```

### StatsCard Component

```typescript
// src/components/dashboard/StatsCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { DashboardStats, Period } from '@/types/dashboard';

interface StatsCardProps {
  stats: DashboardStats;
  period: Period;
}

export function StatsCard({ stats, period }: StatsCardProps) {
  const periodLabels: Record<Period, string> = {
    today: 'วันนี้',
    week: 'สัปดาห์นี้',
    month: 'เดือนนี้',
  };

  // Check if "done for today" (8+ hours)
  const isDoneForToday = period === 'today' && stats.totalHours >= 8;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {periodLabels[period]}
        </CardTitle>
      </CardHeader>

      <CardContent>
        {/* Main stats */}
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold">
            {stats.totalHours.toFixed(1)}
          </span>
          <span className="text-lg text-muted-foreground">ชม.</span>
          <span className="text-sm text-muted-foreground">
            ({stats.entryCount} รายการ)
          </span>
        </div>

        {/* Done for today indicator */}
        {isDoneForToday && (
          <div className="mt-2 text-sm text-green-600 font-medium">
            Done for today! ✓
          </div>
        )}

        {/* Period-specific stats */}
        {period === 'week' && stats.averagePerDay !== undefined && (
          <div className="mt-3 pt-3 border-t">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">เฉลี่ยต่อวัน</span>
              <span className="font-medium">
                {stats.averagePerDay.toFixed(1)} ชม.
              </span>
            </div>
            {stats.daysWithEntries !== undefined && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">วันที่มี entry</span>
                <span className="font-medium">{stats.daysWithEntries} วัน</span>
              </div>
            )}
          </div>
        )}

        {period === 'month' && (
          <div className="mt-3 pt-3 border-t">
            {stats.averagePerWeek !== undefined && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">เฉลี่ยต่อสัปดาห์</span>
                <span className="font-medium">
                  {stats.averagePerWeek.toFixed(1)} ชม.
                </span>
              </div>
            )}
            {stats.daysWithEntries !== undefined && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">วันที่มี entry</span>
                <span className="font-medium">{stats.daysWithEntries} วัน</span>
              </div>
            )}
          </div>
        )}

        {/* Top client */}
        {stats.topClient && (
          <div className="mt-3 pt-3 border-t">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Client หลัก</span>
              <span className="font-medium truncate max-w-[150px]">
                {stats.topClient.name}
              </span>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span></span>
              <span>{stats.topClient.hours.toFixed(1)} ชม.</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

### Optional Progress Bar Component

```typescript
// src/components/dashboard/DailyProgress.tsx
import { cn } from '@/lib/utils';

interface DailyProgressProps {
  currentHours: number;
  targetHours?: number; // Default 8
}

export function DailyProgress({
  currentHours,
  targetHours = 8,
}: DailyProgressProps) {
  const progress = Math.min((currentHours / targetHours) * 100, 100);
  const isComplete = currentHours >= targetHours;

  return (
    <div className="w-full">
      {/* Progress bar */}
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full transition-all duration-500 rounded-full',
            isComplete ? 'bg-green-500' : 'bg-primary'
          )}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Label */}
      <div className="flex justify-between text-xs text-muted-foreground mt-1">
        <span>{currentHours.toFixed(1)} / {targetHours} ชม.</span>
        {isComplete && <span className="text-green-600">✓ ครบแล้ว</span>}
      </div>
    </div>
  );
}
```

### Integration in DashboardContent

```typescript
// src/components/dashboard/DashboardContent.tsx
import { StatsCard } from '@/components/dashboard/StatsCard';
import { getDashboardStats } from '@/lib/queries/dashboard';
import { getDateRangeForPeriod } from '@/lib/dashboard/period-utils';
import type { Period } from '@/types/dashboard';

interface DashboardContentProps {
  period: Period;
}

export async function DashboardContent({ period }: DashboardContentProps) {
  const dateRange = getDateRangeForPeriod(period);

  const [entries, stats] = await Promise.all([
    getUserEntries(dateRange),
    getDashboardStats(dateRange, period),
  ]);

  return (
    <div className="flex flex-col gap-4">
      {/* Stats Card at top */}
      <StatsCard stats={stats} period={period} />

      {/* Entry list based on period */}
      {/* ... existing entry list code ... */}
    </div>
  );
}
```

### Project Structure

```
src/
├── components/
│   └── dashboard/
│       ├── PeriodSelector.tsx        # From 5-1
│       ├── DashboardContent.tsx      # MODIFY - add StatsCard
│       ├── StatsCard.tsx             # NEW
│       ├── DailyProgress.tsx         # NEW (optional)
│       ├── EntryList.tsx             # From 5-2
│       ├── EntryCard.tsx             # From 5-2
│       ├── GroupedEntryList.tsx      # From 5-3
│       ├── DateHeader.tsx            # From 5-3
│       ├── MonthlyEntryList.tsx      # From 5-4
│       ├── WeekHeader.tsx            # From 5-4
│       ├── EntryDetailsSheet.tsx     # From 5-2
│       ├── EmptyState.tsx            # From 5-2
│       └── DashboardSkeleton.tsx     # From 5-1
├── lib/
│   ├── queries/
│   │   ├── get-user-entries.ts       # From 5-2
│   │   └── dashboard.ts              # NEW - getDashboardStats
│   └── dashboard/
│       ├── period-utils.ts           # From 5-1
│       └── group-entries.ts          # From 5-3, 5-4
└── types/
    └── dashboard.ts                  # EXTEND - add stats types
```

### Previous Story Intelligence (5-4)

**Learnings from Story 5-4:**
- Week grouping utility already exists in `group-entries.ts`
- `getWeeksInMonth()` function available for reuse
- `DateRange` type already defined
- Period selector and URL params working
- Entry tap → bottom sheet flow established

**Code to Reuse:**
- `getDateRangeForPeriod()` from `period-utils.ts`
- `formatThaiDate()` utilities
- `THAI_MONTHS_SHORT` constant

### UX Considerations

**From UX Spec:**
- Stats should create "Accomplishment" emotion
- "Done for today! ✓" creates closure feeling
- Keep progress indicator subtle (not alarming)
- Use warm Thai language ("วันนี้: X ชม.")
- Success messages display ≥1.5s

**Visual Design:**
- Total hours in large, bold font (3xl)
- Secondary stats in smaller text
- Card component from shadcn/ui
- Muted borders between sections
- Green color for completion states

### Testing

```typescript
// src/components/dashboard/StatsCard.test.tsx
import { render, screen } from '@testing-library/react';
import { StatsCard } from './StatsCard';

describe('StatsCard', () => {
  it('displays total hours and entry count', () => {
    render(
      <StatsCard
        stats={{ totalHours: 6.5, entryCount: 3 }}
        period="today"
      />
    );

    expect(screen.getByText('6.5')).toBeInTheDocument();
    expect(screen.getByText('(3 รายการ)')).toBeInTheDocument();
  });

  it('shows "Done for today" when 8+ hours logged', () => {
    render(
      <StatsCard
        stats={{ totalHours: 8.5, entryCount: 4 }}
        period="today"
      />
    );

    expect(screen.getByText('Done for today! ✓')).toBeInTheDocument();
  });

  it('shows average per day for weekly period', () => {
    render(
      <StatsCard
        stats={{
          totalHours: 35,
          entryCount: 20,
          averagePerDay: 7,
          daysWithEntries: 5,
        }}
        period="week"
      />
    );

    expect(screen.getByText('7.0 ชม.')).toBeInTheDocument();
    expect(screen.getByText('5 วัน')).toBeInTheDocument();
  });

  it('displays top client when available', () => {
    render(
      <StatsCard
        stats={{
          totalHours: 20,
          entryCount: 10,
          topClient: { id: '1', name: 'Acme Corp', hours: 12 },
        }}
        period="today"
      />
    );

    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
    expect(screen.getByText('12.0 ชม.')).toBeInTheDocument();
  });

  it('hides top client section when no entries', () => {
    render(
      <StatsCard
        stats={{ totalHours: 0, entryCount: 0 }}
        period="today"
      />
    );

    expect(screen.queryByText('Client หลัก')).not.toBeInTheDocument();
  });
});
```

### E2E Test

```typescript
// test/e2e/dashboard/stats.test.ts
import { test, expect } from '@playwright/test';

test.describe('Dashboard Stats', () => {
  test.beforeEach(async ({ page }) => {
    // Login and seed test data
    await page.goto('/dashboard');
  });

  test('displays stats card with total hours', async ({ page }) => {
    const statsCard = page.locator('[data-testid="stats-card"]');
    await expect(statsCard).toBeVisible();
    await expect(statsCard).toContainText('ชม.');
    await expect(statsCard).toContainText('รายการ');
  });

  test('shows period-specific label', async ({ page }) => {
    await page.goto('/dashboard?period=today');
    await expect(page.getByText('วันนี้')).toBeVisible();

    await page.goto('/dashboard?period=week');
    await expect(page.getByText('สัปดาห์นี้')).toBeVisible();

    await page.goto('/dashboard?period=month');
    await expect(page.getByText('เดือนนี้')).toBeVisible();
  });

  test('shows average per day for weekly view', async ({ page }) => {
    await page.goto('/dashboard?period=week');
    await expect(page.getByText('เฉลี่ยต่อวัน')).toBeVisible();
  });

  test('shows top client when entries exist', async ({ page }) => {
    // Assuming test user has entries
    await expect(page.getByText('Client หลัก')).toBeVisible();
  });
});
```

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 5.5]
- [Source: _bmad-output/planning-artifacts/prd.md#FR20]
- [Source: _bmad-output/planning-artifacts/architecture.md#State Management]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Emotional Journey]
- [Source: _bmad-output/implementation-artifacts/5-4-monthly-entries-view.md]
- [Source: _bmad-output/project-context.md#Implementation Rules]

## Definition of Done

- [ ] DashboardStats type defined in `src/types/dashboard.ts`
- [ ] getDashboardStats query function created
- [ ] StatsCard component created with shadcn/ui Card
- [ ] Total hours displayed prominently
- [ ] Entry count shown
- [ ] Top client displayed when available
- [ ] Period-specific stats (avg/day, avg/week) working
- [ ] "Done for today! ✓" shown at 8+ hours
- [ ] Stats update after entry mutations
- [ ] Unit tests passing
- [ ] Mobile-optimized layout
- [ ] No TanStack Query (Server Component pattern)

## Dev Agent Record

### Agent Model Used

_To be filled by dev agent_

### Completion Notes List

_To be filled during implementation_

### File List

_To be filled with all created/modified files_
