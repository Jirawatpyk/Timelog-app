/**
 * Unit tests for AuthStateListener component
 * Story 2.4: Session Timeout Handling (AC: 5)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, act } from '@testing-library/react';

// Store the callback to call it in tests
let authStateCallback: ((event: string, session: unknown) => void) | null =
  null;

// Mock @/lib/supabase/client
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      onAuthStateChange: vi.fn((callback) => {
        authStateCallback = callback;
        return {
          data: {
            subscription: {
              unsubscribe: vi.fn(),
            },
          },
        };
      }),
    },
  }),
}));

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
    info: vi.fn(),
  },
}));

import { AuthStateListener } from './auth-state-listener';
import { toast } from 'sonner';

describe('AuthStateListener', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authStateCallback = null;
  });

  it('should render children', () => {
    const { getByText } = render(
      <AuthStateListener>
        <div>Test Child</div>
      </AuthStateListener>
    );

    expect(getByText('Test Child')).toBeInTheDocument();
  });

  it('should set up auth state listener on mount', () => {
    render(
      <AuthStateListener>
        <div>Test</div>
      </AuthStateListener>
    );

    expect(authStateCallback).toBeDefined();
  });

  it('should redirect and show toast on SIGNED_OUT event', () => {
    render(
      <AuthStateListener>
        <div>Test</div>
      </AuthStateListener>
    );

    // Simulate SIGNED_OUT event
    act(() => {
      if (authStateCallback) {
        authStateCallback('SIGNED_OUT', null);
      }
    });

    expect(toast.info).toHaveBeenCalledWith('Signed Out', {
      description: 'You have been signed out.',
    });
    expect(mockPush).toHaveBeenCalledWith('/login');
  });

  it('should redirect on TOKEN_REFRESHED with no session', () => {
    render(
      <AuthStateListener>
        <div>Test</div>
      </AuthStateListener>
    );

    // Simulate TOKEN_REFRESHED with no session (refresh failed)
    act(() => {
      if (authStateCallback) {
        authStateCallback('TOKEN_REFRESHED', null);
      }
    });

    expect(toast.info).toHaveBeenCalledWith('Session Expired', {
      description: 'Please login again.',
    });
    expect(mockPush).toHaveBeenCalledWith('/login?expired=true');
  });

  it('should not redirect on TOKEN_REFRESHED with valid session', () => {
    render(
      <AuthStateListener>
        <div>Test</div>
      </AuthStateListener>
    );

    // Simulate TOKEN_REFRESHED with valid session
    act(() => {
      if (authStateCallback) {
        authStateCallback('TOKEN_REFRESHED', { access_token: 'valid' });
      }
    });

    expect(mockPush).not.toHaveBeenCalled();
  });

  it('should not redirect multiple times on repeated SIGNED_OUT events', () => {
    render(
      <AuthStateListener>
        <div>Test</div>
      </AuthStateListener>
    );

    // Simulate multiple SIGNED_OUT events
    act(() => {
      if (authStateCallback) {
        authStateCallback('SIGNED_OUT', null);
        authStateCallback('SIGNED_OUT', null);
        authStateCallback('SIGNED_OUT', null);
      }
    });

    // Should only redirect once
    expect(mockPush).toHaveBeenCalledTimes(1);
  });
});
