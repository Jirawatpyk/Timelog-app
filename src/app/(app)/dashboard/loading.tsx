/**
 * Dashboard Loading - Story 5.1
 *
 * Route-level Suspense fallback for the dashboard page.
 * Displays while the page is loading.
 */

import {
  DashboardHeaderSkeleton,
  PeriodSelectorSkeleton,
  DashboardSkeleton,
} from '@/components/dashboard';

export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-4">
      <DashboardHeaderSkeleton />
      <PeriodSelectorSkeleton />
      <DashboardSkeleton />
    </div>
  );
}
