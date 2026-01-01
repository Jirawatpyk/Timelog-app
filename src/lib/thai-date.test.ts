import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  toBuddhistYear,
  formatThaiDate,
  isFutureDate,
  getTodayISO,
  parseISODate,
  MONTHS_SHORT,
  MONTHS_FULL,
  WEEKDAYS_SHORT,
  THAI_MONTHS_SHORT,
  THAI_MONTHS_FULL,
  THAI_WEEKDAYS_SHORT,
} from './thai-date';

describe('Date Utilities', () => {
  describe('toBuddhistYear (legacy)', () => {
    it('converts 2024 to 2567', () => {
      expect(toBuddhistYear(2024)).toBe(2567);
    });

    it('converts 2025 to 2568', () => {
      expect(toBuddhistYear(2025)).toBe(2568);
    });

    it('converts 2000 to 2543', () => {
      expect(toBuddhistYear(2000)).toBe(2543);
    });
  });

  describe('MONTHS_SHORT', () => {
    it('has 12 months', () => {
      expect(MONTHS_SHORT).toHaveLength(12);
    });

    it('has correct first month (January)', () => {
      expect(MONTHS_SHORT[0]).toBe('Jan');
    });

    it('has correct last month (December)', () => {
      expect(MONTHS_SHORT[11]).toBe('Dec');
    });
  });

  describe('MONTHS_FULL', () => {
    it('has 12 months', () => {
      expect(MONTHS_FULL).toHaveLength(12);
    });

    it('has correct first month (January)', () => {
      expect(MONTHS_FULL[0]).toBe('January');
    });

    it('has correct last month (December)', () => {
      expect(MONTHS_FULL[11]).toBe('December');
    });
  });

  describe('WEEKDAYS_SHORT', () => {
    it('has 7 days', () => {
      expect(WEEKDAYS_SHORT).toHaveLength(7);
    });

    it('starts with Sunday', () => {
      expect(WEEKDAYS_SHORT[0]).toBe('Sun');
    });

    it('ends with Saturday', () => {
      expect(WEEKDAYS_SHORT[6]).toBe('Sat');
    });
  });

  describe('Legacy exports (THAI_* aliases)', () => {
    it('THAI_MONTHS_SHORT equals MONTHS_SHORT', () => {
      expect(THAI_MONTHS_SHORT).toBe(MONTHS_SHORT);
    });

    it('THAI_MONTHS_FULL equals MONTHS_FULL', () => {
      expect(THAI_MONTHS_FULL).toBe(MONTHS_FULL);
    });

    it('THAI_WEEKDAYS_SHORT equals WEEKDAYS_SHORT', () => {
      expect(THAI_WEEKDAYS_SHORT).toBe(WEEKDAYS_SHORT);
    });
  });

  describe('formatThaiDate', () => {
    it('formats date in short format (default)', () => {
      const date = new Date(2024, 11, 31); // December 31, 2024
      expect(formatThaiDate(date)).toBe('Dec 31, 2024');
    });

    it('formats date in short format explicitly', () => {
      const date = new Date(2024, 11, 31);
      expect(formatThaiDate(date, 'short')).toBe('Dec 31, 2024');
    });

    it('formats date in long format', () => {
      const date = new Date(2024, 11, 31);
      expect(formatThaiDate(date, 'long')).toBe('December 31, 2024');
    });

    it('formats date in full format with weekday', () => {
      const date = new Date(2024, 11, 31); // Tuesday
      expect(formatThaiDate(date, 'full')).toBe('Tue, Dec 31, 2024');
    });

    it('handles ISO string input', () => {
      expect(formatThaiDate('2024-12-31')).toBe('Dec 31, 2024');
    });

    it('handles January correctly', () => {
      const date = new Date(2025, 0, 1); // January 1, 2025
      expect(formatThaiDate(date)).toBe('Jan 1, 2025');
    });

    it('handles single digit days', () => {
      const date = new Date(2024, 0, 5); // January 5, 2024
      expect(formatThaiDate(date)).toBe('Jan 5, 2024');
    });
  });

  describe('isFutureDate', () => {
    beforeEach(() => {
      // Mock today as 2024-12-31
      vi.useFakeTimers();
      vi.setSystemTime(new Date(2024, 11, 31, 12, 0, 0));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('returns false for today', () => {
      expect(isFutureDate('2024-12-31')).toBe(false);
    });

    it('returns false for yesterday', () => {
      expect(isFutureDate('2024-12-30')).toBe(false);
    });

    it('returns false for tomorrow (within 1 day)', () => {
      expect(isFutureDate('2025-01-01', 1)).toBe(false);
    });

    it('returns true for 2 days in future (default daysAhead=1)', () => {
      expect(isFutureDate('2025-01-02', 1)).toBe(true);
    });

    it('returns true for 3 days in future', () => {
      expect(isFutureDate('2025-01-03')).toBe(true);
    });

    it('accepts Date object input', () => {
      const futureDate = new Date(2025, 0, 5);
      expect(isFutureDate(futureDate)).toBe(true);
    });

    it('respects custom daysAhead parameter', () => {
      // 2 days ahead is NOT future when daysAhead=2
      expect(isFutureDate('2025-01-02', 2)).toBe(false);
      // 3 days ahead IS future when daysAhead=2
      expect(isFutureDate('2025-01-03', 2)).toBe(true);
    });
  });

  describe('getTodayISO', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(2024, 11, 31, 15, 30, 45));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('returns today in YYYY-MM-DD format', () => {
      expect(getTodayISO()).toBe('2024-12-31');
    });

    it('returns string of length 10', () => {
      expect(getTodayISO()).toHaveLength(10);
    });

    it('matches ISO date pattern', () => {
      expect(getTodayISO()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('parseISODate', () => {
    it('parses ISO date string correctly', () => {
      const date = parseISODate('2024-12-31');
      expect(date.getFullYear()).toBe(2024);
      expect(date.getMonth()).toBe(11); // December = 11
      expect(date.getDate()).toBe(31);
    });

    it('handles January correctly', () => {
      const date = parseISODate('2025-01-01');
      expect(date.getFullYear()).toBe(2025);
      expect(date.getMonth()).toBe(0); // January = 0
      expect(date.getDate()).toBe(1);
    });

    it('returns a Date object', () => {
      const date = parseISODate('2024-06-15');
      expect(date).toBeInstanceOf(Date);
    });

    it('creates local date (not UTC)', () => {
      const date = parseISODate('2024-12-31');
      // Hour should be 0 for local date
      expect(date.getHours()).toBe(0);
    });
  });
});
