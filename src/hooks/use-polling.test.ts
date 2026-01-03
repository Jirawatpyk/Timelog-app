// src/hooks/use-polling.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePolling } from '@/hooks/use-polling';

describe('usePolling', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('interval execution', () => {
    it('calls onPoll callback at specified interval', () => {
      const onPoll = vi.fn();
      renderHook(() => usePolling({ onPoll, intervalMs: 1000 }));

      expect(onPoll).not.toHaveBeenCalled();

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(onPoll).toHaveBeenCalledTimes(1);

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(onPoll).toHaveBeenCalledTimes(2);
    });

    it('uses POLLING_INTERVAL_MS as default interval', () => {
      const onPoll = vi.fn();
      renderHook(() => usePolling({ onPoll }));

      // Default is 30_000ms
      expect(onPoll).not.toHaveBeenCalled();

      act(() => {
        vi.advanceTimersByTime(30_000);
      });

      expect(onPoll).toHaveBeenCalledTimes(1);
    });

    it('does not call onPoll immediately on mount', () => {
      const onPoll = vi.fn();
      renderHook(() => usePolling({ onPoll, intervalMs: 1000 }));

      expect(onPoll).not.toHaveBeenCalled();
    });
  });

  describe('pause/resume on visibility change', () => {
    it('pauses polling when tab becomes hidden', () => {
      const onPoll = vi.fn();
      renderHook(() => usePolling({ onPoll, intervalMs: 1000 }));

      // Simulate tab hidden
      Object.defineProperty(document, 'hidden', {
        value: true,
        writable: true,
      });
      act(() => {
        document.dispatchEvent(new Event('visibilitychange'));
      });

      act(() => {
        vi.advanceTimersByTime(3000);
      });

      expect(onPoll).not.toHaveBeenCalled();
    });

    it('resumes polling when tab becomes visible', () => {
      const onPoll = vi.fn();
      renderHook(() => usePolling({ onPoll, intervalMs: 1000 }));

      // Simulate tab hidden
      Object.defineProperty(document, 'hidden', {
        value: true,
        writable: true,
      });
      act(() => {
        document.dispatchEvent(new Event('visibilitychange'));
      });

      // Simulate tab visible
      Object.defineProperty(document, 'hidden', {
        value: false,
        writable: true,
      });
      act(() => {
        document.dispatchEvent(new Event('visibilitychange'));
      });

      // Should call onPoll immediately on return
      expect(onPoll).toHaveBeenCalledTimes(1);

      // And continue polling
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(onPoll).toHaveBeenCalledTimes(2);
    });
  });

  describe('reset functionality', () => {
    it('resets polling timer and calls onPoll immediately', () => {
      const onPoll = vi.fn();
      const { result } = renderHook(() =>
        usePolling({ onPoll, intervalMs: 1000 })
      );

      act(() => {
        vi.advanceTimersByTime(500);
      });

      act(() => {
        result.current.reset();
      });

      // Should call immediately on reset
      expect(onPoll).toHaveBeenCalledTimes(1);

      // Timer should be reset, so next call at 1000ms from now
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(onPoll).toHaveBeenCalledTimes(2);
    });
  });

  describe('cleanup on unmount', () => {
    it('clears interval on unmount', () => {
      const onPoll = vi.fn();
      const { unmount } = renderHook(() =>
        usePolling({ onPoll, intervalMs: 1000 })
      );

      unmount();

      act(() => {
        vi.advanceTimersByTime(5000);
      });

      expect(onPoll).not.toHaveBeenCalled();
    });

    it('removes visibility event listener on unmount', () => {
      const onPoll = vi.fn();
      const removeEventListenerSpy = vi.spyOn(
        document,
        'removeEventListener'
      );

      const { unmount } = renderHook(() =>
        usePolling({ onPoll, intervalMs: 1000 })
      );

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'visibilitychange',
        expect.any(Function)
      );

      removeEventListenerSpy.mockRestore();
    });
  });

  describe('lastUpdated state', () => {
    it('updates lastUpdated after each poll', async () => {
      const onPoll = vi.fn();
      const { result } = renderHook(() =>
        usePolling({ onPoll, intervalMs: 1000 })
      );

      const initialDate = result.current.lastUpdated;

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(result.current.lastUpdated.getTime()).toBeGreaterThanOrEqual(
        initialDate.getTime()
      );
    });

    it('updates lastUpdated after reset', () => {
      const onPoll = vi.fn();
      const { result } = renderHook(() =>
        usePolling({ onPoll, intervalMs: 1000 })
      );

      const initialDate = result.current.lastUpdated;

      act(() => {
        result.current.reset();
      });

      expect(result.current.lastUpdated.getTime()).toBeGreaterThanOrEqual(
        initialDate.getTime()
      );
    });
  });

  describe('isPolling state', () => {
    it('returns isPolling true when polling is active', () => {
      const onPoll = vi.fn();
      const { result } = renderHook(() =>
        usePolling({ onPoll, intervalMs: 1000 })
      );

      expect(result.current.isPolling).toBe(true);
    });

    it('returns isPolling false when paused', () => {
      const onPoll = vi.fn();
      const { result } = renderHook(() =>
        usePolling({ onPoll, intervalMs: 1000 })
      );

      // Simulate tab hidden
      Object.defineProperty(document, 'hidden', {
        value: true,
        writable: true,
      });

      act(() => {
        document.dispatchEvent(new Event('visibilitychange'));
      });

      expect(result.current.isPolling).toBe(false);
    });
  });
});
