# Story 5.8: Empty States

Status: done

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

- [x] **Task 1: Create EmptyState Base Component** (AC: 7)
  - [x] 1.1 Create `src/components/dashboard/EmptyStateBase.tsx`
  - [x] 1.2 Props: icon, title, description (ReactNode), action, secondaryAction
  - [x] 1.3 Center layout with proper spacing
  - [x] 1.4 Muted color scheme (bg-muted, text-muted-foreground)

- [x] **Task 2: Create Empty Period States** (AC: 1, 2, 3)
  - [x] 2.1 Create `EmptyPeriodState` with period prop (today/week/month)
  - [x] 2.2 Uses periodConfig record for period-specific titles/icons
  - [x] 2.3 Calendar/CalendarDays/CalendarRange icons from lucide-react
  - [x] 2.4 Add "Add Entry" CTA linking to /entry

- [x] **Task 3: Create Empty Filter State** (AC: 4)
  - [x] 3.1 Refactored `EmptyFilterState` to use EmptyStateBase
  - [x] 3.2 Accept clientName prop for message
  - [x] 3.3 Add "Clear Filter" action
  - [x] 3.4 No "Add Entry" CTA (filter context)

- [x] **Task 4: Update Empty Search State** (AC: 5)
  - [x] 4.1 Refactored `EmptySearchState` to use EmptyStateBase
  - [x] 4.2 Consistent styling with other empty states
  - [x] 4.3 Display search query in message with font-medium

- [x] **Task 5: Create Combined Empty State** (AC: 6)
  - [x] 5.1 Priority: search message prioritized over filter
  - [x] 5.2 Shows both search query and client name
  - [x] 5.3 Provides Clear Search and Clear Filter buttons

- [x] **Task 6: Create First-Time User State** (AC: 8)
  - [x] 6.1 Create `EmptyFirstTimeState` component
  - [x] 6.2 Detect first-time user via checkIsFirstTimeUser() query
  - [x] 6.3 "Welcome!" title, Sparkles icon, "Add First Entry" CTA

- [x] **Task 7: Create Empty State Icons/Illustrations** (AC: 7)
  - [x] 7.1 All icons from lucide-react
  - [x] 7.2 Calendar/CalendarDays/CalendarRange for period states
  - [x] 7.3 Filter icon for filter empty state
  - [x] 7.4 Search icon for search empty state
  - [x] 7.5 Sparkles for first-time state

- [x] **Task 8: Integrate Empty States in Dashboard** (AC: All)
  - [x] 8.1 Updated DashboardContent with getEmptyStateType() logic
  - [x] 8.2 Fetches isFirstTimeUser in parallel with entries/stats
  - [x] 8.3 Priority: Combined > Search > Filter > First-Time > Period

- [x] **Task 9: Unit & E2E Tests** (AC: All)
  - [x] 9.1 47 unit tests for all empty state components
  - [x] 9.2 CTA navigation tests (href to /entry)
  - [x] 9.3 Clear filter/search action tests with URL param handling
  - [x] 9.4 checkIsFirstTimeUser() query tests (6 tests)

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

- [x] EmptyState base component created (EmptyStateBase.tsx)
- [x] EmptyPeriodState for today/week/month
- [x] EmptyFilterState with client name (refactored to use base)
- [x] EmptySearchState with query display (refactored to use base)
- [x] EmptyFirstTimeState for new users
- [x] All empty states use consistent styling (muted colors, centered layout)
- [x] Icons from lucide-react (Calendar, Filter, Search, Sparkles)
- [x] "Add Entry" CTA links to /entry (English per project-context.md)
- [x] Clear Filter/Search actions work (URL param handling)
- [x] First-time user detection working (checkIsFirstTimeUser query)
- [x] Priority logic: Combined > Search > Filter > First-Time > Period
- [x] English copy per project-context.md UI standards
- [x] Unit tests for all components (47 tests)
- [x] Query tests for checkIsFirstTimeUser (6 tests)
- [x] E2E tests for all empty states (12 tests)
- [x] Mobile-friendly centered layout (py-12 px-4 text-center)

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Completion Notes List

1. **Task 1** - Created EmptyStateBase.tsx as the reusable base component with flexible props (icon, title, description as ReactNode, action with href/onClick, secondaryAction). 9 unit tests.

