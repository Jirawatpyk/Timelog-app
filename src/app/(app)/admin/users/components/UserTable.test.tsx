import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { UserTable } from './UserTable';
import type { UserListItem } from '@/types/domain';

const mockUsers: UserListItem[] = [
  {
    id: 'user-1',
    email: 'alice@example.com',
    displayName: 'Alice Smith',
    role: 'staff',
    department: { id: 'dept-1', name: 'Engineering' },
    isActive: true,
  },
  {
    id: 'user-2',
    email: 'bob@example.com',
    displayName: 'Bob Jones',
    role: 'manager',
    department: { id: 'dept-2', name: 'Marketing' },
    isActive: true,
  },
  {
    id: 'user-3',
    email: 'carol@example.com',
    displayName: null,
    role: 'admin',
    department: null,
    isActive: false,
  },
];

describe('UserTable', () => {
  it('renders table headers', () => {
    render(<UserTable users={mockUsers} />);

    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Role')).toBeInTheDocument();
    expect(screen.getByText('Department')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
  });

  it('renders user data correctly', () => {
    render(<UserTable users={mockUsers} />);

    // Both desktop table and mobile cards are rendered (responsive design)
    // Use getAllByText since elements appear twice
    expect(screen.getAllByText('Alice Smith')).toHaveLength(2);
    expect(screen.getAllByText('alice@example.com')).toHaveLength(2);
    expect(screen.getAllByText('Engineering')).toHaveLength(2);
  });

  it('renders role badges for all users', () => {
    render(<UserTable users={mockUsers} />);

    // Each role appears twice (desktop + mobile)
    expect(screen.getAllByText('Staff')).toHaveLength(2);
    expect(screen.getAllByText('Manager')).toHaveLength(2);
    expect(screen.getAllByText('Admin')).toHaveLength(2);
  });

  it('renders status badges correctly', () => {
    render(<UserTable users={mockUsers} />);

    // Active badges: Alice + Bob = 2 users × 2 views = 4
    // Inactive badges: Carol = 1 user × 2 views = 2
    const activeBadges = screen.getAllByText('Active');
    const inactiveBadges = screen.getAllByText('Inactive');

    expect(activeBadges).toHaveLength(4);
    expect(inactiveBadges).toHaveLength(2);
  });

  it('uses email prefix when displayName is null', () => {
    render(<UserTable users={mockUsers} />);

    // Carol has null displayName, should show 'carol' from email
    // Appears in both desktop and mobile views
    expect(screen.getAllByText('carol')).toHaveLength(2);
  });

  it('shows dash for null department', () => {
    render(<UserTable users={mockUsers} />);

    // Carol has null department - only shown in desktop table view
    // Mobile view doesn't show dash for null department
    expect(screen.getByText('-')).toBeInTheDocument();
  });

  it('renders empty state when users array is empty', () => {
    render(<UserTable users={[]} />);

    expect(screen.getByText('No users found')).toBeInTheDocument();
  });

  it('does not render table when empty', () => {
    render(<UserTable users={[]} />);

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });
});
