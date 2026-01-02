/**
 * Group Entries Tests - Story 5.3
 *
 * Tests for grouping time entries by date with subtotals.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { groupEntriesByDate, groupEntriesByWeek } from './group-entries';
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

/**
 * Story 5.4 - Group Entries by Week for Monthly View
 */
describe('groupEntriesByWeek', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2025, 0, 15, 10, 0, 0));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('basic week grouping', () => {
    it('groups entries by week number within month', () => {
      // January 2025 calendar (Mon-Sun weeks):
      // Week 1: 1-5 (Wed-Sun)
      // Week 2: 6-12 (Mon-Sun)
      // Week 3: 13-19 (Mon-Sun)
      // Week 4: 20-26 (Mon-Sun)
      // Week 5: 27-31 (Mon-Fri)

      const entries: TimeEntryWithDetails[] = [
        createMockEntry({ entry_date: '2025-01-02', duration_minutes: 60 }),  // Week 1
        createMockEntry({ entry_date: '2025-01-03', duration_minutes: 120 }), // Week 1
        createMockEntry({ entry_date: '2025-01-07', duration_minutes: 90 }),  // Week 2
        createMockEntry({ entry_date: '2025-01-15', duration_minutes: 180 }), // Week 3
        createMockEntry({ entry_date: '2025-01-28', duration_minutes: 60 }),  // Week 5
      ];

      const monthDate = new Date(2025, 0, 1); // January 2025
      const weekGroups = groupEntriesByWeek(entries, monthDate);

      // Should only return weeks with entries (4 weeks - Week 4 has no entries)
      expect(weekGroups).toHaveLength(4);

      // Week 1
      expect(weekGroups[0].weekNumber).toBe(1);
      expect(weekGroups[0].entries).toHaveLength(2);
      expect(weekGroups[0].totalHours).toBe(3); // 60 + 120 = 180 min = 3 hr

      // Week 2
      expect(weekGroups[1].weekNumber).toBe(2);
      expect(weekGroups[1].entries).toHaveLength(1);
      expect(weekGroups[1].totalHours).toBe(1.5); // 90 min = 1.5 hr

      // Week 3
      expect(weekGroups[2].weekNumber).toBe(3);
      expect(weekGroups[2].entries).toHaveLength(1);
      expect(weekGroups[2].totalHours).toBe(3); // 180 min = 3 hr

      // Week 5 (Week 4 skipped - no entries)
      expect(weekGroups[3].weekNumber).toBe(5);
      expect(weekGroups[3].entries).toHaveLength(1);
      expect(weekGroups[3].totalHours).toBe(1); // 60 min = 1 hr
    });

    it('returns empty array for no entries', () => {
      const monthDate = new Date(2025, 0, 1);
      const weekGroups = groupEntriesByWeek([], monthDate);
      expect(weekGroups).toHaveLength(0);
    });
  });

  describe('week label formatting', () => {
    it('formats week labels in English with date range', () => {
      const entries: TimeEntryWithDetails[] = [
        createMockEntry({ entry_date: '2025-01-15', duration_minutes: 60 }),
      ];

      const monthDate = new Date(2025, 0, 1);
      const weekGroups = groupEntriesByWeek(entries, monthDate);

      // Should contain "Week 3" and date range "13-19 Jan"
      expect(weekGroups[0].label).toContain('Week 3');
      expect(weekGroups[0].label).toContain('13-19 Jan');
    });
  });

  describe('entry sorting within weeks', () => {
    it('sorts entries within week by date descending, then created_at descending', () => {
      const entries: TimeEntryWithDetails[] = [
        createMockEntry({
          id: 'entry-1',
          entry_date: '2025-01-14',
          duration_minutes: 60,
          created_at: '2025-01-14T09:00:00Z',
        }),
        createMockEntry({
          id: 'entry-2',
          entry_date: '2025-01-15',
          duration_minutes: 60,
          created_at: '2025-01-15T10:00:00Z',
        }),
        createMockEntry({
          id: 'entry-3',
          entry_date: '2025-01-15',
          duration_minutes: 60,
          created_at: '2025-01-15T08:00:00Z',
        }),
      ];

      const monthDate = new Date(2025, 0, 1);
      const weekGroups = groupEntriesByWeek(entries, monthDate);

      // All entries in week 3
      expect(weekGroups).toHaveLength(1);
      const weekEntries = weekGroups[0].entries;

      // Order: Jan 15 (10:00) -> Jan 15 (08:00) -> Jan 14
      expect(weekEntries[0].id).toBe('entry-2'); // Jan 15, 10:00
      expect(weekEntries[1].id).toBe('entry-3'); // Jan 15, 08:00
      expect(weekEntries[2].id).toBe('entry-1'); // Jan 14
    });
  });

  describe('week boundaries', () => {
    it('calculates correct week boundaries for partial first week', () => {
      // January 2025 starts on Wednesday
      const entries: TimeEntryWithDetails[] = [
        createMockEntry({ entry_date: '2025-01-01', duration_minutes: 60 }), // Wed - Week 1
        createMockEntry({ entry_date: '2025-01-05', duration_minutes: 60 }), // Sun - Week 1
      ];

      const monthDate = new Date(2025, 0, 1);
      const weekGroups = groupEntriesByWeek(entries, monthDate);

      expect(weekGroups).toHaveLength(1);
      expect(weekGroups[0].weekNumber).toBe(1);
      expect(weekGroups[0].startDate).toBe('2025-01-01');
      expect(weekGroups[0].endDate).toBe('2025-01-05');
    });

    it('handles week boundary at Monday correctly', () => {
      const entries: TimeEntryWithDetails[] = [
        createMockEntry({ entry_date: '2025-01-05', duration_minutes: 60 }), // Sun - Week 1
        createMockEntry({ entry_date: '2025-01-06', duration_minutes: 60 }), // Mon - Week 2
      ];

      const monthDate = new Date(2025, 0, 1);
      const weekGroups = groupEntriesByWeek(entries, monthDate);

      expect(weekGroups).toHaveLength(2);
      expect(weekGroups[0].weekNumber).toBe(1);
      expect(weekGroups[0].entries[0].entry_date).toBe('2025-01-05');
      expect(weekGroups[1].weekNumber).toBe(2);
      expect(weekGroups[1].entries[0].entry_date).toBe('2025-01-06');
    });

    it('provides startDate and endDate for each week group', () => {
      const entries: TimeEntryWithDetails[] = [
        createMockEntry({ entry_date: '2025-01-15', duration_minutes: 60 }), // Week 3: 13-19
      ];

      const monthDate = new Date(2025, 0, 1);
      const weekGroups = groupEntriesByWeek(entries, monthDate);

      expect(weekGroups[0].startDate).toBe('2025-01-13');
      expect(weekGroups[0].endDate).toBe('2025-01-19');
    });

    it('handles partial last week of month', () => {
      const entries: TimeEntryWithDetails[] = [
        createMockEntry({ entry_date: '2025-01-31', duration_minutes: 60 }), // Week 5 - Fri
      ];

      const monthDate = new Date(2025, 0, 1);
      const weekGroups = groupEntriesByWeek(entries, monthDate);

      expect(weekGroups).toHaveLength(1);
      expect(weekGroups[0].weekNumber).toBe(5);
      expect(weekGroups[0].startDate).toBe('2025-01-27');
      expect(weekGroups[0].endDate).toBe('2025-01-31'); // End of month, not Sunday
    });
  });

  describe('all weeks coverage', () => {
    it('handles months with entries spanning all weeks', () => {
      const entries: TimeEntryWithDetails[] = [
        createMockEntry({ entry_date: '2025-01-01', duration_minutes: 60 }), // Week 1
        createMockEntry({ entry_date: '2025-01-06', duration_minutes: 60 }), // Week 2
        createMockEntry({ entry_date: '2025-01-13', duration_minutes: 60 }), // Week 3
        createMockEntry({ entry_date: '2025-01-20', duration_minutes: 60 }), // Week 4
        createMockEntry({ entry_date: '2025-01-27', duration_minutes: 60 }), // Week 5
      ];

      const monthDate = new Date(2025, 0, 1);
      const weekGroups = groupEntriesByWeek(entries, monthDate);

      expect(weekGroups).toHaveLength(5);
      weekGroups.forEach((week, index) => {
        expect(week.weekNumber).toBe(index + 1);
        expect(week.entries).toHaveLength(1);
      });
    });
  });

  describe('different month patterns', () => {
    it('handles February with 4 weeks', () => {
      // February 2025: Sat Feb 1 to Fri Feb 28
      const entries: TimeEntryWithDetails[] = [
        createMockEntry({ entry_date: '2025-02-01', duration_minutes: 60 }), // Sat - Week 1
        createMockEntry({ entry_date: '2025-02-10', duration_minutes: 60 }), // Mon - Week 2
        createMockEntry({ entry_date: '2025-02-28', duration_minutes: 60 }), // Fri - Last week
      ];

      const monthDate = new Date(2025, 1, 1);
      const weekGroups = groupEntriesByWeek(entries, monthDate);

      expect(weekGroups.length).toBeGreaterThanOrEqual(3);
      expect(weekGroups[0].weekNumber).toBe(1);
    });
  });
});
