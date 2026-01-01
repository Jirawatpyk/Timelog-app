/**
 * Date Formatting Utilities
 * Story 4.4 - AC3: Date formatting with English format
 */

export const MONTHS_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
] as const;

export const MONTHS_FULL = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
] as const;

export const WEEKDAYS_SHORT = [
  'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'
] as const;

// Legacy exports for backwards compatibility
export const THAI_MONTHS_SHORT = MONTHS_SHORT;
export const THAI_MONTHS_FULL = MONTHS_FULL;
export const THAI_WEEKDAYS_SHORT = WEEKDAYS_SHORT;

/**
 * Convert Gregorian year to Buddhist year (พ.ศ.)
 * @param gregorianYear - e.g., 2024
 * @returns Buddhist year - e.g., 2567
 * @deprecated Use Gregorian year for English format
 */
export function toBuddhistYear(gregorianYear: number): number {
  return gregorianYear + 543;
}

/**
 * Format date to English format
 * @param date - Date object or ISO string
 * @param format - 'short' | 'long' | 'full'
 * @returns Formatted date string
 *
 * Examples:
 * - short: "Jan 2, 2026"
 * - long: "January 2, 2026"
 * - full: "Thu, Jan 2, 2026"
 */
export function formatThaiDate(
  date: Date | string,
  format: 'short' | 'long' | 'full' = 'short'
): string {
  const d = typeof date === 'string' ? parseISODate(date) : date;
  const day = d.getDate();
  const month = d.getMonth();
  const year = d.getFullYear();
  const weekday = d.getDay();

  switch (format) {
    case 'short':
      return `${MONTHS_SHORT[month]} ${day}, ${year}`;
    case 'long':
      return `${MONTHS_FULL[month]} ${day}, ${year}`;
    case 'full':
      return `${WEEKDAYS_SHORT[weekday]}, ${MONTHS_SHORT[month]} ${day}, ${year}`;
    default:
      return `${MONTHS_SHORT[month]} ${day}, ${year}`;
  }
}

/**
 * Check if date is more than N days in the future
 * @param date - Date object or ISO string
 * @param daysAhead - Number of days ahead to consider "future" (default: 1)
 * @returns true if date is more than daysAhead days in the future
 */
export function isFutureDate(date: Date | string, daysAhead: number = 1): boolean {
  const d = typeof date === 'string' ? parseISODate(date) : date;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const futureLimit = new Date(today);
  futureLimit.setDate(futureLimit.getDate() + daysAhead);

  return d > futureLimit;
}

/**
 * Get today's date as ISO string (YYYY-MM-DD)
 * Uses local timezone
 */
export function getTodayISO(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parse ISO date string to Date object (handles timezone correctly)
 * Creates a local date at midnight, avoiding UTC conversion issues
 * @param isoString - Date in YYYY-MM-DD format
 */
export function parseISODate(isoString: string): Date {
  const [year, month, day] = isoString.split('-').map(Number);
  return new Date(year, month - 1, day);
}
