import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getUsers, createUser, getActiveDepartments, getCurrentUserRole } from './user';
import type { CreateUserInput } from '@/schemas/user.schema';

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

describe('createUser', () => {
  // Mock functions for createUser
  const mockInsert = vi.fn();
  const mockSelectInsert = vi.fn();
  const mockSingleInsert = vi.fn();
  const mockEq = vi.fn();
  const mockIlike = vi.fn();
  const mockSingle = vi.fn();
  const mockGetUser = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Reset mocks for createUser tests
    mockFrom.mockImplementation((table: string) => {
      if (table === 'users') {
        return {
          select: mockSelect,
          insert: mockInsert,
        };
      }
      return { select: mockSelect };
    });
  });

  const validInput: CreateUserInput = {
    email: 'newuser@example.com',
    displayName: 'New User',
    role: 'staff',
    departmentId: '550e8400-e29b-41d4-a716-446655440000',
  };

  it('creates user successfully when admin', async () => {
    // Mock auth.getUser
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'admin-user-id' } },
    });

    // Mock current user role check
    mockSelect.mockImplementation(() => ({
      eq: mockEq.mockReturnValue({
        single: mockSingle.mockResolvedValue({
          data: { role: 'admin' },
          error: null,
        }),
      }),
      ilike: mockIlike.mockReturnValue({
        single: mockSingle.mockResolvedValue({
          data: null,
          error: { code: 'PGRST116' }, // Not found
        }),
      }),
    }));

    // Mock insert
    mockInsert.mockReturnValue({
      select: mockSelectInsert.mockReturnValue({
        single: mockSingleInsert.mockResolvedValue({
          data: {
            id: 'new-user-id',
            email: validInput.email,
            display_name: validInput.displayName,
            role: validInput.role,
            department_id: validInput.departmentId,
            is_active: true,
          },
          error: null,
        }),
      }),
    });

    // Override mock to include auth
    vi.mocked(await import('@/lib/supabase/server')).createClient.mockResolvedValue({
      from: mockFrom,
      auth: { getUser: mockGetUser },
    } as unknown as Awaited<ReturnType<typeof import('@/lib/supabase/server').createClient>>);

    const result = await createUser(validInput);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe(validInput.email);
    }
  });

  it('prevents admin from creating super_admin', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'admin-user-id' } },
    });

    // Mock current user is admin
    mockSelect.mockImplementation(() => ({
      eq: mockEq.mockReturnValue({
        single: mockSingle.mockResolvedValue({
          data: { role: 'admin' },
          error: null,
        }),
      }),
    }));

    vi.mocked(await import('@/lib/supabase/server')).createClient.mockResolvedValue({
      from: mockFrom,
      auth: { getUser: mockGetUser },
    } as unknown as Awaited<ReturnType<typeof import('@/lib/supabase/server').createClient>>);

    const result = await createUser({
      ...validInput,
      role: 'super_admin',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('Cannot create Super Admin user');
    }
  });

  it('allows super_admin to create super_admin', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'super-admin-id' } },
    });

    // Mock current user is super_admin
    mockSelect.mockImplementation(() => ({
      eq: mockEq.mockReturnValue({
        single: mockSingle.mockResolvedValue({
          data: { role: 'super_admin' },
          error: null,
        }),
      }),
      ilike: mockIlike.mockReturnValue({
        single: mockSingle.mockResolvedValue({
          data: null,
          error: { code: 'PGRST116' },
        }),
      }),
    }));

    mockInsert.mockReturnValue({
      select: mockSelectInsert.mockReturnValue({
        single: mockSingleInsert.mockResolvedValue({
          data: {
            id: 'new-super-admin-id',
            email: validInput.email,
            display_name: validInput.displayName,
            role: 'super_admin',
            department_id: validInput.departmentId,
            is_active: true,
          },
          error: null,
        }),
      }),
    });

    vi.mocked(await import('@/lib/supabase/server')).createClient.mockResolvedValue({
      from: mockFrom,
      auth: { getUser: mockGetUser },
    } as unknown as Awaited<ReturnType<typeof import('@/lib/supabase/server').createClient>>);

    const result = await createUser({
      ...validInput,
      role: 'super_admin',
    });

    expect(result.success).toBe(true);
  });

  it('rejects duplicate email', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'admin-user-id' } },
    });

    // Mock current user role check and duplicate check
    mockSelect.mockImplementation(() => ({
      eq: mockEq.mockReturnValue({
        single: mockSingle.mockResolvedValue({
          data: { role: 'admin' },
          error: null,
        }),
      }),
      ilike: mockIlike.mockReturnValue({
        single: mockSingle.mockResolvedValue({
          data: { id: 'existing-user' }, // Email exists
          error: null,
        }),
      }),
    }));

    vi.mocked(await import('@/lib/supabase/server')).createClient.mockResolvedValue({
      from: mockFrom,
      auth: { getUser: mockGetUser },
    } as unknown as Awaited<ReturnType<typeof import('@/lib/supabase/server').createClient>>);

    const result = await createUser(validInput);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('Email already exists');
    }
  });

  it('rejects invalid input', async () => {
    const result = await createUser({
      email: 'invalid-email',
      displayName: 'A', // Too short
      role: 'staff',
      departmentId: 'not-a-uuid',
    });

    expect(result.success).toBe(false);
  });

  it('requires authentication', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
    });

    vi.mocked(await import('@/lib/supabase/server')).createClient.mockResolvedValue({
      from: mockFrom,
      auth: { getUser: mockGetUser },
    } as unknown as Awaited<ReturnType<typeof import('@/lib/supabase/server').createClient>>);

    const result = await createUser(validInput);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('Not authenticated');
    }
  });
});

