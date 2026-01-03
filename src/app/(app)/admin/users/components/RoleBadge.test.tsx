import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RoleBadge } from './RoleBadge';

describe('RoleBadge', () => {
  it('renders Staff badge with correct label', () => {
    render(<RoleBadge role="staff" />);
    expect(screen.getByText('Staff')).toBeInTheDocument();
  });

  it('renders Manager badge with correct label', () => {
    render(<RoleBadge role="manager" />);
    expect(screen.getByText('Manager')).toBeInTheDocument();
  });

  it('renders Admin badge with correct label', () => {
    render(<RoleBadge role="admin" />);
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('renders Super Admin badge with correct label', () => {
    render(<RoleBadge role="super_admin" />);
    expect(screen.getByText('Super Admin')).toBeInTheDocument();
  });

  it('has correct aria-label for accessibility', () => {
    render(<RoleBadge role="manager" />);
    expect(screen.getByLabelText('Role: Manager')).toBeInTheDocument();
  });

  it('applies gray styling for staff role', () => {
    render(<RoleBadge role="staff" />);
    const badge = screen.getByText('Staff');
    expect(badge).toHaveClass('bg-gray-100', 'text-gray-800');
  });

  it('applies blue styling for manager role', () => {
    render(<RoleBadge role="manager" />);
    const badge = screen.getByText('Manager');
    expect(badge).toHaveClass('bg-blue-100', 'text-blue-800');
  });

  it('applies purple styling for admin role', () => {
    render(<RoleBadge role="admin" />);
    const badge = screen.getByText('Admin');
    expect(badge).toHaveClass('bg-purple-100', 'text-purple-800');
  });

  it('applies red styling for super_admin role', () => {
    render(<RoleBadge role="super_admin" />);
    const badge = screen.getByText('Super Admin');
    expect(badge).toHaveClass('bg-red-100', 'text-red-800');
  });
});
