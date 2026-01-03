/**
 * Dashboard Page - Story 5.1, 5.6, 5.7
 *
 * Server Component that displays user's time entries organized by period.
 * Uses URL state for period selection (AC4), client filtering (Story 5.6),
 * and text search (Story 5.7).
 *
 * Per Architecture: NO TanStack Query - Server Components only
 */

import { Suspense } from 'react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { PeriodSelector } from '@/components/dashboard/PeriodSelector';
import { DashboardWrapper } from '@/components/dashboard/DashboardWrapper';
import { DashboardContent } from '@/components/dashboard/DashboardContent';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';
import { FilterChip } from '@/components/dashboard/FilterChip';
import { ErrorToast } from '@/components/shared/error-toast';
import { getPeriodFromSearchParams } from '@/lib/dashboard/period-utils';
import { getFilterFromSearchParams } from '@/lib/dashboard/filter-utils';
import { getUserClients } from '@/lib/queries/get-user-entries';
import type { DashboardPageProps } from '@/types/dashboard';

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = await searchParams;
  const period = getPeriodFromSearchParams(params.period);
  const filter = getFilterFromSearchParams(params);

  // Fetch clients for filter dropdown
  const clients = await getUserClients();

  // Find client name for chip display
  const activeClient = clients.find((c) => c.id === filter.clientId);

  return (
    <div className="flex flex-col gap-4">
      <ErrorToast />
      <DashboardHeader />

      <DashboardWrapper
        clients={clients}
        currentClientId={filter.clientId}
        currentSearchQuery={filter.searchQuery}
      >
        <PeriodSelector currentPeriod={period} />
      </DashboardWrapper>

      {/* Active Filter Chips */}
      {activeClient && (
        <div className="flex gap-2 flex-wrap">
          <FilterChip
            label="Client"
            value={activeClient.name}
            paramName="client"
          />
        </div>
      )}

      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent
          period={period}
          filter={filter}
          clientName={activeClient?.name}
        />
      </Suspense>
    </div>
  );
}
