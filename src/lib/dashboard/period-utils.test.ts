import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  isValidPeriod,
  getPeriodFromSearchParams,
  getDateRangeForPeriod,
  formatPeriodLabel,
} from './period-utils';

describe('period-utils', () => {
  describe('isValidPeriod', () => {
    it('returns true for valid periods', () => {
      expect(isValidPeriod('today')).toBe(true);
      expect(isValidPeriod('week')).toBe(true);
      expect(isValidPeriod('month')).toBe(true);
    });

    it('returns false for invalid periods', () => {
      expect(isValidPeriod('invalid')).toBe(false);
      expect(isValidPeriod('yesterday')).toBe(false);
      expect(isValidPeriod('')).toBe(false);
      expect(isValidPeriod(undefined)).toBe(false);
    });
  });

  describe('getPeriodFromSearchParams', () => {
    it('returns valid period if provided', () => {
      expect(getPeriodFromSearchParams('today')).toBe('today');
      expect(getPeriodFromSearchParams('week')).toBe('week');
      expect(getPeriodFromSearchParams('month')).toBe('month');
    });

    it('returns today as default for invalid period', () => {
      expect(getPeriodFromSearchParams('invalid')).toBe('today');
      expect(getPeriodFromSearchParams(undefined)).toBe('today');
      expect(getPeriodFromSearchParams('')).toBe('today');
    });
  });

  describe('getDateRangeForPeriod', () => {
    // Use a fixed date for consistent testing
    beforeEach(() => {
      // Mock Date to be Wednesday, January 15, 2025 at 10:30:00
      vi.useFakeTimers();
      vi.setSystemTime(new Date(2025, 0, 15, 10, 30, 0));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    describe('today period', () => {
      it('returns start of today to end of today', () => {
        const range = getDateRangeForPeriod('today');

        // Start should be January 15, 2025 00:00:00.000
        expect(range.start.getFullYear()).toBe(2025);
        expect(range.start.getMonth()).toBe(0); // January
        expect(range.start.getDate()).toBe(15);
        expect(range.start.getHours()).toBe(0);
        expect(range.start.getMinutes()).toBe(0);
        expect(range.start.getSeconds()).toBe(0);
        expect(range.start.getMilliseconds()).toBe(0);

        // End should be January 15, 2025 23:59:59.999
        expect(range.end.getFullYear()).toBe(2025);
        expect(range.end.getMonth()).toBe(0);
        expect(range.end.getDate()).toBe(15);
        expect(range.end.getHours()).toBe(23);
        expect(range.end.getMinutes()).toBe(59);
        expect(range.end.getSeconds()).toBe(59);
        expect(range.end.getMilliseconds()).toBe(999);
      });
    });

    describe('week period', () => {
      it('returns Monday to Sunday of current week (ISO week)', () => {
        // Jan 15, 2025 is a Wednesday
        // Monday of that week is Jan 13
        // Sunday of that week is Jan 19
        const range = getDateRangeForPeriod('week');

        // Start should be Monday, January 13, 2025 00:00:00.000
        expect(range.start.getFullYear()).toBe(2025);
        expect(range.start.getMonth()).toBe(0);
        expect(range.start.getDate()).toBe(13);
        expect(range.start.getDay()).toBe(1); // Monday
        expect(range.start.getHours()).toBe(0);
        expect(range.start.getMinutes()).toBe(0);

        // End should be Sunday, January 19, 2025 23:59:59.999
        expect(range.end.getFullYear()).toBe(2025);
        expect(range.end.getMonth()).toBe(0);
        expect(range.end.getDate()).toBe(19);
        expect(range.end.getDay()).toBe(0); // Sunday
        expect(range.end.getHours()).toBe(23);
        expect(range.end.getMinutes()).toBe(59);
        expect(range.end.getSeconds()).toBe(59);
        expect(range.end.getMilliseconds()).toBe(999);
      });

      it('handles Sunday correctly (goes to previous Monday)', () => {
        // Set date to Sunday, January 19, 2025
        vi.setSystemTime(new Date(2025, 0, 19, 10, 30, 0));

        const range = getDateRangeForPeriod('week');

        // Start should be Monday, January 13, 2025
        expect(range.start.getDate()).toBe(13);
        expect(range.start.getDay()).toBe(1); // Monday

        // End should be Sunday, January 19, 2025
        expect(range.end.getDate()).toBe(19);
        expect(range.end.getDay()).toBe(0); // Sunday
      });

      it('handles Monday correctly', () => {
        // Set date to Monday, January 13, 2025
        vi.setSystemTime(new Date(2025, 0, 13, 10, 30, 0));

        const range = getDateRangeForPeriod('week');

        // Start should be Monday, January 13, 2025
        expect(range.start.getDate()).toBe(13);
        expect(range.start.getDay()).toBe(1); // Monday
      });
    });

    describe('month period', () => {
      it('returns first day to last day of current month', () => {
        // January 2025 has 31 days
        const range = getDateRangeForPeriod('month');

        // Start should be January 1, 2025 00:00:00.000
        expect(range.start.getFullYear()).toBe(2025);
        expect(range.start.getMonth()).toBe(0);
        expect(range.start.getDate()).toBe(1);
        expect(range.start.getHours()).toBe(0);

        // End should be January 31, 2025 23:59:59.999
        expect(range.end.getFullYear()).toBe(2025);
        expect(range.end.getMonth()).toBe(0);
        expect(range.end.getDate()).toBe(31);
        expect(range.end.getHours()).toBe(23);
        expect(range.end.getMinutes()).toBe(59);
        expect(range.end.getSeconds()).toBe(59);
        expect(range.end.getMilliseconds()).toBe(999);
      });

      it('handles February correctly (28 days in non-leap year)', () => {
        // Set date to February 2025 (non-leap year)
        vi.setSystemTime(new Date(2025, 1, 15, 10, 30, 0));

        const range = getDateRangeForPeriod('month');

        // February 2025 has 28 days
        expect(range.start.getDate()).toBe(1);
        expect(range.end.getDate()).toBe(28);
        expect(range.end.getMonth()).toBe(1); // February
      });

      it('handles leap year February correctly', () => {
        // Set date to February 2024 (leap year)
        vi.setSystemTime(new Date(2024, 1, 15, 10, 30, 0));

        const range = getDateRangeForPeriod('month');

        // February 2024 has 29 days
        expect(range.end.getDate()).toBe(29);
      });
    });
  });

  describe('formatPeriodLabel', () => {
    it('returns English labels for each period', () => {
      expect(formatPeriodLabel('today')).toBe('Today');
      expect(formatPeriodLabel('week')).toBe('This Week');
      expect(formatPeriodLabel('month')).toBe('This Month');
    });
  });
});
