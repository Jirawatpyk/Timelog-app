# Story 4.9: Skeleton Loading States

Status: ready-for-dev

## Story

As a **user**,
I want **to see loading skeletons while data loads**,
So that **I understand the app is working and the layout remains stable**.

## Acceptance Criteria

1. **AC1: Entry Page Initial Load**
   - Given I navigate to /entry page
   - When data is loading (recent combinations, dropdown options)
   - Then I see skeleton placeholders matching the final layout
   - And skeletons have subtle pulse animation

2. **AC2: Layout Stability (No CLS)**
   - Given skeletons are displayed
   - When real data loads
   - Then layout does not shift
   - And content replaces skeletons in-place

3. **AC3: Dropdown Loading State**
   - Given dropdown options are loading
   - When I tap a dropdown
   - Then I see loading indicator inside the dropdown
   - And dropdown is disabled until data arrives

4. **AC4: Recent Combinations Skeleton**
   - Given recent combinations are loading
   - When I view the recent section
   - Then I see skeleton cards matching final card dimensions
   - And skeleton count matches typical display (3 cards)

5. **AC5: Error State with Retry**
   - Given data fails to load
   - When error occurs
   - Then I see retry button: "ลองใหม่"
   - And tapping retry refetches the data

6. **AC6: Dashboard Entry List Skeleton**
   - Given I navigate to /dashboard
   - When entries are loading
   - Then I see skeleton entry cards
   - And stats skeleton shows at top

7. **AC7: Consistent Animation**
   - Given any skeleton is displayed
   - When animation plays
   - Then all skeletons use the same pulse animation
   - And animation is subtle (not distracting)

## Tasks / Subtasks

- [ ] **Task 1: Create Base Skeleton Components** (AC: 1, 7)
  - [ ] 1.1 Ensure shadcn/ui Skeleton is configured
  - [ ] 1.2 Create consistent animation styles
  - [ ] 1.3 Document skeleton usage patterns

- [ ] **Task 2: Entry Form Skeletons** (AC: 1, 2)
  - [ ] 2.1 Create `FormSkeleton` component
  - [ ] 2.2 Match selector field dimensions
  - [ ] 2.3 Match button dimensions

- [ ] **Task 3: Selector Loading States** (AC: 3)
  - [ ] 3.1 Add loading state to each selector
  - [ ] 3.2 Show skeleton while fetching
  - [ ] 3.3 Disable interaction during load

- [ ] **Task 4: Recent Combinations Skeleton** (AC: 4)
  - [ ] 4.1 Create `RecentCombinationsSkeleton`
  - [ ] 4.2 Match card dimensions (280px × 76px)
  - [ ] 4.3 Show 3 skeleton cards

- [ ] **Task 5: Error State with Retry** (AC: 5)
  - [ ] 5.1 Create `LoadingError` component
  - [ ] 5.2 Add retry button
  - [ ] 5.3 Handle refetch on click

- [ ] **Task 6: Dashboard Skeletons** (AC: 6)
  - [ ] 6.1 Create `EntryListSkeleton`
  - [ ] 6.2 Create `StatsSkeleton`
  - [ ] 6.3 Integrate with dashboard page

- [ ] **Task 7: Verify No Layout Shift** (AC: 2)
  - [ ] 7.1 Test CLS with Chrome DevTools
  - [ ] 7.2 Fix any dimension mismatches
  - [ ] 7.3 Ensure consistent heights

## Dev Notes

### Base Skeleton Component (shadcn/ui)

```typescript
// src/components/ui/skeleton.tsx (from shadcn/ui)
import { cn } from '@/lib/utils';

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-muted', className)}
      {...props}
    />
  );
}

export { Skeleton };
```

### Entry Form Skeleton

