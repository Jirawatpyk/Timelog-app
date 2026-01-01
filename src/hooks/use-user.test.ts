/**
 * Unit tests for use-user hook
 * Story 2.2: Session Persistence & Logout (AC: 3)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useUser } from './use-user';

// Mock the Supabase client
const mockGetSession = vi.fn();
const mockSelect = vi.fn();
const mockEq = vi.fn();
const mockSingle = vi.fn();
const mockOnAuthStateChange = vi.fn();
const mockUnsubscribe = vi.fn();

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getSession: mockGetSession,
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
    mockGetSession.mockResolvedValue({ data: { session: null }, error: null });
    mockSingle.mockResolvedValue({ data: null, error: null });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return loading state initially', async () => {
    mockOnAuthStateChange.mockImplementation((callback) => {
      // Simulate INITIAL_SESSION event immediately
      Promise.resolve().then(() => callback('INITIAL_SESSION', null));
      return { data: { subscription: { unsubscribe: mockUnsubscribe } } };
    });

    const { result } = renderHook(() => useUser());

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('should return null user when not authenticated', async () => {
    mockOnAuthStateChange.mockImplementation((callback) => {
      Promise.resolve().then(() => callback('INITIAL_SESSION', null));
      return { data: { subscription: { unsubscribe: mockUnsubscribe } } };
    });

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

    mockSingle.mockResolvedValue({
      data: { role: 'staff', display_name: 'Test User' },
      error: null,
    });

    mockOnAuthStateChange.mockImplementation((callback) => {
      Promise.resolve().then(() => callback('INITIAL_SESSION', { user: mockUser }));
      return { data: { subscription: { unsubscribe: mockUnsubscribe } } };
    });

    const { result } = renderHook(() => useUser());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await waitFor(() => {
      expect(result.current.role).toBe('staff');
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.displayName).toBe('Test User');
    expect(result.current.error).toBeNull();
  });

  it('should return manager role correctly', async () => {
    const mockUser = {
      id: 'manager-id',
      email: 'manager@example.com',
    };

    mockSingle.mockResolvedValue({
      data: { role: 'manager', display_name: 'Test Manager' },
      error: null,
    });

    mockOnAuthStateChange.mockImplementation((callback) => {
      Promise.resolve().then(() => callback('INITIAL_SESSION', { user: mockUser }));
      return { data: { subscription: { unsubscribe: mockUnsubscribe } } };
    });

    const { result } = renderHook(() => useUser());

    await waitFor(() => {
      expect(result.current.role).toBe('manager');
    });
  });

  it('should handle user without profile', async () => {
    const mockUser = {
      id: 'new-user-id',
      email: 'new@example.com',
    };

    mockSingle.mockResolvedValue({
      data: null,
      error: { message: 'Profile not found' },
    });

    mockOnAuthStateChange.mockImplementation((callback) => {
      Promise.resolve().then(() => callback('INITIAL_SESSION', { user: mockUser }));
      return { data: { subscription: { unsubscribe: mockUnsubscribe } } };
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
    mockOnAuthStateChange.mockImplementation((callback) => {
      Promise.resolve().then(() => callback('INITIAL_SESSION', null));
      return { data: { subscription: { unsubscribe: mockUnsubscribe } } };
    });

    renderHook(() => useUser());

    await waitFor(() => {
      expect(mockOnAuthStateChange).toHaveBeenCalled();
    });
  });

  it('should unsubscribe on unmount', async () => {
    mockOnAuthStateChange.mockImplementation((callback) => {
      Promise.resolve().then(() => callback('INITIAL_SESSION', null));
      return { data: { subscription: { unsubscribe: mockUnsubscribe } } };
    });

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

    mockSingle.mockResolvedValue({
      data: { role: 'staff', display_name: 'Test User' },
      error: null,
    });

    let authCallback: ((event: string, session: unknown) => void) | null = null;
    mockOnAuthStateChange.mockImplementation((callback) => {
      authCallback = callback;
      // First, trigger INITIAL_SESSION with user
      Promise.resolve().then(() => callback('INITIAL_SESSION', { user: mockUser }));
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
    mockOnAuthStateChange.mockImplementation((callback) => {
      Promise.resolve().then(() => callback('INITIAL_SESSION', null));
      return { data: { subscription: { unsubscribe: mockUnsubscribe } } };
    });

    const { result } = renderHook(() => useUser());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(typeof result.current.refetch).toBe('function');
  });

  it('should refetch user data when refetch is called', async () => {
    const mockUser = {
      id: 'test-user-id',
      email: 'test@example.com',
    };

    mockGetSession.mockResolvedValue({
      data: { session: { user: mockUser } },
      error: null,
    });

    mockSingle.mockResolvedValue({
      data: { role: 'admin', display_name: 'Test Admin' },
      error: null,
    });

    mockOnAuthStateChange.mockImplementation((callback) => {
      Promise.resolve().then(() => callback('INITIAL_SESSION', null));
      return { data: { subscription: { unsubscribe: mockUnsubscribe } } };
    });

    const { result } = renderHook(() => useUser());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Call refetch
    await act(async () => {
      await result.current.refetch();
    });

    await waitFor(() => {
      expect(result.current.role).toBe('admin');
    });

    expect(mockGetSession).toHaveBeenCalled();
  });
});
