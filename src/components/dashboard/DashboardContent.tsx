/**
 * Dashboard Content - Story 5.1, 5.3, 5.4, 5.6, 5.7, 5.8
 *
 * Server Component that fetches and displays entries + stats for a period.
 * Uses Supabase server client (no TanStack Query per architecture).
 *
 * Story 5.3: Uses GroupedEntryList for week period
 * Story 5.4: Uses MonthlyEntryList for month period with week grouping
 * Story 5.6: Supports client filtering with empty filter state
 * Story 5.7: Supports search with search results count and empty search state
 * Story 5.8: Empty states with priority: Search > Combined > Filter > First-Time > Period
 */

import { StatsCard } from '@/components/dashboard/StatsCard';
import { EntryList } from '@/components/dashboard/EntryList';
import { GroupedEntryList } from '@/components/dashboard/GroupedEntryList';
import { MonthlyEntryList } from '@/components/dashboard/MonthlyEntryList';
import { EmptyPeriodState } from '@/components/dashboard/EmptyPeriodState';
import { EmptyFilterState } from '@/components/dashboard/EmptyFilterState';
import { EmptySearchState } from '@/components/dashboard/EmptySearchState';
import { EmptyCombinedState } from '@/components/dashboard/EmptyCombinedState';
import { EmptyFirstTimeState } from '@/components/dashboard/EmptyFirstTimeState';
import { SearchResultsCount } from '@/components/dashboard/SearchResultsCount';
import { getUserEntries, getDashboardStats, checkIsFirstTimeUser } from '@/lib/queries/get-user-entries';
import { getDateRangeForPeriod } from '@/lib/dashboard/period-utils';
import type { Period, FilterState } from '@/types/dashboard';

interface DashboardContentProps {
  period: Period;
  filter?: FilterState;
  clientName?: string; // For empty filter state display
}

export async function DashboardContent({ period, filter, clientName }: DashboardContentProps) {
  const dateRange = getDateRangeForPeriod(period);

  // Story 5.8: Fetch entries and stats first
  const [entries, stats] = await Promise.all([
    getUserEntries(dateRange, filter),
    getDashboardStats(dateRange, period, filter),
  ]);

  const hasActiveFilter = !!filter?.clientId;
  const hasActiveSearch = !!filter?.searchQuery;
  const isEmpty = entries.length === 0;

  // Only check first-time user when empty (performance optimization)
  const isFirstTimeUser = isEmpty ? await checkIsFirstTimeUser() : false;

  // Story 5.8: Determine empty state type with priority
  // Priority: Search > Combined (Search + Filter) > Filter > First-Time > Period
  const getEmptyStateType = () => {
    if (!isEmpty) return null;

    // Combined: both search and filter active
    if (hasActiveSearch && hasActiveFilter && clientName) {
      return 'combined';
    }

    // Search only
    if (hasActiveSearch) {
      return 'search';
    }

    // Filter only
    if (hasActiveFilter && clientName) {
      return 'filter';
    }

    // First-time user (no entries ever)
    if (isFirstTimeUser) {
      return 'first-time';
    }

    // Period (no entries for this period but user has entries elsewhere)
    return 'period';
  };

  const emptyStateType = getEmptyStateType();

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

      {/* Story 5.8: Render appropriate empty state based on type */}
      {emptyStateType === 'combined' && (
        <EmptyCombinedState query={filter!.searchQuery!} clientName={clientName!} />
      )}

      {emptyStateType === 'search' && (
        <EmptySearchState query={filter!.searchQuery!} />
      )}

      {emptyStateType === 'filter' && (
        <EmptyFilterState clientName={clientName!} />
      )}

      {emptyStateType === 'first-time' && (
        <EmptyFirstTimeState />
      )}

      {emptyStateType === 'period' && (
        <EmptyPeriodState period={period} />
      )}

      {/* Render entry lists when not empty */}
      {!emptyStateType && (
        <>
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
