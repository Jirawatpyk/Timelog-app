/**
 * Draft Module
 *
 * Provides form draft persistence functionality using sessionStorage.
 *
 * Features:
 * - Auto-save form data with debounce (2 seconds)
 * - Restore drafts on form mount
 * - Automatic expiry after 24 hours
 * - Toast notifications for draft restoration
 *
 * @example
 * ```typescript
 * import { useDraftPersistence, DRAFT_KEYS, cleanupExpiredDrafts } from '@/lib/draft';
 *
 * // In app layout - cleanup expired drafts on mount
 * useEffect(() => {
 *   cleanupExpiredDrafts();
 * }, []);
 *
 * // In form component
 * const form = useForm<MyFormData>();
 * const { clearDraft } = useDraftPersistence({
 *   form,
 *   storageKey: DRAFT_KEYS.entry,
 * });
 * ```
 */

// Types
export type { FormDraft } from './types';

// Constants
export {
  DRAFT_KEYS,
  DRAFT_EXPIRY_MS,
  DRAFT_SAVE_DEBOUNCE_MS,
} from './constants';

// Utilities
export {
  cleanupExpiredDrafts,
  hasDraft,
  getDraftAge,
} from './utils';

// Hook
export { useDraftPersistence } from './use-draft-persistence';
