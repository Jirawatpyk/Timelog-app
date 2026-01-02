'use client';

import { Skeleton } from '@/components/ui/skeleton';

interface EntryListSkeletonProps {
  /** Number of skeleton cards to display. Defaults to 5. */
  count?: number;
}

/**
 * Entry List Skeleton Component
 * Story 4.9 - AC6: Dashboard entry list skeleton
 *
 * Displays skeleton cards for time entries during loading.
 * Matches the layout of actual entry cards to prevent CLS.
 */
export function EntryListSkeleton({ count = 5 }: EntryListSkeletonProps) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <EntryCardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Single Entry Card Skeleton
 * Matches the layout of EntryRow component from RecentEntries
 */
export function EntryCardSkeleton() {
  return (
    <div
      className="p-4 rounded-lg border bg-card"
      data-testid="entry-card-skeleton"
    >
      <div className="flex justify-between items-start">
        <div className="space-y-2 flex-1">
          {/* Client name */}
          <Skeleton className="h-5 w-3/4" />
          {/* Project • Job */}
          <Skeleton className="h-4 w-1/2" />
          {/* Date • Duration */}
          <Skeleton className="h-4 w-1/3" />
        </div>
        {/* Chevron icon skeleton */}
        <Skeleton className="h-5 w-5 rounded" />
      </div>
    </div>
  );
}
