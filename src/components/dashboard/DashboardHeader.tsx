/**
 * Dashboard Header - Story 5.1
 *
 * Simple header for the dashboard page.
 */

import { Skeleton } from '@/components/ui/skeleton';

export function DashboardHeader() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="text-muted-foreground">
        Track your logged hours
      </p>
    </div>
  );
}

export function DashboardHeaderSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-4 w-48" />
    </div>
  );
}
