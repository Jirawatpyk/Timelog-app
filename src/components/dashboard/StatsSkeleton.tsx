'use client';

import { Skeleton } from '@/components/ui/skeleton';

/**
 * Stats Skeleton Component
 * Story 4.9 - AC6: Dashboard stats skeleton
 *
 * Displays skeleton for statistics card during loading.
 */
export function StatsSkeleton() {
  return (
    <div
      className="p-4 rounded-lg border bg-card"
      data-testid="stats-skeleton"
    >
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          {/* Period label (e.g., "Today", "This Week") */}
          <Skeleton className="h-4 w-20" />
          {/* Total hours display */}
          <Skeleton className="h-8 w-32" />
        </div>
        {/* Entry count badge */}
        <Skeleton className="h-10 w-16 rounded-full" />
      </div>
    </div>
  );
}

/**
 * Period Selector Skeleton
 * Story 4.9: Loading state for period tabs (Today, Week, Month)
 */
export function PeriodSelectorSkeleton() {
  return (
    <div className="flex gap-2" data-testid="period-selector-skeleton">
      {[1, 2, 3].map((i) => (
        <Skeleton
          key={i}
          className="h-9 w-24 rounded-md"
          data-testid="period-tab-skeleton"
        />
      ))}
    </div>
  );
}
