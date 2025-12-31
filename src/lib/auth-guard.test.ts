/**
 * Unit tests for auth-guard utility
 * Story 2.4: Session Timeout Handling (AC: 4)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock @/lib/supabase/server
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  redirect: vi.fn(() => {
    throw new Error('REDIRECT');
  }),
}));

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { requireAuth, getAuthUser, isAuthError } from './auth-guard';

describe('auth-guard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('requireAuth', () => {
    it('should return supabase client and user when authenticated', async () => {
      const mockUser = { id: 'user-123', email: 'test@test.com' };
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null,
          }),
        },
      };

      vi.mocked(createClient).mockResolvedValue(mockSupabase as never);

      const result = await requireAuth();

      expect(result.user).toEqual(mockUser);
      expect(result.supabase).toBe(mockSupabase);
    });

    it('should redirect to login when not authenticated', async () => {
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: null },
            error: null,
          }),
        },
      };

      vi.mocked(createClient).mockResolvedValue(mockSupabase as never);

      await expect(requireAuth()).rejects.toThrow('REDIRECT');
      expect(redirect).toHaveBeenCalledWith('/login?expired=true');
    });

    it('should redirect to login when auth error occurs', async () => {
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: null },
            error: { message: 'Token expired' },
          }),
        },
      };

      vi.mocked(createClient).mockResolvedValue(mockSupabase as never);

      await expect(requireAuth()).rejects.toThrow('REDIRECT');
      expect(redirect).toHaveBeenCalledWith('/login?expired=true');
    });
  });

  describe('getAuthUser', () => {
    it('should return user when authenticated', async () => {
      const mockUser = { id: 'user-123', email: 'test@test.com' };
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null,
          }),
        },
      };

      vi.mocked(createClient).mockResolvedValue(mockSupabase as never);

      const result = await getAuthUser();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.user).toEqual(mockUser);
      }
    });

    it('should return auth error when not authenticated', async () => {
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: null },
            error: null,
          }),
        },
      };

      vi.mocked(createClient).mockResolvedValue(mockSupabase as never);

      const result = await getAuthUser();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Session expired');
        expect(result.authError).toBe(true);
      }
    });

    it('should return auth error when getUser fails', async () => {
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: null },
            error: { message: 'Invalid token' },
          }),
        },
      };

      vi.mocked(createClient).mockResolvedValue(mockSupabase as never);

      const result = await getAuthUser();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.authError).toBe(true);
      }
    });
  });

  describe('isAuthError', () => {
    it('should return true for auth errors', () => {
      const result = { success: false, error: 'Session expired', authError: true };
      expect(isAuthError(result)).toBe(true);
    });

    it('should return false for non-auth errors', () => {
      const result = { success: false, error: 'Validation failed' };
      expect(isAuthError(result)).toBe(false);
    });

    it('should return false for success results', () => {
      const result = { success: true, data: { user: { id: '123' } } };
      expect(isAuthError(result)).toBe(false);
    });
  });
});
