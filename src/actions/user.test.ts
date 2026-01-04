import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getUsers,
  createUser,
  getActiveDepartments,
  getCurrentUserRole,
  resendInvitation,
} from './user';
import type { CreateUserInput } from '@/schemas/user.schema';

// Mock Supabase client
const mockSelect = vi.fn();
const mockRange = vi.fn();
const mockOrder = vi.fn();
const mockFrom = vi.fn();
const mockInsert = vi.fn();
const mockEq = vi.fn();
const mockIlike = vi.fn();
const mockSingle = vi.fn();
const mockGetUser = vi.fn();

// Mock Admin client functions
const mockInviteUserByEmail = vi.fn();
const mockDeleteUser = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({
    auth: {
      admin: {
        inviteUserByEmail: mockInviteUserByEmail,
        deleteUser: mockDeleteUser,
        getUserById: vi.fn(),
      },
    },
  })),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

// Helper to set up supabase mock
async function setupSupabaseMock(options: {
  authUser?: { id: string } | null;
  userRole?: string;
  existingEmail?: boolean;
  validDepartment?: boolean; // For department validation check
  insertSuccess?: boolean;
  insertedUser?: object;
  inviteSuccess?: boolean; // For admin invite
  invitedUser?: { user: { id: string } }; // Returned from invite
}) {
  // Reset admin mocks
  mockInviteUserByEmail.mockReset();
  mockDeleteUser.mockReset();

  // Setup admin invite mock
  if (options.inviteSuccess !== undefined) {
    if (options.inviteSuccess) {
      mockInviteUserByEmail.mockResolvedValue({
        data: options.invitedUser || { user: { id: 'auth-user-id' } },
        error: null,
      });
    } else {
      mockInviteUserByEmail.mockResolvedValue({
        data: null,
        error: { message: 'Failed to invite' },
      });
    }
  } else {
    // Default: successful invite
    mockInviteUserByEmail.mockResolvedValue({
      data: { user: { id: 'auth-user-id' } },
      error: null,
    });
  }
  mockDeleteUser.mockResolvedValue({ data: null, error: null });
  const { createClient } = await import('@/lib/supabase/server');

  mockGetUser.mockResolvedValue({
    data: { user: options.authUser ?? null },
  });

  // Reset all mocks
  mockFrom.mockReset();
  mockSelect.mockReset();
  mockEq.mockReset();
  mockIlike.mockReset();
  mockSingle.mockReset();
  mockInsert.mockReset();

  // Setup mock chain for different queries
  mockFrom.mockImplementation((table: string) => {
    if (table === 'users') {
      return {
        select: vi.fn().mockImplementation((columns: string) => {
          if (columns === 'role') {
            // Getting current user role
            return {
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: options.userRole ? { role: options.userRole } : null,
                  error: options.userRole ? null : { message: 'Not found' },
                }),
              }),
            };
          }
          if (columns === 'id') {
            // Checking duplicate email
            return {
              ilike: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: options.existingEmail ? { id: 'existing-id' } : null,
                  error: options.existingEmail ? null : { code: 'PGRST116' },
                }),
              }),
            };
          }
          // Default select chain for getUsers
          return {
            range: mockRange.mockReturnValue({
              order: mockOrder,
            }),
          };
        }),
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: options.insertSuccess ? options.insertedUser : null,
              error: options.insertSuccess ? null : { message: 'Insert failed' },
            }),
          }),
        }),
      };
    }
    if (table === 'departments') {
      return {
        select: vi.fn().mockImplementation((columns: string) => {
          if (columns === 'id') {
            // Department validation check: .select('id').eq('id', ...).eq('active', true).single()
            // Use explicit chaining to handle .eq().eq().single()
            const singleMock = vi.fn().mockResolvedValue({
              data: options.validDepartment !== false ? { id: 'valid-dept-id' } : null,
              error: options.validDepartment !== false ? null : { code: 'PGRST116' },
            });
            const secondEqMock = vi.fn().mockReturnValue({ single: singleMock });
            const firstEqMock = vi.fn().mockReturnValue({ eq: secondEqMock, single: singleMock });
            return { eq: firstEqMock };
          }
          // getActiveDepartments: .select('id, name').eq('active', true).order('name')
          return {
            eq: vi.fn().mockReturnValue({
              order: vi.fn(),
            }),
          };
        }),
      };
    }
    return { select: mockSelect };
  });

  vi.mocked(createClient).mockResolvedValue({
    from: mockFrom,
    auth: { getUser: mockGetUser },
  } as unknown as Awaited<ReturnType<typeof createClient>>);
}

