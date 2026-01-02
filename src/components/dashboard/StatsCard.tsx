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
import { WORK_HOURS_TARGET } from '@/constants/business';
import type { Period, DashboardStats } from '@/types/dashboard';

interface StatsCardProps {
  stats: DashboardStats;
  period: Period;
}

export function StatsCard({ stats, period }: StatsCardProps) {
  const isToday = period === 'today';
  const isUnderTarget = isToday && stats.totalHours < WORK_HOURS_TARGET;
  const isDoneForToday = isToday && stats.totalHours >= WORK_HOURS_TARGET;
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
                  isDoneForToday ? 'bg-green-500' : 'bg-amber-500'
                )}
                style={{ width: `${progressPercent}%` }}
                role="progressbar"
                aria-valuenow={stats.totalHours}
                aria-valuemin={0}
                aria-valuemax={WORK_HOURS_TARGET}
                data-testid="progress-bar"
              />
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-xs text-muted-foreground">
                {progressPercent.toFixed(0)}% of target
              </span>
              {isDoneForToday && (
                <span
                  className="text-xs text-green-600 dark:text-green-500 font-medium"
                  data-testid="done-for-today"
                >
                  Done for today! ✓
                </span>
              )}
            </div>
          </div>
        )}

        {/* Weekly Average Display (AC3) - Story 5.5 */}
        {period === 'week' && (
          <div className="mt-4 pt-4 border-t" data-testid="weekly-stats">
            {stats.averagePerDay !== undefined && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Avg per day</span>
                <span className="font-medium" data-testid="weekly-avg">
                  {stats.averagePerDay.toFixed(1)} hr/day
                </span>
              </div>
            )}
            {stats.daysWithEntries !== undefined && (
              <div className="flex justify-between text-sm mt-1">
                <span className="text-muted-foreground">Days logged</span>
                <span className="font-medium" data-testid="days-logged-week">
                  {stats.daysWithEntries} {stats.daysWithEntries === 1 ? 'day' : 'days'}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Monthly Stats Display (Story 5.4, 5.5 - AC4) */}
        {period === 'month' && (
          <div className="mt-4 pt-4 border-t" data-testid="monthly-stats">
            {stats.averagePerWeek !== undefined && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Avg per week</span>
                <span className="font-medium" data-testid="weekly-avg-month">
                  {stats.averagePerWeek.toFixed(1)} hr/wk
                </span>
              </div>
            )}
            {stats.averagePerDay !== undefined && (
              <div className="flex justify-between text-sm mt-1">
                <span className="text-muted-foreground">Avg per day</span>
                <span className="font-medium" data-testid="daily-avg-month">
                  {stats.averagePerDay.toFixed(1)} hr/day
                </span>
              </div>
            )}
            {stats.daysWithEntries !== undefined && (
              <div className="flex justify-between text-sm mt-1">
                <span className="text-muted-foreground">Days logged</span>
                <span className="font-medium" data-testid="days-logged">
                  {stats.daysWithEntries} {stats.daysWithEntries === 1 ? 'day' : 'days'}
                </span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
