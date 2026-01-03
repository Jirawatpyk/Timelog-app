/**
 * FilterChip Tests - Story 5.6
 *
 * Tests for the filter chip component.
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FilterChip } from './FilterChip';

// Mock next/navigation
const mockPush = vi.fn();
let mockSearchParamsString = '';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => ({
    toString: () => mockSearchParamsString,
  }),
}));

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: { children: React.ReactNode }) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('FilterChip', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParamsString = 'period=week&client=abc';
  });

  it('renders label and value', () => {
    render(
      <FilterChip
        label="Client"
        value="Acme Corp"
        paramName="client"
      />
    );

    expect(screen.getByText('Client:')).toBeInTheDocument();
    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
  });

  it('renders clear button with accessible name', () => {
    render(
      <FilterChip
        label="Client"
        value="Acme Corp"
        paramName="client"
      />
    );

    const clearButton = screen.getByRole('button', { name: /clear client filter/i });
    expect(clearButton).toBeInTheDocument();
  });

  it('clears filter on button click', async () => {
    const user = userEvent.setup();

    render(
      <FilterChip
        label="Client"
        value="Acme Corp"
        paramName="client"
      />
    );

    await user.click(screen.getByRole('button'));

    // Should navigate without the client param
    expect(mockPush).toHaveBeenCalledWith('/dashboard?period=week');
  });

  it('preserves other params when clearing', async () => {
    const user = userEvent.setup();
    mockSearchParamsString = 'period=month&client=abc&other=value';

    render(
      <FilterChip
        label="Client"
        value="Acme Corp"
        paramName="client"
      />
    );

    await user.click(screen.getByRole('button'));

    // Should keep period and other params
    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('period=month'));
    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('other=value'));
    expect(mockPush).toHaveBeenCalledWith(expect.not.stringContaining('client='));
  });

  it('has correct styling classes', () => {
    render(
      <FilterChip
        label="Client"
        value="Acme Corp"
        paramName="client"
      />
    );

    // The chip container should have styling
    const chipText = screen.getByText('Acme Corp');
    expect(chipText).toHaveClass('font-medium');
  });
});
