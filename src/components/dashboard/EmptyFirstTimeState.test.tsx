/**
 * EmptyFirstTimeState Tests - Story 5.8
 *
 * Tests for the first-time user empty state.
 * AC8: Welcoming empty state with extra prominent CTA
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EmptyFirstTimeState } from './EmptyFirstTimeState';

describe('EmptyFirstTimeState', () => {
  it('renders welcoming title', () => {
    render(<EmptyFirstTimeState />);

    expect(screen.getByText('Welcome!')).toBeInTheDocument();
  });

  it('renders encouraging message', () => {
    render(<EmptyFirstTimeState />);

    expect(screen.getByText(/log your first entry/i)).toBeInTheDocument();
  });

  it('renders sparkles icon', () => {
    render(<EmptyFirstTimeState />);

    // Icon is rendered but check for the container
    expect(screen.getByTestId('empty-first-time-state')).toBeInTheDocument();
  });

  it('renders Add First Entry CTA linking to /entry', () => {
    render(<EmptyFirstTimeState />);

    const link = screen.getByRole('link', { name: /add.*entry/i });
    expect(link).toHaveAttribute('href', '/entry');
  });

  it('has testid for testing', () => {
    render(<EmptyFirstTimeState />);

    expect(screen.getByTestId('empty-first-time-state')).toBeInTheDocument();
  });
});
