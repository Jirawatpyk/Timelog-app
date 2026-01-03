// src/lib/utils/time-indicator.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getTimeOfDayIndicator, isAfter5PM } from './time-indicator';

describe('time-indicator', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('getTimeOfDayIndicator', () => {
    it('returns neutral before noon', () => {
      vi.setSystemTime(new Date('2025-01-01T09:00:00'));
      expect(getTimeOfDayIndicator()).toBe('neutral');
    });

    it('returns neutral at noon', () => {
      vi.setSystemTime(new Date('2025-01-01T12:00:00'));
      expect(getTimeOfDayIndicator()).toBe('neutral');
    });

    it('returns neutral between noon and 5 PM', () => {
      vi.setSystemTime(new Date('2025-01-01T14:00:00'));
      expect(getTimeOfDayIndicator()).toBe('neutral');
    });

    it('returns neutral at 4:59 PM', () => {
      vi.setSystemTime(new Date('2025-01-01T16:59:00'));
      expect(getTimeOfDayIndicator()).toBe('neutral');
    });

    it('returns warning at exactly 5 PM', () => {
      vi.setSystemTime(new Date('2025-01-01T17:00:00'));
      expect(getTimeOfDayIndicator()).toBe('warning');
    });

    it('returns warning after 5 PM', () => {
      vi.setSystemTime(new Date('2025-01-01T17:30:00'));
      expect(getTimeOfDayIndicator()).toBe('warning');
    });

    it('returns warning at 11 PM', () => {
      vi.setSystemTime(new Date('2025-01-01T23:00:00'));
      expect(getTimeOfDayIndicator()).toBe('warning');
    });
  });

  describe('isAfter5PM', () => {
    it('returns false before 5 PM', () => {
      vi.setSystemTime(new Date('2025-01-01T16:59:00'));
      expect(isAfter5PM()).toBe(false);
    });

    it('returns true at exactly 5 PM', () => {
      vi.setSystemTime(new Date('2025-01-01T17:00:00'));
      expect(isAfter5PM()).toBe(true);
    });

    it('returns true after 5 PM', () => {
      vi.setSystemTime(new Date('2025-01-01T18:30:00'));
      expect(isAfter5PM()).toBe(true);
    });
  });

  // isBeforeNoon() was removed - not used in implementation
  // AC4 treats "before noon" and "noon to 5 PM" identically
});
