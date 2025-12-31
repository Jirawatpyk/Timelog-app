# Story 8.5: Pull-to-Refresh

## Status: ready-for-dev

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

## Tasks

### Task 1: Install @use-gesture/react
**File:** `package.json`
- [ ] Install @use-gesture/react package
- [ ] Verify peer dependencies

### Task 2: Create usePullToRefresh Hook
**File:** `src/hooks/use-pull-to-refresh.ts`
- [ ] Track pull distance with useDrag
- [ ] Calculate pull progress (0-100%)
- [ ] Define threshold (60px)
- [ ] Handle release logic
- [ ] Return { pullDistance, isRefreshing, isPulling, progress }

### Task 3: Create PullToRefreshContainer Component
**File:** `src/components/shared/PullToRefreshContainer.tsx`
- [ ] Wrap content with pull gesture
- [ ] Position indicator above content
- [ ] Handle pull animation
- [ ] Accept onRefresh callback

### Task 4: Create PullIndicator Component
**File:** `src/components/shared/PullIndicator.tsx`
- [ ] Circular progress indicator
- [ ] Animate based on pull progress
- [ ] Spinning state when refreshing
- [ ] Smooth hide animation

### Task 5: Integrate with Dashboard
**File:** `src/app/(app)/dashboard/page.tsx`
- [ ] Wrap content with PullToRefreshContainer
- [ ] Implement onRefresh to reload data
- [ ] Use router.refresh() or revalidate

### Task 6: Integrate with Team Dashboard
**File:** `src/app/(app)/team/page.tsx`
- [ ] Wrap content with PullToRefreshContainer
- [ ] Implement onRefresh to reload data
- [ ] Use router.refresh() or revalidate

### Task 7: Handle Scroll Position
**File:** `src/hooks/use-pull-to-refresh.ts`
- [ ] Check scrollTop before activating
- [ ] Only enable at top of scroll
- [ ] Prevent conflicts with normal scroll

### Task 8: Style Pull Indicator
**File:** `src/components/shared/PullIndicator.tsx`
- [ ] Match app theme colors
- [ ] Smooth transitions
- [ ] Proper z-index
- [ ] Shadow for depth

### Task 9: Add Haptic Feedback
**File:** `src/components/shared/PullToRefreshContainer.tsx`
- [ ] Vibrate on threshold reach (if supported)
- [ ] Use navigator.vibrate API
- [ ] Graceful fallback

### Task 10: Test on Real Devices
**File:** Manual testing
- [ ] Test on iOS Safari
- [ ] Test on Android Chrome
- [ ] Test in PWA mode
- [ ] Verify native feel

## Dev Notes

### Architecture Pattern
- Custom hook for gesture logic
- Container component for wrapping content
- Server component refresh via router.refresh()

### usePullToRefresh Hook
```typescript
// src/hooks/use-pull-to-refresh.ts
'use client';

import { useState, useCallback, useRef } from 'react';
import { useDrag } from '@use-gesture/react';

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void>;
  threshold?: number;
  maxPull?: number;
}

export function usePullToRefresh({
  onRefresh,
  threshold = 60,
  maxPull = 120,
}: UsePullToRefreshOptions) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const bind = useDrag(
    ({ movement: [, my], direction: [, dy], active, cancel }) => {
      // Only activate when at top of scroll
      const scrollTop = containerRef.current?.scrollTop ?? 0;
      if (scrollTop > 0) {
        cancel();
        return;
      }

      // Only allow downward pull
      if (dy < 0) {
        cancel();
        return;
      }

      if (active) {
        // Apply resistance
        const resistance = 0.5;
        const distance = Math.min(my * resistance, maxPull);
        setPullDistance(Math.max(0, distance));
      } else {
        // Released
        if (pullDistance >= threshold && !isRefreshing) {
          handleRefresh();
        } else {
          setPullDistance(0);
        }
      }
    },
    {
      axis: 'y',
      filterTaps: true,
      pointer: { touch: true },
    }
  );

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    setPullDistance(threshold); // Keep at threshold during refresh

    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }

    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
      setPullDistance(0);
    }
  }, [onRefresh, threshold]);

  const progress = Math.min((pullDistance / threshold) * 100, 100);
  const isPulling = pullDistance > 0;

  return {
    bind,
    containerRef,
    pullDistance,
    isRefreshing,
    isPulling,
    progress,
  };
}
```

