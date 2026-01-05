/**
 * TeamDashboardClient Tests - Story 8.5
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TeamDashboardClient } from './TeamDashboardClient';
import type { TeamDashboardProps } from '@/components/team/TeamDashboard';

// Mock the team data hook
const mockRefresh = vi.fn();
vi.mock('@/app/(app)/team/components/TeamDataProvider', () => ({
  useTeamData: () => ({
    lastUpdated: new Date(),
    refresh: mockRefresh,
  }),
}));

// Mock PullToRefresh to test wrapper behavior
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

// Mock TeamDashboard
vi.mock('@/components/team/TeamDashboard', () => ({
  TeamDashboard: ({ lastUpdated }: TeamDashboardProps & { lastUpdated?: Date }) => (
    <div data-testid="team-dashboard">
      Team Dashboard {lastUpdated ? 'with lastUpdated' : 'without lastUpdated'}
    </div>
  ),
}));

const defaultProps: TeamDashboardProps = {
  departments: [],
  membersGrouped: { logged: [], notLogged: [] },
  period: 'today',
  stats: null,
  weeklyBreakdown: null,
  statsError: null,
  showDepartmentFilter: false,
  departmentFilter: 'all',
};

describe('TeamDashboardClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders TeamDashboard inside PullToRefresh', () => {
    render(<TeamDashboardClient {...defaultProps} />);

    expect(screen.getByTestId('pull-to-refresh')).toBeInTheDocument();
    expect(screen.getByTestId('team-dashboard')).toBeInTheDocument();
  });

  it('passes lastUpdated to TeamDashboard', () => {
    render(<TeamDashboardClient {...defaultProps} />);

    expect(screen.getByTestId('team-dashboard')).toHaveTextContent('with lastUpdated');
  });

  it('calls refresh when pull-to-refresh triggers', async () => {
    const userEvent = (await import('@testing-library/user-event')).default;
    const user = userEvent.setup();

    render(<TeamDashboardClient {...defaultProps} />);

    await user.click(screen.getByText('Refresh'));

    await vi.waitFor(() => {
      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  it('initially shows isLoading as false', () => {
    render(<TeamDashboardClient {...defaultProps} />);

    expect(screen.getByTestId('pull-to-refresh')).toHaveAttribute('data-loading', 'false');
  });
});
