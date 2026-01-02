/**
 * Entry Rules Utility
 * Story 4.5 - AC4: 7-day edit restriction
 */

const EDIT_WINDOW_DAYS = 7;

/**
 * Check if an entry can be edited (within 7-day window)
 * @param entryDate - ISO date string (YYYY-MM-DD)
 * @returns true if entry is within edit window
 */
export function canEditEntry(entryDate: string): boolean {
  const entry = new Date(entryDate);
  entry.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const cutoffDate = new Date(today);
  cutoffDate.setDate(cutoffDate.getDate() - EDIT_WINDOW_DAYS);

  return entry >= cutoffDate;
}

/**
 * Get days remaining until entry becomes non-editable
 * @param entryDate - ISO date string (YYYY-MM-DD)
 * @returns days remaining (0 if already locked)
 *
 * Edit window: entry date + 7 days (8 total days including entry day)
 * - Entry from today: 8 days remaining
 * - Entry from 7 days ago: 1 day remaining (last day)
 * - Entry from 8 days ago: 0 (locked)
 */
export function getDaysUntilLocked(entryDate: string): number {
  const entry = new Date(entryDate);
  entry.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Calculate days since entry (0 for today, 7 for 7 days ago)
  const daysSinceEntry = Math.floor(
    (today.getTime() - entry.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Edit window is EDIT_WINDOW_DAYS + 1 days total (including entry day)
  const daysRemaining = EDIT_WINDOW_DAYS + 1 - daysSinceEntry;

  return Math.max(0, daysRemaining);
}

/**
 * Export the edit window constant for use in error messages
 */
export const EDIT_WINDOW_DAYS_CONST = EDIT_WINDOW_DAYS;
