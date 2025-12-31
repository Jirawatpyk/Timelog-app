/**
 * Unit tests for use-user hook
 * Story 2.2: Session Persistence & Logout (AC: 3)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useUser } from './use-user';

// Mock the Supabase client
const mockGetUser = vi.fn();
const mockSelect = vi.fn();
const mockEq = vi.fn();
const mockSingle = vi.fn();
const mockOnAuthStateChange = vi.fn();
const mockUnsubscribe = vi.fn();

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getUser: mockGetUser,
      onAuthStateChange: mockOnAuthStateChange,
    },
    from: () => ({
      select: mockSelect,
    }),
  }),
}));

describe('useUser hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementations
    mockSelect.mockReturnValue({ eq: mockEq });
    mockEq.mockReturnValue({ single: mockSingle });
    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: mockUnsubscribe } },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return loading state initially', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
    mockSingle.mockResolvedValue({ data: null, error: null });

    const { result } = renderHook(() => useUser());

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('should return null user when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

    const { result } = renderHook(() => useUser());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.user).toBeNull();
    expect(result.current.role).toBeNull();
    expect(result.current.displayName).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('should return user with role when authenticated', async () => {
    const mockUser = {
      id: 'test-user-id',
      email: 'test@example.com',
    };

    mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });
    mockSingle.mockResolvedValue({
      data: { role: 'staff', display_name: 'Test User' },
      error: null,
    });

    const { result } = renderHook(() => useUser());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.role).toBe('staff');
    expect(result.current.displayName).toBe('Test User');
    expect(result.current.error).toBeNull();
  });

  it('should return manager role correctly', async () => {
    const mockUser = {
      id: 'manager-id',
      email: 'manager@example.com',
    };

    mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });
    mockSingle.mockResolvedValue({
      data: { role: 'manager', display_name: 'Test Manager' },
      error: null,
    });

    const { result } = renderHook(() => useUser());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.role).toBe('manager');
  });

  it('should handle auth error', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Auth error' },
    });

    const { result } = renderHook(() => useUser());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.user).toBeNull();
    expect(result.current.error).toBe('Auth error');
  });

  it('should handle user without profile', async () => {
    const mockUser = {
      id: 'new-user-id',
      email: 'new@example.com',
    };

    mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });
    mockSingle.mockResolvedValue({
      data: null,
      error: { message: 'Profile not found' },
    });

    const { result } = renderHook(() => useUser());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // User exists but no profile
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.role).toBeNull();
    expect(result.current.displayName).toBeNull();
  });

  it('should subscribe to auth state changes', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

    renderHook(() => useUser());

    await waitFor(() => {
      expect(mockOnAuthStateChange).toHaveBeenCalled();
    });
  });

  it('should unsubscribe on unmount', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

    const { unmount } = renderHook(() => useUser());

    await waitFor(() => {
      expect(mockOnAuthStateChange).toHaveBeenCalled();
    });

    unmount();

    expect(mockUnsubscribe).toHaveBeenCalled();
  });

  it('should clear state on SIGNED_OUT event', async () => {
    const mockUser = {
      id: 'test-user-id',
      email: 'test@example.com',
    };

    mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });
    mockSingle.mockResolvedValue({
      data: { role: 'staff', display_name: 'Test User' },
      error: null,
    });

    let authCallback: ((event: string, session: unknown) => void) | null = null;
    mockOnAuthStateChange.mockImplementation((callback) => {
      authCallback = callback;
      return { data: { subscription: { unsubscribe: mockUnsubscribe } } };
    });

    const { result } = renderHook(() => useUser());

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser);
    });

    // Simulate sign out
    await act(async () => {
      if (authCallback) {
        authCallback('SIGNED_OUT', null);
      }
    });

    expect(result.current.user).toBeNull();
    expect(result.current.role).toBeNull();
  });

  it('should have refetch function', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

    const { result } = renderHook(() => useUser());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(typeof result.current.refetch).toBe('function');
  });
});
