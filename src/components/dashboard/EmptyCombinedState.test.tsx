/**
 * EmptyCombinedState Tests - Story 5.8
 *
 * Tests for the combined filter + search empty state.
 * AC6: Show appropriate message prioritizing search, provide clear actions for both
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EmptyCombinedState } from './EmptyCombinedState';

// Mock next/navigation
const mockPush = vi.fn();
const mockSearchParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => mockSearchParams,
}));

describe('EmptyCombinedState', () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockSearchParams.set('q', 'test');
    mockSearchParams.set('client', 'abc');
    mockSearchParams.set('period', 'week');
  });

  it('renders search query in message (prioritizes search)', () => {
    render(<EmptyCombinedState query="marketing" clientName="Acme Corp" />);

    // Should show search message prioritized
    expect(screen.getByText('No entries found')).toBeInTheDocument();
    expect(screen.getByText('marketing')).toBeInTheDocument();
  });

  it('shows client name in secondary text', () => {
    render(<EmptyCombinedState query="marketing" clientName="Acme Corp" />);

    expect(screen.getByText(/Acme Corp/)).toBeInTheDocument();
  });

  it('renders Clear Search button', () => {
    render(<EmptyCombinedState query="test" clientName="Acme" />);

    expect(screen.getByRole('button', { name: /clear search/i })).toBeInTheDocument();
  });

  it('renders Clear Filter button', () => {
    render(<EmptyCombinedState query="test" clientName="Acme" />);

    expect(screen.getByRole('button', { name: /clear filter/i })).toBeInTheDocument();
  });

  it('clears search when Clear Search is clicked', async () => {
    const user = userEvent.setup();
    render(<EmptyCombinedState query="test" clientName="Acme" />);

    await user.click(screen.getByRole('button', { name: /clear search/i }));

    // Should remove q but keep client
    expect(mockPush).toHaveBeenCalledWith('/dashboard?client=abc&period=week');
  });

  it('clears filter when Clear Filter is clicked', async () => {
    const user = userEvent.setup();
    render(<EmptyCombinedState query="test" clientName="Acme" />);

    await user.click(screen.getByRole('button', { name: /clear filter/i }));

    // Should remove client but keep q
    expect(mockPush).toHaveBeenCalledWith('/dashboard?q=test&period=week');
  });

  it('has testid for testing', () => {
    render(<EmptyCombinedState query="test" clientName="Acme" />);

    expect(screen.getByTestId('empty-combined-state')).toBeInTheDocument();
  });
});
