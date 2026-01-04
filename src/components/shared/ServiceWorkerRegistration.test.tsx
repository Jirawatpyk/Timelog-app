import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import { ServiceWorkerRegistration } from './ServiceWorkerRegistration';

describe('ServiceWorkerRegistration', () => {
  // Mock service worker API
  const mockRegistration = {
    scope: '/',
    installing: null as ServiceWorker | null,
    waiting: null as ServiceWorker | null,
    active: null as ServiceWorker | null,
    addEventListener: vi.fn(),
    update: vi.fn(),
  };

  const mockServiceWorker = {
    register: vi.fn().mockResolvedValue(mockRegistration),
    controller: null as ServiceWorker | null,
    ready: Promise.resolve(mockRegistration),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Reset mock registration
    mockRegistration.installing = null;
    mockRegistration.waiting = null;
    mockRegistration.addEventListener.mockReset();

    // Mock navigator.serviceWorker
    Object.defineProperty(navigator, 'serviceWorker', {
      value: mockServiceWorker,
      configurable: true,
      writable: true,
    });

    // Mock document.readyState
    Object.defineProperty(document, 'readyState', {
      value: 'complete',
      configurable: true,
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('rendering', () => {
    it('should render nothing (returns null)', () => {
      const { container } = render(<ServiceWorkerRegistration />);
      expect(container).toBeEmptyDOMElement();
    });
  });

  // Note: In test environment (NODE_ENV=test), the component skips registration
  // This is similar to development mode behavior
  describe('in test environment', () => {
    it('should not call register in test mode (similar to development)', () => {
      render(<ServiceWorkerRegistration />);
      // In test mode (which is what we're running), NODE_ENV !== 'production'
      // so it should skip registration silently
      expect(mockServiceWorker.register).not.toHaveBeenCalled();
    });
  });

  describe('without service worker support', () => {
    it('should not throw when SW not supported', () => {
      Object.defineProperty(navigator, 'serviceWorker', {
        value: undefined,
        configurable: true,
        writable: true,
      });

      expect(() => render(<ServiceWorkerRegistration />)).not.toThrow();
    });
  });
});
