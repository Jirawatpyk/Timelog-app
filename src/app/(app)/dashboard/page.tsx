/**
 * Dashboard Page - Story 5.1
 *
 * Server Component that displays user's time entries organized by period.
 * Uses URL state for period selection (AC4).
 *
 * Per Architecture: NO TanStack Query - Server Components only
 */

import { Suspense } from 'react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { PeriodSelector } from '@/components/dashboard/PeriodSelector';
import { DashboardContent } from '@/components/dashboard/DashboardContent';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';
import { getPeriodFromSearchParams } from '@/lib/dashboard/period-utils';
import type { DashboardPageProps } from '@/types/dashboard';

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = await searchParams;
  const period = getPeriodFromSearchParams(params.period);

  return (
    <div className="flex flex-col gap-4">
      <DashboardHeader />

      <PeriodSelector currentPeriod={period} />

      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent period={period} />
      </Suspense>
    </div>
  );
}
