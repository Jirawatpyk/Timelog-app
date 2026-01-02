/**
 * Stats Card - Story 5.1
 *
 * Displays summary statistics for the selected period.
 * Shows total hours, entry count, and top client.
 */

import { Card, CardContent } from '@/components/ui/card';
import { formatPeriodLabel } from '@/lib/dashboard/period-utils';
import type { Period, DashboardStats } from '@/types/dashboard';

interface StatsCardProps {
  stats: DashboardStats;
  period: Period;
}

export function StatsCard({ stats, period }: StatsCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-muted-foreground">
              {formatPeriodLabel(period)}
            </p>
            <p className="text-3xl font-bold">
              {stats.totalHours.toFixed(1)} hr
            </p>
            <p className="text-sm text-muted-foreground">
              {stats.entryCount} {stats.entryCount === 1 ? 'entry' : 'entries'}
            </p>
          </div>

          {stats.topClient && (
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Top Client</p>
              <p className="text-sm font-medium">{stats.topClient.name}</p>
              <p className="text-xs text-muted-foreground">
                {stats.topClient.hours.toFixed(1)} hr
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
