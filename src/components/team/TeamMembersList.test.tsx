/**
 * Team Members List Tests - Story 6.1
 *
 * Tests for TeamMembersList component
 * AC2: Team members list section
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TeamMembersList } from './TeamMembersList';
import type { TeamMember } from '@/types/team';

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
    departmentId: 'dept-1',
    departmentName: 'Engineering',
    role: 'manager',
  },
];

describe('TeamMembersList', () => {
  it('renders Logged Today section', () => {
    render(<TeamMembersList members={mockMembers} />);

    expect(screen.getByText('Logged Today')).toBeInTheDocument();
  });

  it('renders Not Logged Yet section', () => {
    render(<TeamMembersList members={mockMembers} />);

    expect(screen.getByText('Not Logged Yet')).toBeInTheDocument();
  });

  it('shows placeholder message for logged section', () => {
    render(<TeamMembersList members={mockMembers} />);

    expect(screen.getByText('Details will be added in Story 6.2')).toBeInTheDocument();
  });

  it('shows placeholder message for not logged section', () => {
    render(<TeamMembersList members={mockMembers} />);

    expect(screen.getByText('Details will be added in Story 6.3')).toBeInTheDocument();
  });

  it('displays first 5 member names', () => {
    render(<TeamMembersList members={mockMembers} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('shows "and X more" when more than 5 members', () => {
    const manyMembers: TeamMember[] = Array.from({ length: 10 }, (_, i) => ({
      id: `${i}`,
      email: `user${i}@example.com`,
      displayName: `User ${i}`,
      departmentId: 'dept-1',
      departmentName: 'Engineering',
      role: 'staff' as const,
    }));

    render(<TeamMembersList members={manyMembers} />);

    expect(screen.getByText('and 5 more...')).toBeInTheDocument();
  });

  it('does not show "and X more" when 5 or fewer members', () => {
    render(<TeamMembersList members={mockMembers} />);

    expect(screen.queryByText(/and \d+ more/)).not.toBeInTheDocument();
  });

  it('handles empty members array', () => {
    render(<TeamMembersList members={[]} />);

    expect(screen.queryByText(/User \d/)).not.toBeInTheDocument();
    expect(screen.queryByText(/and \d+ more/)).not.toBeInTheDocument();
  });
});
