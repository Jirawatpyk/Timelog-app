/**
 * Dashboard Content - Story 5.1
 *
 * Server Component that fetches and displays entries + stats for a period.
 * Uses Supabase server client (no TanStack Query per architecture).
 */

import { StatsCard } from '@/components/dashboard/StatsCard';
import { EntryList } from '@/components/dashboard/EntryList';
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
    getDashboardStats(dateRange),
  ]);

  return (
    <div
      className="flex flex-col gap-4"
      id={`panel-${period}`}
      role="tabpanel"
      aria-labelledby={`tab-${period}`}
    >
      <StatsCard stats={stats} period={period} />
      <EntryList entries={entries} />
    </div>
  );
}
