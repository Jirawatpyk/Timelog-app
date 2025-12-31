# Story 5.8: Empty States

Status: ready-for-dev

## Story

As a **staff member**,
I want **to see helpful messages when there's no data**,
So that **I understand why the list is empty and what to do**.

## Acceptance Criteria

1. **AC1: Empty Today State**
   - Given I have no entries for "วันนี้" (today)
   - When dashboard loads
   - Then I see empty state message: "ยังไม่มี entry วันนี้"
   - And I see CTA button: "เพิ่ม Entry" linking to /entry
   - And I see a minimal, non-distracting illustration or icon

2. **AC2: Empty Week State**
   - Given I have no entries for "สัปดาห์นี้" (this week)
   - When dashboard loads with week period
   - Then I see: "ยังไม่มี entry สัปดาห์นี้"
   - And same CTA button appears
   - And illustration is consistent with today's empty state

3. **AC3: Empty Month State**
   - Given I have no entries for "เดือนนี้" (this month)
   - When dashboard loads with month period
   - Then I see: "ยังไม่มี entry เดือนนี้"
   - And same CTA button appears

4. **AC4: Empty Client Filter State**
   - Given a client filter is active (from Story 5-6)
   - When no entries match the selected client
   - Then I see: "ไม่พบ entry สำหรับ [Client Name]"
   - And I see option to clear filter
   - And CTA to add entry is NOT shown (filter issue, not data issue)

5. **AC5: Empty Search State**
   - Given a search query is active (from Story 5-7)
   - When no entries match the search
   - Then I see: "ไม่พบรายการที่ค้นหา"
   - And I see the search query displayed
   - And I see option to clear search

6. **AC6: Empty Combined Filter + Search State**
   - Given both filter and search are active
   - When no entries match
   - Then I see appropriate message prioritizing search
   - And I see options to clear both

7. **AC7: Empty State Visual Design**
   - Given any empty state is shown
   - Then illustration/icon uses muted colors
   - And message is centered vertically in available space
   - And CTA button is prominent but not aggressive
   - And overall feel is encouraging, not alarming

8. **AC8: First-Time User Empty State**
   - Given I am a new user with zero entries ever
   - When I first visit dashboard
   - Then I see a welcoming empty state
   - And message encourages first entry: "ลองลง entry แรกกัน!"
   - And CTA is extra prominent

## Tasks / Subtasks

- [ ] **Task 1: Create EmptyState Base Component** (AC: 7)
  - [ ] 1.1 Create `src/components/dashboard/EmptyState.tsx`
  - [ ] 1.2 Props: icon, message, description, action
  - [ ] 1.3 Center layout with proper spacing
  - [ ] 1.4 Muted color scheme

- [ ] **Task 2: Create Empty Period States** (AC: 1, 2, 3)
  - [ ] 2.1 Create `EmptyTodayState` variant
  - [ ] 2.2 Create `EmptyWeekState` variant
  - [ ] 2.3 Create `EmptyMonthState` variant
  - [ ] 2.4 Add "เพิ่ม Entry" CTA linking to /entry

- [ ] **Task 3: Create Empty Filter State** (AC: 4)
  - [ ] 3.1 Create `EmptyFilterState` component (or extend base)
  - [ ] 3.2 Accept clientName prop for message
  - [ ] 3.3 Add "Clear Filter" action
  - [ ] 3.4 No "Add Entry" CTA (filter context)

- [ ] **Task 4: Update Empty Search State** (AC: 5)
  - [ ] 4.1 Verify `EmptySearchState` from 5-7 meets requirements
  - [ ] 4.2 Ensure consistent styling with other empty states
  - [ ] 4.3 Display search query in message

- [ ] **Task 5: Create Combined Empty State** (AC: 6)
  - [ ] 5.1 Determine priority: search > filter
  - [ ] 5.2 Show appropriate message
  - [ ] 5.3 Provide clear actions for both

- [ ] **Task 6: Create First-Time User State** (AC: 8)
  - [ ] 6.1 Create `EmptyFirstTimeState` component
  - [ ] 6.2 Detect first-time user (zero total entries)
  - [ ] 6.3 Extra welcoming message and prominent CTA

- [ ] **Task 7: Create Empty State Icons/Illustrations** (AC: 7)
  - [ ] 7.1 Select or create simple icons (lucide-react)
  - [ ] 7.2 Calendar icon for period empty states
  - [ ] 7.3 Filter icon for filter empty state
  - [ ] 7.4 Search icon for search empty state
  - [ ] 7.5 Sparkles/star for first-time state

