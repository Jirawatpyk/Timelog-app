/**
 * Business Constants
 *
 * Configurable business rules and thresholds.
 * Central location for values that may need adjustment per deployment.
 */

/**
 * Standard daily work hours target.
 * Used in StatsCard to show progress toward daily goal.
 * Default: 8 hours (standard full-time workday)
 */
export const WORK_HOURS_TARGET = 8;

/**
 * Edit window for time entries in days.
 * Entries older than this cannot be edited by staff.
 * Already defined in src/lib/entry-rules.ts - exported here for reference.
 */
export { EDIT_WINDOW_DAYS_CONST as EDIT_WINDOW_DAYS } from '@/lib/entry-rules';
