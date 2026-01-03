# Story 6.6: Near Real-Time Updates

## Status: done

## Story

As a **manager**,
I want **the team dashboard to update automatically**,
So that **I see current data without manual refresh**.

## Acceptance Criteria

### AC 1: Auto-Refresh Every 30 Seconds
- **Given** I am viewing the team dashboard
- **When** The page is open
- **Then** Data refreshes automatically every 30 seconds
- **And** Polling uses `POLLING_INTERVAL_MS` from constants
- **And** No visible loading indicator during background refresh

### AC 2: Team Member Status Updates
- **Given** A team member logs a new entry
- **When** Next poll occurs (within 30s)
- **Then** Their status updates from "Not Logged" to "Logged"
- **And** Their hours update in the list
- **And** Aggregated stats update

### AC 3: Pull-to-Refresh on Mobile
- **Given** I manually pull-to-refresh on mobile
- **When** Pull gesture completes
- **Then** Data refreshes immediately
- **And** I see brief loading indicator
- **And** Polling timer resets

### AC 4: Silent Network Error Handling
- **Given** Network connection is lost
- **When** Poll fails
- **Then** No error shown to user (silent retry)
- **And** Data remains stale but visible
- **And** When connection restored, next poll succeeds

### AC 5: Pause Polling When Tab Hidden
- **Given** I switch to another browser tab
- **When** Team dashboard tab is not visible
- **Then** Polling pauses to save resources
- **And** Polling resumes when tab becomes visible again

## Tasks

### Task 1: Create Polling Interval Constant
**File:** `src/constants/time.ts`
- [x] Add `POLLING_INTERVAL_MS = 30_000` constant
- [x] Export for use across team dashboard

### Task 2: Create usePolling Hook
**File:** `src/hooks/use-polling.ts`
- [x] Create generic polling hook with interval parameter
- [x] Handle start/stop/reset functions
- [x] Support pause when tab is hidden (visibilitychange)
- [x] Return polling state (isPolling, lastUpdated)

### Task 3: Create Team Data Fetcher
**File:** `src/app/(app)/team/components/TeamDataProvider.tsx`
- [x] Create client component wrapper for polling
- [x] Fetch team data on interval
- [x] Pass data to child components
- [x] Handle loading and error states silently

### Task 4: Implement Background Refresh
**File:** `src/app/(app)/team/components/TeamDataProvider.tsx`
- [x] Use `router.refresh()` for Server Component data
- [x] No loading spinner during background refresh
- [x] Update data seamlessly

### Task 5: Create Pull-to-Refresh Component
**File:** `src/components/shared/PullToRefresh.tsx`
- [x] Use `@use-gesture/react` for pull detection
- [x] Show pull indicator following gesture
- [x] Trigger refresh at threshold (60px)
- [x] Reset polling timer after manual refresh

### Task 6: Integrate Pull-to-Refresh in Team Page
**File:** `src/app/(app)/team/page.tsx`
- [x] Wrap content with PullToRefresh component
- [x] Connect to refresh action
- [x] Show brief loading indicator during refresh

### Task 7: Add Tab Visibility Detection
**File:** `src/hooks/use-polling.ts`
- [x] Listen for `visibilitychange` event
- [x] Pause polling when `document.hidden === true`
- [x] Resume polling when tab becomes visible
- [x] Immediate refresh on tab return

### Task 8: Handle Network Errors Gracefully
**File:** `src/app/(app)/team/components/TeamDataProvider.tsx`
- [x] Catch fetch errors silently
- [x] Keep displaying last known data
- [x] Retry on next poll interval

### Task 9: Add Last Updated Indicator
**File:** `src/components/team/TeamHeader.tsx`
- [x] Show "Last updated: XX:XX" timestamp
- [x] Update after each successful poll
- [x] Subtle styling, not prominent

### Task 10: Write Unit Tests for Polling Hook
**File:** `src/hooks/use-polling.test.ts`
- [x] Test interval execution
- [x] Test pause/resume on visibility change
- [x] Test reset functionality
- [x] Test cleanup on unmount

## Dev Notes

### Architecture Pattern
- Team Dashboard is Server Component but needs client-side polling
- Use `router.refresh()` to refetch Server Component data
- Wrap with client component for polling logic

### Polling Implementation
```typescript
// src/hooks/use-polling.ts
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { POLLING_INTERVAL_MS } from '@/constants/time';

export function usePolling(onPoll: () => void, interval = POLLING_INTERVAL_MS) {
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const intervalRef = useRef<NodeJS.Timeout>();
  const router = useRouter();

  useEffect(() => {
    const startPolling = () => {
      intervalRef.current = setInterval(() => {
        onPoll();
        setLastUpdated(new Date());
      }, interval);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        clearInterval(intervalRef.current);
      } else {
        onPoll(); // Immediate refresh
        startPolling();
      }
    };

    startPolling();
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(intervalRef.current);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [onPoll, interval]);

  const reset = () => {
    clearInterval(intervalRef.current);
    onPoll();
    setLastUpdated(new Date());
    intervalRef.current = setInterval(onPoll, interval);
  };

  return { lastUpdated, reset };
}
```

