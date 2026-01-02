/**
 * Group Entries Tests - Story 5.3
 *
 * Tests for grouping time entries by date with subtotals.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { groupEntriesByDate } from './group-entries';
import type { TimeEntryWithDetails } from '@/types/domain';

// Helper to create mock entries
function createMockEntry(
  overrides: Partial<TimeEntryWithDetails> & { entry_date: string; duration_minutes: number }
): TimeEntryWithDetails {
  const { entry_date, duration_minutes, created_at, ...rest } = overrides;
  return {
    id: crypto.randomUUID(),
    user_id: 'user-1',
    job_id: 'job-1',
    service_id: 'service-1',
    task_id: null,
    entry_date,
    duration_minutes,
    notes: null,
    department_id: 'dept-1',
    created_at: created_at ?? new Date().toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null,
    job: {
      id: 'job-1',
      name: 'Test Job',
      job_no: 'J001',
      project: {
        id: 'project-1',
        name: 'Test Project',
        client: {
          id: 'client-1',
          name: 'Test Client',
        },
      },
    },
    service: {
      id: 'service-1',
      name: 'Development',
    },
    task: null,
    ...rest,
  };
}

describe('groupEntriesByDate', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Set to Wed Jan 15, 2025
    vi.setSystemTime(new Date(2025, 0, 15, 10, 0, 0));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('basic grouping', () => {
    it('groups entries by entry_date', () => {
      const entries: TimeEntryWithDetails[] = [
        createMockEntry({ entry_date: '2025-01-15', duration_minutes: 60 }),
        createMockEntry({ entry_date: '2025-01-15', duration_minutes: 120 }),
        createMockEntry({ entry_date: '2025-01-14', duration_minutes: 90 }),
      ];

      const groups = groupEntriesByDate(entries, 'week', false);

      // Should have 2 groups (Jan 14 and Jan 15)
      expect(groups).toHaveLength(2);
      // Groups sorted newest first
      expect(groups[0].date).toBe('2025-01-15');
      expect(groups[0].entries).toHaveLength(2);
      expect(groups[1].date).toBe('2025-01-14');
      expect(groups[1].entries).toHaveLength(1);
    });

    it('sorts groups by date (newest first)', () => {
      const entries: TimeEntryWithDetails[] = [
        createMockEntry({ entry_date: '2025-01-13', duration_minutes: 60 }),
        createMockEntry({ entry_date: '2025-01-15', duration_minutes: 60 }),
        createMockEntry({ entry_date: '2025-01-14', duration_minutes: 60 }),
      ];

      const groups = groupEntriesByDate(entries, 'week', false);

      expect(groups[0].date).toBe('2025-01-15');
      expect(groups[1].date).toBe('2025-01-14');
      expect(groups[2].date).toBe('2025-01-13');
    });

    it('sorts entries within each day by created_at (newest first)', () => {
      const entries: TimeEntryWithDetails[] = [
        createMockEntry({
          id: 'entry-1',
          entry_date: '2025-01-15',
          duration_minutes: 60,
          created_at: '2025-01-15T08:00:00Z',
        }),
        createMockEntry({
          id: 'entry-2',
          entry_date: '2025-01-15',
          duration_minutes: 120,
          created_at: '2025-01-15T12:00:00Z',
        }),
        createMockEntry({
          id: 'entry-3',
          entry_date: '2025-01-15',
          duration_minutes: 90,
          created_at: '2025-01-15T10:00:00Z',
        }),
      ];

      const groups = groupEntriesByDate(entries, 'week', false);

      // Entries sorted by created_at descending (newest first)
      expect(groups[0].entries[0].id).toBe('entry-2'); // 12:00
      expect(groups[0].entries[1].id).toBe('entry-3'); // 10:00
      expect(groups[0].entries[2].id).toBe('entry-1'); // 08:00
    });

    it('returns empty array for no entries', () => {
      const groups = groupEntriesByDate([], 'week', false);
      expect(groups).toHaveLength(0);
    });
  });

  describe('daily subtotals', () => {
    it('calculates totalHours for each day', () => {
      const entries: TimeEntryWithDetails[] = [
        createMockEntry({ entry_date: '2025-01-15', duration_minutes: 60 }),  // 1 hr
        createMockEntry({ entry_date: '2025-01-15', duration_minutes: 90 }),  // 1.5 hr
        createMockEntry({ entry_date: '2025-01-14', duration_minutes: 120 }), // 2 hr
      ];

      const groups = groupEntriesByDate(entries, 'week', false);

      expect(groups[0].totalHours).toBe(2.5);  // Jan 15: 60 + 90 = 150 min = 2.5 hr
      expect(groups[1].totalHours).toBe(2);    // Jan 14: 120 min = 2 hr
    });

    it('handles single entry days', () => {
      const entries: TimeEntryWithDetails[] = [
        createMockEntry({ entry_date: '2025-01-15', duration_minutes: 30 }),
      ];

      const groups = groupEntriesByDate(entries, 'week', false);

      expect(groups[0].totalHours).toBe(0.5);
    });
  });

  describe('empty days handling', () => {
    it('includes empty days when includeEmptyDays is true for week', () => {
      const entries: TimeEntryWithDetails[] = [
        createMockEntry({ entry_date: '2025-01-15', duration_minutes: 60 }),
      ];

      const groups = groupEntriesByDate(entries, 'week', true);

      // Week of Jan 13-19 should have 7 days
      expect(groups).toHaveLength(7);

      // Days without entries should have empty arrays and 0 hours
      const jan14Group = groups.find(g => g.date === '2025-01-14');
      expect(jan14Group).toBeDefined();
      expect(jan14Group?.entries).toHaveLength(0);
      expect(jan14Group?.totalHours).toBe(0);
    });

    it('excludes empty days when includeEmptyDays is false', () => {
      const entries: TimeEntryWithDetails[] = [
        createMockEntry({ entry_date: '2025-01-15', duration_minutes: 60 }),
        createMockEntry({ entry_date: '2025-01-13', duration_minutes: 60 }),
      ];

      const groups = groupEntriesByDate(entries, 'week', false);

      // Only 2 groups for the 2 days with entries
      expect(groups).toHaveLength(2);
    });

    it('does not include empty days for today period', () => {
      const entries: TimeEntryWithDetails[] = [
        createMockEntry({ entry_date: '2025-01-15', duration_minutes: 60 }),
      ];

      // Even with includeEmptyDays=true, today should only show today
      const groups = groupEntriesByDate(entries, 'today', true);

      expect(groups).toHaveLength(1);
    });
  });

  describe('cross-year boundary (AC7)', () => {
    it('handles week spanning year boundary correctly', () => {
      // Set time to Wed Dec 31, 2025
      vi.setSystemTime(new Date(2025, 11, 31, 10, 0, 0));

      const entries: TimeEntryWithDetails[] = [
        createMockEntry({ entry_date: '2025-12-29', duration_minutes: 60 }), // Mon
        createMockEntry({ entry_date: '2026-01-02', duration_minutes: 90 }), // Fri
      ];

      const groups = groupEntriesByDate(entries, 'week', true);

      // Week should span Dec 29 2025 to Jan 4 2026
      expect(groups).toHaveLength(7);
      expect(groups.some(g => g.date === '2025-12-29')).toBe(true);
      expect(groups.some(g => g.date === '2026-01-04')).toBe(true);
    });
  });
});
