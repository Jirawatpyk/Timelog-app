import { describe, it, expect, vi, beforeEach } from 'vitest';
import { completeOnboarding } from './onboarding';

// Mock Supabase client
const mockUpdate = vi.fn();
const mockEq = vi.fn();
const mockGetUser = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: mockGetUser,
    },
    from: vi.fn(() => ({
      update: mockUpdate,
    })),
  })),
}));

describe('completeOnboarding', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default: user is authenticated
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
    });

    // Default: update succeeds
    mockUpdate.mockReturnValue({
      eq: mockEq,
    });
    mockEq.mockResolvedValue({ error: null });
  });

  describe('Success Cases', () => {
    it('returns success when onboarding is completed', async () => {
      const result = await completeOnboarding();

      expect(result).toEqual({ success: true, data: undefined });
    });

    it('calls update with has_completed_onboarding: true', async () => {
      await completeOnboarding();

      expect(mockUpdate).toHaveBeenCalledWith({ has_completed_onboarding: true });
    });

    it('filters by user id', async () => {
      await completeOnboarding();

      expect(mockEq).toHaveBeenCalledWith('id', 'user-123');
    });
  });

  describe('Error Cases', () => {
    it('returns error when user is not authenticated', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
      });

      const result = await completeOnboarding();

      expect(result).toEqual({ success: false, error: 'Not authenticated' });
    });

    it('returns error when update fails', async () => {
      mockEq.mockResolvedValue({
        error: { message: 'Database update failed' },
      });

      const result = await completeOnboarding();

      expect(result).toEqual({ success: false, error: 'Database update failed' });
    });
  });
});
