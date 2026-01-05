// src/components/shared/PullToRefresh.tsx
'use client';

import { ReactNode, useState, useRef, useCallback } from 'react';
import { useDrag } from '@use-gesture/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { PULL_THRESHOLD_PX } from '@/constants/time';

/**
 * Triggers haptic feedback using the Vibration API.
 * Safely checks for API support before calling.
 * No-op on unsupported devices.
 */
export function triggerHapticFeedback(): void {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate(10);
  }
}

interface PullToRefreshProps {
  /** Content to display */
  children: ReactNode;
  /** Callback when refresh is triggered */
  onRefresh: () => Promise<void> | void;
  /** Custom threshold in pixels (default: PULL_THRESHOLD_PX from constants) */
  threshold?: number;
  /** External loading state control */
  isLoading?: boolean;
  /** Disabled state */
  disabled?: boolean;
}

/**
 * Pull-to-refresh component for mobile touch interactions.
 *
 * Features:
 * - Pull down gesture detection using @use-gesture/react
 * - Visual indicator following gesture
 * - Loading spinner during refresh
 * - Accessible aria-live region for screen readers
 */
export function PullToRefresh({
  children,
  onRefresh,
  threshold = PULL_THRESHOLD_PX,
  isLoading = false,
  disabled = false,
}: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleRefresh = useCallback(async () => {
    if (isRefreshing || disabled) return;

    // Haptic feedback on threshold reach
    triggerHapticFeedback();

    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  }, [onRefresh, isRefreshing, disabled]);

  const bind = useDrag(
    ({ movement: [, my], last, cancel, active }) => {
      // Only allow pulling when at top of scroll container
      if (containerRef.current && containerRef.current.scrollTop > 0) {
        cancel();
        return;
      }

      // Ignore upward pulls
      if (my < 0) {
        setPullDistance(0);
        return;
      }

      if (active && !disabled) {
        // Apply resistance to make pull feel natural
        const resistance = 0.5;
        setPullDistance(Math.min(my * resistance, threshold * 1.5));
      }

      if (last) {
        if (my >= threshold && !disabled) {
          handleRefresh();
        }
        setPullDistance(0);
      }
    },
    {
      axis: 'y',
      filterTaps: true,
      from: () => [0, 0],
    }
  );

  const showIndicator = isLoading || isRefreshing || pullDistance > 0;
  const isAboveThreshold = pullDistance >= threshold;

  return (
    <div className="relative h-full" ref={containerRef}>
      {/* Pull indicator */}
      <AnimatePresence>
        {showIndicator && (
          <motion.div
            role="status"
            aria-live="polite"
            className="absolute inset-x-0 top-0 flex items-center justify-center z-10"
            initial={{ opacity: 0, height: 0 }}
            animate={{
              opacity: 1,
              height: isLoading || isRefreshing ? 48 : Math.max(pullDistance, 0),
            }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div
              className={`flex items-center justify-center gap-2 transition-transform duration-150 ${
                isAboveThreshold ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <Loader2
                className={`h-5 w-5 ${isLoading || isRefreshing ? 'animate-spin' : ''}`}
                style={{
                  transform:
                    !isLoading && !isRefreshing
                      ? `rotate(${(pullDistance / threshold) * 360}deg)`
                      : undefined,
                }}
              />
              {/* AC 1: Show pull progress percentage */}
              {!isLoading && !isRefreshing && pullDistance > 0 && (
                <span className="text-xs font-medium tabular-nums">
                  {Math.min(Math.round((pullDistance / threshold) * 100), 100)}%
                </span>
              )}
              <span className="sr-only">
                {isLoading || isRefreshing ? 'Refreshing...' : 'Pull to refresh'}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content with gesture binding */}
      <div
        {...bind()}
        className="h-full touch-pan-y"
        style={{
          transform: `translateY(${pullDistance}px)`,
          transition: pullDistance === 0 ? 'transform 0.2s ease-out' : undefined,
        }}
      >
        {children}
      </div>
    </div>
  );
}
