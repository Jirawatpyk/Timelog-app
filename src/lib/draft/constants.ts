/**
 * Draft Constants
 *
 * Configuration constants for form draft persistence.
 */

/** Storage keys for different draft types */
export const DRAFT_KEYS = {
  entry: 'draft-entry',
  editEntry: (id: string) => `draft-entry-${id}`,
} as const;

/** Draft expiry time: 24 hours */
export const DRAFT_EXPIRY_MS = 24 * 60 * 60 * 1000;

/** Debounce delay for auto-save: 2 seconds */
export const DRAFT_SAVE_DEBOUNCE_MS = 2000;
