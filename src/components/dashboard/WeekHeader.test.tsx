/**
 * WeekHeader Component Tests - Story 5.4
 *
 * Tests for the week header component used in monthly view.
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WeekHeader } from './WeekHeader';

describe('WeekHeader', () => {
  const defaultProps = {
    label: 'Week 3 (13-19 Jan)',
    totalHours: 12.5,
    entryCount: 5,
  };

  it('renders the week label', () => {
    render(<WeekHeader {...defaultProps} />);

    expect(screen.getByText('Week 3 (13-19 Jan)')).toBeInTheDocument();
  });

  it('displays total hours', () => {
    render(<WeekHeader {...defaultProps} />);

    expect(screen.getByText('12.5 hrs')).toBeInTheDocument();
  });

  it('displays entry count', () => {
    render(<WeekHeader {...defaultProps} />);

    expect(screen.getByText('(5 entries)')).toBeInTheDocument();
  });

  it('formats hours with 1 decimal place', () => {
    render(<WeekHeader {...defaultProps} totalHours={8.333} />);

    expect(screen.getByText('8.3 hrs')).toBeInTheDocument();
  });

  it('handles single entry', () => {
    render(<WeekHeader {...defaultProps} entryCount={1} />);

    expect(screen.getByText('(1 entry)')).toBeInTheDocument();
  });

  it('handles zero hours', () => {
    render(<WeekHeader {...defaultProps} totalHours={0} entryCount={0} />);

    expect(screen.getByText('0.0 hrs')).toBeInTheDocument();
    expect(screen.getByText('(0 entries)')).toBeInTheDocument();
  });

  it('has correct data-testid for testing', () => {
    render(<WeekHeader {...defaultProps} />);

    expect(screen.getByTestId('week-header')).toBeInTheDocument();
  });

  it('applies sticky styles by default', () => {
    render(<WeekHeader {...defaultProps} />);

    const header = screen.getByTestId('week-header');
    expect(header).toHaveClass('sticky');
  });

  it('can disable sticky behavior', () => {
    render(<WeekHeader {...defaultProps} isSticky={false} />);

    const header = screen.getByTestId('week-header');
    expect(header).not.toHaveClass('sticky');
  });
});
