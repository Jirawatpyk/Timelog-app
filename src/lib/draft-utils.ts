import { DRAFT_KEYS, DRAFT_EXPIRY_MS } from '@/constants/storage';
import type { FormDraft } from '@/types/draft';

/**
 * Clean up all expired drafts from sessionStorage
 * Call this on app initialization
 */
export function cleanupExpiredDrafts(): void {
  if (typeof window === 'undefined') return;

  const now = Date.now();

  // Check entry draft
  cleanupDraftIfExpired(DRAFT_KEYS.entry, now);

  // Check all edit drafts (keys matching pattern)
  // Collect keys first to avoid index shifting during removal
  const keysToCheck: string[] = [];
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key?.startsWith('draft-entry-')) {
      keysToCheck.push(key);
    }
  }
  keysToCheck.forEach((key) => cleanupDraftIfExpired(key, now));
}

function cleanupDraftIfExpired(key: string, now: number): void {
  const saved = sessionStorage.getItem(key);
  if (!saved) return;

  try {
    const draft: FormDraft<unknown> = JSON.parse(saved);
    if (now - draft.savedAt > DRAFT_EXPIRY_MS) {
      sessionStorage.removeItem(key);
    }
  } catch {
    // Invalid JSON, remove it
    sessionStorage.removeItem(key);
  }
}

/**
 * Check if a draft exists for given key
 * Note: Only call from client components
 */
export function hasDraft(key: string): boolean {
  return sessionStorage.getItem(key) !== null;
}

/**
 * Get draft age in minutes
 * Note: Only call from client components
 */
export function getDraftAge(key: string): number | null {
  const saved = sessionStorage.getItem(key);
  if (!saved) return null;

  try {
    const draft: FormDraft<unknown> = JSON.parse(saved);
    return Math.floor((Date.now() - draft.savedAt) / (1000 * 60));
  } catch {
    return null;
  }
}
