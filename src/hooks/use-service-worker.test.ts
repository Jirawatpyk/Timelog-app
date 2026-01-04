import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useServiceWorker } from './use-service-worker';

describe('useServiceWorker', () => {
  // Mock service worker API
  let mockRegistration: {
    waiting: ServiceWorker | null;
    installing: ServiceWorker | null;
  };

  let mockServiceWorker: {
    ready: Promise<typeof mockRegistration>;
    controller: ServiceWorker | null;
    register: ReturnType<typeof vi.fn>;
    addEventListener: ReturnType<typeof vi.fn>;
    removeEventListener: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Reset mock registration
    mockRegistration = {
      waiting: null,
      installing: null,
    };

    mockServiceWorker = {
      ready: Promise.resolve(mockRegistration),
      controller: null,
      register: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };

    // Mock navigator.serviceWorker
    Object.defineProperty(navigator, 'serviceWorker', {
      value: mockServiceWorker,
      configurable: true,
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initial state', () => {
    it('should return updateAvailable as false initially', async () => {
      const { result } = renderHook(() => useServiceWorker());

      expect(result.current.updateAvailable).toBe(false);

      // Wait for ready promise to resolve
      await waitFor(() => {
        expect(result.current.isReady).toBe(true);
      });
    });

    it('should set isReady to true when SW is ready', async () => {
      const { result } = renderHook(() => useServiceWorker());

      // Wait for ready promise
      await waitFor(() => {
        expect(result.current.isReady).toBe(true);
      });
    });
  });

  describe('update detection', () => {
    it('should set updateAvailable to true when swUpdate event is dispatched', async () => {
      const { result } = renderHook(() => useServiceWorker());

      // Wait for hook to initialize
      await waitFor(() => {
        expect(result.current.isReady).toBe(true);
      });

      // Initially false
      expect(result.current.updateAvailable).toBe(false);

      // Dispatch swUpdate event
      act(() => {
        window.dispatchEvent(new CustomEvent('swUpdate'));
      });

      // Should be true now
      expect(result.current.updateAvailable).toBe(true);
    });

    it('should clean up event listener on unmount', async () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
      const { unmount, result } = renderHook(() => useServiceWorker());

      // Wait for hook to initialize
      await waitFor(() => {
        expect(result.current.isReady).toBe(true);
      });

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'swUpdate',
        expect.any(Function)
      );
    });
  });

  describe('update function', () => {
    it('should post SKIP_WAITING message to waiting worker', async () => {
      const mockWaiting = {
        postMessage: vi.fn(),
      };
      mockRegistration.waiting = mockWaiting as unknown as ServiceWorker;

      const { result } = renderHook(() => useServiceWorker());

      // Wait for hook to initialize
      await waitFor(() => {
        expect(result.current.isReady).toBe(true);
      });

      await act(async () => {
        result.current.update();
        // Allow promises to resolve
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(mockWaiting.postMessage).toHaveBeenCalledWith({
        type: 'SKIP_WAITING',
      });
    });

    it('should add controllerchange listener with once option', async () => {
      const addEventListenerSpy = vi.spyOn(
        mockServiceWorker,
        'addEventListener'
      );

      const { result } = renderHook(() => useServiceWorker());

      // Wait for hook to initialize
      await waitFor(() => {
        expect(result.current.isReady).toBe(true);
      });

      act(() => {
        result.current.update();
      });

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'controllerchange',
        expect.any(Function),
        { once: true }
      );
    });
  });

  describe('dismissUpdate function', () => {
    it('should set updateAvailable to false', async () => {
      const { result } = renderHook(() => useServiceWorker());

      // Wait for hook to initialize
      await waitFor(() => {
        expect(result.current.isReady).toBe(true);
      });

      // Set update available
      act(() => {
        window.dispatchEvent(new CustomEvent('swUpdate'));
      });
      expect(result.current.updateAvailable).toBe(true);

      // Dismiss
      act(() => {
        result.current.dismissUpdate();
      });
      expect(result.current.updateAvailable).toBe(false);
    });
  });

  describe('without service worker support', () => {
    it('should handle gracefully when SW not supported', () => {
      // Remove serviceWorker from navigator
      Object.defineProperty(navigator, 'serviceWorker', {
        value: undefined,
        configurable: true,
        writable: true,
      });

      const { result } = renderHook(() => useServiceWorker());

      // Should not throw and return default state
      expect(result.current.updateAvailable).toBe(false);
      expect(result.current.isReady).toBe(false);

      // update should not throw
      expect(() => result.current.update()).not.toThrow();
    });
  });
});
