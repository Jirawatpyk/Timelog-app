/**
 * SearchInput Tests - Story 5.7
 *
 * Tests for the search input component.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { SearchInput } from './SearchInput';

// Mock next/navigation
const mockPush = vi.fn();
const mockSearchParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => mockSearchParams,
}));

describe('SearchInput', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    mockPush.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders search input with placeholder', () => {
    render(<SearchInput onClose={() => {}} />);
    expect(screen.getByPlaceholderText(/search client, project/i)).toBeInTheDocument();
  });

  it('renders cancel button', () => {
    render(<SearchInput onClose={() => {}} />);
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('auto-focuses on mount', async () => {
    render(<SearchInput onClose={() => {}} />);
    await waitFor(() => {
      expect(screen.getByLabelText('Search entries')).toHaveFocus();
    });
  });

  it('shows initial query value', () => {
    render(<SearchInput initialQuery="test" onClose={() => {}} />);
    expect(screen.getByLabelText('Search entries')).toHaveValue('test');
  });

  it('shows clear button when query has text', async () => {
    render(<SearchInput initialQuery="test" onClose={() => {}} />);
    expect(screen.getByLabelText('Clear search')).toBeInTheDocument();
  });

  it('does not show clear button when query is empty', () => {
    render(<SearchInput onClose={() => {}} />);
    expect(screen.queryByLabelText('Clear search')).not.toBeInTheDocument();
  });

  it('clears input when clear button is clicked', async () => {
    render(<SearchInput initialQuery="test" onClose={() => {}} />);

    fireEvent.click(screen.getByLabelText('Clear search'));

    expect(screen.getByLabelText('Search entries')).toHaveValue('');
  });

  it('calls onClose when cancel button is clicked', () => {
    const handleClose = vi.fn();
    render(<SearchInput onClose={handleClose} />);

    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('updates URL with debounced query', async () => {
    render(<SearchInput onClose={() => {}} />);
    const input = screen.getByLabelText('Search entries');

    fireEvent.change(input, { target: { value: 'test' } });

    // URL should not update immediately
    expect(mockPush).not.toHaveBeenCalled();

    // Advance timers past debounce delay
    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    expect(mockPush).toHaveBeenCalledWith('/dashboard?q=test');
  });

  it('does not update URL for queries less than MIN_SEARCH_LENGTH', async () => {
    render(<SearchInput onClose={() => {}} />);
    const input = screen.getByLabelText('Search entries');

    fireEvent.change(input, { target: { value: 'a' } });

    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    // Should not have been called with q param for single char
    expect(mockPush).not.toHaveBeenCalledWith(expect.stringContaining('q=a'));
  });

  it('removes q param from URL when input is cleared', async () => {
    render(<SearchInput initialQuery="test" onClose={() => {}} />);
    const input = screen.getByLabelText('Search entries');

    // Clear the input
    fireEvent.change(input, { target: { value: '' } });

    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    // URL should be updated without q param
    expect(mockPush).toHaveBeenCalled();
  });

  it('preserves other URL params when updating search', async () => {
    // Setup with existing params
    mockSearchParams.set('period', 'week');
    mockSearchParams.set('client', 'abc');

    render(<SearchInput onClose={() => {}} />);
    const input = screen.getByLabelText('Search entries');

    fireEvent.change(input, { target: { value: 'test' } });

    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('period=week'));
    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('client=abc'));
    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('q=test'));

    // Cleanup
    mockSearchParams.delete('period');
    mockSearchParams.delete('client');
  });
});