- [ ] **Task 8: Integrate Empty States in Dashboard** (AC: All)
  - [ ] 8.1 Add logic to DashboardContent to detect empty scenarios
  - [ ] 8.2 Pass appropriate props to empty state components
  - [ ] 8.3 Handle priority when multiple conditions apply

- [ ] **Task 9: Unit & E2E Tests** (AC: All)
  - [ ] 9.1 Test each empty state renders correctly
  - [ ] 9.2 Test CTA navigation
  - [ ] 9.3 Test clear filter/search actions
  - [ ] 9.4 Test first-time user detection

## Dev Notes

### Architecture Compliance

**Required Patterns:**
- Server Components for data detection
- Client Component for interactive CTAs
- Use `@/` import aliases only
- Reuse EmptySearchState from 5-7, EmptyFilterState from 5-6

**File Locations:**
- Components: `src/components/dashboard/EmptyState.tsx` (base)
- Variants in same file or separate as needed

### Types Definition

```typescript
// src/types/dashboard.ts - Add if needed

export type EmptyStateType =
  | 'period'      // No entries for period
  | 'filter'      // Filter returns no results
  | 'search'      // Search returns no results
  | 'first-time'; // New user, no entries ever

export interface EmptyStateContext {
  type: EmptyStateType;
  period?: Period;
  clientName?: string;
  searchQuery?: string;
  isFirstTime?: boolean;
}
```

### Base EmptyState Component

```typescript
// src/components/dashboard/EmptyState.tsx
import Link from 'next/link';
import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 px-4 text-center',
        className
      )}
    >
      {/* Icon */}
      <div className="rounded-full bg-muted p-4 mb-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>

      {/* Title */}
      <h3 className="text-lg font-medium mb-2">{title}</h3>

      {/* Description */}
      {description && (
        <p className="text-sm text-muted-foreground mb-6 max-w-[250px]">
          {description}
        </p>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-2">
        {action && (
          action.href ? (
            <Button asChild>
              <Link href={action.href}>{action.label}</Link>
            </Button>
          ) : (
            <Button onClick={action.onClick}>{action.label}</Button>
          )
        )}

        {secondaryAction && (
          <Button variant="ghost" onClick={secondaryAction.onClick}>
            {secondaryAction.label}
          </Button>
        )}
      </div>
    </div>
  );
}
```

### Period-Specific Empty States

```typescript
// src/components/dashboard/EmptyPeriodState.tsx
import { Calendar, CalendarDays, CalendarRange } from 'lucide-react';
import { EmptyState } from '@/components/dashboard/EmptyState';
import type { Period } from '@/types/dashboard';

interface EmptyPeriodStateProps {
  period: Period;
}

const periodConfig: Record<Period, {
  icon: typeof Calendar;
  title: string;
  description: string;
}> = {
  today: {
    icon: Calendar,
    title: 'ยังไม่มี entry วันนี้',
    description: 'เริ่มลง entry วันนี้กันเถอะ!',
  },
  week: {
    icon: CalendarDays,
    title: 'ยังไม่มี entry สัปดาห์นี้',
    description: 'ยังไม่มี entry ในสัปดาห์นี้',
  },
  month: {
    icon: CalendarRange,
    title: 'ยังไม่มี entry เดือนนี้',
    description: 'ยังไม่มี entry ในเดือนนี้',
  },
};

export function EmptyPeriodState({ period }: EmptyPeriodStateProps) {
  const config = periodConfig[period];

  return (
    <EmptyState
      icon={config.icon}
      title={config.title}
      description={config.description}
      action={{
        label: 'เพิ่ม Entry',
        href: '/entry',
      }}
    />
  );
}
```

### Empty Filter State

```typescript
// src/components/dashboard/EmptyFilterState.tsx
'use client';

import { Filter } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { EmptyState } from '@/components/dashboard/EmptyState';

interface EmptyFilterStateProps {
  clientName: string;
}

export function EmptyFilterState({ clientName }: EmptyFilterStateProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleClearFilter = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('client');
    router.push(`/dashboard?${params.toString()}`);
  };

  return (
    <EmptyState
      icon={Filter}
      title={`ไม่พบ entry สำหรับ ${clientName}`}
      description="ลองเลือก Client อื่น หรือดูทุก entry"
      action={{
        label: 'Clear Filter',
        onClick: handleClearFilter,
      }}
    />
  );
}
```

### Empty Search State (Updated from 5-7)

