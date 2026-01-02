/**
 * Group Entries Utility - Story 5.3
 *
 * Groups time entries by date with daily subtotals.
 * Used for weekly and monthly views on the dashboard.
 */

import { getDateRangeForPeriod, getDaysInRange } from '@/lib/dashboard/period-utils';
import type { TimeEntryWithDetails } from '@/types/domain';
import type { Period } from '@/types/dashboard';

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
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
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
