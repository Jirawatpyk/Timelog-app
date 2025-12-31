# Story 5.7: Search Entries

Status: ready-for-dev

## Story

As a **staff member**,
I want **to search my entries by text**,
So that **I can find specific entries quickly**.

## Acceptance Criteria

1. **AC1: Search Icon & Input Toggle**
   - Given I am on the dashboard
   - When I tap the search icon
   - Then a search input appears at the top
   - And the keyboard opens automatically (mobile)
   - And the search icon changes to indicate active state

2. **AC2: Debounced Search**
   - Given the search input is visible
   - When I type a search query (minimum 2 characters)
   - And I stop typing for 300ms (debounced)
   - Then entries are filtered to match the query
   - And a loading indicator shows briefly during search

3. **AC3: Search Scope**
   - Given I enter a search query
   - When search executes
   - Then it matches against:
     - Client name
     - Project name
     - Job name
     - Job number (job_no)
     - Service name
     - Task name
     - Notes field
   - And matching is case-insensitive
   - And partial matches are included

4. **AC4: Search Results Display**
   - Given search returns results
   - When viewing the filtered list
   - Then only matching entries are shown
   - And stats update to reflect search results
   - And result count is displayed: "พบ X รายการ"

5. **AC5: No Results State**
   - Given search returns no results
   - When query doesn't match any entries
   - Then I see: "ไม่พบรายการที่ค้นหา"
   - And I see the search query displayed
   - And I see option to clear search

6. **AC6: Clear Search**
   - Given search input has text
   - When I tap the clear button (X) OR delete all text
   - Then all entries for current period are shown again
   - And search input remains visible
   - And focus stays in the input

7. **AC7: Close Search**
   - Given search mode is active
   - When I tap the close/cancel button
   - Then search input hides
   - And all entries for current period are shown
   - And search query is cleared

8. **AC8: Search + Filter Combination**
   - Given I have a client filter active (from 5-6)
   - When I also search
   - Then search applies within the filtered results
   - And both filter chip and search are visible

9. **AC9: Search + Period Combination**
   - Given I have a search active
   - When I switch periods (today/week/month)
   - Then search applies to the new period
   - And search query is preserved

## Tasks / Subtasks

- [ ] **Task 1: Create Search Types & State** (AC: 1, 2)
  - [ ] 1.1 Add search-related types to `src/types/dashboard.ts`
  - [ ] 1.2 Define URL search param for query (`?q=xxx`)
  - [ ] 1.3 Create useDebounce hook if not exists

- [ ] **Task 2: Create SearchButton Component** (AC: 1)
  - [ ] 2.1 Create `src/components/dashboard/SearchButton.tsx`
  - [ ] 2.2 Add search icon (magnifying glass)
  - [ ] 2.3 Toggle search input visibility
  - [ ] 2.4 Show active state when searching

- [ ] **Task 3: Create SearchInput Component** (AC: 1, 2, 6, 7)
  - [ ] 3.1 Create `src/components/dashboard/SearchInput.tsx`
  - [ ] 3.2 Auto-focus on mount (open keyboard on mobile)
  - [ ] 3.3 Add clear button (X) inside input
  - [ ] 3.4 Add close/cancel button
  - [ ] 3.5 Implement 300ms debounce
  - [ ] 3.6 Update URL with debounced query

- [ ] **Task 4: Implement Search Query Logic** (AC: 3)
  - [ ] 4.1 Modify `getUserEntries()` to accept search param
  - [ ] 4.2 Build case-insensitive search across all fields
  - [ ] 4.3 Use Supabase `ilike` or `textSearch` for performance
  - [ ] 4.4 Handle partial matches

- [ ] **Task 5: Create SearchResultsCount Component** (AC: 4)
  - [ ] 5.1 Display "พบ X รายการ" when searching
  - [ ] 5.2 Animate count changes
  - [ ] 5.3 Hide when not searching

- [ ] **Task 6: Create EmptySearchState Component** (AC: 5)
  - [ ] 6.1 Create `src/components/dashboard/EmptySearchState.tsx`
  - [ ] 6.2 Display "ไม่พบรายการที่ค้นหา"
  - [ ] 6.3 Show the search query
  - [ ] 6.4 Add clear search button