describe('getUsers', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup mock chain for getUsers
    mockFrom.mockReturnValue({ select: mockSelect });
    mockSelect.mockReturnValue({ range: mockRange });
    mockRange.mockReturnValue({ order: mockOrder });
  });

  it('returns paginated users with default params', async () => {
    const { createClient } = await import('@/lib/supabase/server');
    vi.mocked(createClient).mockResolvedValue({
      from: mockFrom,
    } as unknown as Awaited<ReturnType<typeof createClient>>);

    const mockData = [
      {
        id: 'user-1',
        email: 'alice@example.com',
        display_name: 'Alice',
        role: 'staff',
        is_active: true,
        confirmed_at: '2026-01-01T00:00:00Z',
        department: { id: 'dept-1', name: 'Engineering' },
      },
      {
        id: 'user-2',
        email: 'bob@example.com',
        display_name: 'Bob',
        role: 'manager',
        is_active: true,
        confirmed_at: '2026-01-01T00:00:00Z',
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
        status: 'active',
        confirmedAt: '2026-01-01T00:00:00Z',
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
    const { createClient } = await import('@/lib/supabase/server');
    vi.mocked(createClient).mockResolvedValue({
      from: mockFrom,
    } as unknown as Awaited<ReturnType<typeof createClient>>);

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
    const { createClient } = await import('@/lib/supabase/server');
    vi.mocked(createClient).mockResolvedValue({
      from: mockFrom,
    } as unknown as Awaited<ReturnType<typeof createClient>>);

    const mockData = [
      {
        id: 'user-1',
        email: 'noDept@example.com',
        display_name: 'No Dept',
        role: 'admin',
        is_active: true,
        confirmed_at: '2026-01-01T00:00:00Z',
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

  it('calculates status correctly for pending user (no confirmed_at)', async () => {
    const { createClient } = await import('@/lib/supabase/server');
    vi.mocked(createClient).mockResolvedValue({
      from: mockFrom,
    } as unknown as Awaited<ReturnType<typeof createClient>>);

    const mockData = [
      {
        id: 'user-1',
        email: 'pending@example.com',
        display_name: 'Pending User',
        role: 'staff',
        is_active: true,
        confirmed_at: null,
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
      expect(result.data.users[0].status).toBe('pending');
      expect(result.data.users[0].confirmedAt).toBeNull();
    }
  });

  it('calculates status correctly for inactive user', async () => {
    const { createClient } = await import('@/lib/supabase/server');
    vi.mocked(createClient).mockResolvedValue({
      from: mockFrom,
    } as unknown as Awaited<ReturnType<typeof createClient>>);

    const mockData = [
      {
        id: 'user-1',
        email: 'inactive@example.com',
        display_name: 'Inactive User',
        role: 'staff',
        is_active: false,
        confirmed_at: '2026-01-01T00:00:00Z',
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
      expect(result.data.users[0].status).toBe('inactive');
    }
  });

  it('returns error on database failure', async () => {
    const { createClient } = await import('@/lib/supabase/server');
    vi.mocked(createClient).mockResolvedValue({
      from: mockFrom,
    } as unknown as Awaited<ReturnType<typeof createClient>>);

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
    const { createClient } = await import('@/lib/supabase/server');
    vi.mocked(createClient).mockResolvedValue({
      from: mockFrom,
    } as unknown as Awaited<ReturnType<typeof createClient>>);

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
    const { createClient } = await import('@/lib/supabase/server');
    vi.mocked(createClient).mockResolvedValue({
      from: mockFrom,
    } as unknown as Awaited<ReturnType<typeof createClient>>);

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
  const validInput: CreateUserInput = {
    email: 'newuser@example.com',
    displayName: 'New User',
    role: 'staff',
    departmentId: '550e8400-e29b-41d4-a716-446655440000',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects invalid input before making API calls', async () => {
    const result = await createUser({
      email: 'invalid-email',
      displayName: 'A', // Too short
      role: 'staff',
      departmentId: 'not-a-uuid',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('Invalid');
    }
  });

  it('requires authentication', async () => {
    await setupSupabaseMock({ authUser: null });

    const result = await createUser(validInput);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('Not authenticated');
    }
  });

  it('prevents admin from creating super_admin', async () => {
    await setupSupabaseMock({
      authUser: { id: 'admin-user-id' },
      userRole: 'admin',
    });

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
    await setupSupabaseMock({
      authUser: { id: 'super-admin-id' },
      userRole: 'super_admin',
      existingEmail: false,
      validDepartment: true,
      insertSuccess: true,
      insertedUser: {
        id: 'new-user-id',
        email: validInput.email,
        display_name: validInput.displayName,
        role: 'super_admin',
        department_id: validInput.departmentId,
        is_active: true,
      },
    });

    const result = await createUser({
      ...validInput,
      role: 'super_admin',
    });

    expect(result.success).toBe(true);
  });

  it('rejects duplicate email', async () => {
    await setupSupabaseMock({
      authUser: { id: 'admin-user-id' },
      userRole: 'admin',
      existingEmail: true,
    });

    const result = await createUser(validInput);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('Email already exists');
    }
  });

  it('creates user successfully', async () => {
    await setupSupabaseMock({
      authUser: { id: 'admin-user-id' },
      userRole: 'admin',
      existingEmail: false,
      validDepartment: true,
      insertSuccess: true,
      insertedUser: {
        id: 'new-user-id',
        email: validInput.email,
        display_name: validInput.displayName,
        role: validInput.role,
        department_id: validInput.departmentId,
        is_active: true,
      },
    });

    const result = await createUser(validInput);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe(validInput.email);
    }
  });

  it('rejects invalid or inactive department', async () => {
    await setupSupabaseMock({
      authUser: { id: 'admin-user-id' },
      userRole: 'admin',
      existingEmail: false,
      validDepartment: false,
    });

    const result = await createUser(validInput);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('Invalid or inactive department');
    }
  });
});

describe('getActiveDepartments', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns list of active departments', async () => {
    const { createClient } = await import('@/lib/supabase/server');
    const mockOrderDepts = vi.fn().mockResolvedValue({
      data: [
        { id: 'dept-1', name: 'Engineering' },
        { id: 'dept-2', name: 'Marketing' },
      ],
      error: null,
    });

    vi.mocked(createClient).mockResolvedValue({
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: mockOrderDepts,
          }),
        }),
      }),
    } as unknown as Awaited<ReturnType<typeof createClient>>);

    const result = await getActiveDepartments();

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toHaveLength(2);
      expect(result.data[0].name).toBe('Engineering');
    }
  });

  it('returns empty list when no departments', async () => {
    const { createClient } = await import('@/lib/supabase/server');

    vi.mocked(createClient).mockResolvedValue({
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: [],
              error: null,
            }),
          }),
        }),
      }),
    } as unknown as Awaited<ReturnType<typeof createClient>>);

    const result = await getActiveDepartments();

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual([]);
    }
  });

  it('returns error on database failure', async () => {
    const { createClient } = await import('@/lib/supabase/server');

    vi.mocked(createClient).mockResolvedValue({
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'Connection failed' },
            }),
          }),
        }),
      }),
    } as unknown as Awaited<ReturnType<typeof createClient>>);

    const result = await getActiveDepartments();

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('Connection failed');
    }
  });
});

