import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import { useDraftPersistence } from './use-draft-persistence';
import { DRAFT_EXPIRY_MS, DRAFT_SAVE_DEBOUNCE_MS } from './constants';

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    info: vi.fn(),
    success: vi.fn(),
  },
}));

import { toast } from 'sonner';

interface TestFormData extends Record<string, unknown> {
  name: string;
  value: number;
}

describe('useDraftPersistence', () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // Helper to create form hook wrapper
  function createFormWrapper() {
    const { result } = renderHook(() =>
      useForm<TestFormData>({
        defaultValues: { name: '', value: 0 },
      })
    );
    return result.current;
  }

  describe('draft saving', () => {
    it('saves_draft_to_sessionStorage_after_debounce', async () => {
      const form = createFormWrapper();
      const storageKey = 'test-draft';

      renderHook(() =>
        useDraftPersistence({
          form,
          storageKey,
        })
      );

      // Change form value
      act(() => {
        form.setValue('name', 'test value');
      });

      // Before debounce - no save
      expect(sessionStorage.getItem(storageKey)).toBeNull();

      // After debounce
      act(() => {
        vi.advanceTimersByTime(DRAFT_SAVE_DEBOUNCE_MS + 100);
      });

      const saved = sessionStorage.getItem(storageKey);
      expect(saved).not.toBeNull();

      const parsed = JSON.parse(saved!);
      expect(parsed.data.name).toBe('test value');
      expect(parsed.version).toBe(1);
      expect(typeof parsed.savedAt).toBe('number');
    });

    it('does_not_save_when_disabled', () => {
      const form = createFormWrapper();
      const storageKey = 'test-draft';

      renderHook(() =>
        useDraftPersistence({
          form,
          storageKey,
          enabled: false,
        })
      );

      act(() => {
        form.setValue('name', 'test');
        vi.advanceTimersByTime(DRAFT_SAVE_DEBOUNCE_MS + 100);
      });

      expect(sessionStorage.getItem(storageKey)).toBeNull();
    });
  });

  describe('draft restoration', () => {
    it('restores_valid_draft_on_mount', () => {
      const storageKey = 'test-draft';
      const draftData = {
        data: { name: 'restored', value: 42 },
        savedAt: Date.now(),
        version: 1,
      };
      sessionStorage.setItem(storageKey, JSON.stringify(draftData));

      const form = createFormWrapper();

      renderHook(() =>
        useDraftPersistence({
          form,
          storageKey,
        })
      );

      // Wait for effect to run
      act(() => {
        vi.advanceTimersByTime(0);
      });

      expect(form.getValues('name')).toBe('restored');
      expect(form.getValues('value')).toBe(42);
    });

    it('shows_restoration_toast_when_draft_is_restored', () => {
      const storageKey = 'test-draft';
      const draftData = {
        data: { name: 'restored', value: 42 },
        savedAt: Date.now(),
        version: 1,
      };
      sessionStorage.setItem(storageKey, JSON.stringify(draftData));

      const form = createFormWrapper();

      renderHook(() =>
        useDraftPersistence({
          form,
          storageKey,
        })
      );

      act(() => {
        vi.advanceTimersByTime(0);
      });

      expect(toast.info).toHaveBeenCalledWith(
        'Draft found. Continue or clear?',
        expect.objectContaining({
          action: expect.objectContaining({
            label: 'Clear Draft',
          }),
        })
      );
    });

    it('calls_onRestore_callback_when_draft_is_restored', () => {
      const storageKey = 'test-draft';
      const onRestore = vi.fn();
      const draftData = {
        data: { name: 'restored', value: 42 },
        savedAt: Date.now(),
        version: 1,
      };
      sessionStorage.setItem(storageKey, JSON.stringify(draftData));

      const form = createFormWrapper();

      renderHook(() =>
        useDraftPersistence({
          form,
          storageKey,
          onRestore,
        })
      );

      act(() => {
        vi.advanceTimersByTime(0);
      });

      expect(onRestore).toHaveBeenCalledWith({ name: 'restored', value: 42 });
    });

    it('discards_expired_draft_silently', () => {
      const storageKey = 'test-draft';
      const expiredDraft = {
        data: { name: 'old', value: 0 },
        savedAt: Date.now() - DRAFT_EXPIRY_MS - 1000, // Expired
        version: 1,
      };
      sessionStorage.setItem(storageKey, JSON.stringify(expiredDraft));

      const form = createFormWrapper();

      renderHook(() =>
        useDraftPersistence({
          form,
          storageKey,
        })
      );

      act(() => {
        vi.advanceTimersByTime(0);
      });

      // Form should not be restored
      expect(form.getValues('name')).toBe('');
      // Draft should be removed
      expect(sessionStorage.getItem(storageKey)).toBeNull();
      // No toast shown
      expect(toast.info).not.toHaveBeenCalled();
    });

    it('removes_invalid_JSON_from_storage', () => {
      const storageKey = 'test-draft';
      sessionStorage.setItem(storageKey, 'invalid json{');

      const form = createFormWrapper();

      renderHook(() =>
        useDraftPersistence({
          form,
          storageKey,
        })
      );

      act(() => {
        vi.advanceTimersByTime(0);
      });

      expect(sessionStorage.getItem(storageKey)).toBeNull();
    });
  });

  describe('clearDraft', () => {
    it('removes_draft_from_sessionStorage', () => {
      const storageKey = 'test-draft';
      sessionStorage.setItem(
        storageKey,
        JSON.stringify({ data: {}, savedAt: Date.now(), version: 1 })
      );

      const form = createFormWrapper();

      const { result } = renderHook(() =>
        useDraftPersistence({
          form,
          storageKey,
        })
      );

      act(() => {
        result.current.clearDraft();
      });

      expect(sessionStorage.getItem(storageKey)).toBeNull();
    });
  });
});