- [ ] **Task 7: Update Dashboard Page** (AC: 8, 9)
  - [ ] 7.1 Read `q` param from URL searchParams
  - [ ] 7.2 Pass query to getUserEntries and getDashboardStats
  - [ ] 7.3 Combine with existing filter logic
  - [ ] 7.4 Preserve search on period change

- [ ] **Task 8: Create useDebounce Hook** (AC: 2)
  - [ ] 8.1 Create `src/hooks/use-debounce.ts`
  - [ ] 8.2 Generic debounce implementation
  - [ ] 8.3 Unit tests

- [ ] **Task 9: E2E Tests** (AC: All)
  - [ ] 9.1 Test search toggle
  - [ ] 9.2 Test debounced search
  - [ ] 9.3 Test clear and close
  - [ ] 9.4 Test empty state
  - [ ] 9.5 Test with filter combination

## Dev Notes

### Architecture Compliance

**Required Patterns:**
- Client Component for SearchInput (needs interactivity)
- Server Component pattern for data fetching
- URL searchParams for search state (`?q=xxx`)
- Use `@/` import aliases only
- No TanStack Query on Dashboard

**Key Decisions:**
- Search is **client-side filtering** for MVP (entries already loaded)
- Alternative: Server-side search with URL params (better for large datasets)
- **Chosen: URL-based server search** for consistency with filter pattern

**File Locations:**
- Components: `src/components/dashboard/SearchButton.tsx`, `SearchInput.tsx`, `EmptySearchState.tsx`
- Hook: `src/hooks/use-debounce.ts`
- Types: `src/types/dashboard.ts` (extend)

### Types Definition

```typescript
// src/types/dashboard.ts - Add these

export interface SearchState {
  query: string;
  isOpen: boolean;
}

// Extend page props
export interface DashboardPageProps {
  searchParams: {
    period?: string;
    client?: string;
    q?: string;  // Search query
  };
}

// Extend filter state
export interface FilterState {
  clientId?: string;
  searchQuery?: string;
}
```

### useDebounce Hook

```typescript
// src/hooks/use-debounce.ts
'use client';

import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
```

### SearchButton Component

```typescript
// src/components/dashboard/SearchButton.tsx
'use client';

import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SearchButtonProps {
  isActive: boolean;
  onClick: () => void;
}

export function SearchButton({ isActive, onClick }: SearchButtonProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      className={cn(isActive && 'bg-primary/10 text-primary')}
      aria-label={isActive ? 'Close search' : 'Search entries'}
    >
      <Search className="h-5 w-5" />
    </Button>
  );
}
```

### SearchInput Component

```typescript
// src/components/dashboard/SearchInput.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useDebounce } from '@/hooks/use-debounce';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchInputProps {
  initialQuery?: string;
  onClose: () => void;
}

export function SearchInput({ initialQuery = '', onClose }: SearchInputProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState(initialQuery);
  const [isSearching, setIsSearching] = useState(false);
  const debouncedQuery = useDebounce(query, 300);

  // Auto-focus on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Update URL when debounced query changes
  useEffect(() => {
    if (debouncedQuery === initialQuery) return;

    setIsSearching(true);
    const params = new URLSearchParams(searchParams.toString());

    if (debouncedQuery.length >= 2) {
      params.set('q', debouncedQuery);
    } else {
      params.delete('q');
    }

    router.push(`/dashboard?${params.toString()}`);

    // Brief loading indicator
    const timer = setTimeout(() => setIsSearching(false), 200);
    return () => clearTimeout(timer);
  }, [debouncedQuery, initialQuery, router, searchParams]);

  const handleClear = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  const handleClose = () => {
    // Clear search from URL
    const params = new URLSearchParams(searchParams.toString());
    params.delete('q');
    router.push(`/dashboard?${params.toString()}`);
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="flex items-center gap-2 w-full"
      >
        <div className="relative flex-1">
          <Input
            ref={inputRef}
            type="text"
            placeholder="ค้นหา client, project, job..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pr-10"
          />

          {/* Clear or Loading indicator */}
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            {isSearching ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : query ? (
              <button
                onClick={handleClear}
                className="p-1 rounded-full hover:bg-muted"
                aria-label="Clear search"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            ) : null}
          </div>
        </div>

        <Button variant="ghost" size="sm" onClick={handleClose}>
          Cancel
        </Button>
      </motion.div>
    </AnimatePresence>
  );
}
```

