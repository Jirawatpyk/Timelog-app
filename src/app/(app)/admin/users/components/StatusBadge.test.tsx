import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from './StatusBadge';

describe('StatusBadge', () => {
  describe('renders correct labels', () => {
    it('renders Pending badge for pending status', () => {
      render(<StatusBadge status="pending" />);
      expect(screen.getByText('Pending')).toBeInTheDocument();
    });

    it('renders Active badge for active status', () => {
      render(<StatusBadge status="active" />);
      expect(screen.getByText('Active')).toBeInTheDocument();
    });

    it('renders Inactive badge for inactive status', () => {
      render(<StatusBadge status="inactive" />);
      expect(screen.getByText('Inactive')).toBeInTheDocument();
    });
  });

  describe('applies correct colors', () => {
    it('applies yellow styling for pending status', () => {
      render(<StatusBadge status="pending" />);
      const badge = screen.getByText('Pending');
      expect(badge).toHaveClass('bg-yellow-100', 'text-yellow-800');
    });

    it('applies green styling for active status', () => {
      render(<StatusBadge status="active" />);
      const badge = screen.getByText('Active');
      expect(badge).toHaveClass('bg-green-100', 'text-green-800');
    });

    it('applies red styling for inactive status', () => {
      render(<StatusBadge status="inactive" />);
      const badge = screen.getByText('Inactive');
      expect(badge).toHaveClass('bg-red-100', 'text-red-600');
    });
  });

  describe('accessibility', () => {
    it('has correct aria-label for pending status', () => {
      render(<StatusBadge status="pending" />);
      expect(screen.getByLabelText('Status: Pending invitation')).toBeInTheDocument();
    });

    it('has correct aria-label for active status', () => {
      render(<StatusBadge status="active" />);
      expect(screen.getByLabelText('Status: Active')).toBeInTheDocument();
    });

    it('has correct aria-label for inactive status', () => {
      render(<StatusBadge status="inactive" />);
      expect(screen.getByLabelText('Status: Inactive')).toBeInTheDocument();
    });
  });
});
