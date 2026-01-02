'use client';

import { Skeleton } from '@/components/ui/skeleton';

/**
 * Form Skeleton Component
 * Story 4.9 - AC1: Shows skeleton during initial load
 * Story 4.9 - AC2: Matches final layout to prevent CLS
 * Story 4.9 - AC7: Consistent pulse animation
 */
export function FormSkeleton() {
  return (
    <div className="space-y-6" data-testid="form-skeleton">
      {/* Recent Combinations Skeleton */}
      <div data-testid="recent-skeleton-section">
        <RecentCombinationsSkeleton />
      </div>

      <div className="border-t" />

      {/* Cascading Selectors Skeleton */}
      <div className="space-y-4" data-testid="selectors-skeleton-section">
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
      <div className="space-y-4" data-testid="duration-date-skeleton-section">
        <DurationSkeleton />
        <DateSkeleton />
      </div>

      {/* Submit Button Skeleton */}
      <div className="pt-4">
        <Skeleton className="h-12 w-full rounded-md" data-testid="submit-skeleton" />
      </div>
    </div>
  );
}

interface SelectorSkeletonProps {
  label: string;
  optional?: boolean;
}

/**
 * Selector Skeleton Component
 * Matches height of Select components (h-9 = 36px, shadcn default)
 */
export function SelectorSkeleton({ label: _label, optional }: SelectorSkeletonProps) {
  return (
    <div className="space-y-2" data-testid="selector-skeleton">
      <div className="flex items-center gap-1">
        <Skeleton className="h-4 w-16" />
        {optional && (
          <Skeleton className="h-3 w-12" data-testid="optional-skeleton-badge" />
        )}
      </div>
      <Skeleton className="h-9 w-full rounded-md" />
    </div>
  );
}

/**
 * Duration Skeleton Component
 * Matches DurationInput layout: preset buttons + input field
 */
export function DurationSkeleton() {
  return (
    <div className="space-y-3" data-testid="duration-skeleton">
      {/* Label skeleton */}
      <Skeleton className="h-4 w-28" />

      {/* Preset buttons skeleton - 5 buttons matching DURATION_PRESETS */}
      <div className="flex flex-wrap gap-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton
            key={i}
            className="h-8 w-[60px] rounded-md"
            data-testid="preset-button-skeleton"
          />
        ))}
      </div>

      {/* Input field skeleton */}
      <Skeleton className="h-9 w-full rounded-md" />

      {/* Helper text skeleton */}
      <Skeleton className="h-3 w-40" />
    </div>
  );
}

/**
 * Date Skeleton Component
 * Matches DatePicker button dimensions
 */
export function DateSkeleton() {
  return (
    <div className="space-y-2" data-testid="date-skeleton">
      <Skeleton className="h-4 w-12" />
      <Skeleton className="h-11 w-full rounded-md" />
    </div>
  );
}

/**
 * Recent Combinations Skeleton
 * Story 4.9 - AC4: Match card dimensions (280px × 76px)
 */
function RecentCombinationsSkeleton() {
  return (
    <div className="space-y-3">
      {/* Header skeleton */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-16" />
      </div>

      {/* Card skeletons - 3 cards matching typical display */}
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

export { RecentCombinationsSkeleton };