### Update getUserEntries for Search

```typescript
// src/lib/queries/get-user-entries.ts - Add search support

export async function getUserEntries(
  dateRange: DateRange,
  filter?: FilterState
): Promise<TimeEntryWithRelations[]> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const startDate = dateRange.start.toISOString().split('T')[0];
  const endDate = dateRange.end.toISOString().split('T')[0];

  let query = supabase
    .from('time_entries')
    .select(`
      *,
      job:jobs!inner(
        id, name, job_no,
        project:projects!inner(
          id, name,
          client:clients!inner(id, name)
        )
      ),
      service:services(id, name),
      task:tasks(id, name)
    `)
    .eq('user_id', user.id)
    .gte('entry_date', startDate)
    .lte('entry_date', endDate)
    .order('entry_date', { ascending: false })
    .order('created_at', { ascending: false });

  // Apply client filter
  if (filter?.clientId) {
    query = query.eq('job.project.client.id', filter.clientId);
  }

  const { data, error } = await query;
  if (error) throw error;

  let entries = data || [];

  // Apply search filter (client-side for complex multi-field search)
  if (filter?.searchQuery && filter.searchQuery.length >= 2) {
    const searchLower = filter.searchQuery.toLowerCase();

    entries = entries.filter((entry) => {
      const searchableFields = [
        entry.job?.project?.client?.name,
        entry.job?.project?.name,
        entry.job?.name,
        entry.job?.job_no,
        entry.service?.name,
        entry.task?.name,
        entry.notes,
      ];

      return searchableFields.some(
        (field) => field?.toLowerCase().includes(searchLower)
      );
    });
  }

  return entries;
}
```

### SearchResultsCount Component

```typescript
// src/components/dashboard/SearchResultsCount.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface SearchResultsCountProps {
  count: number;
  query: string;
}

export function SearchResultsCount({ count, query }: SearchResultsCountProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="text-sm text-muted-foreground"
      >
        พบ <span className="font-medium text-foreground">{count}</span> รายการ
        {query && (
          <span className="ml-1">
            สำหรับ "<span className="font-medium">{query}</span>"
          </span>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
```

### EmptySearchState Component

```typescript
// src/components/dashboard/EmptySearchState.tsx
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptySearchStateProps {
  query: string;
  onClear: () => void;
}

export function EmptySearchState({ query, onClear }: EmptySearchStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-muted p-4 mb-4">
        <Search className="h-8 w-8 text-muted-foreground" />
      </div>

      <h3 className="text-lg font-medium mb-2">
        ไม่พบรายการที่ค้นหา
      </h3>

      <p className="text-muted-foreground mb-4">
        ไม่พบ entry สำหรับ "<span className="font-medium">{query}</span>"
      </p>

      <Button variant="outline" onClick={onClear}>
        Clear Search
      </Button>
    </div>
  );
}
```

### Dashboard Header with Search

