/**
 * Empty State Tests - Story 5.2
 *
 * Tests for EmptyState component
 * AC7: Empty state for today with CTA
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EmptyState } from './EmptyState';

describe('EmptyState', () => {
  it('renders default message', () => {
    render(<EmptyState />);

    expect(screen.getByText('No entries for today')).toBeInTheDocument();
  });

  it('renders custom message', () => {
    render(<EmptyState message="No entries this week" />);

    expect(screen.getByText('No entries this week')).toBeInTheDocument();
  });

  it('renders CTA button by default', () => {
    render(<EmptyState />);

    const link = screen.getByRole('link', { name: 'Add Entry' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/entry');
  });

  it('hides CTA when showCta is false', () => {
    render(<EmptyState showCta={false} />);

    expect(
      screen.queryByRole('link', { name: 'Add Entry' })
    ).not.toBeInTheDocument();
  });

  it('renders clock icon', () => {
    render(<EmptyState />);

    const icon = document.querySelector('[aria-hidden="true"]');
    expect(icon).toBeInTheDocument();
  });

  it('has testid for testing', () => {
    render(<EmptyState />);

    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
  });
});
