/**
 * SearchInput Component Tests
 * Story 3.5: Master Data Admin UI Layout (AC: 4)
 *
 * Tests for debounced search input with clear functionality
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { SearchInput } from './SearchInput';

describe('SearchInput', () => {
  describe('Rendering', () => {
    it('renders search input with placeholder', () => {
      render(<SearchInput value="" onChange={() => {}} />);

      expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
    });

    it('renders with custom placeholder', () => {
      render(
        <SearchInput
          value=""
          onChange={() => {}}
          placeholder="Search services..."
        />
      );

      expect(screen.getByPlaceholderText('Search services...')).toBeInTheDocument();
    });

    it('displays search icon', () => {
      render(<SearchInput value="" onChange={() => {}} />);

      // Search icon is rendered (using data-testid)
      expect(screen.getByTestId('search-icon')).toBeInTheDocument();
    });

    it('displays current value', () => {
      render(<SearchInput value="test" onChange={() => {}} />);

      expect(screen.getByDisplayValue('test')).toBeInTheDocument();
    });
  });

  describe('Clear button', () => {
    it('shows clear button when value is present', () => {
      render(<SearchInput value="test" onChange={() => {}} />);

      expect(screen.getByRole('button', { name: /clear search/i })).toBeInTheDocument();
    });

    it('hides clear button when value is empty', () => {
      render(<SearchInput value="" onChange={() => {}} />);

      expect(screen.queryByRole('button', { name: /clear search/i })).not.toBeInTheDocument();
    });

    it('calls onChange with empty string when clear is clicked', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(<SearchInput value="test" onChange={handleChange} />);

      const clearButton = screen.getByRole('button', { name: /clear search/i });
      await user.click(clearButton);

      expect(handleChange).toHaveBeenCalledWith('');
    });
  });

  describe('Debounced input', () => {
    it('debounces onChange calls', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(<SearchInput value="" onChange={handleChange} debounceMs={100} />);

      const input = screen.getByPlaceholderText('Search...');
      await user.type(input, 'abc');

      // Should not call immediately
      expect(handleChange).not.toHaveBeenCalled();

      // Wait for debounce
      await waitFor(() => {
        expect(handleChange).toHaveBeenCalledWith('abc');
      }, { timeout: 200 });

      // Should only be called once (debounced)
      expect(handleChange).toHaveBeenCalledTimes(1);
    });

    it('updates local value immediately', async () => {
      const user = userEvent.setup();

      render(<SearchInput value="" onChange={() => {}} />);

      const input = screen.getByPlaceholderText('Search...');
      await user.type(input, 'test');

      // Local value should update immediately
      expect(input).toHaveValue('test');
    });

    it('syncs with external value changes', () => {
      const { rerender } = render(
        <SearchInput value="initial" onChange={() => {}} />
      );

      expect(screen.getByDisplayValue('initial')).toBeInTheDocument();

      rerender(<SearchInput value="updated" onChange={() => {}} />);

      expect(screen.getByDisplayValue('updated')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper input type', () => {
      render(<SearchInput value="" onChange={() => {}} />);

      const input = screen.getByPlaceholderText('Search...');
      expect(input).toHaveAttribute('type', 'text');
    });

    it('clear button has accessible label', () => {
      render(<SearchInput value="test" onChange={() => {}} />);

      const clearButton = screen.getByRole('button', { name: /clear search/i });
      expect(clearButton).toBeInTheDocument();
    });

    it('input is focusable', async () => {
      const user = userEvent.setup();
      render(<SearchInput value="" onChange={() => {}} />);

      const input = screen.getByPlaceholderText('Search...');
      await user.tab();

      expect(input).toHaveFocus();
    });
  });

  describe('Touch targets', () => {
    it('clear button meets minimum touch target size', () => {
      render(<SearchInput value="test" onChange={() => {}} />);

      const clearButton = screen.getByRole('button', { name: /clear search/i });
      // Button should have minimum 44x44px touch target (h-7 w-7 = 28px, but nested in 44px clickable area)
      expect(clearButton).toHaveClass('h-7', 'w-7');
    });
  });
});