describe('getActiveDepartments', () => {
  const mockEq = vi.fn();
  const mockOrderDepts = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    mockFrom.mockReturnValue({
      select: mockSelect.mockReturnValue({
        eq: mockEq.mockReturnValue({
          order: mockOrderDepts,
        }),
      }),
    });
  });

  it('returns list of active departments', async () => {
    const mockDepts = [
      { id: 'dept-1', name: 'Engineering' },
      { id: 'dept-2', name: 'Marketing' },
    ];

    mockOrderDepts.mockResolvedValue({
      data: mockDepts,
      error: null,
    });

    const result = await getActiveDepartments();

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toHaveLength(2);
      expect(result.data[0].name).toBe('Engineering');
    }

    expect(mockFrom).toHaveBeenCalledWith('departments');
    expect(mockEq).toHaveBeenCalledWith('active', true);
  });

  it('returns empty list when no departments', async () => {
    mockOrderDepts.mockResolvedValue({
      data: [],
      error: null,
    });

    const result = await getActiveDepartments();

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual([]);
    }
  });

  it('returns error on database failure', async () => {
    mockOrderDepts.mockResolvedValue({
      data: null,
      error: { message: 'Connection failed' },
    });

    const result = await getActiveDepartments();

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('Connection failed');
    }
  });
});

describe('getCurrentUserRole', () => {
  const mockGetUser = vi.fn();
  const mockEq = vi.fn();
  const mockSingle = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns current user role', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-id' } },
    });

    mockFrom.mockReturnValue({
      select: mockSelect.mockReturnValue({
        eq: mockEq.mockReturnValue({
          single: mockSingle.mockResolvedValue({
            data: { role: 'admin' },
            error: null,
          }),
        }),
      }),
    });

    vi.mocked(await import('@/lib/supabase/server')).createClient.mockResolvedValue({
      from: mockFrom,
      auth: { getUser: mockGetUser },
    } as unknown as Awaited<ReturnType<typeof import('@/lib/supabase/server').createClient>>);

    const result = await getCurrentUserRole();

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe('admin');
    }
  });

  it('returns error when not authenticated', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
    });

    vi.mocked(await import('@/lib/supabase/server')).createClient.mockResolvedValue({
      from: mockFrom,
      auth: { getUser: mockGetUser },
    } as unknown as Awaited<ReturnType<typeof import('@/lib/supabase/server').createClient>>);

    const result = await getCurrentUserRole();

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('Not authenticated');
    }
  });
});