```typescript
// src/components/dashboard/EmptySearchState.tsx
'use client';

import { Search } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { EmptyState } from '@/components/dashboard/EmptyState';

interface EmptySearchStateProps {
  query: string;
}

export function EmptySearchState({ query }: EmptySearchStateProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleClearSearch = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('q');
    router.push(`/dashboard?${params.toString()}`);
  };

  return (
    <EmptyState
      icon={Search}
      title="ไม่พบรายการที่ค้นหา"
      description={`ไม่พบ entry สำหรับ "${query}"`}
      action={{
        label: 'Clear Search',
        onClick: handleClearSearch,
      }}
    />
  );
}
```

### First-Time User Empty State

```typescript
// src/components/dashboard/EmptyFirstTimeState.tsx
import { Sparkles } from 'lucide-react';
import { EmptyState } from '@/components/dashboard/EmptyState';

export function EmptyFirstTimeState() {
  return (
    <EmptyState
      icon={Sparkles}
      title="ยินดีต้อนรับ!"
      description="ลองลง entry แรกกัน! ใช้เวลาไม่ถึง 30 วินาที"
      action={{
        label: 'เพิ่ม Entry แรก',
        href: '/entry',
      }}
    />
  );
}
```

### Empty State Logic in DashboardContent

```typescript
// src/components/dashboard/DashboardContent.tsx
import { EmptyPeriodState } from '@/components/dashboard/EmptyPeriodState';
import { EmptyFilterState } from '@/components/dashboard/EmptyFilterState';
import { EmptySearchState } from '@/components/dashboard/EmptySearchState';
import { EmptyFirstTimeState } from '@/components/dashboard/EmptyFirstTimeState';

interface DashboardContentProps {
  period: Period;
  filter?: FilterState;
}

export async function DashboardContent({ period, filter }: DashboardContentProps) {
  const dateRange = getDateRangeForPeriod(period);

  const [entries, stats, isFirstTimeUser, activeClient] = await Promise.all([
    getUserEntries(dateRange, filter),
    getDashboardStats(dateRange, period, filter),
    checkIsFirstTimeUser(),
    filter?.clientId ? getClientById(filter.clientId) : null,
  ]);

  // Determine empty state type
  if (entries.length === 0) {
    // Priority: Search > Filter > First-Time > Period

    // 1. Search active but no results
    if (filter?.searchQuery) {
      return <EmptySearchState query={filter.searchQuery} />;
    }

    // 2. Filter active but no results
    if (filter?.clientId && activeClient) {
      return <EmptyFilterState clientName={activeClient.name} />;
    }

    // 3. First-time user (no entries ever)
    if (isFirstTimeUser) {
      return <EmptyFirstTimeState />;
    }

    // 4. No entries for period
    return <EmptyPeriodState period={period} />;
  }

  // Normal content rendering...
  return (
    <div className="flex flex-col gap-4">
      <StatsCard stats={stats} period={period} />
      {/* Entry lists... */}
    </div>
  );
}
```

### First-Time User Detection

```typescript
// src/lib/queries/dashboard.ts - Add this function

export async function checkIsFirstTimeUser(): Promise<boolean> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { count, error } = await supabase
    .from('time_entries')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  if (error) return false;

  return count === 0;
}
```

### Project Structure Update

```
src/
├── components/
│   └── dashboard/
│       ├── EmptyState.tsx            # NEW (base component)
│       ├── EmptyPeriodState.tsx      # NEW
│       ├── EmptyFilterState.tsx      # UPDATE (use base)
│       ├── EmptySearchState.tsx      # UPDATE (use base)
│       ├── EmptyFirstTimeState.tsx   # NEW
│       ├── DashboardContent.tsx      # MODIFY (add empty logic)
│       ├── StatsCard.tsx             # From 5-5
│       ├── SearchInput.tsx           # From 5-7
│       ├── FilterSheet.tsx           # From 5-6
│       └── ...
├── lib/
│   └── queries/
│       └── dashboard.ts              # ADD checkIsFirstTimeUser()
└── types/
    └── dashboard.ts                  # ADD EmptyStateType
```

### Previous Story Intelligence

**From Story 5-6:**
- EmptyFilterState already created, refactor to use base

**From Story 5-7:**
- EmptySearchState already created, refactor to use base

**Consolidation Opportunity:**
- Both 5-6 and 5-7 created empty states
- This story unifies them with consistent base component

### UX Design Alignment

**From UX Spec:**
- Empty states should feel encouraging, not alarming
- Use warm Thai language
- CTA should be clear but not aggressive
- Illustrations minimal, muted colors

**Copy Guidelines:**
| Context | Message |
|---------|---------|
| No entries today | "ยังไม่มี entry วันนี้" |
| No entries week | "ยังไม่มี entry สัปดาห์นี้" |
| No entries month | "ยังไม่มี entry เดือนนี้" |
| Filter no match | "ไม่พบ entry สำหรับ [Client]" |
| Search no match | "ไม่พบรายการที่ค้นหา" |
| First time | "ยินดีต้อนรับ! ลองลง entry แรกกัน!" |

