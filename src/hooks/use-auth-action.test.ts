/**
 * Unit tests for useAuthAction hook
 * Story 2.4: Session Timeout Handling (AC: 4)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock sonner
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
  },
}));

import { useAuthAction, handleAuthError } from './use-auth-action';
import { toast } from 'sonner';

describe('useAuthAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('handleResult', () => {
    it('should return data on success', () => {
      const { result } = renderHook(() => useAuthAction());

      const actionResult = { success: true as const, data: { id: '123' } };
      const data = result.current.handleResult(actionResult);

      expect(data).toEqual({ id: '123' });
      expect(toast.error).not.toHaveBeenCalled();
      expect(mockPush).not.toHaveBeenCalled();
    });

    it('should redirect on auth error', () => {
      const { result } = renderHook(() => useAuthAction());

      const actionResult = {
        success: false as const,
        error: 'Session expired',
        authError: true as const,
      };

      act(() => {
        const data = result.current.handleResult(actionResult);
        expect(data).toBeNull();
      });

      expect(toast.error).toHaveBeenCalledWith('Session Expired', {
        description: 'Please login again.',
      });
      expect(mockPush).toHaveBeenCalledWith('/login?expired=true');
    });

    it('should show error toast on non-auth error', () => {
      const { result } = renderHook(() => useAuthAction());

      const actionResult = {
        success: false as const,
        error: 'Validation failed',
      };

      act(() => {
        const data = result.current.handleResult(actionResult);
        expect(data).toBeNull();
      });

      expect(toast.error).toHaveBeenCalledWith('Validation failed');
      expect(mockPush).not.toHaveBeenCalled();
    });

    it('should use custom error message when provided', () => {
      const { result } = renderHook(() => useAuthAction());

      const actionResult = {
        success: false as const,
        error: 'Technical error',
      };

      act(() => {
        result.current.handleResult(actionResult, {
          errorMessage: 'Something went wrong',
        });
      });

      expect(toast.error).toHaveBeenCalledWith('Something went wrong');
    });

    it('should not show toast when showErrorToast is false', () => {
      const { result } = renderHook(() => useAuthAction());

      const actionResult = {
        success: false as const,
        error: 'Validation failed',
      };

      act(() => {
        result.current.handleResult(actionResult, {
          showErrorToast: false,
        });
      });

      expect(toast.error).not.toHaveBeenCalled();
    });

    it('should still redirect on auth error even when showErrorToast is false', () => {
      const { result } = renderHook(() => useAuthAction());

      const actionResult = {
        success: false as const,
        error: 'Session expired',
        authError: true as const,
      };

      act(() => {
        result.current.handleResult(actionResult, {
          showErrorToast: false,
        });
      });

      // Auth errors always show toast and redirect
      expect(toast.error).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalled();
    });
  });
});

describe('handleAuthError', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return true and redirect on auth error', () => {
    const mockRouter = { push: mockPush };
    const actionResult = {
      success: false as const,
      error: 'Session expired',
      authError: true as const,
    };

    const result = handleAuthError(actionResult, mockRouter as ReturnType<typeof import('next/navigation').useRouter>);

    expect(result).toBe(true);
    expect(toast.error).toHaveBeenCalledWith('Session Expired', {
      description: 'Please login again.',
    });
    expect(mockPush).toHaveBeenCalledWith('/login?expired=true');
  });

  it('should return false on non-auth error', () => {
    const mockRouter = { push: mockPush };
    const actionResult = {
      success: false as const,
      error: 'Validation failed',
    };

    const result = handleAuthError(actionResult, mockRouter as ReturnType<typeof import('next/navigation').useRouter>);

    expect(result).toBe(false);
    expect(toast.error).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('should return false on success result', () => {
    const mockRouter = { push: mockPush };
    const actionResult = {
      success: true as const,
      data: { id: '123' },
    };

    const result = handleAuthError(actionResult, mockRouter as ReturnType<typeof import('next/navigation').useRouter>);

    expect(result).toBe(false);
    expect(mockPush).not.toHaveBeenCalled();
  });
});
