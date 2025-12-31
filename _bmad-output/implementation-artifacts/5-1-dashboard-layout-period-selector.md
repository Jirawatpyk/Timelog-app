# Story 5.1: Dashboard Layout & Period Selector

Status: ready-for-dev

## Story

As a **staff member**,
I want **to view my time entries organized by time period**,
So that **I can track my logged hours effectively**.

## Acceptance Criteria

1. **AC1: Dashboard Page Structure**
   - Given I am logged in and navigate to /dashboard
   - When the page loads
   - Then I see the dashboard page with period selector at the top
   - And I see my entries list below
   - And I see summary stats section
   - And the layout is optimized for mobile (single column, stacked cards)

2. **AC2: Period Selector Tabs**
   - Given I am on the dashboard
   - When I view the period selector
   - Then I see tabs: "วันนี้", "สัปดาห์นี้", "เดือนนี้"
   - And "วันนี้" is selected by default
   - And tabs have clear active/inactive states
   - And touch targets are minimum 44x44px

3. **AC3: Period Tab Selection**
   - Given I tap a different period tab
   - When the selection changes
   - Then entries are filtered to show only that period
   - And the selected tab is visually highlighted
   - And transition is smooth (no jarring reload)

4. **AC4: URL State Persistence**
   - Given I select a period tab
   - When I look at the URL
   - Then URL updates with query param (e.g., ?period=today, ?period=week, ?period=month)
   - And refreshing the page preserves the selected period
   - And sharing the URL shows the correct period for others

5. **AC5: Stats Update on Period Change**
   - Given I change the period
   - When the new period is selected
   - Then stats update to reflect the selected period
   - And loading state shows briefly during data fetch

6. **AC6: Default Date Range Calculation**
   - Given "วันนี้" is selected
   - Then entries show from 00:00 to 23:59 today
   - Given "สัปดาห์นี้" is selected
   - Then entries show from Monday 00:00 to Sunday 23:59 of current week
   - Given "เดือนนี้" is selected
   - Then entries show from 1st 00:00 to last day 23:59 of current month

7. **AC7: Server Component Architecture**
   - Given the dashboard page
   - When implemented
   - Then it uses Server Components for initial data fetch
   - And does NOT use TanStack Query (reserved for Entry page only)
   - And uses Server Actions for mutations

## Tasks / Subtasks

- [ ] **Task 1: Create Dashboard Page Structure** (AC: 1, 7)
  - [ ] 1.1 Create `app/(app)/dashboard/page.tsx` as Server Component
  - [ ] 1.2 Create `app/(app)/dashboard/layout.tsx` if needed
  - [ ] 1.3 Define page title and meta
  - [ ] 1.4 Set up container with mobile-first padding

- [ ] **Task 2: Implement Period Selector Component** (AC: 2, 3)
  - [ ] 2.1 Create `components/dashboard/PeriodSelector.tsx`
  - [ ] 2.2 Create tab buttons with proper styling
  - [ ] 2.3 Add active state styling
  - [ ] 2.4 Ensure 44x44px touch targets
  - [ ] 2.5 Add smooth transition animations

- [ ] **Task 3: URL State Management** (AC: 4)
  - [ ] 3.1 Use searchParams from page props
  - [ ] 3.2 Create `lib/dashboard/period-utils.ts` for period calculations
  - [ ] 3.3 Update URL on tab change using useRouter
  - [ ] 3.4 Validate period param (default to 'today' if invalid)

