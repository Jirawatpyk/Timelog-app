import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from './StatusBadge';

describe('StatusBadge', () => {
  it('renders Active badge when isActive is true', () => {
    render(<StatusBadge isActive={true} />);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('renders Inactive badge when isActive is false', () => {
    render(<StatusBadge isActive={false} />);
    expect(screen.getByText('Inactive')).toBeInTheDocument();
  });

  it('applies green styling for active status', () => {
    render(<StatusBadge isActive={true} />);
    const badge = screen.getByText('Active');
    expect(badge).toHaveClass('bg-green-100', 'text-green-800');
  });

  it('applies gray styling for inactive status', () => {
    render(<StatusBadge isActive={false} />);
    const badge = screen.getByText('Inactive');
    expect(badge).toHaveClass('bg-gray-100', 'text-gray-500');
  });

  it('has correct aria-label for active status', () => {
    render(<StatusBadge isActive={true} />);
    expect(screen.getByLabelText('Status: Active')).toBeInTheDocument();
  });

  it('has correct aria-label for inactive status', () => {
    render(<StatusBadge isActive={false} />);
    expect(screen.getByLabelText('Status: Inactive')).toBeInTheDocument();
  });
});
