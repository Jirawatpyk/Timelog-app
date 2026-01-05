/**
 * DashboardRefreshWrapper Tests - Story 8.5
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DashboardRefreshWrapper } from './DashboardRefreshWrapper';

// Mock next/navigation
const mockRefresh = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: mockRefresh,
  }),
}));

// Mock PullToRefresh to test the wrapper behavior
vi.mock('@/components/shared/PullToRefresh', () => ({
  PullToRefresh: ({
    children,
    onRefresh,
    isLoading,
  }: {
    children: React.ReactNode;
    onRefresh: () => Promise<void>;
    isLoading: boolean;
  }) => (
    <div data-testid="pull-to-refresh" data-loading={isLoading}>
      <button onClick={() => onRefresh()}>Refresh</button>
      {children}
    </div>
  ),
}));

describe('DashboardRefreshWrapper', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders children', () => {
    render(
      <DashboardRefreshWrapper>
        <div data-testid="dashboard-content">Dashboard Content</div>
      </DashboardRefreshWrapper>
    );

    expect(screen.getByTestId('dashboard-content')).toHaveTextContent('Dashboard Content');
  });

  it('wraps content with PullToRefresh', () => {
    render(
      <DashboardRefreshWrapper>
        <div>Content</div>
      </DashboardRefreshWrapper>
    );

    expect(screen.getByTestId('pull-to-refresh')).toBeInTheDocument();
  });

  it('calls router.refresh when onRefresh is triggered', async () => {
    const userEvent = (await import('@testing-library/user-event')).default;
    const user = userEvent.setup();

    render(
      <DashboardRefreshWrapper>
        <div>Content</div>
      </DashboardRefreshWrapper>
    );

    // Trigger refresh via the mocked button
    await user.click(screen.getByText('Refresh'));

    // Wait for async operation
    await vi.waitFor(() => {
      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  it('initially shows isLoading as false', () => {
    render(
      <DashboardRefreshWrapper>
        <div>Content</div>
      </DashboardRefreshWrapper>
    );

    expect(screen.getByTestId('pull-to-refresh')).toHaveAttribute('data-loading', 'false');
  });
});
