# Story 8.5: Pull-to-Refresh

## Status: partially-implemented

## Story

As a **user**,
I want **to pull down to refresh dashboard data**,
So that **I can update the view with a natural gesture**.

## Acceptance Criteria

### AC 1: Pull Gesture Recognition
- **Given** I am on /dashboard or /team page
- **When** I pull down from the top
- **Then** I see a loading indicator following my gesture
- **And** Indicator shows pull progress (0-100%)

### AC 2: Threshold Release
- **Given** I pull past the threshold (60px) and release
- **When** Refresh triggers
- **Then** Data is fetched from server
- **And** Loading indicator spins
- **And** List updates when data arrives
- **And** Indicator smoothly hides

### AC 3: Cancel Pull
- **Given** I pull but don't reach threshold
- **When** I release
- **Then** Indicator bounces back
- **And** No refresh occurs

### AC 4: Native Feel
- **Given** Pull-to-refresh implementation
- **When** Using the gesture
- **Then** Gesture feels native (matches iOS/Android behavior)
- **And** Works in PWA standalone mode
- **And** Overscroll is handled properly

### AC 5: Prevent During Scroll
- **Given** I am scrolled down in the list
- **When** I pull down
- **Then** Pull-to-refresh doesn't activate
- **And** Normal scroll behavior occurs

### AC 6: Haptic Feedback
- **Given** Pull-to-refresh is supported
- **When** I pull past the threshold
- **Then** Device vibrates briefly (if supported)
- **And** Graceful fallback on unsupported devices

## Implementation Status

### Already Implemented
- `PullToRefresh` component exists at `src/components/shared/PullToRefresh.tsx`
- `@use-gesture/react@10.3.1` installed
- Uses `framer-motion` for smooth animations
- Has `isLoading`, `disabled`, `threshold` props
- Uses `PULL_THRESHOLD_PX` from `@/constants/time`
- Unit tests exist (7 tests passing)

### Remaining Work
- Integrate with Dashboard page
- Integrate with Team page
- Add haptic feedback
- Add E2E tests

## Tasks

### Task 1: Install Dependencies
**Status:** COMPLETE
- [x] @use-gesture/react installed (v10.3.1)
- [x] framer-motion already available

### Task 2: Create PullToRefresh Component
**Status:** COMPLETE
**File:** `src/components/shared/PullToRefresh.tsx`
- [x] Pull gesture detection using @use-gesture/react
- [x] Visual indicator with progress
- [x] Loading spinner during refresh
- [x] Smooth animations with framer-motion
- [x] `isLoading` prop for external control
- [x] `disabled` prop
- [x] `threshold` prop (default from constants)
- [x] Scroll position check (only at top)
- [x] Resistance factor for natural feel

### Task 3: Unit Tests for Component
**Status:** COMPLETE
**File:** `src/components/shared/PullToRefresh.test.tsx`
- [x] Test renders children
- [x] Test pull indicator visibility
- [x] Test accessible loading state
- [x] Test loading spinner display
- [x] Test threshold styling
- [x] Test aria-live accessibility

### Task 4: Add Haptic Feedback
**File:** `src/components/shared/PullToRefresh.tsx`
- [ ] Add haptic feedback when threshold is reached
- [ ] Use `navigator.vibrate(10)` API
- [ ] Check for API support before calling
- [ ] Graceful fallback (no-op on unsupported devices)

### Task 5: Integrate with Dashboard
**File:** `src/components/dashboard/DashboardContent.tsx` or `src/app/(app)/dashboard/page.tsx`
- [ ] Wrap dashboard content with PullToRefresh
- [ ] Implement onRefresh callback using router.refresh()
- [ ] Pass appropriate className for layout
- [ ] Test refresh triggers data reload

### Task 6: Integrate with Team Dashboard
**File:** `src/components/team/TeamDashboardClient.tsx` or `src/app/(app)/team/page.tsx`
- [ ] Wrap team content with PullToRefresh
- [ ] Implement onRefresh callback using router.refresh()
- [ ] Coordinate with existing polling (pause during refresh)
- [ ] Test refresh triggers data reload

### Task 7: Add CSS for PWA Overscroll
**File:** `src/app/globals.css`
- [ ] Add `overscroll-behavior-y: none` to html/body
- [ ] Prevent native pull-to-refresh in PWA mode
- [ ] Test in standalone PWA mode

