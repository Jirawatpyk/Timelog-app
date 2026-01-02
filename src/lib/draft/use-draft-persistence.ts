'use client';

/**
 * Draft Persistence Hook
 *
 * React hook to persist form data as a draft in sessionStorage.
 * - Saves form data with debounce (2 seconds)
 * - Restores draft on mount if not expired (24 hours)
 * - Shows toast with clear action on restoration
 */

import { useEffect, useRef, useCallback } from 'react';
import { useWatch, type UseFormReturn } from 'react-hook-form';
import { toast } from 'sonner';
import { DRAFT_EXPIRY_MS, DRAFT_SAVE_DEBOUNCE_MS } from './constants';
import type { FormDraft } from './types';

interface UseDraftPersistenceOptions<T extends Record<string, unknown>> {
  form: UseFormReturn<T>;
  storageKey: string;
  onRestore?: (data: T) => void;
  enabled?: boolean;
}

interface UseDraftPersistenceReturn {
  clearDraft: () => void;
}

/**
 * Hook to persist form data as a draft in sessionStorage.
 *
 * @param options Configuration options
 * @returns Object with clearDraft function
 *
 * @example
 * ```typescript
 * import { useDraftPersistence, DRAFT_KEYS } from '@/lib/draft';
 *
 * function MyForm() {
 *   const form = useForm<MyFormData>();
 *   const { clearDraft } = useDraftPersistence({
 *     form,
 *     storageKey: DRAFT_KEYS.entry,
 *   });
 *
 *   const onSubmit = () => {
 *     // ... submit logic
 *     clearDraft(); // Clear draft on successful submit
 *   };
 * }
 * ```
 */
export function useDraftPersistence<T extends Record<string, unknown>>({
  form,
  storageKey,
  onRestore,
  enabled = true,
}: UseDraftPersistenceOptions<T>): UseDraftPersistenceReturn {
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasRestoredRef = useRef(false);

  // Watch form values for changes
  const formValues = useWatch({ control: form.control });

  // Restore draft on mount
  useEffect(() => {
    if (!enabled || hasRestoredRef.current) return;
    hasRestoredRef.current = true;

    const savedDraft = sessionStorage.getItem(storageKey);
    if (!savedDraft) return;

    try {
      const draft: FormDraft<T> = JSON.parse(savedDraft);

      // Check expiry
      const now = Date.now();
      if (now - draft.savedAt > DRAFT_EXPIRY_MS) {
        // Draft expired, remove it silently
        sessionStorage.removeItem(storageKey);
        return;
      }

      // Restore form data
      form.reset(draft.data);
      onRestore?.(draft.data);

      // Show toast with clear action
      toast.info('Draft found. Continue or clear?', {
        action: {
          label: 'Clear Draft',
          onClick: () => {
            sessionStorage.removeItem(storageKey);
            form.reset();
            toast.success('Draft cleared');
          },
        },
        duration: 5000,
      });
    } catch {
      // Invalid draft JSON, remove it
      sessionStorage.removeItem(storageKey);
    }
  }, [enabled, storageKey, form, onRestore]);

  // Save draft on form change (debounced)
  useEffect(() => {
    if (!enabled) return;

    // Clear previous timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Debounce save
    saveTimeoutRef.current = setTimeout(() => {
      const draft: FormDraft<T> = {
        data: formValues as T,
        savedAt: Date.now(),
        version: 1,
      };

      sessionStorage.setItem(storageKey, JSON.stringify(draft));
    }, DRAFT_SAVE_DEBOUNCE_MS);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [formValues, storageKey, enabled]);

  // Clear draft function
  const clearDraft = useCallback(() => {
    sessionStorage.removeItem(storageKey);
  }, [storageKey]);

  return { clearDraft };
}
