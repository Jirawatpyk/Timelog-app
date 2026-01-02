/**
 * Dashboard Content - Story 5.1, 5.3, 5.4
 *
 * Server Component that fetches and displays entries + stats for a period.
 * Uses Supabase server client (no TanStack Query per architecture).
 *
 * Story 5.3: Uses GroupedEntryList for week period
 * Story 5.4: Uses MonthlyEntryList for month period with week grouping
 */

import { StatsCard } from '@/components/dashboard/StatsCard';
import { EntryList } from '@/components/dashboard/EntryList';
import { GroupedEntryList } from '@/components/dashboard/GroupedEntryList';
import { MonthlyEntryList } from '@/components/dashboard/MonthlyEntryList';
import { getUserEntries, getDashboardStats } from '@/lib/queries/get-user-entries';
import { getDateRangeForPeriod } from '@/lib/dashboard/period-utils';
import type { Period } from '@/types/dashboard';

interface DashboardContentProps {
  period: Period;
}

export async function DashboardContent({ period }: DashboardContentProps) {
  const dateRange = getDateRangeForPeriod(period);

  const [entries, stats] = await Promise.all([
    getUserEntries(dateRange),
    getDashboardStats(dateRange, period),
  ]);

  return (
    <div
      className="flex flex-col gap-4"
      id={`panel-${period}`}
      role="tabpanel"
      aria-labelledby={`tab-${period}`}
    >
      <StatsCard stats={stats} period={period} />

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
    </div>
  );
}