### Task 8: E2E Tests
**File:** `test/e2e/pwa/pull-to-refresh.test.ts`
- [ ] Test pull gesture triggers refresh on Dashboard
- [ ] Test pull gesture triggers refresh on Team
- [ ] Test cancel pull (below threshold) doesn't refresh
- [ ] Test pull-to-refresh disabled when scrolled down
- [ ] Test loading indicator appears during refresh
- [ ] Test data updates after refresh

## Dev Notes

### Existing Component
The `PullToRefresh` component already exists with these features:
```typescript
// src/components/shared/PullToRefresh.tsx
interface PullToRefreshProps {
  children: ReactNode;
  onRefresh: () => Promise<void> | void;
  threshold?: number;      // Default: PULL_THRESHOLD_PX (60)
  isLoading?: boolean;     // External loading state
  disabled?: boolean;      // Disable pull gesture
}
```

### Integration Pattern (Client Component)
```typescript
// src/components/dashboard/DashboardContent.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { PullToRefresh } from '@/components/shared/PullToRefresh';

export function DashboardContent({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    router.refresh();
    // Small delay to ensure server has processed
    await new Promise((resolve) => setTimeout(resolve, 300));
    setIsRefreshing(false);
  };

  return (
    <PullToRefresh onRefresh={handleRefresh} isLoading={isRefreshing}>
      {children}
    </PullToRefresh>
  );
}
```

### Haptic Feedback Addition
```typescript
// Add to PullToRefresh.tsx handleRefresh function
const handleRefresh = useCallback(async () => {
  if (isRefreshing || disabled) return;

  // Haptic feedback on threshold reach
  if ('vibrate' in navigator) {
    navigator.vibrate(10);
  }

  setIsRefreshing(true);
  try {
    await onRefresh();
  } finally {
    setIsRefreshing(false);
  }
}, [onRefresh, isRefreshing, disabled]);
```

### Team Dashboard Integration with Polling
```typescript
// src/components/team/TeamDashboardClient.tsx
export function TeamDashboardClient({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { pausePolling, resumePolling } = usePolling();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    pausePolling(); // Pause polling during manual refresh

    router.refresh();
    await new Promise((resolve) => setTimeout(resolve, 300));

    setIsRefreshing(false);
    resumePolling(); // Resume polling after refresh
  };

  return (
    <PullToRefresh onRefresh={handleRefresh} isLoading={isRefreshing}>
      {children}
    </PullToRefresh>
  );
}
```

### Overscroll CSS
```css
/* src/app/globals.css */

/* Prevent native pull-to-refresh in PWA standalone mode */
@media all and (display-mode: standalone) {
  html, body {
    overscroll-behavior-y: none;
  }
}

/* Alternative: always disable native pull-to-refresh */
html {
  overscroll-behavior-y: none;
}
```

### Component Dependencies
- `@use-gesture/react` - Touch gesture detection
- `framer-motion` - Animations
- `lucide-react` - Loader2 icon
- `@/constants/time` - PULL_THRESHOLD_PX constant

### Import Convention
```typescript
import { PullToRefresh } from '@/components/shared/PullToRefresh';
```

### Testing Notes
- E2E tests require touch event simulation
- Test on real devices for accurate gesture feel
- PWA standalone mode may behave differently
- Verify scroll position check prevents activation when scrolled

### Accessibility
- `role="status"` on loading indicator
- `aria-live="polite"` for screen reader announcements
- `sr-only` text: "Refreshing..." or "Pull to refresh"
- Does not interfere with keyboard navigation

## Definition of Done

- [x] @use-gesture/react installed
- [x] PullToRefresh component created
- [x] Component uses framer-motion for animations
- [x] Component has isLoading/disabled/threshold props
- [x] Only activates at scroll top
- [x] Threshold release triggers refresh
- [x] Cancel pull bounces back
- [x] Unit tests pass (7 tests)
- [ ] Haptic feedback on threshold reach
- [ ] Dashboard has pull-to-refresh
- [ ] Team dashboard has pull-to-refresh
- [ ] PWA overscroll CSS added
- [ ] Works in PWA standalone mode
- [ ] E2E tests pass
- [ ] No TypeScript errors
- [ ] All imports use @/ aliases
