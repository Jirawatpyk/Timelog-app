/**
 * Period Utilities - Story 5.1
 *
 * Utilities for handling time period selection on the dashboard.
 * Supports: today, week (ISO - Mon-Sun), month
 */

import type { Period, DateRange } from '@/types/dashboard';

/**
 * Type guard to validate if a string is a valid Period
 */
export function isValidPeriod(value: string | undefined): value is Period {
  return value === 'today' || value === 'week' || value === 'month';
}

/**
 * Get period from URL search params with fallback to 'today'
 */
export function getPeriodFromSearchParams(period?: string): Period {
  if (isValidPeriod(period)) {
    return period;
  }
  return 'today';
}

/**
 * Calculate date range for a given period
 *
 * - today: 00:00 to 23:59:59.999 of current day
 * - week: Monday 00:00 to Sunday 23:59:59.999 (ISO week)
 * - month: 1st 00:00 to last day 23:59:59.999
 */
export function getDateRangeForPeriod(period: Period): DateRange {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (period) {
    case 'today':
      return {
        start: today,
        end: new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
          23,
          59,
          59,
          999
        ),
      };

    case 'week': {
      // ISO week: Monday is first day (1), Sunday is last (0)
      const dayOfWeek = today.getDay();
      // If Sunday (0), go back 6 days; otherwise go back (dayOfWeek - 1) days
      const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      const monday = new Date(today);
      monday.setDate(today.getDate() + diffToMonday);

      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      sunday.setHours(23, 59, 59, 999);

      return { start: monday, end: sunday };
    }

    case 'month': {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      // Day 0 of next month = last day of current month
      const lastDay = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
        23,
        59,
        59,
        999
      );
      return { start: firstDay, end: lastDay };
    }
  }
}

/**
 * Format period for display (English UI labels per project-context.md)
 */
export function formatPeriodLabel(period: Period): string {
  const labels: Record<Period, string> = {
    today: 'Today',
    week: 'This Week',
    month: 'This Month',
  };
  return labels[period];
}
