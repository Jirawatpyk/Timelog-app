/**
 * Team Dashboard Tests - Story 6.1
 *
 * Tests for TeamDashboard component
 * AC2: Dashboard layout structure
 * AC3: Managed departments display
 * AC8: Empty state when no members
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TeamDashboard } from './TeamDashboard';
import type { ManagerDepartment, TeamMember } from '@/types/team';

// Mock date-fns
vi.mock('date-fns', () => ({
  format: vi.fn((date, formatStr) => 'Friday, January 3, 2026'),
}));

const mockDepartments: ManagerDepartment[] = [
  { id: 'dept-1', name: 'Engineering' },
  { id: 'dept-2', name: 'Marketing' },
];

const mockMembers: TeamMember[] = [
  {
    id: '1',
    email: 'john@example.com',
    displayName: 'John Doe',
    departmentId: 'dept-1',
    departmentName: 'Engineering',
    role: 'staff',
  },
  {
    id: '2',
    email: 'jane@example.com',
    displayName: 'Jane Smith',
    departmentId: 'dept-2',
    departmentName: 'Marketing',
    role: 'manager',
  },
];

describe('TeamDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders Team Dashboard title', () => {
    render(<TeamDashboard departments={mockDepartments} members={mockMembers} />);

    expect(screen.getByText('Team Dashboard')).toBeInTheDocument();
  });

  it('renders formatted today date', () => {
    render(<TeamDashboard departments={mockDepartments} members={mockMembers} />);

    expect(screen.getByText('Friday, January 3, 2026')).toBeInTheDocument();
  });

  it('renders department names', () => {
    render(<TeamDashboard departments={mockDepartments} members={mockMembers} />);

    expect(screen.getByText('Engineering, Marketing')).toBeInTheDocument();
  });

  it('does not render department names when empty', () => {
    render(<TeamDashboard departments={[]} members={mockMembers} />);

    expect(screen.queryByText('Engineering, Marketing')).not.toBeInTheDocument();
  });

  it('renders TeamStatsCard with member count', () => {
    render(<TeamDashboard departments={mockDepartments} members={mockMembers} />);

    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('team members')).toBeInTheDocument();
  });

  it('renders TeamMembersList', () => {
    render(<TeamDashboard departments={mockDepartments} members={mockMembers} />);

    expect(screen.getByText('Logged Today')).toBeInTheDocument();
    expect(screen.getByText('Not Logged Yet')).toBeInTheDocument();
  });

  it('shows empty state when no members', () => {
    render(<TeamDashboard departments={mockDepartments} members={[]} />);

    expect(screen.getByText('No Team Members')).toBeInTheDocument();
    expect(screen.queryByText('Team Dashboard')).not.toBeInTheDocument();
  });

  it('renders member names in the list', () => {
    render(<TeamDashboard departments={mockDepartments} members={mockMembers} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('handles single department', () => {
    render(
      <TeamDashboard
        departments={[{ id: 'dept-1', name: 'Engineering' }]}
        members={mockMembers}
      />
    );

    expect(screen.getByText('Engineering')).toBeInTheDocument();
  });

  it('uses gap-4 layout', () => {
    const { container } = render(
      <TeamDashboard departments={mockDepartments} members={mockMembers} />
    );

    const layout = container.querySelector('[class*="gap-4"]');
    expect(layout).toBeInTheDocument();
  });
});
