# Story 6.6: Near Real-Time Updates

## Status: ready-for-dev

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
- **Then** Their status updates from "ยังไม่ลง" to "ลงแล้ว"
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
- [ ] Add `POLLING_INTERVAL_MS = 30_000` constant
- [ ] Export for use across team dashboard

### Task 2: Create usePolling Hook
**File:** `src/hooks/use-polling.ts`
- [ ] Create generic polling hook with interval parameter
- [ ] Handle start/stop/reset functions
- [ ] Support pause when tab is hidden (visibilitychange)
- [ ] Return polling state (isPolling, lastUpdated)

### Task 3: Create Team Data Fetcher
**File:** `src/app/(app)/team/components/TeamDataProvider.tsx`
- [ ] Create client component wrapper for polling
- [ ] Fetch team data on interval
- [ ] Pass data to child components
- [ ] Handle loading and error states silently

### Task 4: Implement Background Refresh
**File:** `src/app/(app)/team/components/TeamDataProvider.tsx`
- [ ] Use `router.refresh()` for Server Component data
- [ ] No loading spinner during background refresh
- [ ] Update data seamlessly

### Task 5: Create Pull-to-Refresh Component
**File:** `src/components/shared/PullToRefresh.tsx`
- [ ] Use `@use-gesture/react` for pull detection
- [ ] Show pull indicator following gesture
- [ ] Trigger refresh at threshold (60px)
- [ ] Reset polling timer after manual refresh

### Task 6: Integrate Pull-to-Refresh in Team Page
**File:** `src/app/(app)/team/page.tsx`
- [ ] Wrap content with PullToRefresh component
- [ ] Connect to refresh action
- [ ] Show brief loading indicator during refresh

### Task 7: Add Tab Visibility Detection
**File:** `src/hooks/use-polling.ts`
- [ ] Listen for `visibilitychange` event
- [ ] Pause polling when `document.hidden === true`
- [ ] Resume polling when tab becomes visible
- [ ] Immediate refresh on tab return

### Task 8: Handle Network Errors Gracefully
**File:** `src/app/(app)/team/components/TeamDataProvider.tsx`
- [ ] Catch fetch errors silently
- [ ] Keep displaying last known data
- [ ] Retry on next poll interval
- [ ] Optional: Show subtle offline indicator

### Task 9: Add Last Updated Indicator
**File:** `src/app/(app)/team/components/TeamHeader.tsx`
- [ ] Show "อัปเดตล่าสุด: XX:XX" timestamp
- [ ] Update after each successful poll
- [ ] Subtle styling, not prominent

### Task 10: Write Unit Tests for Polling Hook
**File:** `src/hooks/use-polling.test.ts`
- [ ] Test interval execution
- [ ] Test pause/resume on visibility change
- [ ] Test reset functionality
- [ ] Test cleanup on unmount

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

- [ ] Data auto-refreshes every 30 seconds
- [ ] No loading indicator during background refresh
- [ ] Pull-to-refresh works on mobile
- [ ] Polling pauses when tab is hidden
- [ ] Network errors handled silently
- [ ] Last updated timestamp displays
- [ ] Polling timer resets after manual refresh
- [ ] Unit tests pass for polling hook
- [ ] No TypeScript errors
- [ ] All imports use @/ aliases
- [ ] Uses POLLING_INTERVAL_MS constant
