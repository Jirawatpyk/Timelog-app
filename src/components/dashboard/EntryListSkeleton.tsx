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
 * Story 5.2 - Matches the layout of EntryCard component
 *
 * Layout:
 * - Left: Client name, Job display, Service • Task
 * - Right: Duration, Date
 */
export function EntryCardSkeleton() {
  return (
    <div
      className="p-4 rounded-lg border bg-card min-h-[72px]"
      data-testid="entry-card-skeleton"
    >
      <div className="flex justify-between items-start gap-2">
        {/* Left: Client > Job > Service */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Client name */}
          <Skeleton className="h-4 w-2/3" />
          {/* Job display */}
          <Skeleton className="h-3 w-1/2" />
          {/* Service • Task */}
          <Skeleton className="h-3 w-2/5" />
        </div>

        {/* Right: Duration and Date */}
        <div className="shrink-0 space-y-2 text-right">
          {/* Duration */}
          <Skeleton className="h-5 w-16 ml-auto" />
          {/* Date */}
          <Skeleton className="h-3 w-20 ml-auto" />
        </div>
      </div>
    </div>
  );
}
