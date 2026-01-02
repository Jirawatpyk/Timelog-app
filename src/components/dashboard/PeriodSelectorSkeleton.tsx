/**
 * Period Selector Skeleton - Story 5.1
 *
 * Server Component skeleton for PeriodSelector loading state.
 * Separated from PeriodSelector to avoid bundling Skeleton in client bundle.
 */

import { Skeleton } from '@/components/ui/skeleton';

export function PeriodSelectorSkeleton() {
  return (
    <div className="flex gap-1 p-1 bg-muted rounded-lg">
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="flex-1 h-[44px] rounded-md" />
      ))}
    </div>
  );
}
