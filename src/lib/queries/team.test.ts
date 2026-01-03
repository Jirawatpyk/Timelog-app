/**
 * Team Queries Tests - Story 6.1, 6.2
 *
 * Tests for getManagerDepartments, getTeamMembers, and getTeamMembersWithTodayStats functions.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the server client before importing the module
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

import { getManagerDepartments, getTeamMembers, getTeamMembersWithTodayStats } from './team';
import { createClient } from '@/lib/supabase/server';

describe('getManagerDepartments', () => {
  const mockSelect = vi.fn();
  const mockEq = vi.fn();
  const mockOrder = vi.fn();
  const mockFrom = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns all departments for admin users', async () => {
    const mockDepartments = [
      { id: 'dept-1', name: 'Engineering' },
      { id: 'dept-2', name: 'Marketing' },
    ];

    mockOrder.mockResolvedValue({
      data: mockDepartments,
      error: null,
    });
    mockEq.mockReturnValue({ order: mockOrder });
    mockSelect.mockReturnValue({ eq: mockEq });
    mockFrom.mockReturnValue({ select: mockSelect });

    vi.mocked(createClient).mockResolvedValue({
      from: mockFrom,
    } as unknown as Awaited<ReturnType<typeof createClient>>);

    const result = await getManagerDepartments('user-1', true);

    expect(result).toEqual(mockDepartments);
    expect(mockFrom).toHaveBeenCalledWith('departments');
    expect(mockEq).toHaveBeenCalledWith('active', true);
  });

  it('returns only assigned departments for managers', async () => {
    const mockData = [
      {
        department: {
          id: 'dept-1',
          name: 'Engineering',
        },
      },
    ];

    mockEq.mockResolvedValue({
      data: mockData,
      error: null,
    });
    mockSelect.mockReturnValue({ eq: mockEq });
    mockFrom.mockReturnValue({ select: mockSelect });

    vi.mocked(createClient).mockResolvedValue({
      from: mockFrom,
    } as unknown as Awaited<ReturnType<typeof createClient>>);

    const result = await getManagerDepartments('manager-1', false);

    expect(result).toEqual([
      { id: 'dept-1', name: 'Engineering' },
    ]);
    expect(mockFrom).toHaveBeenCalledWith('manager_departments');
    expect(mockEq).toHaveBeenCalledWith('manager_id', 'manager-1');
  });

  it('throws error when query fails', async () => {
    const mockError = new Error('Database error');

    mockOrder.mockResolvedValue({
      data: null,
      error: mockError,
    });
    mockEq.mockReturnValue({ order: mockOrder });
    mockSelect.mockReturnValue({ eq: mockEq });
    mockFrom.mockReturnValue({ select: mockSelect });

    vi.mocked(createClient).mockResolvedValue({
      from: mockFrom,
    } as unknown as Awaited<ReturnType<typeof createClient>>);

    await expect(getManagerDepartments('user-1', true)).rejects.toThrow('Database error');
  });
});

describe('getTeamMembers', () => {
  const mockSelect = vi.fn();
  const mockIn = vi.fn();
  const mockOrder = vi.fn();
  const mockFrom = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns empty array when no department IDs provided', async () => {
    const result = await getTeamMembers([]);
    expect(result).toEqual([]);
  });

  it('returns team members for given departments', async () => {
    const mockData = [
      {
        id: 'user-1',
        email: 'john@example.com',
        display_name: 'John Doe',
        role: 'staff',
        department_id: 'dept-1',
        department: { name: 'Engineering' },
      },
      {
        id: 'user-2',
        email: 'jane@example.com',
        display_name: null,
        role: 'manager',
        department_id: 'dept-1',
        department: { name: 'Engineering' },
      },
    ];

    mockOrder.mockResolvedValue({
      data: mockData,
      error: null,
    });
    mockIn.mockReturnValue({ order: mockOrder });
    mockSelect.mockReturnValue({ in: mockIn });
    mockFrom.mockReturnValue({ select: mockSelect });

    vi.mocked(createClient).mockResolvedValue({
      from: mockFrom,
    } as unknown as Awaited<ReturnType<typeof createClient>>);

    const result = await getTeamMembers(['dept-1']);

    expect(result).toEqual([
      {
        id: 'user-1',
        email: 'john@example.com',
        displayName: 'John Doe',
        departmentId: 'dept-1',
        departmentName: 'Engineering',
        role: 'staff',
      },
      {
        id: 'user-2',
        email: 'jane@example.com',
        displayName: 'jane', // Falls back to email prefix
        departmentId: 'dept-1',
        departmentName: 'Engineering',
        role: 'manager',
      },
    ]);
    expect(mockIn).toHaveBeenCalledWith('department_id', ['dept-1']);
  });

  it('filters out members with null department', async () => {
    const mockData = [
      {
        id: 'user-1',
        email: 'john@example.com',
        display_name: 'John Doe',
        role: 'staff',
        department_id: 'dept-1',
        department: null, // No department data - should be filtered out
      },
      {
        id: 'user-2',
        email: 'jane@example.com',
        display_name: 'Jane Doe',
        role: 'staff',
        department_id: 'dept-1',
        department: { name: 'Engineering' }, // Valid department
      },
    ];

    mockOrder.mockResolvedValue({
      data: mockData,
      error: null,
    });
    mockIn.mockReturnValue({ order: mockOrder });
    mockSelect.mockReturnValue({ in: mockIn });
    mockFrom.mockReturnValue({ select: mockSelect });

    vi.mocked(createClient).mockResolvedValue({
      from: mockFrom,
    } as unknown as Awaited<ReturnType<typeof createClient>>);

    const result = await getTeamMembers(['dept-1']);

    // Only user-2 should be returned (user-1 filtered out due to null department)
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('user-2');
    expect(result[0].departmentName).toBe('Engineering');
  });

  it('throws error when query fails', async () => {
    const mockError = new Error('Database error');

    mockOrder.mockResolvedValue({
      data: null,
      error: mockError,
    });
    mockIn.mockReturnValue({ order: mockOrder });
    mockSelect.mockReturnValue({ in: mockIn });
    mockFrom.mockReturnValue({ select: mockSelect });

    vi.mocked(createClient).mockResolvedValue({
      from: mockFrom,
    } as unknown as Awaited<ReturnType<typeof createClient>>);

    await expect(getTeamMembers(['dept-1'])).rejects.toThrow('Database error');
  });
});

describe('getTeamMembersWithTodayStats', () => {
  const mockSelect = vi.fn();
  const mockIn = vi.fn();
  const mockEq = vi.fn();
  const mockFrom = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns empty groups when no department IDs provided', async () => {
    const result = await getTeamMembersWithTodayStats([]);
    expect(result).toEqual({ logged: [], notLogged: [] });
  });

  it('groups members by logged and not logged', async () => {
    const mockMembers = [
      {
        id: 'user-1',
        email: 'logged@example.com',
        display_name: 'Logged User',
        role: 'staff',
        department_id: 'dept-1',
        department: { name: 'Engineering' },
      },
      {
        id: 'user-2',
        email: 'notlogged@example.com',
        display_name: 'Not Logged',
        role: 'staff',
        department_id: 'dept-1',
        department: { name: 'Engineering' },
      },
    ];

    const mockEntries = [
      {
        user_id: 'user-1',
        duration_minutes: 480, // 8 hours
      },
      {
        user_id: 'user-1',
        duration_minutes: 30, // Additional 0.5 hours
      },
    ];

    // Mock separate query chains for users and time_entries tables
    mockFrom.mockImplementation((table: string) => {
      if (table === 'users') {
        const usersIn = vi.fn().mockResolvedValue({ data: mockMembers, error: null });
        const usersSelect = vi.fn().mockReturnValue({ in: usersIn });
        return { select: usersSelect };
      } else if (table === 'time_entries') {
        const entriesEq = vi.fn().mockResolvedValue({ data: mockEntries, error: null });
        const entriesIn = vi.fn().mockReturnValue({ eq: entriesEq });
        const entriesSelect = vi.fn().mockReturnValue({ in: entriesIn });
        return { select: entriesSelect };
      }
      return { select: mockSelect };
    });

    vi.mocked(createClient).mockResolvedValue({
      from: mockFrom,
    } as unknown as Awaited<ReturnType<typeof createClient>>);

    const result = await getTeamMembersWithTodayStats(['dept-1']);

    expect(result.logged).toHaveLength(1);
    expect(result.notLogged).toHaveLength(1);

    // Check logged member
    expect(result.logged[0]).toMatchObject({
      id: 'user-1',
      displayName: 'Logged User',
      totalHours: 8.5,
      entryCount: 2,
      hasLoggedToday: true,
      isComplete: true,
    });

    // Check not logged member
    expect(result.notLogged[0]).toMatchObject({
      id: 'user-2',
      displayName: 'Not Logged',
      totalHours: 0,
      entryCount: 0,
      hasLoggedToday: false,
      isComplete: false,
    });
  });

  it('sorts logged members by hours descending', async () => {
    const mockMembers = [
      {
        id: 'user-1',
        email: 'user1@example.com',
        display_name: 'User 1',
        role: 'staff',
        department_id: 'dept-1',
        department: { name: 'Engineering' },
      },
      {
        id: 'user-2',
        email: 'user2@example.com',
        display_name: 'User 2',
        role: 'staff',
        department_id: 'dept-1',
        department: { name: 'Engineering' },
      },
      {
        id: 'user-3',
        email: 'user3@example.com',
        display_name: 'User 3',
        role: 'staff',
        department_id: 'dept-1',
        department: { name: 'Engineering' },
      },
    ];

    const mockEntries = [
      { user_id: 'user-1', duration_minutes: 240 }, // 4 hours
      { user_id: 'user-2', duration_minutes: 480 }, // 8 hours
      { user_id: 'user-3', duration_minutes: 360 }, // 6 hours
    ];

    // Mock separate query chains for users and time_entries tables
    mockFrom.mockImplementation((table: string) => {
      if (table === 'users') {
        const usersIn = vi.fn().mockResolvedValue({ data: mockMembers, error: null });
        const usersSelect = vi.fn().mockReturnValue({ in: usersIn });
        return { select: usersSelect };
      } else if (table === 'time_entries') {
        const entriesEq = vi.fn().mockResolvedValue({ data: mockEntries, error: null });
        const entriesIn = vi.fn().mockReturnValue({ eq: entriesEq });
        const entriesSelect = vi.fn().mockReturnValue({ in: entriesIn });
        return { select: entriesSelect };
      }
      return { select: mockSelect };
    });

    vi.mocked(createClient).mockResolvedValue({
      from: mockFrom,
    } as unknown as Awaited<ReturnType<typeof createClient>>);

    const result = await getTeamMembersWithTodayStats(['dept-1']);

    expect(result.logged).toHaveLength(3);
    // Should be sorted: user-2 (8h), user-3 (6h), user-1 (4h)
    expect(result.logged[0].id).toBe('user-2');
    expect(result.logged[0].totalHours).toBe(8);
    expect(result.logged[1].id).toBe('user-3');
    expect(result.logged[1].totalHours).toBe(6);
    expect(result.logged[2].id).toBe('user-1');
    expect(result.logged[2].totalHours).toBe(4);
  });

  it('marks members as complete when >= 8 hours', async () => {
    const mockMembers = [
      {
        id: 'user-complete',
        email: 'complete@example.com',
        display_name: 'Complete User',
        role: 'staff',
        department_id: 'dept-1',
        department: { name: 'Engineering' },
      },
      {
        id: 'user-partial',
        email: 'partial@example.com',
        display_name: 'Partial User',
        role: 'staff',
        department_id: 'dept-1',
        department: { name: 'Engineering' },
      },
    ];

    const mockEntries = [
      { user_id: 'user-complete', duration_minutes: 480 }, // Exactly 8 hours
      { user_id: 'user-partial', duration_minutes: 479 }, // Just under 8 hours
    ];

    // Mock separate query chains for users and time_entries tables
    mockFrom.mockImplementation((table: string) => {
      if (table === 'users') {
        const usersIn = vi.fn().mockResolvedValue({ data: mockMembers, error: null });
        const usersSelect = vi.fn().mockReturnValue({ in: usersIn });
        return { select: usersSelect };
      } else if (table === 'time_entries') {
        const entriesEq = vi.fn().mockResolvedValue({ data: mockEntries, error: null });
        const entriesIn = vi.fn().mockReturnValue({ eq: entriesEq });
        const entriesSelect = vi.fn().mockReturnValue({ in: entriesIn });
        return { select: entriesSelect };
      }
      return { select: mockSelect };
    });

    vi.mocked(createClient).mockResolvedValue({
      from: mockFrom,
    } as unknown as Awaited<ReturnType<typeof createClient>>);

    const result = await getTeamMembersWithTodayStats(['dept-1']);

    const completeUser = result.logged.find((m) => m.id === 'user-complete');
    const partialUser = result.logged.find((m) => m.id === 'user-partial');

    expect(completeUser?.isComplete).toBe(true);
    expect(completeUser?.totalHours).toBe(8);

    expect(partialUser?.isComplete).toBe(false);
    expect(partialUser?.totalHours).toBeLessThan(8);
  });

  it('throws error when members query fails', async () => {
    const mockError = new Error('Database error');

    mockIn.mockResolvedValue({
      data: null,
      error: mockError,
    });

    mockSelect.mockReturnValue({ in: mockIn });
    mockFrom.mockReturnValue({ select: mockSelect });

    vi.mocked(createClient).mockResolvedValue({
      from: mockFrom,
    } as unknown as Awaited<ReturnType<typeof createClient>>);

    await expect(getTeamMembersWithTodayStats(['dept-1'])).rejects.toThrow('Database error');
  });

  it('throws error when entries query fails', async () => {
    const mockMembers = [
      {
        id: 'user-1',
        email: 'test@example.com',
        display_name: 'Test User',
        role: 'staff',
        department_id: 'dept-1',
        department: { name: 'Engineering' },
      },
    ];

    const mockError = new Error('Entries error');

    // Mock separate query chains for users and time_entries tables
    mockFrom.mockImplementation((table: string) => {
      if (table === 'users') {
        const usersIn = vi.fn().mockResolvedValue({ data: mockMembers, error: null });
        const usersSelect = vi.fn().mockReturnValue({ in: usersIn });
        return { select: usersSelect };
      } else if (table === 'time_entries') {
        const entriesEq = vi.fn().mockResolvedValue({ data: null, error: mockError });
        const entriesIn = vi.fn().mockReturnValue({ eq: entriesEq });
        const entriesSelect = vi.fn().mockReturnValue({ in: entriesIn });
        return { select: entriesSelect };
      }
      return { select: mockSelect };
    });

    vi.mocked(createClient).mockResolvedValue({
      from: mockFrom,
    } as unknown as Awaited<ReturnType<typeof createClient>>);

    await expect(getTeamMembersWithTodayStats(['dept-1'])).rejects.toThrow('Entries error');
  });
});
