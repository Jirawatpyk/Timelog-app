/**
 * Check Manager Access Tests - Story 6.1
 *
 * Tests for checkManagerAccess authorization function.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { redirect } from 'next/navigation';

// Mock dependencies
vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

import { checkManagerAccess } from './check-manager-access';
import { createClient } from '@/lib/supabase/server';

describe('checkManagerAccess', () => {
  const mockGetUser = vi.fn();
  const mockSelect = vi.fn();
  const mockEq = vi.fn();
  const mockSingle = vi.fn();
  const mockFrom = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirects to /login when user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
    });

    vi.mocked(createClient).mockResolvedValue({
      auth: { getUser: mockGetUser },
    } as unknown as Awaited<ReturnType<typeof createClient>>);

    await checkManagerAccess();

    expect(redirect).toHaveBeenCalledWith('/login');
  });

  it('allows manager access and returns correct data', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-1' } },
    });

    mockSingle.mockResolvedValue({
      data: { role: 'manager' },
      error: null,
    });
    mockEq.mockReturnValue({ single: mockSingle });
    mockSelect.mockReturnValue({ eq: mockEq });
    mockFrom.mockReturnValue({ select: mockSelect });

    vi.mocked(createClient).mockResolvedValue({
      auth: { getUser: mockGetUser },
      from: mockFrom,
    } as unknown as Awaited<ReturnType<typeof createClient>>);

    const result = await checkManagerAccess();

    expect(result).toEqual({
      canAccess: true,
      userId: 'user-1',
      role: 'manager',
      isAdmin: false,
    });
  });

  it('allows admin access and sets isAdmin flag', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'admin-1' } },
    });

    mockSingle.mockResolvedValue({
      data: { role: 'admin' },
      error: null,
    });
    mockEq.mockReturnValue({ single: mockSingle });
    mockSelect.mockReturnValue({ eq: mockEq });
    mockFrom.mockReturnValue({ select: mockSelect });

    vi.mocked(createClient).mockResolvedValue({
      auth: { getUser: mockGetUser },
      from: mockFrom,
    } as unknown as Awaited<ReturnType<typeof createClient>>);

    const result = await checkManagerAccess();

    expect(result).toEqual({
      canAccess: true,
      userId: 'admin-1',
      role: 'admin',
      isAdmin: true,
    });
  });

  it('allows super_admin access and sets isAdmin flag', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'super-1' } },
    });

    mockSingle.mockResolvedValue({
      data: { role: 'super_admin' },
      error: null,
    });
    mockEq.mockReturnValue({ single: mockSingle });
    mockSelect.mockReturnValue({ eq: mockEq });
    mockFrom.mockReturnValue({ select: mockSelect });

    vi.mocked(createClient).mockResolvedValue({
      auth: { getUser: mockGetUser },
      from: mockFrom,
    } as unknown as Awaited<ReturnType<typeof createClient>>);

    const result = await checkManagerAccess();

    expect(result).toEqual({
      canAccess: true,
      userId: 'super-1',
      role: 'super_admin',
      isAdmin: true,
    });
  });

  it('denies staff access', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'staff-1' } },
    });

    mockSingle.mockResolvedValue({
      data: { role: 'staff' },
      error: null,
    });
    mockEq.mockReturnValue({ single: mockSingle });
    mockSelect.mockReturnValue({ eq: mockEq });
    mockFrom.mockReturnValue({ select: mockSelect });

    vi.mocked(createClient).mockResolvedValue({
      auth: { getUser: mockGetUser },
      from: mockFrom,
    } as unknown as Awaited<ReturnType<typeof createClient>>);

    const result = await checkManagerAccess();

    expect(result).toEqual({
      canAccess: false,
      userId: 'staff-1',
      role: 'staff',
      isAdmin: false,
    });
  });

  it('defaults to staff role when profile query fails', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-1' } },
    });

    mockSingle.mockResolvedValue({
      data: null,
      error: new Error('Profile not found'),
    });
    mockEq.mockReturnValue({ single: mockSingle });
    mockSelect.mockReturnValue({ eq: mockEq });
    mockFrom.mockReturnValue({ select: mockSelect });

    vi.mocked(createClient).mockResolvedValue({
      auth: { getUser: mockGetUser },
      from: mockFrom,
    } as unknown as Awaited<ReturnType<typeof createClient>>);

    const result = await checkManagerAccess();

    expect(result).toEqual({
      canAccess: false,
      userId: 'user-1',
      role: 'staff',
      isAdmin: false,
    });
  });
});
