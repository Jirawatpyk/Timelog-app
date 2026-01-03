/**
 * EmptyFilterState Tests - Story 5.6
 *
 * Tests for the empty filter state component.
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EmptyFilterState } from './EmptyFilterState';

// Mock next/navigation
const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => ({
    toString: () => 'period=week&client=abc',
  }),
}));

describe('EmptyFilterState', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders empty message with client name', () => {
    render(<EmptyFilterState clientName="Acme Corp" />);

    expect(screen.getByText(/no entries found for acme corp/i)).toBeInTheDocument();
  });

  it('renders filter icon', () => {
    render(<EmptyFilterState clientName="Acme Corp" />);

    // The Filter icon from lucide-react
    expect(document.querySelector('svg')).toBeInTheDocument();
  });

  it('renders clear filter button', () => {
    render(<EmptyFilterState clientName="Acme Corp" />);

    expect(screen.getByRole('button', { name: /clear filter/i })).toBeInTheDocument();
  });

  it('clears filter and navigates on button click', async () => {
    const user = userEvent.setup();

    render(<EmptyFilterState clientName="Acme Corp" />);

    await user.click(screen.getByRole('button', { name: /clear filter/i }));

    expect(mockPush).toHaveBeenCalledWith('/dashboard?period=week');
  });

  it('shows suggestion text', () => {
    render(<EmptyFilterState clientName="Acme Corp" />);

    expect(screen.getByText(/try a different client or view all entries/i)).toBeInTheDocument();
  });
});
