import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ActiveFilters } from './ActiveFilters';
import type { DepartmentOption, UserFilters } from '@/types/domain';

/**
 * Tests for ActiveFilters component
 * Story 7.7: Filter Users (AC 6)
 */
describe('ActiveFilters', () => {
  const mockDepartments: DepartmentOption[] = [
    { id: 'dept-1', name: 'Audio Production' },
    { id: 'dept-2', name: 'Video Editing' },
  ];

  const defaultProps = {
    filters: {} as UserFilters,
    departments: mockDepartments,
    onRemove: vi.fn(),
    onClearAll: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders nothing when no filters are active', () => {
      const { container } = render(<ActiveFilters {...defaultProps} />);
      expect(container.firstChild).toBeNull();
    });

    it('renders department filter chip', () => {
      render(
        <ActiveFilters
          {...defaultProps}
          filters={{ departmentId: 'dept-1' }}
        />
      );
      expect(screen.getByText('Department: Audio Production')).toBeInTheDocument();
    });

    it('renders role filter chip with label', () => {
      render(
        <ActiveFilters
          {...defaultProps}
          filters={{ role: 'manager' }}
        />
      );
      expect(screen.getByText('Role: Manager')).toBeInTheDocument();
    });

    it('renders status filter chip', () => {
      render(
        <ActiveFilters
          {...defaultProps}
          filters={{ status: 'pending' }}
        />
      );
      expect(screen.getByText('Status: Pending')).toBeInTheDocument();
    });

    it('renders search filter chip with quoted value', () => {
      render(
        <ActiveFilters
          {...defaultProps}
          filters={{ search: 'john' }}
        />
      );
      expect(screen.getByText('Search: "john"')).toBeInTheDocument();
    });

    it('renders multiple filter chips', () => {
      render(
        <ActiveFilters
          {...defaultProps}
          filters={{
            departmentId: 'dept-2',
            role: 'admin',
            status: 'active',
          }}
        />
      );
      expect(screen.getByText('Department: Video Editing')).toBeInTheDocument();
      expect(screen.getByText('Role: Admin')).toBeInTheDocument();
      expect(screen.getByText('Status: Active')).toBeInTheDocument();
    });

    it('renders "Clear All" button when multiple filters active', () => {
      render(
        <ActiveFilters
          {...defaultProps}
          filters={{ role: 'staff', status: 'active' }}
        />
      );
      expect(screen.getByRole('button', { name: /clear all/i })).toBeInTheDocument();
    });

    it('does not render "Clear All" button with single filter', () => {
      render(
        <ActiveFilters
          {...defaultProps}
          filters={{ role: 'staff' }}
        />
      );
      expect(screen.queryByRole('button', { name: /clear all/i })).not.toBeInTheDocument();
    });
  });

  describe('remove individual filter', () => {
    it('calls onRemove with "dept" when department chip is removed', () => {
      const onRemove = vi.fn();
      render(
        <ActiveFilters
          {...defaultProps}
          filters={{ departmentId: 'dept-1' }}
          onRemove={onRemove}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /remove department/i }));
      expect(onRemove).toHaveBeenCalledWith('dept');
    });

    it('calls onRemove with "role" when role chip is removed', () => {
      const onRemove = vi.fn();
      render(
        <ActiveFilters
          {...defaultProps}
          filters={{ role: 'manager' }}
          onRemove={onRemove}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /remove role/i }));
      expect(onRemove).toHaveBeenCalledWith('role');
    });

    it('calls onRemove with "status" when status chip is removed', () => {
      const onRemove = vi.fn();
      render(
        <ActiveFilters
          {...defaultProps}
          filters={{ status: 'inactive' }}
          onRemove={onRemove}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /remove status/i }));
      expect(onRemove).toHaveBeenCalledWith('status');
    });

    it('calls onRemove with "q" when search chip is removed', () => {
      const onRemove = vi.fn();
      render(
        <ActiveFilters
          {...defaultProps}
          filters={{ search: 'test' }}
          onRemove={onRemove}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /remove search/i }));
      expect(onRemove).toHaveBeenCalledWith('q');
    });
  });

  describe('clear all filters', () => {
    it('calls onClearAll when "Clear All" button is clicked', () => {
      const onClearAll = vi.fn();
      render(
        <ActiveFilters
          {...defaultProps}
          filters={{ role: 'staff', status: 'active' }}
          onClearAll={onClearAll}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /clear all/i }));
      expect(onClearAll).toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    it('has region role with aria-label', () => {
      render(
        <ActiveFilters
          {...defaultProps}
          filters={{ role: 'staff' }}
        />
      );
      expect(screen.getByRole('region', { name: /active filters/i })).toBeInTheDocument();
    });

    it('remove buttons have aria-labels', () => {
      render(
        <ActiveFilters
          {...defaultProps}
          filters={{ role: 'manager' }}
        />
      );
      expect(screen.getByRole('button', { name: /remove role: manager filter/i })).toBeInTheDocument();
    });
  });

  describe('unknown department', () => {
    it('displays "Unknown" for unrecognized department ID', () => {
      render(
        <ActiveFilters
          {...defaultProps}
          filters={{ departmentId: 'unknown-dept' }}
        />
      );
      expect(screen.getByText('Department: Unknown')).toBeInTheDocument();
    });
  });
});
