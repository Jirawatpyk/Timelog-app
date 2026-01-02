import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { hapticFeedback, isHapticSupported } from './haptic';

describe('haptic', () => {
  const originalNavigator = global.navigator;

  beforeEach(() => {
    // Reset navigator mock before each test
    vi.restoreAllMocks();
  });

  afterEach(() => {
    // Restore original navigator
    Object.defineProperty(global, 'navigator', {
      value: originalNavigator,
      writable: true,
    });
  });

  describe('isHapticSupported', () => {
    it('returns true when vibrate is available', () => {
      Object.defineProperty(global, 'navigator', {
        value: { vibrate: vi.fn() },
        writable: true,
      });

      expect(isHapticSupported()).toBe(true);
    });

    it('returns false when vibrate is not available', () => {
      Object.defineProperty(global, 'navigator', {
        value: {},
        writable: true,
      });

      expect(isHapticSupported()).toBe(false);
    });
  });

  describe('hapticFeedback', () => {
    it('returns false when vibrate is not supported', () => {
      Object.defineProperty(global, 'navigator', {
        value: {},
        writable: true,
      });

      expect(hapticFeedback('light')).toBe(false);
    });

    it('calls vibrate with correct pattern for light', () => {
      const vibrateMock = vi.fn();
      Object.defineProperty(global, 'navigator', {
        value: { vibrate: vibrateMock },
        writable: true,
      });

      hapticFeedback('light');
      expect(vibrateMock).toHaveBeenCalledWith(10);
    });

    it('calls vibrate with correct pattern for medium', () => {
      const vibrateMock = vi.fn();
      Object.defineProperty(global, 'navigator', {
        value: { vibrate: vibrateMock },
        writable: true,
      });

      hapticFeedback('medium');
      expect(vibrateMock).toHaveBeenCalledWith(50);
    });

    it('calls vibrate with correct pattern for heavy', () => {
      const vibrateMock = vi.fn();
      Object.defineProperty(global, 'navigator', {
        value: { vibrate: vibrateMock },
        writable: true,
      });

      hapticFeedback('heavy');
      expect(vibrateMock).toHaveBeenCalledWith(100);
    });

    it('calls vibrate with correct pattern for success', () => {
      const vibrateMock = vi.fn();
      Object.defineProperty(global, 'navigator', {
        value: { vibrate: vibrateMock },
        writable: true,
      });

      hapticFeedback('success');
      expect(vibrateMock).toHaveBeenCalledWith(50);
    });

    it('calls vibrate with correct pattern for warning', () => {
      const vibrateMock = vi.fn();
      Object.defineProperty(global, 'navigator', {
        value: { vibrate: vibrateMock },
        writable: true,
      });

      hapticFeedback('warning');
      expect(vibrateMock).toHaveBeenCalledWith([50, 50]);
    });

    it('calls vibrate with correct pattern for error', () => {
      const vibrateMock = vi.fn();
      Object.defineProperty(global, 'navigator', {
        value: { vibrate: vibrateMock },
        writable: true,
      });

      hapticFeedback('error');
      expect(vibrateMock).toHaveBeenCalledWith([50, 50, 50]);
    });

    it('returns true on successful vibration', () => {
      Object.defineProperty(global, 'navigator', {
        value: { vibrate: vi.fn() },
        writable: true,
      });

      expect(hapticFeedback('light')).toBe(true);
    });

    it('returns false when vibrate throws', () => {
      Object.defineProperty(global, 'navigator', {
        value: {
          vibrate: () => {
            throw new Error('Vibration failed');
          },
        },
        writable: true,
      });

      expect(hapticFeedback('light')).toBe(false);
    });

    it('uses light pattern by default', () => {
      const vibrateMock = vi.fn();
      Object.defineProperty(global, 'navigator', {
        value: { vibrate: vibrateMock },
        writable: true,
      });

      hapticFeedback();
      expect(vibrateMock).toHaveBeenCalledWith(10);
    });
  });
});
