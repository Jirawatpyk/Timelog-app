/**
 * FilterButton Tests - Story 5.6
 *
 * Tests for the filter button component.
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { FilterButton } from './FilterButton';

describe('FilterButton', () => {
  it('renders filter button with icon', () => {
    render(<FilterButton hasActiveFilter={false} onClick={() => {}} />);

    const button = screen.getByRole('button', { name: /filter entries/i });
    expect(button).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(<FilterButton hasActiveFilter={false} onClick={handleClick} />);

    await user.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('shows badge when filter is active', () => {
    render(<FilterButton hasActiveFilter={true} onClick={() => {}} />);

    // Badge should be present (indicator dot)
    const button = screen.getByRole('button');
    const badge = button.querySelector('.bg-primary');
    expect(badge).toBeInTheDocument();
  });

  it('does not show badge when no filter is active', () => {
    render(<FilterButton hasActiveFilter={false} onClick={() => {}} />);

    const button = screen.getByRole('button');
    const badge = button.querySelector('.bg-primary');
    expect(badge).not.toBeInTheDocument();
  });

  it('has accessible name', () => {
    render(<FilterButton hasActiveFilter={false} onClick={() => {}} />);

    const button = screen.getByRole('button', { name: /filter entries/i });
    expect(button).toHaveAttribute('aria-label', 'Filter entries');
  });
});