```typescript
// src/components/entry/FormSkeleton.tsx
'use client';

import { Skeleton } from '@/components/ui/skeleton';

export function FormSkeleton() {
  return (
    <div className="space-y-6">
      {/* Recent Combinations Skeleton */}
      <RecentCombinationsSkeleton />

      <div className="border-t" />

      {/* Cascading Selectors Skeleton */}
      <div className="space-y-4">
        <SelectorSkeleton label="Client" />
        <SelectorSkeleton label="Project" />
        <SelectorSkeleton label="Job" />
      </div>

      <div className="border-t" />

      {/* Service & Task Skeleton */}
      <div className="space-y-4">
        <SelectorSkeleton label="Service" />
        <SelectorSkeleton label="Task" optional />
      </div>

      <div className="border-t" />

      {/* Duration & Date Skeleton */}
      <div className="space-y-4">
        <DurationSkeleton />
        <DateSkeleton />
      </div>

      {/* Submit Button Skeleton */}
      <div className="pt-4">
        <Skeleton className="h-12 w-full rounded-md" />
      </div>
    </div>
  );
}

function SelectorSkeleton({ label, optional }: { label: string; optional?: boolean }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1">
        <Skeleton className="h-4 w-16" />
        {optional && <Skeleton className="h-3 w-12" />}
      </div>
      <Skeleton className="h-11 w-full rounded-md" />
    </div>
  );
}

function DurationSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-4 w-24" />
      {/* Preset buttons */}
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-8 w-14 rounded-md" />
        ))}
      </div>
      {/* Input field */}
      <Skeleton className="h-10 w-full rounded-md" />
    </div>
  );
}

function DateSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-4 w-12" />
      <Skeleton className="h-11 w-full rounded-md" />
    </div>
  );
}

function RecentCombinationsSkeleton() {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-20" />
      </div>

      {/* Cards */}
      <div className="flex gap-2 overflow-hidden">
        {[1, 2, 3].map((i) => (
          <Skeleton
            key={i}
            className="flex-shrink-0 w-[280px] h-[76px] rounded-lg"
          />
        ))}
      </div>
    </div>
  );
}

export { RecentCombinationsSkeleton, SelectorSkeleton, DurationSkeleton, DateSkeleton };
```

### Selector with Loading State

```typescript
// src/components/entry/ClientSelector.tsx (updated with skeleton)
'use client';

import { forwardRef } from 'react';
import { useClients } from '@/hooks/use-entry-data';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ClientSelectorProps {
  value: string;
  onChange: (clientId: string) => void;
  disabled?: boolean;
  error?: string;
}

export const ClientSelector = forwardRef<HTMLButtonElement, ClientSelectorProps>(
  function ClientSelector({ value, onChange, disabled, error }, ref) {
    const { data: clients, isLoading, isError, refetch } = useClients();

    // Loading skeleton
    if (isLoading) {
      return (
        <div className="space-y-2">
          <Label>Client *</Label>
          <Skeleton className="h-11 w-full rounded-md" />
        </div>
      );
    }

    // Error state with retry
    if (isError) {
      return (
        <div className="space-y-2">
          <Label>Client *</Label>
          <div className="flex items-center justify-between h-11 px-3 border rounded-md bg-muted/50">
            <span className="text-sm text-muted-foreground">โหลดข้อมูลไม่สำเร็จ</span>
            <button
              type="button"
              onClick={() => refetch()}
              className="text-sm text-primary hover:underline"
            >
              ลองใหม่
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        <Label htmlFor="clientId" className={error ? 'text-destructive' : ''}>
          Client *
        </Label>
        <Select
          value={value}
          onValueChange={onChange}
          disabled={disabled}
        >
          <SelectTrigger
            ref={ref}
            id="clientId"
            className={cn(
              'min-h-[44px]',
              error && 'border-destructive'
            )}
          >
            <SelectValue placeholder="เลือก Client" />
          </SelectTrigger>
          <SelectContent>
            {clients?.map((client) => (
              <SelectItem key={client.id} value={client.id}>
                {client.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);
```

### Loading Error Component

```typescript
// src/components/shared/LoadingError.tsx
'use client';

import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LoadingErrorProps {
  message?: string;
  onRetry: () => void;
  isRetrying?: boolean;
}

export function LoadingError({
  message = 'ไม่สามารถโหลดข้อมูลได้',
  onRetry,
  isRetrying,
}: LoadingErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <AlertCircle className="h-10 w-10 text-muted-foreground mb-3" />
      <p className="text-sm text-muted-foreground mb-4">{message}</p>
      <Button
        variant="outline"
        size="sm"
        onClick={onRetry}
        disabled={isRetrying}
      >
        {isRetrying ? (
          <>
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            กำลังโหลด...
          </>
        ) : (
          <>
            <RefreshCw className="mr-2 h-4 w-4" />
            ลองใหม่
          </>
        )}
      </Button>
    </div>
  );
}
```

### Dashboard Entry List Skeleton

```typescript
// src/components/dashboard/EntryListSkeleton.tsx
'use client';

import { Skeleton } from '@/components/ui/skeleton';

interface EntryListSkeletonProps {
  count?: number;
}

export function EntryListSkeleton({ count = 5 }: EntryListSkeletonProps) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <EntryCardSkeleton key={i} />
      ))}
    </div>
  );
}

function EntryCardSkeleton() {
  return (
    <div className="p-4 rounded-lg border bg-card">
      <div className="flex justify-between items-start">
        <div className="space-y-2 flex-1">
          {/* Client › Project */}
          <Skeleton className="h-5 w-3/4" />
          {/* Job */}
          <Skeleton className="h-4 w-1/2" />
          {/* Service */}
          <Skeleton className="h-3 w-1/3" />
        </div>
        {/* Duration */}
        <Skeleton className="h-6 w-16" />
      </div>
    </div>
  );
}

export { EntryCardSkeleton };
```

