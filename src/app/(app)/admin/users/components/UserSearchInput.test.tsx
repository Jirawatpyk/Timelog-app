import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UserSearchInput } from './UserSearchInput';

// Mock useUserFilters hook
const mockSetFilter = vi.fn();
const mockFilters = { search: '' };

vi.mock('@/hooks/use-user-filters', () => ({
  useUserFilters: () => ({
    filters: mockFilters,
    setFilter: mockSetFilter,
  }),
}));

/**
 * Tests for UserSearchInput component
 * Story 7.7: Filter Users (AC 5)
 */
describe('UserSearchInput', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFilters.search = '';
  });

  describe('rendering', () => {
    it('renders search input with placeholder', () => {
      render(<UserSearchInput />);
      expect(screen.getByPlaceholderText(/search by name or email/i)).toBeInTheDocument();
    });

    it('renders with aria-label for accessibility', () => {
      render(<UserSearchInput />);
      expect(screen.getByRole('textbox', { name: /search users/i })).toBeInTheDocument();
    });

    it('does not show clear button when input is empty', () => {
      render(<UserSearchInput />);
      expect(screen.queryByRole('button', { name: /clear search/i })).not.toBeInTheDocument();
    });

    it('shows clear button when input has value', () => {
      mockFilters.search = 'john';
      render(<UserSearchInput />);
      expect(screen.getByRole('button', { name: /clear search/i })).toBeInTheDocument();
    });
  });

  describe('search behavior', () => {
    it('updates local value on input change', () => {
      render(<UserSearchInput />);
      const input = screen.getByRole('textbox', { name: /search users/i });

      fireEvent.change(input, { target: { value: 'test' } });

      expect(input).toHaveValue('test');
    });

    it('debounces search query updates (300ms)', async () => {
      render(<UserSearchInput />);
      const input = screen.getByRole('textbox', { name: /search users/i });

      fireEvent.change(input, { target: { value: 'john' } });

      // Should not be called immediately
      expect(mockSetFilter).not.toHaveBeenCalled();

      // Wait for debounce
      await waitFor(
        () => {
          expect(mockSetFilter).toHaveBeenCalledWith('q', 'john');
        },
        { timeout: 500 }
      );
    });

    it('calls setFilter with null when input is cleared via typing', async () => {
      mockFilters.search = 'john';
      render(<UserSearchInput />);
      const input = screen.getByRole('textbox', { name: /search users/i });

      fireEvent.change(input, { target: { value: '' } });

      await waitFor(
        () => {
          expect(mockSetFilter).toHaveBeenCalledWith('q', null);
        },
        { timeout: 500 }
      );
    });
  });

  describe('clear button', () => {
    it('clears input and filter when clear button is clicked', () => {
      mockFilters.search = 'john';
      render(<UserSearchInput />);

      fireEvent.click(screen.getByRole('button', { name: /clear search/i }));

      expect(mockSetFilter).toHaveBeenCalledWith('q', null);
    });

    it('clears local input value when clear button is clicked', () => {
      mockFilters.search = 'john';
      render(<UserSearchInput />);

      const input = screen.getByRole('textbox', { name: /search users/i });
      fireEvent.click(screen.getByRole('button', { name: /clear search/i }));

      expect(input).toHaveValue('');
    });
  });

  describe('sync with URL', () => {
    it('syncs local value when filters.search changes externally', () => {
      const { rerender } = render(<UserSearchInput />);

      // Simulate external filter change
      mockFilters.search = 'external';
      rerender(<UserSearchInput />);

      const input = screen.getByRole('textbox', { name: /search users/i });
      expect(input).toHaveValue('external');
    });
  });
});
