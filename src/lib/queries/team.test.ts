/**
 * Team Queries Tests - Story 6.1
 *
 * Tests for getManagerDepartments and getTeamMembers functions.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the server client before importing the module
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

import { getManagerDepartments, getTeamMembers } from './team';
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

  it('handles null department gracefully', async () => {
    const mockData = [
      {
        id: 'user-1',
        email: 'john@example.com',
        display_name: 'John Doe',
        role: 'staff',
        department_id: 'dept-1',
        department: null, // No department data
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

    expect(result[0].departmentName).toBe('');
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
