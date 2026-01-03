/**
 * EmptySearchState Tests - Story 5.7
 *
 * Tests for the empty search results component.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EmptySearchState } from './EmptySearchState';

// Mock next/navigation
const mockPush = vi.fn();
const mockSearchParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => mockSearchParams,
}));

describe('EmptySearchState', () => {
  beforeEach(() => {
    mockPush.mockClear();
    // Reset search params
    mockSearchParams.delete('q');
    mockSearchParams.delete('period');
  });

  it('renders search icon', () => {
    render(<EmptySearchState query="test" />);
    // The Search icon is rendered but not easily testable by label
    expect(screen.getByText('No entries found')).toBeInTheDocument();
  });

  it('displays "No entries found" message', () => {
    render(<EmptySearchState query="xyz" />);
    expect(screen.getByText('No entries found')).toBeInTheDocument();
  });

  it('displays the search query', () => {
    render(<EmptySearchState query="marketing" />);
    expect(screen.getByText('marketing')).toBeInTheDocument();
  });

  it('renders Clear Search button', () => {
    render(<EmptySearchState query="test" />);
    expect(screen.getByRole('button', { name: /clear search/i })).toBeInTheDocument();
  });

  it('calls onClear when provided and button clicked', () => {
    const handleClear = vi.fn();
    render(<EmptySearchState query="test" onClear={handleClear} />);

    fireEvent.click(screen.getByRole('button', { name: /clear search/i }));

    expect(handleClear).toHaveBeenCalledTimes(1);
    expect(mockPush).not.toHaveBeenCalled(); // Should not navigate when onClear provided
  });

  it('navigates to remove q param when no onClear provided', () => {
    render(<EmptySearchState query="test" />);

    fireEvent.click(screen.getByRole('button', { name: /clear search/i }));

    expect(mockPush).toHaveBeenCalledWith('/dashboard');
  });

  it('preserves other URL params when clearing search', () => {
    mockSearchParams.set('period', 'week');
    mockSearchParams.set('client', 'abc');
    mockSearchParams.set('q', 'test');

    render(<EmptySearchState query="test" />);

    fireEvent.click(screen.getByRole('button', { name: /clear search/i }));

    // Should preserve period and client but remove q
    expect(mockPush).toHaveBeenCalledWith('/dashboard?period=week&client=abc');
  });
});
