/**
 * Unit tests for RoleBadge component
 * Story 4.12: Desktop Header Enhancement (AC 4)
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RoleBadge } from './role-badge';

describe('RoleBadge', () => {
  describe('Role display', () => {
    it('should display "Staff" for staff role', () => {
      render(<RoleBadge role="staff" />);
      expect(screen.getByText('Staff')).toBeInTheDocument();
    });

    it('should display "Manager" for manager role', () => {
      render(<RoleBadge role="manager" />);
      expect(screen.getByText('Manager')).toBeInTheDocument();
    });

    it('should display "Admin" for admin role', () => {
      render(<RoleBadge role="admin" />);
      expect(screen.getByText('Admin')).toBeInTheDocument();
    });

    it('should display "Super Admin" for super_admin role', () => {
      render(<RoleBadge role="super_admin" />);
      expect(screen.getByText('Super Admin')).toBeInTheDocument();
    });
  });

  describe('Role-specific styling (AC 4)', () => {
    it('should have neutral/slate styling for staff role', () => {
      render(<RoleBadge role="staff" />);
      const badge = screen.getByText('Staff');
      expect(badge).toHaveClass('bg-slate-100');
      expect(badge).toHaveClass('text-slate-700');
    });

    it('should have blue styling for manager role', () => {
      render(<RoleBadge role="manager" />);
      const badge = screen.getByText('Manager');
      expect(badge).toHaveClass('bg-blue-100');
      expect(badge).toHaveClass('text-blue-700');
    });

    it('should have purple styling for admin role', () => {
      render(<RoleBadge role="admin" />);
      const badge = screen.getByText('Admin');
      expect(badge).toHaveClass('bg-purple-100');
      expect(badge).toHaveClass('text-purple-700');
    });

    it('should have amber/gold styling for super_admin role', () => {
      render(<RoleBadge role="super_admin" />);
      const badge = screen.getByText('Super Admin');
      expect(badge).toHaveClass('bg-amber-100');
      expect(badge).toHaveClass('text-amber-700');
    });
  });

  describe('Accessibility', () => {
    it('should render as inline element', () => {
      render(<RoleBadge role="staff" />);
      const badge = screen.getByText('Staff');
      expect(badge).toHaveClass('inline-flex');
    });
  });

  describe('Custom className', () => {
    it('should accept and apply custom className', () => {
      render(<RoleBadge role="staff" className="custom-class" />);
      const badge = screen.getByText('Staff');
      expect(badge).toHaveClass('custom-class');
    });
  });
});
