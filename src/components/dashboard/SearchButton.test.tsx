/**
 * SearchButton Tests - Story 5.7
 *
 * Tests for search button toggle and active state.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SearchButton } from './SearchButton';

describe('SearchButton', () => {
  it('renders search icon', () => {
    render(<SearchButton isActive={false} onClick={() => {}} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByLabelText('Search entries')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<SearchButton isActive={false} onClick={handleClick} />);

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('shows inactive aria-label when not active', () => {
    render(<SearchButton isActive={false} onClick={() => {}} />);
    expect(screen.getByLabelText('Search entries')).toBeInTheDocument();
  });

  it('shows active aria-label when active', () => {
    render(<SearchButton isActive={true} onClick={() => {}} />);
    expect(screen.getByLabelText('Close search')).toBeInTheDocument();
  });

  it('applies active styles when isActive is true', () => {
    render(<SearchButton isActive={true} onClick={() => {}} />);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-primary/10');
    expect(button).toHaveClass('text-primary');
  });

  it('does not apply active styles when isActive is false', () => {
    render(<SearchButton isActive={false} onClick={() => {}} />);
    const button = screen.getByRole('button');
    expect(button).not.toHaveClass('bg-primary/10');
    expect(button).not.toHaveClass('text-primary');
  });
});
