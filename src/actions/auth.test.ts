/**
 * Unit tests for auth server actions
 * Story 2.2: Session Persistence & Logout (AC: 5, 6)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { logout } from './auth';

// Mock next/navigation
const mockRedirect = vi.fn();
vi.mock('next/navigation', () => ({
  redirect: (path: string) => {
    mockRedirect(path);
    // Simulate redirect throwing to stop execution
    throw new Error('NEXT_REDIRECT');
  },
}));

// Mock Supabase server client
const mockSignOut = vi.fn();
vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    auth: {
      signOut: mockSignOut,
    },
  }),
}));

describe('logout action', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call supabase.auth.signOut', async () => {
    mockSignOut.mockResolvedValue({ error: null });

    try {
      await logout();
    } catch {
      // redirect throws, which is expected
    }

    expect(mockSignOut).toHaveBeenCalled();
  });

  it('should redirect to /login on successful logout', async () => {
    mockSignOut.mockResolvedValue({ error: null });

    try {
      await logout();
    } catch {
      // redirect throws, which is expected
    }

    expect(mockRedirect).toHaveBeenCalledWith('/login');
  });

  it('should return error when signOut fails', async () => {
    mockSignOut.mockResolvedValue({
      error: { message: 'Sign out failed' },
    });

    const result = await logout();

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('Failed to logout. Please try again.');
    }
  });

  it('should return error on network failure', async () => {
    mockSignOut.mockRejectedValue(new Error('Network error'));

    const result = await logout();

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('Unable to logout. Please check your connection.');
    }
  });
});