```typescript
// src/components/dashboard/DashboardHeader.tsx
'use client';

import { useState } from 'react';
import { PeriodSelector } from '@/components/dashboard/PeriodSelector';
import { FilterButton } from '@/components/dashboard/FilterButton';
import { SearchButton } from '@/components/dashboard/SearchButton';
import { SearchInput } from '@/components/dashboard/SearchInput';
import type { Period } from '@/types/dashboard';

interface DashboardHeaderProps {
  currentPeriod: Period;
  hasActiveFilter: boolean;
  currentSearchQuery?: string;
  onFilterClick: () => void;
}

export function DashboardHeader({
  currentPeriod,
  hasActiveFilter,
  currentSearchQuery,
  onFilterClick,
}: DashboardHeaderProps) {
  const [searchOpen, setSearchOpen] = useState(!!currentSearchQuery);

  return (
    <div className="space-y-3">
      {searchOpen ? (
        <SearchInput
          initialQuery={currentSearchQuery}
          onClose={() => setSearchOpen(false)}
        />
      ) : (
        <div className="flex items-center justify-between">
          <PeriodSelector currentPeriod={currentPeriod} />

          <div className="flex items-center gap-1">
            <SearchButton
              isActive={!!currentSearchQuery}
              onClick={() => setSearchOpen(true)}
            />
            <FilterButton
              hasActiveFilter={hasActiveFilter}
              onClick={onFilterClick}
            />
          </div>
        </div>
      )}
    </div>
  );
}
```

### Updated Dashboard Page

```typescript
// src/app/(app)/dashboard/page.tsx
import { Suspense } from 'react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { FilterChip } from '@/components/dashboard/FilterChip';
import { SearchResultsCount } from '@/components/dashboard/SearchResultsCount';
import { DashboardContent } from '@/components/dashboard/DashboardContent';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';
import { getUserClients } from '@/lib/queries/dashboard';
import type { Period, DashboardPageProps } from '@/types/dashboard';

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const period = (searchParams.period as Period) || 'today';
  const clientId = searchParams.client;
  const searchQuery = searchParams.q;

  const clients = await getUserClients();
  const activeClient = clients.find((c) => c.id === clientId);

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Header with Period, Search, and Filter */}
      <DashboardHeader
        currentPeriod={period}
        hasActiveFilter={!!clientId}
        currentSearchQuery={searchQuery}
        onFilterClick={() => {/* handled by client component */}}
      />

      {/* Active Filters & Search Results */}
      <div className="flex flex-wrap items-center gap-2">
        {activeClient && (
          <FilterChip
            label="Client"
            value={activeClient.name}
            paramName="client"
          />
        )}

        {searchQuery && (
          <SearchResultsCount
            count={0} // Will be updated by DashboardContent
            query={searchQuery}
          />
        )}
      </div>

      {/* Dashboard Content */}
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent
          period={period}
          filter={{ clientId, searchQuery }}
        />
      </Suspense>
    </div>
  );
}
```

### Project Structure Update

```
src/
├── components/
│   └── dashboard/
│       ├── DashboardHeader.tsx       # NEW (combines period, search, filter)
│       ├── SearchButton.tsx          # NEW
│       ├── SearchInput.tsx           # NEW
│       ├── SearchResultsCount.tsx    # NEW
│       ├── EmptySearchState.tsx      # NEW
│       ├── PeriodSelector.tsx        # From 5-1
│       ├── FilterButton.tsx          # From 5-6
│       ├── FilterSheet.tsx           # From 5-6
│       ├── FilterChip.tsx            # From 5-6
│       ├── StatsCard.tsx             # From 5-5
│       ├── EntryList.tsx             # From 5-2
│       └── ...
├── hooks/
│   ├── use-debounce.ts               # NEW
│   └── use-debounce.test.ts          # NEW
├── lib/
│   └── queries/
│       ├── get-user-entries.ts       # MODIFY (add search)
│       └── dashboard.ts              # From 5-5, 5-6
└── types/
    └── dashboard.ts                  # EXTEND (SearchState)
```

### Previous Story Intelligence (5-6)

**Learnings from Story 5-6:**
- URL searchParams pattern established (`?client=xxx`)
- FilterChip component available for reuse pattern
- getUserEntries accepts FilterState
- getDashboardStats accepts filter

**Code to Reuse:**
- URL params handling pattern
- FilterState type (extend with searchQuery)
- Animation patterns with framer-motion

### Testing