### PullToRefreshContainer Component
```typescript
// src/components/shared/PullToRefreshContainer.tsx
'use client';

import { ReactNode } from 'react';
import { usePullToRefresh } from '@/hooks/use-pull-to-refresh';
import { PullIndicator } from '@/components/shared/PullIndicator';
import { cn } from '@/lib/utils';

interface PullToRefreshContainerProps {
  children: ReactNode;
  onRefresh: () => Promise<void>;
  className?: string;
}

export function PullToRefreshContainer({
  children,
  onRefresh,
  className,
}: PullToRefreshContainerProps) {
  const {
    bind,
    containerRef,
    pullDistance,
    isRefreshing,
    progress,
  } = usePullToRefresh({ onRefresh });

  return (
    <div
      ref={containerRef}
      {...bind()}
      className={cn('relative overflow-auto touch-pan-y', className)}
      style={{ overscrollBehavior: 'none' }}
    >
      {/* Pull Indicator */}
      <div
        className="absolute left-1/2 -translate-x-1/2 z-10 transition-transform"
        style={{
          transform: `translateX(-50%) translateY(${pullDistance - 40}px)`,
        }}
      >
        <PullIndicator progress={progress} isRefreshing={isRefreshing} />
      </div>

      {/* Content */}
      <div
        style={{
          transform: `translateY(${pullDistance}px)`,
          transition: pullDistance === 0 ? 'transform 0.2s ease-out' : 'none',
        }}
      >
        {children}
      </div>
    </div>
  );
}
```

### PullIndicator Component
```typescript
// src/components/shared/PullIndicator.tsx
'use client';

import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PullIndicatorProps {
  progress: number;
  isRefreshing: boolean;
}

export function PullIndicator({ progress, isRefreshing }: PullIndicatorProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-center',
        'w-10 h-10 rounded-full bg-background shadow-lg',
        'transition-opacity duration-200',
        progress === 0 && !isRefreshing && 'opacity-0'
      )}
    >
      <RefreshCw
        className={cn(
          'w-5 h-5 text-primary transition-transform',
          isRefreshing && 'animate-spin'
        )}
        style={{
          transform: isRefreshing
            ? undefined
            : `rotate(${(progress / 100) * 360}deg)`,
        }}
      />
    </div>
  );
}
```

### Dashboard Integration
```typescript
// src/app/(app)/dashboard/page.tsx
import { PullToRefreshContainer } from '@/components/shared/PullToRefreshContainer';

export default function DashboardPage() {
  return (
    <PullToRefreshContainer
      onRefresh={async () => {
        'use server';
        revalidatePath('/dashboard');
      }}
      className="h-full"
    >
      {/* Dashboard content */}
    </PullToRefreshContainer>
  );
}

// Or with client-side refresh
'use client';

import { useRouter } from 'next/navigation';

export default function DashboardClient() {
  const router = useRouter();

  const handleRefresh = async () => {
    router.refresh();
    // Wait for refresh to complete
    await new Promise((resolve) => setTimeout(resolve, 500));
  };

  return (
    <PullToRefreshContainer onRefresh={handleRefresh}>
      {/* Content */}
    </PullToRefreshContainer>
  );
}
```

### Overscroll CSS
```css
/* src/app/globals.css */

/* Prevent native pull-to-refresh in PWA */
html, body {
  overscroll-behavior-y: none;
}

/* Allow custom pull-to-refresh container */
.pull-to-refresh-container {
  overscroll-behavior: none;
  touch-action: pan-y;
  -webkit-overflow-scrolling: touch;
}
```

### Component Dependencies
- @use-gesture/react for touch gestures
- lucide-react for RefreshCw icon
- router.refresh() for Server Component revalidation

### Import Convention
```typescript
import { usePullToRefresh } from '@/hooks/use-pull-to-refresh';
import { PullToRefreshContainer } from '@/components/shared/PullToRefreshContainer';
import { PullIndicator } from '@/components/shared/PullIndicator';
```

### Testing Notes
- Disable browser's native pull-to-refresh with overscroll-behavior
- Test on real devices (emulator gestures differ)
- Test in PWA standalone mode
- Verify scroll position check works

### Accessibility
- Visual indicator shows progress
- Works with touch devices
- Does not interfere with screen readers
- Alternative refresh available (manual button)

## Definition of Done

- [ ] @use-gesture/react installed
- [ ] usePullToRefresh hook created
- [ ] PullToRefreshContainer component created
- [ ] PullIndicator shows pull progress
- [ ] Dashboard has pull-to-refresh
- [ ] Team dashboard has pull-to-refresh
- [ ] Only activates at scroll top
- [ ] Threshold release triggers refresh
- [ ] Cancel pull bounces back
- [ ] Haptic feedback on threshold
- [ ] Native feel on iOS/Android
- [ ] Works in PWA mode
- [ ] No TypeScript errors
- [ ] All imports use @/ aliases
