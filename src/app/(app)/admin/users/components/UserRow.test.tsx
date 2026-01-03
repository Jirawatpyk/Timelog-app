import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { UserRow } from './UserRow';
import type { UserListItem } from '@/types/domain';

// Wrap component in table for valid HTML
const renderUserRow = (user: UserListItem) => {
  return render(
    <table>
      <tbody>
        <UserRow user={user} />
      </tbody>
    </table>
  );
};

describe('UserRow', () => {
  const mockUser: UserListItem = {
    id: 'user-1',
    email: 'alice@example.com',
    displayName: 'Alice Smith',
    role: 'staff',
    department: { id: 'dept-1', name: 'Engineering' },
    isActive: true,
  };

  it('renders user display name', () => {
    renderUserRow(mockUser);
    expect(screen.getByText('Alice Smith')).toBeInTheDocument();
  });

  it('renders user email', () => {
    renderUserRow(mockUser);
    expect(screen.getByText('alice@example.com')).toBeInTheDocument();
  });

  it('renders role badge', () => {
    renderUserRow(mockUser);
    expect(screen.getByText('Staff')).toBeInTheDocument();
  });

  it('renders department name', () => {
    renderUserRow(mockUser);
    expect(screen.getByText('Engineering')).toBeInTheDocument();
  });

  it('renders active status badge', () => {
    renderUserRow(mockUser);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('uses email prefix when displayName is null', () => {
    const userWithoutName: UserListItem = {
      ...mockUser,
      displayName: null,
    };
    renderUserRow(userWithoutName);
    expect(screen.getByText('alice')).toBeInTheDocument();
  });

  it('shows dash when department is null', () => {
    const userWithoutDept: UserListItem = {
      ...mockUser,
      department: null,
    };
    renderUserRow(userWithoutDept);
    expect(screen.getByText('-')).toBeInTheDocument();
  });

  it('renders inactive status badge', () => {
    const inactiveUser: UserListItem = {
      ...mockUser,
      isActive: false,
    };
    renderUserRow(inactiveUser);
    expect(screen.getByText('Inactive')).toBeInTheDocument();
  });

  it('renders manager role badge with correct styling', () => {
    const managerUser: UserListItem = {
      ...mockUser,
      role: 'manager',
    };
    renderUserRow(managerUser);
    expect(screen.getByText('Manager')).toBeInTheDocument();
  });

  it('renders admin role badge', () => {
    const adminUser: UserListItem = {
      ...mockUser,
      role: 'admin',
    };
    renderUserRow(adminUser);
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('renders super_admin role badge', () => {
    const superAdminUser: UserListItem = {
      ...mockUser,
      role: 'super_admin',
    };
    renderUserRow(superAdminUser);
    expect(screen.getByText('Super Admin')).toBeInTheDocument();
  });
});
