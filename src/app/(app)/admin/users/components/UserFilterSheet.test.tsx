import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { UserFilterSheet } from './UserFilterSheet';
import type { DepartmentOption, UserFilters } from '@/types/domain';

/**
 * Tests for UserFilterSheet component
 * Story 7.7: Filter Users (AC 1, 2, 3, 4)
 */
describe('UserFilterSheet', () => {
  const mockDepartments: DepartmentOption[] = [
    { id: 'dept-1', name: 'Audio Production' },
    { id: 'dept-2', name: 'Video Editing' },
  ];

  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    departments: mockDepartments,
    currentFilters: {} as UserFilters,
    onApply: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders sheet title', () => {
      render(<UserFilterSheet {...defaultProps} />);
      expect(screen.getByRole('heading', { name: /filter users/i })).toBeInTheDocument();
    });

    it('renders department select with "All" option', () => {
      render(<UserFilterSheet {...defaultProps} />);
      expect(screen.getByLabelText(/department/i)).toBeInTheDocument();
    });

    it('renders role select with "All" option', () => {
      render(<UserFilterSheet {...defaultProps} />);
      expect(screen.getByLabelText(/role/i)).toBeInTheDocument();
    });

    it('renders status select with "All" option', () => {
      render(<UserFilterSheet {...defaultProps} />);
      expect(screen.getByLabelText(/status/i)).toBeInTheDocument();
    });

    it('renders Apply and Clear buttons', () => {
      render(<UserFilterSheet {...defaultProps} />);
      expect(screen.getByRole('button', { name: /apply/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /clear/i })).toBeInTheDocument();
    });
  });

  describe('filter application', () => {
    it('calls onApply when Apply button is clicked', () => {
      const onApply = vi.fn();
      render(<UserFilterSheet {...defaultProps} onApply={onApply} />);

      fireEvent.click(screen.getByRole('button', { name: /apply/i }));

      expect(onApply).toHaveBeenCalled();
    });

    it('closes sheet after applying filters', () => {
      const onOpenChange = vi.fn();
      render(<UserFilterSheet {...defaultProps} onOpenChange={onOpenChange} />);

      fireEvent.click(screen.getByRole('button', { name: /apply/i }));

      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it('calls onApply with empty filters when Clear is clicked', () => {
      const onApply = vi.fn();
      render(
        <UserFilterSheet
          {...defaultProps}
          currentFilters={{ role: 'admin', status: 'active' }}
          onApply={onApply}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /clear/i }));

      expect(onApply).toHaveBeenCalledWith({});
    });

    it('closes sheet after clearing filters', () => {
      const onOpenChange = vi.fn();
      render(<UserFilterSheet {...defaultProps} onOpenChange={onOpenChange} />);

      fireEvent.click(screen.getByRole('button', { name: /clear/i }));

      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  describe('current filter values', () => {
    it('shows "All" when no department filter is set', () => {
      render(<UserFilterSheet {...defaultProps} />);

      const trigger = screen.getByLabelText(/department/i);
      expect(trigger).toHaveTextContent('All');
    });

    it('shows "All" when no role filter is set', () => {
      render(<UserFilterSheet {...defaultProps} />);

      const trigger = screen.getByLabelText(/role/i);
      expect(trigger).toHaveTextContent('All');
    });

    it('shows "All" when no status filter is set', () => {
      render(<UserFilterSheet {...defaultProps} />);

      const trigger = screen.getByLabelText(/status/i);
      expect(trigger).toHaveTextContent('All');
    });
  });
});
