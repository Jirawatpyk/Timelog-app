/**
 * TeamErrorState Tests - Story 6.4
 *
 * Tests for error display component
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TeamErrorState } from './TeamErrorState';

describe('TeamErrorState', () => {
  it('displays default error message', () => {
    render(<TeamErrorState />);
    expect(screen.getByText('Unable to load data')).toBeInTheDocument();
  });

  it('displays custom error message', () => {
    render(<TeamErrorState message="Custom error message" />);
    expect(screen.getByText('Custom error message')).toBeInTheDocument();
  });

  it('renders AlertCircle icon', () => {
    const { container } = render(<TeamErrorState />);
    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('has destructive border styling', () => {
    const { container } = render(<TeamErrorState />);
    const card = container.firstChild;
    expect(card).toHaveClass('border-destructive/50');
  });

  it('centers content', () => {
    const { container } = render(<TeamErrorState />);
    const content = container.querySelector('[class*="items-center"]');
    expect(content).toBeInTheDocument();
  });
});