### Pull-to-Refresh Pattern
```typescript
// Using @use-gesture/react
import { useDrag } from '@use-gesture/react';

const bind = useDrag(({ movement: [, my], last }) => {
  if (last && my > 60) {
    onRefresh();
  }
}, { axis: 'y', filterTaps: true });
```

### Constants Location
```typescript
// src/constants/time.ts
export const POLLING_INTERVAL_MS = 30_000; // 30 seconds
export const PULL_THRESHOLD_PX = 60;
```

### Router Refresh for Server Components
```typescript
'use client';
import { useRouter } from 'next/navigation';

function TeamDataProvider({ children }) {
  const router = useRouter();

  usePolling(() => {
    router.refresh(); // Refetches Server Component data
  });

  return <>{children}</>;
}
```

### Component Dependencies
- Builds on team page from Story 6.1
- Updates stats from Story 6.4
- Updates member lists from Stories 6.2, 6.3
- Requires `framer-motion` for smooth animations
- Requires `@use-gesture/react` for pull gesture

### Import Convention
```typescript
import { usePolling } from '@/hooks/use-polling';
import { PullToRefresh } from '@/components/shared/PullToRefresh';
import { POLLING_INTERVAL_MS } from '@/constants/time';
```

### Error Handling Strategy
```typescript
try {
  router.refresh();
} catch (error) {
  // Silent failure - keep showing stale data
  console.error('Polling failed:', error);
}
```

### Performance Considerations
- Polling pauses when tab hidden (saves bandwidth)
- No UI flicker during background refresh
- Debounce rapid pull-to-refresh attempts

### Accessibility
- Pull-to-refresh has aria-live region for status
- Last updated time is readable by screen readers
- Loading indicator announced to assistive tech

## Definition of Done

- [x] Data auto-refreshes every 30 seconds
- [x] No loading indicator during background refresh
- [x] Pull-to-refresh works on mobile
- [x] Polling pauses when tab is hidden
- [x] Network errors handled silently
- [x] Last updated timestamp displays
- [x] Polling timer resets after manual refresh
- [x] Unit tests pass for polling hook
- [x] No TypeScript errors
- [x] All imports use @/ aliases
- [x] Uses POLLING_INTERVAL_MS constant

## Dev Agent Record

### Implementation Plan
- Created usePolling hook with visibility-based pause/resume
- Created TeamDataProvider for auto-refresh using router.refresh()
- Created PullToRefresh component using @use-gesture/react
- Created TeamHeader with Last Updated indicator
- Integrated all components in team page

### Completion Notes
All 10 tasks completed successfully:
1. POLLING_INTERVAL_MS already existed in constants
2. usePolling hook implemented with full visibility handling
3. TeamDataProvider wraps team page with polling context
4. Background refresh uses router.refresh() (Server Component pattern)
5. PullToRefresh component with gesture detection
6. Team page integrated with TeamDashboardClient wrapper
7. Tab visibility detection built into usePolling
8. Silent error handling in TeamDataProvider
9. TeamHeader shows "Last updated: HH:mm" timestamp
10. 12 unit tests for usePolling hook

All 1477 tests pass across 127 test files.

### Debug Log
- Fixed TypeScript conflict between @use-gesture/react and framer-motion's onDrag by using regular div instead of motion.div for gesture area
- Fixed date test in team.test.ts by using date-fns format() instead of toISOString() for local timezone consistency

## File List

### New Files
- src/hooks/use-polling.ts
- src/hooks/use-polling.test.ts
- src/app/(app)/team/components/TeamDataProvider.tsx
- src/app/(app)/team/components/TeamDataProvider.test.tsx
- src/app/(app)/team/components/index.ts
- src/components/shared/PullToRefresh.tsx
- src/components/shared/PullToRefresh.test.tsx
- src/components/team/TeamHeader.tsx
- src/components/team/TeamHeader.test.tsx
- src/components/team/TeamDashboardClient.tsx

### Modified Files
- src/app/(app)/team/page.tsx
- src/components/team/TeamDashboard.tsx
- src/components/team/index.ts
- src/lib/queries/team.ts
- src/lib/queries/team.test.ts
- src/constants/time.ts

## Change Log

- 2026-01-04: Code review fix
  - Moved PULL_THRESHOLD_PX constant from PullToRefresh.tsx to src/constants/time.ts
  - Updated test count to 1477 (127 files)

- 2026-01-04: Story 6.6 implementation complete
  - Created polling infrastructure (usePolling hook)
  - Implemented auto-refresh every 30 seconds
  - Added pull-to-refresh for mobile
  - Added tab visibility pause/resume
  - Added Last Updated indicator
  - All unit tests pass (1477 total)
