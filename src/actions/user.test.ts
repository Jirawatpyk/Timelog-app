import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getUsers } from './user';

// Mock Supabase client
const mockSelect = vi.fn();
const mockRange = vi.fn();
const mockOrder = vi.fn();
const mockFrom = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockImplementation(async () => ({
    from: mockFrom,
  })),
}));

describe('getUsers', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup mock chain
    mockFrom.mockReturnValue({ select: mockSelect });
    mockSelect.mockReturnValue({ range: mockRange });
    mockRange.mockReturnValue({ order: mockOrder });
  });

  it('returns paginated users with default params', async () => {
    const mockData = [
      {
        id: 'user-1',
        email: 'alice@example.com',
        display_name: 'Alice',
        role: 'staff',
        is_active: true,
        department: { id: 'dept-1', name: 'Engineering' },
      },
      {
        id: 'user-2',
        email: 'bob@example.com',
        display_name: 'Bob',
        role: 'manager',
        is_active: true,
        department: { id: 'dept-2', name: 'Marketing' },
      },
    ];

    mockOrder.mockResolvedValue({
      data: mockData,
      error: null,
      count: 2,
    });

    const result = await getUsers();

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.users).toHaveLength(2);
      expect(result.data.totalCount).toBe(2);
      expect(result.data.users[0]).toEqual({
        id: 'user-1',
        email: 'alice@example.com',
        displayName: 'Alice',
        role: 'staff',
        isActive: true,
        department: { id: 'dept-1', name: 'Engineering' },
      });
    }

    // Verify query params
    expect(mockFrom).toHaveBeenCalledWith('users');
    expect(mockRange).toHaveBeenCalledWith(0, 19); // page 1, limit 20
    expect(mockOrder).toHaveBeenCalledWith('display_name', {
      ascending: true,
      nullsFirst: false,
    });
  });

  it('handles pagination params correctly', async () => {
    mockOrder.mockResolvedValue({
      data: [],
      error: null,
      count: 50,
    });

    await getUsers({ page: 3, limit: 10 });

    // page 3, limit 10 means offset 20-29
    expect(mockRange).toHaveBeenCalledWith(20, 29);
  });

  it('returns user without department (null)', async () => {
    const mockData = [
      {
        id: 'user-1',
        email: 'noDept@example.com',
        display_name: 'No Dept',
        role: 'admin',
        is_active: true,
        department: null,
      },
    ];

    mockOrder.mockResolvedValue({
      data: mockData,
      error: null,
      count: 1,
    });

    const result = await getUsers();

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.users[0].department).toBeNull();
    }
  });

  it('returns error on database failure', async () => {
    mockOrder.mockResolvedValue({
      data: null,
      error: { message: 'Database connection failed' },
      count: null,
    });

    const result = await getUsers();

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('Database connection failed');
    }
  });

  it('handles empty user list', async () => {
    mockOrder.mockResolvedValue({
      data: [],
      error: null,
      count: 0,
    });

    const result = await getUsers();

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.users).toEqual([]);
      expect(result.data.totalCount).toBe(0);
    }
  });

  it('transforms all user roles correctly', async () => {
    const mockData = [
      {
        id: 'u1',
        email: 'staff@example.com',
        display_name: 'Staff User',
        role: 'staff',
        is_active: true,
        department: null,
      },
      {
        id: 'u2',
        email: 'manager@example.com',
        display_name: 'Manager User',
        role: 'manager',
        is_active: true,
        department: null,
      },
      {
        id: 'u3',
        email: 'admin@example.com',
        display_name: 'Admin User',
        role: 'admin',
        is_active: false,
        department: null,
      },
      {
        id: 'u4',
        email: 'super@example.com',
        display_name: 'Super Admin',
        role: 'super_admin',
        is_active: true,
        department: null,
      },
    ];

    mockOrder.mockResolvedValue({
      data: mockData,
      error: null,
      count: 4,
    });

    const result = await getUsers();

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.users[0].role).toBe('staff');
      expect(result.data.users[1].role).toBe('manager');
      expect(result.data.users[2].role).toBe('admin');
      expect(result.data.users[2].isActive).toBe(false);
      expect(result.data.users[3].role).toBe('super_admin');
    }
  });
});
