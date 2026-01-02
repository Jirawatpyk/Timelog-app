/**
 * Group Entries Utility - Story 5.3, 5.4
 *
 * Groups time entries by date with daily subtotals.
 * Used for weekly and monthly views on the dashboard.
 *
 * Story 5.4: Added groupEntriesByWeek for monthly view.
 */

import { getDateRangeForPeriod, getDaysInRange } from '@/lib/dashboard/period-utils';
import type { TimeEntryWithDetails } from '@/types/domain';
import type { Period } from '@/types/dashboard';

/** Short month names in English (per project-context.md) */
const ENGLISH_MONTHS_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export interface EntryGroup {
  /** ISO date string (YYYY-MM-DD) */
  date: string;
  /** Entries for this day */
  entries: TimeEntryWithDetails[];
  /** Total hours for this day */
  totalHours: number;
}

/**
 * Group entries by date with optional empty day inclusion.
 *
 * @param entries - Array of time entries to group
 * @param period - Current period context (today, week, month)
 * @param includeEmptyDays - Whether to include days with no entries
 * @returns Array of entry groups sorted by date (newest first)
 */
export function groupEntriesByDate(
  entries: TimeEntryWithDetails[],
  period: Period,
  includeEmptyDays: boolean = false
): EntryGroup[] {
  // Create a map of date -> entries
  const groupMap = new Map<string, TimeEntryWithDetails[]>();

  // Group entries by entry_date
  entries.forEach((entry) => {
    const dateKey = entry.entry_date; // Already YYYY-MM-DD from DB
    if (!groupMap.has(dateKey)) {
      groupMap.set(dateKey, []);
    }
    groupMap.get(dateKey)!.push(entry);
  });

  // Determine all dates to include
  let allDates: string[];
  if (includeEmptyDays && period !== 'today') {
    // Get all dates in the period range
    const { start, end } = getDateRangeForPeriod(period);
    allDates = getDaysInRange(start, end);
  } else {
    // Only dates that have entries
    allDates = Array.from(groupMap.keys());
  }

  // Sort dates descending (newest first)
  allDates.sort((a, b) => b.localeCompare(a));

  // Build result array
  return allDates.map((date) => {
    const dayEntries = groupMap.get(date) || [];

    // Sort entries within day by created_at descending (newest first)
    dayEntries.sort(
      (a, b) =>
        new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime()
    );

    // Calculate total minutes and convert to hours
    const totalMinutes = dayEntries.reduce(
      (sum, entry) => sum + entry.duration_minutes,
      0
    );

    return {
      date,
      entries: dayEntries,
      totalHours: totalMinutes / 60,
    };
  });
}

// ============================================
// STORY 5.4: Week Grouping for Monthly View
// ============================================

/**
 * Represents a week group within a month
 */
export interface WeekGroup {
  /** Week number within the month (1-5) */
  weekNumber: number;
  /** Start date of the week (YYYY-MM-DD) */
  startDate: string;
  /** End date of the week (YYYY-MM-DD) */
  endDate: string;
  /** Formatted label: "Week X (DD-DD Mon)" */
  label: string;
  /** Entries within this week */
  entries: TimeEntryWithDetails[];
  /** Total hours for this week */
  totalHours: number;
}

interface WeekRange {
  start: string;
  end: string;
}

/**
 * Get all weeks in a month as date ranges.
 * Weeks start on Monday and end on Sunday (ISO week standard).
 *
 * @param year - Year of the month
 * @param month - Month (0-indexed, 0 = January)
 * @returns Array of week ranges within the month
 */
function getWeeksInMonth(year: number, month: number): WeekRange[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const weeks: WeekRange[] = [];

  let currentStart = new Date(firstDay);

  while (currentStart <= lastDay) {
    const currentEnd = new Date(currentStart);

    // Calculate days until next Sunday (end of ISO week)
    // Sunday = 0, Mon = 1, ..., Sat = 6
    const dayOfWeek = currentStart.getDay();
    // If Sunday (0), we're already at end; otherwise go to next Sunday
    const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
    currentEnd.setDate(currentStart.getDate() + daysUntilSunday);

    // Cap at end of month
    if (currentEnd > lastDay) {
      currentEnd.setTime(lastDay.getTime());
    }

    weeks.push({
      start: formatISODate(currentStart),
      end: formatISODate(currentEnd),
    });

    // Move to next Monday
    currentStart = new Date(currentEnd);
    currentStart.setDate(currentStart.getDate() + 1);
  }

  return weeks;
}

/**
 * Format a Date to YYYY-MM-DD string
 */
function formatISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Determine which week number (1-5) a date falls into within a month.
 *
 * @param dateStr - ISO date string (YYYY-MM-DD)
 * @param weeks - Array of week ranges for the month
 * @returns Week number (1-indexed)
 */
function getWeekNumberForDate(dateStr: string, weeks: WeekRange[]): number {
  for (let i = 0; i < weeks.length; i++) {
    if (dateStr >= weeks[i].start && dateStr <= weeks[i].end) {
      return i + 1;
    }
  }
  return 1; // Fallback
}

/**
 * Format week label in English: "Week X (DD-DD Mon)"
 *
 * @param weekNumber - Week number (1-5)
 * @param startDate - Start date (YYYY-MM-DD)
 * @param endDate - End date (YYYY-MM-DD)
 * @returns Formatted label
 */
function formatWeekLabel(weekNumber: number, startDate: string, endDate: string): string {
  const start = new Date(startDate + 'T00:00:00');
  const end = new Date(endDate + 'T00:00:00');

  const startDay = start.getDate();
  const endDay = end.getDate();
  const monthName = ENGLISH_MONTHS_SHORT[start.getMonth()];

  return `Week ${weekNumber} (${startDay}-${endDay} ${monthName})`;
}

/**
 * Group entries by week within a month.
 * Only returns weeks that have entries (empty weeks are excluded per AC6).
 *
 * @param entries - Array of time entries to group
 * @param monthDate - A date within the target month
 * @returns Array of week groups, sorted by week number
 */
export function groupEntriesByWeek(
  entries: TimeEntryWithDetails[],
  monthDate: Date
): WeekGroup[] {
  if (entries.length === 0) {
    return [];
  }

  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();

  // Get all weeks in the month
  const weeks = getWeeksInMonth(year, month);

  // Initialize week map
  const weekMap = new Map<number, TimeEntryWithDetails[]>();
  weeks.forEach((_, index) => weekMap.set(index + 1, []));

  // Group entries by week
  entries.forEach((entry) => {
    const weekNum = getWeekNumberForDate(entry.entry_date, weeks);
    weekMap.get(weekNum)?.push(entry);
  });

  // Build result array, filtering out empty weeks
  return weeks
    .map((week, index) => {
      const weekNumber = index + 1;
      const weekEntries = weekMap.get(weekNumber) || [];

      // Sort entries: by date descending, then by created_at descending
      weekEntries.sort((a, b) => {
        const dateCompare = b.entry_date.localeCompare(a.entry_date);
        if (dateCompare !== 0) return dateCompare;
        return (
          new Date(b.created_at ?? 0).getTime() -
          new Date(a.created_at ?? 0).getTime()
        );
      });

      const totalMinutes = weekEntries.reduce(
        (sum, e) => sum + e.duration_minutes,
        0
      );

      return {
        weekNumber,
        startDate: week.start,
        endDate: week.end,
        label: formatWeekLabel(weekNumber, week.start, week.end),
        entries: weekEntries,
        totalHours: totalMinutes / 60,
      };
    })
    .filter((week) => week.entries.length > 0);
}
