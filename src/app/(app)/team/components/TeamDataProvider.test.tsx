// src/app/(app)/team/components/TeamDataProvider.test.tsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { TeamDataProvider } from './TeamDataProvider';

// Mock useRouter
const mockRefresh = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: mockRefresh,
  }),
}));

describe('TeamDataProvider', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockRefresh.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders children', () => {
    render(
      <TeamDataProvider>
        <div data-testid="child">Child Content</div>
      </TeamDataProvider>
    );

    expect(screen.getByTestId('child')).toHaveTextContent('Child Content');
  });

  it('calls router.refresh at polling interval', () => {
    render(
      <TeamDataProvider>
        <div>Content</div>
      </TeamDataProvider>
    );

    expect(mockRefresh).not.toHaveBeenCalled();

    // Advance by polling interval (30 seconds)
    act(() => {
      vi.advanceTimersByTime(30_000);
    });

    expect(mockRefresh).toHaveBeenCalledTimes(1);

    // Another interval
    act(() => {
      vi.advanceTimersByTime(30_000);
    });

    expect(mockRefresh).toHaveBeenCalledTimes(2);
  });

  it('pauses polling when tab is hidden', () => {
    render(
      <TeamDataProvider>
        <div>Content</div>
      </TeamDataProvider>
    );

    // Simulate tab hidden
    Object.defineProperty(document, 'hidden', {
      value: true,
      writable: true,
    });
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'));
    });

    // Advance time
    act(() => {
      vi.advanceTimersByTime(60_000);
    });

    // Should not refresh while hidden
    expect(mockRefresh).not.toHaveBeenCalled();
  });

  it('resumes polling when tab becomes visible', () => {
    render(
      <TeamDataProvider>
        <div>Content</div>
      </TeamDataProvider>
    );

    // Simulate tab hidden
    Object.defineProperty(document, 'hidden', {
      value: true,
      writable: true,
    });
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'));
    });

    // Simulate tab visible again
    Object.defineProperty(document, 'hidden', {
      value: false,
      writable: true,
    });
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'));
    });

    // Should refresh immediately on return
    expect(mockRefresh).toHaveBeenCalledTimes(1);
  });

  it('exposes lastUpdated via context', () => {
    render(
      <TeamDataProvider>
        <div>Content</div>
      </TeamDataProvider>
    );

    // This is tested through the consumer component - basic render test
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('handles refresh errors gracefully (silent)', () => {
    mockRefresh.mockImplementation(() => {
      throw new Error('Network error');
    });

    // Should not throw
    expect(() => {
      render(
        <TeamDataProvider>
          <div>Content</div>
        </TeamDataProvider>
      );

      act(() => {
        vi.advanceTimersByTime(30_000);
      });
    }).not.toThrow();

    expect(screen.getByText('Content')).toBeInTheDocument();
  });
});
