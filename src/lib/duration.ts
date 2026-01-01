/**
 * Duration utility functions for converting between hours and minutes
 * Story 4.3 - AC7: Duration storage and display formats
 */

/**
 * Convert hours (decimal) to minutes
 * @param hours - e.g., 1.5
 * @returns minutes - e.g., 90
 */
export function hoursToMinutes(hours: number): number {
  return Math.round(hours * 60);
}

/**
 * Convert minutes to hours (decimal)
 * @param minutes - e.g., 90
 * @returns hours - e.g., 1.5
 */
export function minutesToHours(minutes: number): number {
  return minutes / 60;
}

/**
 * Format duration for display
 * @param minutes - duration in minutes
 * @param format - 'short' | 'long'
 * @returns formatted string in Thai
 */
export function formatDuration(
  minutes: number,
  format: 'short' | 'long' = 'short'
): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (format === 'short') {
    // "1.5 ชม."
    return `${minutesToHours(minutes)} ชม.`;
  }

  // Long format: "1 ชม. 30 นาที"
  if (hours === 0) {
    return `${mins} นาที`;
  }
  if (mins === 0) {
    return `${hours} ชม.`;
  }
  return `${hours} ชม. ${mins} นาที`;
}

/**
 * Validate duration is in 0.25 hour increments
 * @param hours - duration in hours
 * @returns true if valid increment
 */
export function isValidDurationIncrement(hours: number): boolean {
  // Use multiplication to avoid floating point precision issues
  const quartersInDuration = hours * 4;
  return Number.isInteger(quartersInDuration);
}

/**
 * Duration presets in hours (for quick entry buttons)
 * Story 4.3 - AC4
 */
export const DURATION_PRESETS = [0.5, 1, 2, 4, 8] as const;
