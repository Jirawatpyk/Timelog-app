/**
 * Dashboard Content - Story 5.1, 5.3, 5.4, 5.6, 5.7
 *
 * Server Component that fetches and displays entries + stats for a period.
 * Uses Supabase server client (no TanStack Query per architecture).
 *
 * Story 5.3: Uses GroupedEntryList for week period
 * Story 5.4: Uses MonthlyEntryList for month period with week grouping
 * Story 5.6: Supports client filtering with empty filter state
 * Story 5.7: Supports search with search results count and empty search state
 */

import { StatsCard } from '@/components/dashboard/StatsCard';
import { EntryList } from '@/components/dashboard/EntryList';
import { GroupedEntryList } from '@/components/dashboard/GroupedEntryList';
import { MonthlyEntryList } from '@/components/dashboard/MonthlyEntryList';
import { EmptyFilterState } from '@/components/dashboard/EmptyFilterState';
import { EmptySearchState } from '@/components/dashboard/EmptySearchState';
import { SearchResultsCount } from '@/components/dashboard/SearchResultsCount';
import { getUserEntries, getDashboardStats } from '@/lib/queries/get-user-entries';
import { getDateRangeForPeriod } from '@/lib/dashboard/period-utils';
import type { Period, FilterState } from '@/types/dashboard';

interface DashboardContentProps {
  period: Period;
  filter?: FilterState;
  clientName?: string; // For empty filter state display
}

export async function DashboardContent({ period, filter, clientName }: DashboardContentProps) {
  const dateRange = getDateRangeForPeriod(period);

  const [entries, stats] = await Promise.all([
    getUserEntries(dateRange, filter),
    getDashboardStats(dateRange, period, filter),
  ]);

  // Story 5.6 AC7: Show empty filter state when filter is active but no entries
  const hasActiveFilter = !!filter?.clientId;
  const showEmptyFilterState = hasActiveFilter && entries.length === 0 && clientName && !filter?.searchQuery;

  // Story 5.7: Show empty search state when search is active but no entries
  const hasActiveSearch = !!filter?.searchQuery;
  const showEmptySearchState = hasActiveSearch && entries.length === 0;

  return (
    <div
      className="flex flex-col gap-4"
      id={`panel-${period}`}
      role="tabpanel"
      aria-labelledby={`tab-${period}`}
    >
      {/* Story 5.7 AC4: Search results count */}
      {hasActiveSearch && entries.length > 0 && (
        <SearchResultsCount count={entries.length} query={filter.searchQuery!} />
      )}

      <StatsCard stats={stats} period={period} />

      {/* Story 5.7 AC5: Empty search state */}
      {showEmptySearchState ? (
        <EmptySearchState query={filter.searchQuery!} />
      ) : showEmptyFilterState ? (
        /* Story 5.6 AC7: Empty filter state */
        <EmptyFilterState clientName={clientName} />
      ) : (
        <>
          {/* Use different list component based on period */}
          {period === 'today' && <EntryList entries={entries} />}

          {period === 'week' && (
            <GroupedEntryList
              entries={entries}
              period={period}
              showEmptyDays={true}
            />
          )}

          {period === 'month' && (
            <MonthlyEntryList entries={entries} monthDate={dateRange.start} />
          )}
        </>
      )}
    </div>
  );
}
