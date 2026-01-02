/**
 * Draft Types
 *
 * Type definitions for form draft persistence.
 */

export interface FormDraft<T> {
  data: T;
  savedAt: number; // timestamp
  version: number; // for future migrations
}