### Dashboard Stats Skeleton

```typescript
// src/components/dashboard/StatsSkeleton.tsx
'use client';

import { Skeleton } from '@/components/ui/skeleton';

export function StatsSkeleton() {
  return (
    <div className="p-4 rounded-lg border bg-card">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          {/* Period label */}
          <Skeleton className="h-4 w-20" />
          {/* Total hours */}
          <Skeleton className="h-8 w-32" />
        </div>
        {/* Entry count */}
        <Skeleton className="h-10 w-16 rounded-full" />
      </div>
    </div>
  );
}
```

### Period Selector Skeleton

```typescript
// src/components/dashboard/PeriodSelectorSkeleton.tsx
'use client';

import { Skeleton } from '@/components/ui/skeleton';

export function PeriodSelectorSkeleton() {
  return (
    <div className="flex gap-2">
      {['วันนี้', 'สัปดาห์นี้', 'เดือนนี้'].map((_, i) => (
        <Skeleton key={i} className="h-9 w-24 rounded-md" />
      ))}
    </div>
  );
}
```

### Updated RecentCombinations with Skeleton

```typescript
// src/components/entry/RecentCombinations.tsx (updated)
'use client';

import { Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { LoadingError } from '@/components/shared/LoadingError';
import { useRecentCombinations } from '@/hooks/use-entry-data';
import { cn } from '@/lib/utils';
import type { RecentCombination } from '@/types/domain';

interface RecentCombinationsProps {
  onSelect: (combination: RecentCombination) => void;
}

export function RecentCombinations({ onSelect }: RecentCombinationsProps) {
  const {
    data: combinations,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useRecentCombinations();

  if (isLoading) {
    return <RecentCombinationsSkeleton />;
  }

  if (isError) {
    return (
      <LoadingError
        message="ไม่สามารถโหลดรายการล่าสุดได้"
        onRetry={() => refetch()}
        isRetrying={isRefetching}
      />
    );
  }

  if (!combinations || combinations.length === 0) {
    return <EmptyRecentCombinations />;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Clock className="h-4 w-4" />
        <span>รายการล่าสุด</span>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
        {combinations.map((combo) => (
          <CombinationCard
            key={combo.id}
            combination={combo}
            onClick={() => onSelect(combo)}
          />
        ))}
      </div>
    </div>
  );
}

// ... CombinationCard, EmptyRecentCombinations (same as before)

export function RecentCombinationsSkeleton() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-4 rounded" />
        <Skeleton className="h-4 w-20" />
      </div>

      <div className="flex gap-2 overflow-hidden -mx-4 px-4">
        {[1, 2, 3].map((i) => (
          <Skeleton
            key={i}
            className="flex-shrink-0 w-[280px] h-[76px] rounded-lg"
          />
        ))}
      </div>
    </div>
  );
}

function EmptyRecentCombinations() {
  return (
    <div className="py-4 text-center text-sm text-muted-foreground">
      <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
      <p>ยังไม่มีรายการล่าสุด</p>
      <p className="text-xs mt-1">บันทึก entry แรกเพื่อเริ่มต้น</p>
    </div>
  );
}

function CombinationCard({
  combination,
  onClick,
}: {
  combination: RecentCombination;
  onClick: () => void;
}) {
  const { client, project, job, service, task } = combination;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex-shrink-0 w-[280px] p-3 rounded-lg border bg-card',
        'text-left transition-colors',
        'hover:bg-accent hover:border-accent-foreground/20',
        'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        'touch-manipulation'
      )}
    >
      <div className="space-y-1">
        <p className="text-sm font-medium truncate">
          {client.name} › {project.name}
        </p>
        <p className="text-sm text-muted-foreground truncate">
          {job.jobNo ? `${job.jobNo} - ` : ''}{job.name}
        </p>
        <p className="text-xs text-muted-foreground truncate">
          {service.name}
          {task && ` • ${task.name}`}
        </p>
      </div>
    </button>
  );
}
```

### Entry Page with Suspense

```typescript
// src/app/(app)/entry/page.tsx
import { Suspense } from 'react';
import { TimeEntryForm } from './components/TimeEntryForm';
import { FormSkeleton } from '@/components/entry/FormSkeleton';

export default function EntryPage() {
  return (
    <div className="container py-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-6">บันทึกเวลา</h1>

      <Suspense fallback={<FormSkeleton />}>
        <TimeEntryForm />
      </Suspense>
    </div>
  );
}
```

### Skeleton Dimensions Reference

