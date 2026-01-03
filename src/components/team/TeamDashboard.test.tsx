/**
 * Team Dashboard Tests - Stories 6.1, 6.4
 *
 * Tests for TeamDashboard component
 * AC2: Dashboard layout structure
 * AC3: Managed departments display
 * AC8: Empty state when no members
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TeamDashboard } from './TeamDashboard';
import type { DepartmentOption } from '@/types/domain';
import type { TeamMembersGrouped } from '@/types/team';

// Mock date-fns
vi.mock('date-fns', () => ({
  format: vi.fn(() => 'Friday, January 3, 2026'),
}));

// Mock next/navigation for TeamPeriodSelector
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: vi.fn(),
  }),
  useSearchParams: () => ({
    toString: () => '',
  }),
  usePathname: () => '/team',
}));

const mockDepartments: DepartmentOption[] = [
  { id: 'dept-1', name: 'Engineering' },
  { id: 'dept-2', name: 'Marketing' },
];

const mockMembersGrouped: TeamMembersGrouped = {
  logged: [
    {
      id: '1',
      email: 'john@example.com',
      displayName: 'John Doe',
      departmentId: 'dept-1',
      departmentName: 'Engineering',
      role: 'staff',
      totalHours: 8.5,
      entryCount: 3,
      hasLoggedToday: true,
      isComplete: true,
    },
  ],
  notLogged: [
    {
      id: '2',
      email: 'jane@example.com',
      displayName: 'Jane Smith',
      departmentId: 'dept-2',
      departmentName: 'Marketing',
      role: 'manager',
      totalHours: 0,
      entryCount: 0,
      hasLoggedToday: false,
      isComplete: false,
    },
  ],
};

describe('TeamDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders Team Dashboard title', () => {
    render(
      <TeamDashboard departments={mockDepartments} membersGrouped={mockMembersGrouped} />
    );

    expect(screen.getByText('Team Dashboard')).toBeInTheDocument();
  });

  it('renders formatted today date', () => {
    render(
      <TeamDashboard departments={mockDepartments} membersGrouped={mockMembersGrouped} />
    );

    expect(screen.getByText('Friday, January 3, 2026')).toBeInTheDocument();
  });

  it('renders department names', () => {
    render(
      <TeamDashboard departments={mockDepartments} membersGrouped={mockMembersGrouped} />
    );

    expect(screen.getByText('Engineering, Marketing')).toBeInTheDocument();
  });

  it('does not render department names when empty', () => {
    render(<TeamDashboard departments={[]} membersGrouped={mockMembersGrouped} />);

    expect(screen.queryByText('Engineering, Marketing')).not.toBeInTheDocument();
  });

  it('renders TeamStatsCard with member count', () => {
    render(
      <TeamDashboard departments={mockDepartments} membersGrouped={mockMembersGrouped} />
    );

    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('team members')).toBeInTheDocument();
  });

  it('renders LoggedMembersList with logged members', () => {
    render(
      <TeamDashboard departments={mockDepartments} membersGrouped={mockMembersGrouped} />
    );

    // "Logged Today" appears in both LoggedMembersList and placeholder card
    const loggedTodayElements = screen.getAllByText('Logged Today');
    expect(loggedTodayElements.length).toBeGreaterThan(0);
    expect(screen.getByText('(1 people)')).toBeInTheDocument();
  });

  it('shows empty state when no members', () => {
    render(
      <TeamDashboard
        departments={mockDepartments}
        membersGrouped={{ logged: [], notLogged: [] }}
      />
    );

    expect(screen.getByText('No Team Members')).toBeInTheDocument();
    expect(screen.queryByText('Team Dashboard')).not.toBeInTheDocument();
  });

  it('renders member names in the list', () => {
    render(
      <TeamDashboard departments={mockDepartments} membersGrouped={mockMembersGrouped} />
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('handles single department', () => {
    render(
      <TeamDashboard
        departments={[{ id: 'dept-1', name: 'Engineering' }]}
        membersGrouped={mockMembersGrouped}
      />
    );

    expect(screen.getByText('Engineering')).toBeInTheDocument();
  });

  it('uses gap-4 layout', () => {
    const { container } = render(
      <TeamDashboard departments={mockDepartments} membersGrouped={mockMembersGrouped} />
    );

    const layout = container.querySelector('[class*="gap-4"]');
    expect(layout).toBeInTheDocument();
  });

  it('shows error state when statsError is provided', () => {
    render(
      <TeamDashboard
        departments={mockDepartments}
        membersGrouped={mockMembersGrouped}
        statsError="Unable to load stats"
      />
    );

    expect(screen.getByText('Unable to load stats')).toBeInTheDocument();
    // TeamStatsCard should not render when there's an error
    expect(screen.queryByText('team members')).not.toBeInTheDocument();
  });

  it('shows TeamStatsCard when no statsError', () => {
    render(
      <TeamDashboard
        departments={mockDepartments}
        membersGrouped={mockMembersGrouped}
        statsError={null}
      />
    );

    expect(screen.getByText('team members')).toBeInTheDocument();
    expect(screen.queryByText('Unable to load stats')).not.toBeInTheDocument();
  });
});
