// src/lib/utils/time-indicator.ts

export type TimeIndicator = 'neutral' | 'warning';

/**
 * Get time-of-day indicator for team dashboard
 * - Before 5 PM: neutral (no warning)
 * - After 5 PM (17:00): warning (subtle orange dot)
 */
export function getTimeOfDayIndicator(): TimeIndicator {
  const now = new Date();
  const hour = now.getHours();

  // After 5 PM (17:00) = subtle warning
  if (hour >= 17) {
    return 'warning';
  }

  // Before 5 PM = neutral (including before noon)
  return 'neutral';
}

/**
 * Check if current time is after 5 PM (17:00)
 */
export function isAfter5PM(): boolean {
  return new Date().getHours() >= 17;
}

// Note: isBeforeNoon() was removed as it was never used
// AC4 treats "before noon" and "noon to 5 PM" identically (both neutral)