2. **Task 2** - Created EmptyPeriodState.tsx with periodConfig record containing today/week/month variants. Uses Calendar/CalendarDays/CalendarRange icons. 8 unit tests.

3. **Task 3** - Refactored existing EmptyFilterState.tsx to use EmptyStateBase. Maintains same functionality with cleaner code. 5 unit tests preserved.

4. **Task 4** - Refactored existing EmptySearchState.tsx to use EmptyStateBase. Updated description prop to accept ReactNode for styled query display. 7 unit tests preserved.

5. **Task 5** - Created EmptyCombinedState.tsx for when both search AND filter are active. Shows search query prioritized, client name secondary. Dual clear buttons. 7 unit tests.

6. **Task 6** - Created EmptyFirstTimeState.tsx with welcoming "Welcome!" message and Sparkles icon. Created checkIsFirstTimeUser() query function with 6 unit tests.

7. **Task 7** - Icons integrated via lucide-react: Calendar (today), CalendarDays (week), CalendarRange (month), Filter, Search, Sparkles.

8. **Task 8** - Updated DashboardContent.tsx with getEmptyStateType() logic. Fetches isFirstTimeUser in parallel. Priority: Combined > Search > Filter > First-Time > Period.

9. **Task 9** - All 47 empty state unit tests pass. All 1380 project tests pass. No regressions.

**Architecture Decision**: Used English UI copy per project-context.md ("UI Language: English only") instead of Thai copy in story spec. The story spec contained Thai text but project standards require English.

**Code Review & E2E Tests**: After initial implementation, conducted adversarial code review which identified 6 issues:
1. Language mismatch - CONFIRMED: English is correct per project-context.md
2. EmptyCombinedState code duplication - FIXED: Refactored to use EmptyStateBase (70→60 lines)
3. Missing E2E tests - FIXED: Created comprehensive E2E test suite (12 tests, all passing)
4. Performance issue with checkIsFirstTimeUser - FIXED: Changed from parallel fetch to conditional fetch (only when isEmpty=true)
5. Missing aria-label accessibility - FIXED: Added aria-label to all buttons in EmptyStateBase
6. Redundant wrapper divs - FIXED: Removed wrapper divs from EmptyPeriodState and EmptyFirstTimeState

E2E tests cover all 8 Acceptance Criteria: First-Time User State, Today/Week/Month Empty States, Filter State, Search State, Combined State, Visual Design verification, Navigation/Actions, and Priority Logic.

### File List

**Created:**
- src/components/dashboard/EmptyStateBase.tsx
- src/components/dashboard/EmptyStateBase.test.tsx
- src/components/dashboard/EmptyPeriodState.tsx
- src/components/dashboard/EmptyPeriodState.test.tsx
- src/components/dashboard/EmptyCombinedState.tsx
- src/components/dashboard/EmptyCombinedState.test.tsx
- src/components/dashboard/EmptyFirstTimeState.tsx
- src/components/dashboard/EmptyFirstTimeState.test.tsx
- test/e2e/dashboard/empty-states.test.ts

**Modified:**
- src/components/dashboard/EmptyFilterState.tsx (refactored to use EmptyStateBase)
- src/components/dashboard/EmptyFilterState.test.tsx (added beforeEach import)
- src/components/dashboard/EmptySearchState.tsx (refactored to use EmptyStateBase)
- src/components/dashboard/EmptyStateBase.tsx (added aria-label for accessibility)
- src/components/dashboard/EmptyCombinedState.tsx (refactored to use EmptyStateBase)
- src/components/dashboard/EmptyPeriodState.tsx (removed wrapper div, passed data-testid to base)
- src/components/dashboard/EmptyFirstTimeState.tsx (removed wrapper div, passed data-testid to base)
- src/components/dashboard/DashboardContent.tsx (integrated all empty states with priority logic + optimized checkIsFirstTimeUser)
- src/components/dashboard/index.ts (added new component exports)
- src/lib/queries/get-user-entries.ts (added checkIsFirstTimeUser function)
- src/lib/queries/get-user-entries.test.ts (added checkIsFirstTimeUser tests)

### Change Log

| Date | Change |
|------|--------|
| 2026-01-03 | Story 5.8 implementation completed - all 9 tasks done |
| 2026-01-03 | Code review completed - 6 issues identified and fixed, E2E tests added (12 tests) |