describe('getCurrentUserRole', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns current user role', async () => {
    const { createClient } = await import('@/lib/supabase/server');

    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-id' } },
        }),
      },
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { role: 'admin' },
              error: null,
            }),
          }),
        }),
      }),
    } as unknown as Awaited<ReturnType<typeof createClient>>);

    const result = await getCurrentUserRole();

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe('admin');
    }
  });

  it('returns error when not authenticated', async () => {
    const { createClient } = await import('@/lib/supabase/server');

    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: null },
        }),
      },
      from: vi.fn(),
    } as unknown as Awaited<ReturnType<typeof createClient>>);

    const result = await getCurrentUserRole();

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('Not authenticated');
    }
  });
});

describe('resendInvitation (Story 7.2a)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockInviteUserByEmail.mockReset();
  });

  it('returns error when not authenticated', async () => {
    const { createClient } = await import('@/lib/supabase/server');

    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: null },
        }),
      },
      from: vi.fn(),
    } as unknown as Awaited<ReturnType<typeof createClient>>);

    const result = await resendInvitation('user-id');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('Not authenticated');
    }
  });

  it('returns error when user not found', async () => {
    const { createClient } = await import('@/lib/supabase/server');

    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'admin-id' } },
        }),
      },
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { code: 'PGRST116', message: 'Not found' },
            }),
          }),
        }),
      }),
    } as unknown as Awaited<ReturnType<typeof createClient>>);

    const result = await resendInvitation('non-existent-user');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('User not found');
    }
  });

  it('returns error for already confirmed user', async () => {
    const { createClient } = await import('@/lib/supabase/server');

    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'admin-id' } },
        }),
      },
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                email: 'confirmed@example.com',
                confirmed_at: '2026-01-01T00:00:00Z', // Already confirmed
              },
              error: null,
            }),
          }),
        }),
      }),
    } as unknown as Awaited<ReturnType<typeof createClient>>);

    const result = await resendInvitation('confirmed-user-id');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('User already confirmed');
    }
  });

  it('successfully resends invitation for pending user', async () => {
    const { createClient } = await import('@/lib/supabase/server');

    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'admin-id' } },
        }),
      },
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                email: 'pending@example.com',
                confirmed_at: null, // Not confirmed
              },
              error: null,
            }),
          }),
        }),
      }),
    } as unknown as Awaited<ReturnType<typeof createClient>>);

    mockInviteUserByEmail.mockResolvedValue({ data: {}, error: null });

    const result = await resendInvitation('pending-user-id');

    expect(result.success).toBe(true);
    expect(mockInviteUserByEmail).toHaveBeenCalledWith(
      'pending@example.com',
      expect.any(Object)
    );
  });

  it('returns error when admin invite fails', async () => {
    const { createClient } = await import('@/lib/supabase/server');

    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'admin-id' } },
        }),
      },
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                email: 'pending@example.com',
                confirmed_at: null,
              },
              error: null,
            }),
          }),
        }),
      }),
    } as unknown as Awaited<ReturnType<typeof createClient>>);

    mockInviteUserByEmail.mockResolvedValue({
      data: null,
      error: { message: 'Rate limit exceeded' },
    });

    const result = await resendInvitation('pending-user-id');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('Failed to resend invitation');
    }
  });
});
