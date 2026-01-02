/**
 * Stats Card - Story 5.1, 5.2
 *
 * Displays summary statistics for the selected period.
 * Shows total hours, entry count, and top client.
 *
 * Story 5.2 - AC3: Total hours display with < 8 hours indicator
 */

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { formatPeriodLabel } from '@/lib/dashboard/period-utils';
import {
  WORK_HOURS_TARGET,
  DAYS_PER_WEEK,
  WORK_DAYS_PER_WEEK,
} from '@/constants/business';
import type { Period, DashboardStats } from '@/types/dashboard';

interface StatsCardProps {
  stats: DashboardStats;
  period: Period;
}

export function StatsCard({ stats, period }: StatsCardProps) {
  const isToday = period === 'today';
  const isUnderTarget = isToday && stats.totalHours < WORK_HOURS_TARGET;
  const hoursRemaining = Math.max(0, WORK_HOURS_TARGET - stats.totalHours);
  const progressPercent = Math.min(
    (stats.totalHours / WORK_HOURS_TARGET) * 100,
    100
  );

  return (
    <Card data-testid="stats-card">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-muted-foreground">
              {formatPeriodLabel(period)}
            </p>
            <div className="flex items-baseline gap-2">
              <p
                className={cn(
                  'text-3xl font-bold',
                  isUnderTarget && 'text-amber-600 dark:text-amber-500'
                )}
                data-testid="total-hours"
              >
                {stats.totalHours.toFixed(1)} hr
              </p>
              {isUnderTarget && (
                <span
                  className="text-xs text-amber-600 dark:text-amber-500"
                  data-testid="hours-remaining"
                >
                  ({hoursRemaining.toFixed(1)} hr remaining)
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {stats.entryCount} {stats.entryCount === 1 ? 'entry' : 'entries'}
            </p>
          </div>

          {stats.topClient && (
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Top Client</p>
              <p className="text-sm font-medium truncate max-w-[120px]">
                {stats.topClient.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {stats.topClient.hours.toFixed(1)} hr
              </p>
            </div>
          )}
        </div>

        {/* Progress Bar for Today */}
        {isToday && (
          <div className="mt-4" data-testid="progress-container">
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-500',
                  stats.totalHours >= WORK_HOURS_TARGET
                    ? 'bg-green-500'
                    : 'bg-amber-500'
                )}
                style={{ width: `${progressPercent}%` }}
                role="progressbar"
                aria-valuenow={stats.totalHours}
                aria-valuemin={0}
                aria-valuemax={WORK_HOURS_TARGET}
                data-testid="progress-bar"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1 text-right">
              {progressPercent.toFixed(0)}% of target
            </p>
          </div>
        )}

        {/* Weekly Average Display (AC4) */}
        {period === 'week' && (
          <div className="mt-4 pt-4 border-t" data-testid="weekly-stats">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Avg per day</span>
              <span className="font-medium" data-testid="weekly-avg">
                {(stats.totalHours / DAYS_PER_WEEK).toFixed(1)} hr/day
              </span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-muted-foreground">Mon-Fri avg</span>
              <span className="font-medium" data-testid="workday-avg">
                {(stats.totalHours / WORK_DAYS_PER_WEEK).toFixed(1)} hr/day
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
