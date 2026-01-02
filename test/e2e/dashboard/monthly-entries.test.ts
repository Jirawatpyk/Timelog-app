/**
 * Monthly Entries E2E Tests
 * Story 5.4: Monthly Entries View
 *
 * Tests:
 * - AC1: Entries displayed from 1st to last day of month
 * - AC2: Entries grouped by week with week headers
 * - AC3: Performance acceptable with 100+ entries
 * - AC6: Empty days NOT shown
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import {
  createServiceClient,
  createAuthUser,
  deleteAuthUser,
  createUserClient,
} from '../../helpers/supabase-test';
import { testUsers, testDepartments } from '../../helpers/test-users';
import { groupEntriesByWeek } from '@/lib/dashboard/group-entries';
import type { TimeEntryWithDetails } from '@/types/domain';

// Test data for monthly entries
const testData = {
  client: {
    id: 'e1111111-1111-4111-e111-111111111111',
    name: 'Monthly Test Client',
    active: true,
  },
  project: {
    id: 'e2222222-2222-4222-e222-222222222222',
    name: 'Monthly Test Project',
    active: true,
  },
  job: {
    id: 'e3333333-3333-4333-e333-333333333333',
    name: 'Monthly Test Job',
    job_no: 'MTH-001',
    active: true,
  },
  service: {
    id: 'e4444444-4444-4444-e444-444444444444',
    name: 'Monthly Test Service',
    active: true,
  },
};

// Helper to create test entries for a month
function generateMonthlyEntries(
  userId: string,
  year: number,
  month: number,
  count: number
): Array<{
  id: string;
  user_id: string;
  job_id: string;
  service_id: string;
  department_id: string;
  entry_date: string;
  duration_minutes: number;
  notes: string | null;
}> {
  const entries: Array<{
    id: string;
    user_id: string;
    job_id: string;
    service_id: string;
    department_id: string;
    entry_date: string;
    duration_minutes: number;
    notes: string | null;
  }> = [];

  const lastDay = new Date(year, month + 1, 0).getDate();

  for (let i = 0; i < count; i++) {
    const day = (i % lastDay) + 1;
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    entries.push({
      id: `e5555555-5555-4555-e555-${String(i).padStart(12, '0')}`,
      user_id: userId,
      job_id: testData.job.id,
      service_id: testData.service.id,
      department_id: testDepartments.deptA.id,
      entry_date: dateStr,
      duration_minutes: 60 + (i % 8) * 15, // 60-165 minutes
      notes: `Monthly test entry ${i + 1}`,
    });
  }

  return entries;
}

describe('Monthly Entries View (Story 5.4)', () => {
  const serviceClient = createServiceClient();
  const testEntries: ReturnType<typeof generateMonthlyEntries> = [];
  let createdEntryIds: string[] = [];

  beforeAll(async () => {
    // Create departments
    await serviceClient.from('departments').upsert(
      [{ id: testDepartments.deptA.id, name: testDepartments.deptA.name, active: true }],
      { onConflict: 'id' }
    );

    // Create auth user
    await createAuthUser(testUsers.staff.id, testUsers.staff.email);

    // Create user in public.users
    await serviceClient.from('users').upsert(
      [
        {
          id: testUsers.staff.id,
          email: testUsers.staff.email,
          role: testUsers.staff.role,
          department_id: testUsers.staff.departmentId,
          display_name: testUsers.staff.displayName,
          active: true,
        },
      ],
      { onConflict: 'id' }
    );

    // Create test client, project, job, service
    await serviceClient.from('clients').upsert(
      [testData.client],
      { onConflict: 'id' }
    );

    await serviceClient.from('projects').upsert(
      [{ ...testData.project, client_id: testData.client.id }],
      { onConflict: 'id' }
    );

    await serviceClient.from('jobs').upsert(
      [{ ...testData.job, project_id: testData.project.id }],
      { onConflict: 'id' }
    );

    await serviceClient.from('services').upsert(
      [testData.service],
      { onConflict: 'id' }
    );
  });

  afterAll(async () => {
    // Clean up test entries
    if (createdEntryIds.length > 0) {
      await serviceClient
        .from('time_entries')
        .delete()
        .in('id', createdEntryIds);
    }

    // Clean up test data
    await serviceClient.from('jobs').delete().eq('id', testData.job.id);
    await serviceClient.from('projects').delete().eq('id', testData.project.id);
    await serviceClient.from('clients').delete().eq('id', testData.client.id);
    await serviceClient.from('services').delete().eq('id', testData.service.id);

    // Clean up auth user
    await deleteAuthUser(testUsers.staff.id);
  });

  describe('AC1: Monthly date range', () => {
    it('filters entries within month boundaries', async () => {
      // Create entries for January 2025
      const entries = generateMonthlyEntries(testUsers.staff.id, 2025, 0, 10);
      createdEntryIds.push(...entries.map((e) => e.id));

      // Insert entries
      const { error } = await serviceClient.from('time_entries').upsert(entries, { onConflict: 'id' });
      expect(error).toBeNull();

      // Query entries for January 2025
      const { data: monthEntries } = await serviceClient
        .from('time_entries')
        .select('*')
        .eq('user_id', testUsers.staff.id)
        .gte('entry_date', '2025-01-01')
        .lte('entry_date', '2025-01-31')
        .is('deleted_at', null);

      expect(monthEntries).toBeDefined();
      expect(monthEntries!.length).toBeGreaterThanOrEqual(10);

      // All entries should be within January
      monthEntries!.forEach((entry) => {
        expect(entry.entry_date).toMatch(/^2025-01-/);
      });
    });
  });

  describe('AC2: Week grouping', () => {
    it('groups entries by week correctly', () => {
      // Create mock entries for testing week grouping
      const mockEntries: TimeEntryWithDetails[] = [
        createMockEntry('1', '2025-01-02', 60), // Week 1
        createMockEntry('2', '2025-01-05', 120), // Week 1
        createMockEntry('3', '2025-01-07', 90), // Week 2
        createMockEntry('4', '2025-01-15', 180), // Week 3
        createMockEntry('5', '2025-01-28', 60), // Week 5
      ];

      const monthDate = new Date(2025, 0, 1);
      const weekGroups = groupEntriesByWeek(mockEntries, monthDate);

      // Should have 4 weeks (Week 4 is empty)
      expect(weekGroups).toHaveLength(4);

      // Check week numbers
      expect(weekGroups[0].weekNumber).toBe(1);
      expect(weekGroups[1].weekNumber).toBe(2);
      expect(weekGroups[2].weekNumber).toBe(3);
      expect(weekGroups[3].weekNumber).toBe(5);

      // Check entry counts
      expect(weekGroups[0].entries).toHaveLength(2); // Week 1
      expect(weekGroups[1].entries).toHaveLength(1); // Week 2
      expect(weekGroups[2].entries).toHaveLength(1); // Week 3
      expect(weekGroups[3].entries).toHaveLength(1); // Week 5
    });

    it('calculates week subtotals correctly', () => {
      const mockEntries: TimeEntryWithDetails[] = [
        createMockEntry('1', '2025-01-15', 60), // 1 hour
        createMockEntry('2', '2025-01-16', 120), // 2 hours
        createMockEntry('3', '2025-01-17', 180), // 3 hours
      ];

      const monthDate = new Date(2025, 0, 1);
      const weekGroups = groupEntriesByWeek(mockEntries, monthDate);

      expect(weekGroups).toHaveLength(1);
      expect(weekGroups[0].totalHours).toBe(6); // 1 + 2 + 3 = 6 hours
    });

    it('formats week labels in English', () => {
      const mockEntries: TimeEntryWithDetails[] = [
        createMockEntry('1', '2025-01-15', 60),
      ];

      const monthDate = new Date(2025, 0, 1);
      const weekGroups = groupEntriesByWeek(mockEntries, monthDate);

      expect(weekGroups[0].label).toContain('Week 3');
      expect(weekGroups[0].label).toContain('13-19 Jan');
    });
  });

  describe('AC3: Performance with 100+ entries', () => {
    it('handles 100 entries without significant delay', () => {
      const mockEntries: TimeEntryWithDetails[] = [];

      // Generate 100 entries spread across January
      for (let i = 0; i < 100; i++) {
        const day = (i % 31) + 1;
        const dateStr = `2025-01-${String(day).padStart(2, '0')}`;
        mockEntries.push(createMockEntry(`perf-${i}`, dateStr, 60 + (i % 8) * 15));
      }

      const monthDate = new Date(2025, 0, 1);

      // Measure performance
      const startTime = performance.now();
      const weekGroups = groupEntriesByWeek(mockEntries, monthDate);
      const endTime = performance.now();

      const duration = endTime - startTime;

      // Should complete in less than 50ms for 100 entries
      expect(duration).toBeLessThan(50);

      // Should still produce valid results
      expect(weekGroups.length).toBeGreaterThan(0);
      expect(weekGroups.length).toBeLessThanOrEqual(5); // Max 5 weeks in a month
    });

    it('handles 200 entries without significant delay', () => {
      const mockEntries: TimeEntryWithDetails[] = [];

      // Generate 200 entries
      for (let i = 0; i < 200; i++) {
        const day = (i % 31) + 1;
        const dateStr = `2025-01-${String(day).padStart(2, '0')}`;
        mockEntries.push(createMockEntry(`perf-lg-${i}`, dateStr, 60));
      }

      const monthDate = new Date(2025, 0, 1);

      const startTime = performance.now();
      const weekGroups = groupEntriesByWeek(mockEntries, monthDate);
      const endTime = performance.now();

      const duration = endTime - startTime;

      // Should complete in less than 100ms for 200 entries
      expect(duration).toBeLessThan(100);

      // Verify grouping still works
      const totalEntries = weekGroups.reduce((sum, w) => sum + w.entries.length, 0);
      expect(totalEntries).toBe(200);
    });
  });

  describe('AC6: Empty days handling', () => {
    it('excludes weeks with no entries', () => {
      const mockEntries: TimeEntryWithDetails[] = [
        createMockEntry('1', '2025-01-02', 60), // Week 1 only
      ];

      const monthDate = new Date(2025, 0, 1);
      const weekGroups = groupEntriesByWeek(mockEntries, monthDate);

      // Should only return Week 1
      expect(weekGroups).toHaveLength(1);
      expect(weekGroups[0].weekNumber).toBe(1);
    });

    it('returns empty array for month with no entries', () => {
      const monthDate = new Date(2025, 0, 1);
      const weekGroups = groupEntriesByWeek([], monthDate);

      expect(weekGroups).toHaveLength(0);
    });
  });

  describe('Entry sorting within weeks', () => {
    it('sorts entries by date descending within each week', () => {
      const mockEntries: TimeEntryWithDetails[] = [
        createMockEntry('1', '2025-01-13', 60),
        createMockEntry('2', '2025-01-15', 60),
        createMockEntry('3', '2025-01-14', 60),
      ];

      const monthDate = new Date(2025, 0, 1);
      const weekGroups = groupEntriesByWeek(mockEntries, monthDate);

      // All in Week 3
      expect(weekGroups).toHaveLength(1);

      // Should be sorted by date descending
      const entries = weekGroups[0].entries;
      expect(entries[0].entry_date).toBe('2025-01-15');
      expect(entries[1].entry_date).toBe('2025-01-14');
      expect(entries[2].entry_date).toBe('2025-01-13');
    });
  });
});

// Helper to create mock entries for unit testing
function createMockEntry(
  id: string,
  entryDate: string,
  durationMinutes: number
): TimeEntryWithDetails {
  return {
    id,
    user_id: 'user-1',
    job_id: 'job-1',
    service_id: 'service-1',
    task_id: null,
    department_id: 'dept-1',
    entry_date: entryDate,
    duration_minutes: durationMinutes,
    notes: null,
    created_at: '2025-01-01T10:00:00Z',
    updated_at: '2025-01-01T10:00:00Z',
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
  };
}