```typescript
// src/hooks/use-debounce.test.ts
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from './use-debounce';

describe('useDebounce', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 300));
    expect(result.current).toBe('initial');
  });

  it('updates value after delay', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'initial' } }
    );

    rerender({ value: 'updated' });
    expect(result.current).toBe('initial');

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(result.current).toBe('updated');
  });

  it('resets timer on rapid changes', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'a' } }
    );

    rerender({ value: 'ab' });
    act(() => jest.advanceTimersByTime(100));

    rerender({ value: 'abc' });
    act(() => jest.advanceTimersByTime(100));

    rerender({ value: 'abcd' });
    act(() => jest.advanceTimersByTime(300));

    expect(result.current).toBe('abcd');
  });
});
```

```typescript
// test/e2e/dashboard/search.test.ts
import { test, expect } from '@playwright/test';

test.describe('Dashboard Search', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
  });

  test('opens search input on button click', async ({ page }) => {
    await page.getByRole('button', { name: /search/i }).click();
    await expect(page.getByPlaceholder(/ค้นหา/)).toBeVisible();
    await expect(page.getByPlaceholder(/ค้นหา/)).toBeFocused();
  });

  test('searches after debounce delay', async ({ page }) => {
    await page.getByRole('button', { name: /search/i }).click();
    await page.getByPlaceholder(/ค้นหา/).fill('test query');

    // Wait for debounce
    await page.waitForTimeout(350);

    // URL should have query param
    await expect(page).toHaveURL(/q=test/);
  });

  test('ignores queries less than 2 characters', async ({ page }) => {
    await page.getByRole('button', { name: /search/i }).click();
    await page.getByPlaceholder(/ค้นหา/).fill('a');

    await page.waitForTimeout(350);

    // URL should NOT have query param
    await expect(page).not.toHaveURL(/q=/);
  });

  test('clears search on X click', async ({ page }) => {
    await page.goto('/dashboard?q=test');

    await page.getByRole('button', { name: /clear search/i }).click();

    // Query should be cleared from input
    await expect(page.getByPlaceholder(/ค้นหา/)).toHaveValue('');
  });

  test('closes search on cancel click', async ({ page }) => {
    await page.getByRole('button', { name: /search/i }).click();
    await page.getByRole('button', { name: /cancel/i }).click();

    // Search input should be hidden
    await expect(page.getByPlaceholder(/ค้นหา/)).not.toBeVisible();
  });

  test('shows empty state when no results', async ({ page }) => {
    await page.getByRole('button', { name: /search/i }).click();
    await page.getByPlaceholder(/ค้นหา/).fill('xyznonexistent');

    await page.waitForTimeout(350);

    await expect(page.getByText('ไม่พบรายการที่ค้นหา')).toBeVisible();
  });

  test('preserves search on period change', async ({ page }) => {
    await page.goto('/dashboard?q=test');

    await page.getByRole('tab', { name: /สัปดาห์/i }).click();

    // Search should still be in URL
    await expect(page).toHaveURL(/q=test/);
  });

  test('combines with client filter', async ({ page }) => {
    await page.goto('/dashboard?client=some-client-id&q=test');

    // Both should be in URL
    await expect(page).toHaveURL(/client=/);
    await expect(page).toHaveURL(/q=/);
  });
});
```

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 5.7]
- [Source: _bmad-output/planning-artifacts/prd.md#FR22]
- [Source: _bmad-output/planning-artifacts/architecture.md#State Management]
- [Source: _bmad-output/project-context.md#Implementation Rules]
- [Source: _bmad-output/implementation-artifacts/5-6-filter-by-client.md]

## Definition of Done

- [ ] SearchButton component with active state
- [ ] SearchInput with debounced URL updates
- [ ] useDebounce hook created and tested
- [ ] Search queries min 2 characters
- [ ] Search matches all specified fields (case-insensitive)
- [ ] SearchResultsCount displays correctly
- [ ] EmptySearchState when no results
- [ ] Clear button clears input and URL
- [ ] Cancel button closes search mode
- [ ] Search combines with client filter
- [ ] Search preserves across period changes
- [ ] URL is shareable with search query
- [ ] E2E tests passing
- [ ] Mobile keyboard opens on focus
- [ ] 300ms debounce working correctly

## Dev Agent Record

### Agent Model Used

_To be filled by dev agent_

### Completion Notes List

_To be filled during implementation_

### File List

_To be filled with all created/modified files_