- [ ] **Task 4: Date Range Calculation** (AC: 6)
  - [ ] 4.1 Create `getDateRangeForPeriod(period: Period)` utility
  - [ ] 4.2 Handle week calculation (Monday-Sunday)
  - [ ] 4.3 Handle month calculation (1st to last day)
  - [ ] 4.4 Account for timezone (user's local time)

- [ ] **Task 5: Dashboard Layout Components** (AC: 1)
  - [ ] 5.1 Create `components/dashboard/DashboardHeader.tsx`
  - [ ] 5.2 Create `components/dashboard/StatsCard.tsx` placeholder
  - [ ] 5.3 Create `components/dashboard/EntryList.tsx` placeholder
  - [ ] 5.4 Arrange components in mobile-optimized stack

- [ ] **Task 6: Server Data Fetching** (AC: 5, 7)
  - [ ] 6.1 Create `lib/queries/get-user-entries.ts` server function
  - [ ] 6.2 Fetch entries based on period and user_id
  - [ ] 6.3 Aggregate stats (total hours, count)
  - [ ] 6.4 Use Supabase server client

- [ ] **Task 7: Loading States** (AC: 5)
  - [ ] 7.1 Create `app/(app)/dashboard/loading.tsx` for Suspense
  - [ ] 7.2 Create skeleton components for stats and list
  - [ ] 7.3 Ensure no layout shift (CLS < 0.1)

- [ ] **Task 8: Integration and Testing** (AC: 1-7)
  - [ ] 8.1 Integrate all components in page
  - [ ] 8.2 Test period switching
  - [ ] 8.3 Test URL state persistence
  - [ ] 8.4 Test on mobile viewport

## Dev Notes

### Period Types Definition

```typescript
// src/types/dashboard.ts
export type Period = 'today' | 'week' | 'month';

export interface DateRange {
  start: Date;
  end: Date;
}

export interface DashboardStats {
  totalHours: number;
  entryCount: number;
  topClient?: {
    id: string;
    name: string;
    hours: number;
  };
}

export interface DashboardPageProps {
  searchParams: { period?: string };
}
```

### Period Utilities

```typescript
// src/lib/dashboard/period-utils.ts
import { Period, DateRange } from '@/types/dashboard';

export function isValidPeriod(value: string | undefined): value is Period {
  return value === 'today' || value === 'week' || value === 'month';
}

export function getPeriodFromSearchParams(period?: string): Period {
  if (isValidPeriod(period)) {
    return period;
  }
  return 'today'; // default
}

export function getDateRangeForPeriod(period: Period): DateRange {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (period) {
    case 'today':
      return {
        start: today,
        end: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1), // 23:59:59.999
      };

    case 'week': {
      // Get Monday of current week
      const dayOfWeek = today.getDay();
      const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      const monday = new Date(today);
      monday.setDate(today.getDate() + diffToMonday);

      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      sunday.setHours(23, 59, 59, 999);

      return { start: monday, end: sunday };
    }

    case 'month': {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      return { start: firstDay, end: lastDay };
    }
  }
}

export function formatPeriodLabel(period: Period): string {
  const labels: Record<Period, string> = {
    today: 'วันนี้',
    week: 'สัปดาห์นี้',
    month: 'เดือนนี้',
  };
  return labels[period];
}
```

### Dashboard Page (Server Component)

```typescript
// src/app/(app)/dashboard/page.tsx
import { Suspense } from 'react';
import { PeriodSelector } from '@/components/dashboard/PeriodSelector';
import { DashboardContent } from '@/components/dashboard/DashboardContent';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';
import { getPeriodFromSearchParams } from '@/lib/dashboard/period-utils';
import type { DashboardPageProps } from '@/types/dashboard';

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const period = getPeriodFromSearchParams(searchParams.period);

  return (
    <div className="flex flex-col gap-4 p-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <PeriodSelector currentPeriod={period} />

      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent period={period} />
      </Suspense>
    </div>
  );
}
```

### Period Selector Component

```typescript
// src/components/dashboard/PeriodSelector.tsx
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { Period } from '@/types/dashboard';

interface PeriodSelectorProps {
  currentPeriod: Period;
}

const PERIODS: { value: Period; label: string }[] = [
  { value: 'today', label: 'วันนี้' },
  { value: 'week', label: 'สัปดาห์นี้' },
  { value: 'month', label: 'เดือนนี้' },
];

export function PeriodSelector({ currentPeriod }: PeriodSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePeriodChange = (period: Period) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('period', period);
    router.push(`/dashboard?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex gap-2 p-1 bg-muted rounded-lg">
      {PERIODS.map((period) => (
        <button
          key={period.value}
          onClick={() => handlePeriodChange(period.value)}
          className={cn(
            'flex-1 min-h-[44px] px-4 py-2 rounded-md',
            'text-sm font-medium transition-all duration-200',
            'touch-manipulation',
            currentPeriod === period.value
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {period.label}
        </button>
      ))}
    </div>
  );
}
```

### Dashboard Content (Server Component)

```typescript
// src/components/dashboard/DashboardContent.tsx
import { StatsCard } from '@/components/dashboard/StatsCard';
import { EntryList } from '@/components/dashboard/EntryList';
import { getUserEntries, getDashboardStats } from '@/lib/queries/get-user-entries';
import { getDateRangeForPeriod } from '@/lib/dashboard/period-utils';
import type { Period } from '@/types/dashboard';

interface DashboardContentProps {
  period: Period;
}

export async function DashboardContent({ period }: DashboardContentProps) {
  const dateRange = getDateRangeForPeriod(period);

  const [entries, stats] = await Promise.all([
    getUserEntries(dateRange),
    getDashboardStats(dateRange),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <StatsCard stats={stats} period={period} />
      <EntryList entries={entries} />
    </div>
  );
}
```

### Server Query Functions

```typescript
// src/lib/queries/get-user-entries.ts
import { createClient } from '@/lib/supabase/server';
import type { DateRange, DashboardStats } from '@/types/dashboard';
import type { TimeEntry } from '@/types/domain';

export async function getUserEntries(dateRange: DateRange): Promise<TimeEntry[]> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  const { data, error } = await supabase
    .from('time_entries')
    .select(`
      *,
      job:jobs(
        id, name, job_no,
        project:projects(
          id, name,
          client:clients(id, name)
        )
      ),
      service:services(id, name),
      task:tasks(id, name)
    `)
    .eq('user_id', user.id)
    .gte('entry_date', dateRange.start.toISOString().split('T')[0])
    .lte('entry_date', dateRange.end.toISOString().split('T')[0])
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getDashboardStats(dateRange: DateRange): Promise<DashboardStats> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  // Get entries for stats calculation
  const { data: entries, error } = await supabase
    .from('time_entries')
    .select(`
      duration_minutes,
      job:jobs(
        project:projects(
          client:clients(id, name)
        )
      )
    `)
    .eq('user_id', user.id)
    .gte('entry_date', dateRange.start.toISOString().split('T')[0])
    .lte('entry_date', dateRange.end.toISOString().split('T')[0])
    .is('deleted_at', null);

  if (error) throw error;

  // Calculate total hours
  const totalMinutes = entries?.reduce((sum, e) => sum + (e.duration_minutes || 0), 0) || 0;
  const totalHours = totalMinutes / 60;

  // Calculate top client
  const clientHours: Record<string, { name: string; hours: number }> = {};
  entries?.forEach((entry) => {
    const client = entry.job?.project?.client;
    if (client) {
      if (!clientHours[client.id]) {
        clientHours[client.id] = { name: client.name, hours: 0 };
      }
      clientHours[client.id].hours += (entry.duration_minutes || 0) / 60;
    }
  });

  const topClient = Object.entries(clientHours)
    .sort((a, b) => b[1].hours - a[1].hours)
    .map(([id, data]) => ({ id, ...data }))[0];

  return {
    totalHours,
    entryCount: entries?.length || 0,
    topClient,
  };
}
```

### Stats Card Component

```typescript
// src/components/dashboard/StatsCard.tsx
import { Card, CardContent } from '@/components/ui/card';
import { formatThaiDate } from '@/lib/utils/thai-date';
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

export function StatsCard({ stats, period }: StatsCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-muted-foreground">{PERIOD_LABELS[period]}</p>
            <p className="text-3xl font-bold">{stats.totalHours.toFixed(1)} ชม.</p>
            <p className="text-sm text-muted-foreground">{stats.entryCount} รายการ</p>
          </div>

          {stats.topClient && (
            <div className="text-right">
              <p className="text-xs text-muted-foreground">ลูกค้าหลัก</p>
              <p className="text-sm font-medium">{stats.topClient.name}</p>
              <p className="text-xs text-muted-foreground">
                {stats.topClient.hours.toFixed(1)} ชม.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
```

### Entry List Placeholder

```typescript
// src/components/dashboard/EntryList.tsx
import type { TimeEntry } from '@/types/domain';

interface EntryListProps {
  entries: TimeEntry[];
}

export function EntryList({ entries }: EntryListProps) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        ยังไม่มี entry ในช่วงเวลานี้
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {entries.map((entry) => (
        <div
          key={entry.id}
          className="p-4 border rounded-lg bg-card"
        >
          {/* Entry details - to be enhanced in Story 5.2 */}
          <p className="font-medium">
            {entry.job?.project?.client?.name} &gt; {entry.job?.name}
          </p>
          <p className="text-sm text-muted-foreground">
            {entry.service?.name}
            {entry.task && ` • ${entry.task.name}`}
          </p>
          <p className="text-sm">
            {(entry.duration_minutes / 60).toFixed(1)} ชม.
          </p>
        </div>
      ))}
    </div>
  );
}
```

### Dashboard Skeleton

```typescript
// src/components/dashboard/DashboardSkeleton.tsx
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

export function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {/* Stats Skeleton */}
      <Card>
        <CardContent className="p-4">
          <div className="flex justify-between">
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-4 w-20" />
            </div>
            <div className="space-y-2 text-right">
              <Skeleton className="h-3 w-12 ml-auto" />
              <Skeleton className="h-4 w-20 ml-auto" />
              <Skeleton className="h-3 w-16 ml-auto" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Entry List Skeleton */}
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardContent className="p-4 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-3 w-16" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

### Loading Page

```typescript
// src/app/(app)/dashboard/loading.tsx
import { Skeleton } from '@/components/ui/skeleton';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';

export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <Skeleton className="h-8 w-32" /> {/* Title */}

      {/* Period Selector Skeleton */}
      <div className="flex gap-2 p-1 bg-muted rounded-lg">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="flex-1 h-[44px]" />
        ))}
      </div>

      <DashboardSkeleton />
    </div>
  );
}
```

### Project Structure

```
src/
├── app/
│   └── (app)/
│       └── dashboard/
│           ├── page.tsx              # NEW - Server Component
│           └── loading.tsx           # NEW - Suspense fallback
├── components/
│   └── dashboard/
│       ├── PeriodSelector.tsx        # NEW - Client Component
│       ├── DashboardContent.tsx      # NEW - Server Component
│       ├── StatsCard.tsx             # NEW
│       ├── EntryList.tsx             # NEW (placeholder)
│       └── DashboardSkeleton.tsx     # NEW
├── lib/
│   ├── dashboard/
│   │   └── period-utils.ts           # NEW
│   └── queries/
│       └── get-user-entries.ts       # NEW
└── types/
    └── dashboard.ts                  # NEW
```

### Week Calculation Notes

Thai convention: Week starts on Monday (ISO week)
- Sunday = 0, Monday = 1, ..., Saturday = 6
- Formula to get Monday: `currentDate - (dayOfWeek === 0 ? 6 : dayOfWeek - 1)`

### Important Patterns

1. **Server Components by default** - Dashboard uses Server Components for data fetching
2. **NO TanStack Query** - Per architecture, TanStack Query is Entry page only
3. **URL State** - Period stored in URL for shareability and back/forward navigation
4. **Suspense Boundaries** - Use React Suspense with loading.tsx for streaming
5. **Mobile-First** - Single column layout, touch-optimized tabs

### Why Server Components for Dashboard?

From Architecture Decision:
> TanStack Query v5 for Entry page ONLY
> Server Components for Dashboard/Team/Admin pages

Benefits:
- Initial data is SSR'd (faster FCP)
- No client-side fetch waterfall
- Simpler code (no useEffect, no loading states in components)
- SEO-friendly (if needed in future)

### Accessibility

- Tabs are keyboard navigable (Tab, Enter, Arrow keys)
- Active state is clear visually and programmatically
- Touch targets exceed 44x44px minimum
- Color contrast meets WCAG AA (4.5:1)

### Testing Considerations

```typescript
// test/e2e/dashboard/period-selector.test.ts
import { test, expect } from '@playwright/test';

test.describe('Dashboard Period Selector', () => {
  test.beforeEach(async ({ page }) => {
    // Login as staff
    await page.goto('/login');
    // ... login steps
    await page.goto('/dashboard');
  });

  test('defaults to today period', async ({ page }) => {
    await expect(page).toHaveURL(/period=today|\/dashboard$/);
    const todayTab = page.getByRole('button', { name: 'วันนี้' });
    await expect(todayTab).toHaveAttribute('aria-selected', 'true');
  });

  test('changes period via tab click', async ({ page }) => {
    await page.getByRole('button', { name: 'สัปดาห์นี้' }).click();
    await expect(page).toHaveURL(/period=week/);
  });

  test('persists period on page refresh', async ({ page }) => {
    await page.goto('/dashboard?period=month');
    await page.reload();
    await expect(page).toHaveURL(/period=month/);
  });
});
```

### Dependencies

- **Required from earlier stories:**
  - Authentication (Epic 2)
  - Database schema with time_entries (Epic 1)
  - Bottom Navigation (Story 4.1)
  - Thai date utilities (Story 4.4)

- **Will be enhanced by:**
  - Story 5.2: Today's Entries View
  - Story 5.3: Weekly Entries View
  - Story 5.4: Monthly Entries View
  - Story 5.5: Total Hours Statistics

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#State Management Pattern]
- [Source: _bmad-output/planning-artifacts/epics.md#Epic 5]
- [Source: _bmad-output/planning-artifacts/prd.md#FR17-FR20]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Dashboard]
- [Source: _bmad-output/project-context.md#Server Components]

## Definition of Done

- [ ] Dashboard page created at /dashboard
- [ ] Period selector tabs displayed (วันนี้, สัปดาห์นี้, เดือนนี้)
- [ ] "วันนี้" selected by default
- [ ] URL updates with period query param
- [ ] Period selection persists on refresh
- [ ] Stats update on period change
- [ ] Date range calculations are correct for each period
- [ ] Server Components used (no TanStack Query)
- [ ] Loading states with skeletons implemented
- [ ] Mobile-optimized layout
- [ ] Touch targets are 44x44px minimum
- [ ] Accessible via keyboard

## Dev Agent Record

### Agent Model Used

_To be filled by dev agent_

### Completion Notes List

_To be filled during implementation_

### File List

_To be filled with all created/modified files_