| Component | Width | Height | Notes |
|-----------|-------|--------|-------|
| Selector field | 100% | 44px | min-height for touch |
| Duration preset button | 56px | 32px | 5 buttons |
| Duration input | 100% | 40px | |
| Date picker | 100% | 44px | |
| Submit button | 100% | 48px | |
| Recent combo card | 280px | 76px | fixed width |
| Entry card | 100% | ~88px | varies by content |
| Stats card | 100% | ~72px | |

### CSS for Consistent Animation

```css
/* Already in Tailwind config via shadcn/ui */
/* Ensure animation-pulse is defined */

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
```

### Project Structure

```
src/
├── components/
│   ├── ui/
│   │   └── skeleton.tsx            # Base skeleton (shadcn/ui)
│   ├── shared/
│   │   └── LoadingError.tsx        # NEW
│   ├── entry/
│   │   ├── FormSkeleton.tsx        # NEW
│   │   ├── ClientSelector.tsx      # MODIFIED - Add loading state
│   │   ├── ProjectSelector.tsx     # MODIFIED - Add loading state
│   │   ├── JobSelector.tsx         # MODIFIED - Add loading state
│   │   ├── ServiceSelector.tsx     # MODIFIED - Add loading state
│   │   ├── TaskSelector.tsx        # MODIFIED - Add loading state
│   │   └── RecentCombinations.tsx  # MODIFIED - Export skeleton
│   └── dashboard/
│       ├── EntryListSkeleton.tsx   # NEW
│       ├── StatsSkeleton.tsx       # NEW
│       └── PeriodSelectorSkeleton.tsx # NEW
└── app/
    └── (app)/
        └── entry/
            └── page.tsx            # MODIFIED - Add Suspense
```

### CLS (Cumulative Layout Shift) Prevention

**Rules:**
1. Skeleton dimensions MUST match final content dimensions
2. Use fixed heights where possible
3. Reserve space for dynamic content
4. Avoid layout-affecting properties changing on load

**Testing:**
```bash
# Using Chrome DevTools
1. Open DevTools → Performance tab
2. Check "Web Vitals"
3. Record page load
4. Verify CLS < 0.1
```

### Testing Considerations

```typescript
// test/e2e/entry/skeleton-loading.test.ts
import { test, expect } from '@playwright/test';

test.describe('Skeleton Loading States', () => {
  test('shows skeleton during initial load', async ({ page }) => {
    // Slow down network to see skeleton
    await page.route('**/*', (route) => {
      setTimeout(() => route.continue(), 500);
    });

    await page.goto('/entry');

    // Verify skeletons are visible
    await expect(page.locator('.animate-pulse').first()).toBeVisible();
  });

  test('no layout shift on content load', async ({ page }) => {
    // Measure layout shift
    const cls = await page.evaluate(async () => {
      return new Promise((resolve) => {
        let cls = 0;
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              cls += (entry as any).value;
            }
          }
          resolve(cls);
        }).observe({ type: 'layout-shift', buffered: true });

        // Wait for page to settle
        setTimeout(() => resolve(cls), 3000);
      });
    });

    expect(cls).toBeLessThan(0.1);
  });

  test('shows retry button on error', async ({ page }) => {
    // Mock API failure
    await page.route('**/rest/v1/clients*', (route) => {
      route.fulfill({ status: 500 });
    });

    await page.goto('/entry');

    await expect(page.locator('text=ลองใหม่')).toBeVisible();
  });

  test('retry refetches data', async ({ page }) => {
    let requestCount = 0;

    await page.route('**/rest/v1/clients*', (route) => {
      requestCount++;
      if (requestCount === 1) {
        route.fulfill({ status: 500 });
      } else {
        route.fulfill({
          status: 200,
          body: JSON.stringify([{ id: '1', name: 'Test Client' }]),
        });
      }
    });

    await page.goto('/entry');
    await page.click('text=ลองใหม่');

    await expect(page.locator('text=Test Client')).toBeVisible();
  });
});
```

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#Loading States]
- [Source: _bmad-output/planning-artifacts/epics.md#Story 4.9]
- [Source: _bmad-output/project-context.md#NFR-P5 CLS]
- [Source: _bmad-output/implementation-artifacts/4-7-recent-combinations-quick-entry.md]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Skeleton Loading]

## Definition of Done

- [ ] FormSkeleton matches final form layout
- [ ] All selectors show skeleton during load
- [ ] Recent combinations skeleton matches card dimensions
- [ ] Dashboard has entry list skeleton
- [ ] Dashboard has stats skeleton
- [ ] LoadingError component with retry works
- [ ] Retry button refetches data
- [ ] CLS < 0.1 verified
- [ ] All skeletons use consistent animation
- [ ] Error states handle gracefully
- [ ] Suspense boundaries properly placed
- [ ] No layout shift on content load

## Dev Agent Record

### Agent Model Used

_To be filled by dev agent_

### Completion Notes List

_To be filled during implementation_

### File List

_To be filled with all created/modified files_
