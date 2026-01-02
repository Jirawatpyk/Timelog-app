import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { canEditEntry, getDaysUntilLocked, EDIT_WINDOW_DAYS_CONST } from './entry-rules';

describe('entry-rules', () => {
  beforeEach(() => {
    // Mock current date to 2026-01-02 for consistent testing
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-02T12:00:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('canEditEntry', () => {
    it('returns true for entry from today', () => {
      expect(canEditEntry('2026-01-02')).toBe(true);
    });

    it('returns true for entry from yesterday', () => {
      expect(canEditEntry('2026-01-01')).toBe(true);
    });

    it('returns true for entry from 6 days ago', () => {
      expect(canEditEntry('2025-12-27')).toBe(true);
    });

    it('returns true for entry from exactly 7 days ago', () => {
      expect(canEditEntry('2025-12-26')).toBe(true);
    });

    it('returns false for entry from 8 days ago', () => {
      expect(canEditEntry('2025-12-25')).toBe(false);
    });

    it('returns false for entry from 30 days ago', () => {
      expect(canEditEntry('2025-12-03')).toBe(false);
    });
  });

  describe('getDaysUntilLocked', () => {
    it('returns 8 for entry from today', () => {
      // Entry from today: 8 days total (today + 7 more)
      expect(getDaysUntilLocked('2026-01-02')).toBe(8);
    });

    it('returns 2 for entry from 6 days ago', () => {
      // Entry from 6 days ago: 2 days remaining
      expect(getDaysUntilLocked('2025-12-27')).toBe(2);
    });

    it('returns 1 for entry from 7 days ago', () => {
      // Entry from 7 days ago: last day to edit
      expect(getDaysUntilLocked('2025-12-26')).toBe(1);
    });

    it('returns 0 for entry from 8 days ago', () => {
      // Entry from 8 days ago: already locked
      expect(getDaysUntilLocked('2025-12-25')).toBe(0);
    });

    it('returns 0 for entry from 30 days ago', () => {
      expect(getDaysUntilLocked('2025-12-03')).toBe(0);
    });
  });

  describe('EDIT_WINDOW_DAYS_CONST', () => {
    it('equals 7', () => {
      expect(EDIT_WINDOW_DAYS_CONST).toBe(7);
    });
  });
});