### Testing

```typescript
// src/components/dashboard/EmptyState.test.tsx
import { render, screen } from '@testing-library/react';
import { EmptyState } from './EmptyState';
import { Calendar } from 'lucide-react';

describe('EmptyState', () => {
  it('renders title and description', () => {
    render(
      <EmptyState
        icon={Calendar}
        title="Test Title"
        description="Test description"
      />
    );

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  it('renders action button with href', () => {
    render(
      <EmptyState
        icon={Calendar}
        title="Test"
        action={{ label: 'Click me', href: '/test' }}
      />
    );

    const link = screen.getByRole('link', { name: 'Click me' });
    expect(link).toHaveAttribute('href', '/test');
  });

  it('renders action button with onClick', () => {
    const onClick = jest.fn();
    render(
      <EmptyState
        icon={Calendar}
        title="Test"
        action={{ label: 'Click me', onClick }}
      />
    );

    screen.getByRole('button', { name: 'Click me' }).click();
    expect(onClick).toHaveBeenCalled();
  });
});
```

```typescript
// test/e2e/dashboard/empty-states.test.ts
import { test, expect } from '@playwright/test';

test.describe('Dashboard Empty States', () => {
  test('shows empty today state when no entries', async ({ page }) => {
    // Use test user with no entries for today
    await page.goto('/dashboard?period=today');

    await expect(page.getByText('ยังไม่มี entry วันนี้')).toBeVisible();
    await expect(page.getByRole('link', { name: 'เพิ่ม Entry' })).toBeVisible();
  });

  test('shows empty week state when no entries', async ({ page }) => {
    await page.goto('/dashboard?period=week');

    await expect(page.getByText('ยังไม่มี entry สัปดาห์นี้')).toBeVisible();
  });

  test('shows empty filter state with client name', async ({ page }) => {
    // Filter by client that has no entries
    await page.goto('/dashboard?client=no-entries-client-id');

    await expect(page.getByText(/ไม่พบ entry สำหรับ/)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Clear Filter' })).toBeVisible();
  });

  test('shows empty search state with query', async ({ page }) => {
    await page.goto('/dashboard?q=xyznonexistent');

    await expect(page.getByText('ไม่พบรายการที่ค้นหา')).toBeVisible();
    await expect(page.getByText('xyznonexistent')).toBeVisible();
  });

  test('shows first-time user state for new users', async ({ page }) => {
    // Login as user with zero entries
    await page.goto('/dashboard');

    await expect(page.getByText('ยินดีต้อนรับ!')).toBeVisible();
    await expect(page.getByRole('link', { name: /entry แรก/i })).toBeVisible();
  });

  test('navigates to entry page on CTA click', async ({ page }) => {
    await page.goto('/dashboard?period=today');

    // Assuming no entries for today
    await page.getByRole('link', { name: 'เพิ่ม Entry' }).click();

    await expect(page).toHaveURL('/entry');
  });

  test('clears filter on empty filter state action', async ({ page }) => {
    await page.goto('/dashboard?client=no-entries-client-id');

    await page.getByRole('button', { name: 'Clear Filter' }).click();

    await expect(page).not.toHaveURL(/client=/);
  });
});
```

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 5.8]
- [Source: _bmad-output/planning-artifacts/prd.md#FR23]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Empty States]
- [Source: _bmad-output/project-context.md#Implementation Rules]
- [Source: _bmad-output/implementation-artifacts/5-6-filter-by-client.md]
- [Source: _bmad-output/implementation-artifacts/5-7-search-entries.md]

## Definition of Done

- [ ] EmptyState base component created
- [ ] EmptyPeriodState for today/week/month
- [ ] EmptyFilterState with client name
- [ ] EmptySearchState with query display
- [ ] EmptyFirstTimeState for new users
- [ ] All empty states use consistent styling
- [ ] Icons from lucide-react (Calendar, Filter, Search, Sparkles)
- [ ] "เพิ่ม Entry" CTA links to /entry
- [ ] Clear Filter/Search actions work
- [ ] First-time user detection working
- [ ] Priority logic: Search > Filter > First-Time > Period
- [ ] Warm Thai copy per UX spec
- [ ] Unit tests for base component
- [ ] E2E tests for all empty states
- [ ] Mobile-friendly centered layout

## Dev Agent Record

### Agent Model Used

_To be filled by dev agent_

### Completion Notes List

_To be filled during implementation_

### File List

_To be filled with all created/modified files_
