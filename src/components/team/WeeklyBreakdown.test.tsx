/**
 * Weekly Breakdown Tests - Story 6.4
 *
 * Tests for WeeklyBreakdown component
 * AC3: Weekly stats view with daily breakdown
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WeeklyBreakdown } from './WeeklyBreakdown';
import type { DailyBreakdown } from '@/types/team';

describe('WeeklyBreakdown', () => {
  const mockBreakdown: DailyBreakdown[] = [
    { date: '2026-01-05', dayOfWeek: 'Mon', totalHours: 8, isToday: false },
    { date: '2026-01-06', dayOfWeek: 'Tue', totalHours: 7.5, isToday: false },
    { date: '2026-01-07', dayOfWeek: 'Wed', totalHours: 6, isToday: true },
    { date: '2026-01-08', dayOfWeek: 'Thu', totalHours: 0, isToday: false },
    { date: '2026-01-09', dayOfWeek: 'Fri', totalHours: 0, isToday: false },
    { date: '2026-01-10', dayOfWeek: 'Sat', totalHours: 0, isToday: false },
    { date: '2026-01-11', dayOfWeek: 'Sun', totalHours: 0, isToday: false },
  ];

  it('renders 7 days of the week', () => {
    render(<WeeklyBreakdown breakdown={mockBreakdown} />);

    expect(screen.getByText('Mon')).toBeInTheDocument();
    expect(screen.getByText('Tue')).toBeInTheDocument();
    expect(screen.getByText('Wed')).toBeInTheDocument();
    expect(screen.getByText('Thu')).toBeInTheDocument();
    expect(screen.getByText('Fri')).toBeInTheDocument();
    expect(screen.getByText('Sat')).toBeInTheDocument();
    expect(screen.getByText('Sun')).toBeInTheDocument();
  });

  it('displays hours for each day', () => {
    render(<WeeklyBreakdown breakdown={mockBreakdown} />);

    // Check hours are displayed
    expect(screen.getByText('8.0')).toBeInTheDocument();
    expect(screen.getByText('7.5')).toBeInTheDocument();
    expect(screen.getByText('6.0')).toBeInTheDocument();
  });

  it('shows 0 for days with no entries', () => {
    render(<WeeklyBreakdown breakdown={mockBreakdown} />);

    // Days with 0 hours should still show 0.0
    const zeroHours = screen.getAllByText('0.0');
    expect(zeroHours.length).toBe(4); // Thu, Fri, Sat, Sun
  });

  it('highlights today with special styling', () => {
    const { container } = render(<WeeklyBreakdown breakdown={mockBreakdown} />);

    // Today should have a ring or special border
    const todayElement = container.querySelector('[data-today="true"]');
    expect(todayElement).toBeInTheDocument();
  });

  it('renders in compact format', () => {
    render(<WeeklyBreakdown breakdown={mockBreakdown} />);

    // Should be a grid layout
    const grid = screen.getByRole('list');
    expect(grid).toBeInTheDocument();
  });

  it('handles empty breakdown array', () => {
    render(<WeeklyBreakdown breakdown={[]} />);

    // Should still render without errors
    expect(screen.queryByText('Mon')).not.toBeInTheDocument();
  });

  it('formats hours with one decimal place', () => {
    const breakdownWithDecimals: DailyBreakdown[] = [
      { date: '2026-01-05', dayOfWeek: 'Mon', totalHours: 7.333, isToday: false },
    ];

    render(<WeeklyBreakdown breakdown={breakdownWithDecimals} />);

    // Should be formatted to 1 decimal (7.3)
    expect(screen.getByText('7.3')).toBeInTheDocument();
  });
});
