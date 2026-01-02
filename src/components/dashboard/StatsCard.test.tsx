/**
 * Stats Card Tests - Story 5.2
 *
 * Tests for StatsCard component enhancements
 * AC3: Total hours display with < 8 hours indicator
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatsCard } from './StatsCard';
import type { DashboardStats } from '@/types/dashboard';

const baseStats: DashboardStats = {
  totalHours: 4.5,
  entryCount: 3,
  topClient: {
    id: 'client-1',
    name: 'Acme Corp',
    hours: 3.0,
  },
};

describe('StatsCard', () => {
  describe('Basic Display', () => {
    it('renders period label', () => {
      render(<StatsCard stats={baseStats} period="today" />);
      expect(screen.getByText('Today')).toBeInTheDocument();
    });

    it('renders total hours', () => {
      render(<StatsCard stats={baseStats} period="today" />);
      expect(screen.getByTestId('total-hours')).toHaveTextContent('4.5 hr');
    });

    it('renders entry count singular', () => {
      const singleEntry = { ...baseStats, entryCount: 1 };
      render(<StatsCard stats={singleEntry} period="today" />);
      expect(screen.getByText('1 entry')).toBeInTheDocument();
    });

    it('renders entry count plural', () => {
      render(<StatsCard stats={baseStats} period="today" />);
      expect(screen.getByText('3 entries')).toBeInTheDocument();
    });

    it('renders top client info', () => {
      render(<StatsCard stats={baseStats} period="today" />);
      expect(screen.getByText('Acme Corp')).toBeInTheDocument();
      expect(screen.getByText('3.0 hr')).toBeInTheDocument();
    });
  });

  describe('Today Period - Under Target', () => {
    it('shows amber color when under 8 hours', () => {
      render(<StatsCard stats={baseStats} period="today" />);
      const hours = screen.getByTestId('total-hours');
      expect(hours).toHaveClass('text-amber-600');
    });

    it('shows remaining hours indicator', () => {
      render(<StatsCard stats={baseStats} period="today" />);
      expect(screen.getByTestId('hours-remaining')).toHaveTextContent(
        '(3.5 hr remaining)'
      );
    });

    it('shows progress bar', () => {
      render(<StatsCard stats={baseStats} period="today" />);
      expect(screen.getByTestId('progress-container')).toBeInTheDocument();
      expect(screen.getByTestId('progress-bar')).toBeInTheDocument();
    });

    it('shows amber progress bar when under target', () => {
      render(<StatsCard stats={baseStats} period="today" />);
      const progressBar = screen.getByTestId('progress-bar');
      expect(progressBar).toHaveClass('bg-amber-500');
    });

    it('shows correct progress percentage', () => {
      render(<StatsCard stats={baseStats} period="today" />);
      // 4.5 / 8 = 56.25%
      expect(screen.getByText('56% of target')).toBeInTheDocument();
    });
  });

  describe('Today Period - At or Over Target', () => {
    it('does not show amber color when at 8 hours', () => {
      const fullDay = { ...baseStats, totalHours: 8 };
      render(<StatsCard stats={fullDay} period="today" />);
      const hours = screen.getByTestId('total-hours');
      expect(hours).not.toHaveClass('text-amber-600');
    });

    it('does not show remaining hours when at target', () => {
      const fullDay = { ...baseStats, totalHours: 8 };
      render(<StatsCard stats={fullDay} period="today" />);
      expect(screen.queryByTestId('hours-remaining')).not.toBeInTheDocument();
    });

    it('shows green progress bar when at target', () => {
      const fullDay = { ...baseStats, totalHours: 8 };
      render(<StatsCard stats={fullDay} period="today" />);
      const progressBar = screen.getByTestId('progress-bar');
      expect(progressBar).toHaveClass('bg-green-500');
    });

    it('shows green progress bar when over target', () => {
      const overtime = { ...baseStats, totalHours: 10 };
      render(<StatsCard stats={overtime} period="today" />);
      const progressBar = screen.getByTestId('progress-bar');
      expect(progressBar).toHaveClass('bg-green-500');
    });

    it('caps progress at 100%', () => {
      const overtime = { ...baseStats, totalHours: 10 };
      render(<StatsCard stats={overtime} period="today" />);
      expect(screen.getByText('100% of target')).toBeInTheDocument();
    });
  });

  describe('Week/Month Period', () => {
    it('does not show under-target indicator for week', () => {
      render(<StatsCard stats={baseStats} period="week" />);
      expect(screen.queryByTestId('hours-remaining')).not.toBeInTheDocument();
    });

    it('does not show progress bar for week', () => {
      render(<StatsCard stats={baseStats} period="week" />);
      expect(screen.queryByTestId('progress-container')).not.toBeInTheDocument();
    });

    it('does not show under-target indicator for month', () => {
      render(<StatsCard stats={baseStats} period="month" />);
      expect(screen.queryByTestId('hours-remaining')).not.toBeInTheDocument();
    });

    it('does not show progress bar for month', () => {
      render(<StatsCard stats={baseStats} period="month" />);
      expect(screen.queryByTestId('progress-container')).not.toBeInTheDocument();
    });
  });

  describe('Weekly Average Display (AC4)', () => {
    it('shows average per day for week period', () => {
      const weeklyStats = { ...baseStats, totalHours: 21 }; // 21 / 7 = 3.0
      render(<StatsCard stats={weeklyStats} period="week" />);
      expect(screen.getByText(/Avg.*day/i)).toBeInTheDocument();
      expect(screen.getByTestId('weekly-avg')).toHaveTextContent('3.0 hr/day');
    });

    it('shows workday average for week period', () => {
      const weeklyStats = { ...baseStats, totalHours: 40 }; // 40 / 5 = 8.0
      render(<StatsCard stats={weeklyStats} period="week" />);
      expect(screen.getByText(/Mon-Fri/i)).toBeInTheDocument();
      expect(screen.getByTestId('workday-avg')).toHaveTextContent('8.0 hr/day');
    });

    it('does not show weekly average for today period', () => {
      render(<StatsCard stats={baseStats} period="today" />);
      expect(screen.queryByTestId('weekly-avg')).not.toBeInTheDocument();
    });

    it('does not show weekly average for month period', () => {
      render(<StatsCard stats={baseStats} period="month" />);
      expect(screen.queryByTestId('weekly-avg')).not.toBeInTheDocument();
    });

    it('handles zero hours gracefully', () => {
      const zeroStats = { ...baseStats, totalHours: 0 };
      render(<StatsCard stats={zeroStats} period="week" />);
      expect(screen.getByTestId('weekly-avg')).toHaveTextContent('0.0 hr/day');
    });
  });

  describe('Accessibility', () => {
    it('has progressbar role with aria attributes', () => {
      render(<StatsCard stats={baseStats} period="today" />);
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '4.5');
      expect(progressBar).toHaveAttribute('aria-valuemin', '0');
      expect(progressBar).toHaveAttribute('aria-valuemax', '8');
    });
  });

  describe('Monthly Stats Display (Story 5.4 - AC5)', () => {
    const monthlyStats: DashboardStats = {
      totalHours: 160,
      entryCount: 80,
      topClient: { id: 'c1', name: 'Test Client', hours: 60 },
      daysWithEntries: 20,
      weeksInMonth: 4,
    };

    it('shows average per week for month period', () => {
      render(<StatsCard stats={monthlyStats} period="month" />);
      expect(screen.getByTestId('monthly-stats')).toBeInTheDocument();
      // 160 / 4 = 40 hrs/week
      expect(screen.getByTestId('weekly-avg-month')).toHaveTextContent('40.0 hr/wk');
    });

    it('shows days with entries for month period', () => {
      render(<StatsCard stats={monthlyStats} period="month" />);
      expect(screen.getByText('Days logged')).toBeInTheDocument();
      expect(screen.getByTestId('days-logged')).toHaveTextContent('20 days');
    });

    it('does not show monthly stats for today period', () => {
      render(<StatsCard stats={monthlyStats} period="today" />);
      expect(screen.queryByTestId('monthly-stats')).not.toBeInTheDocument();
    });

    it('does not show monthly stats for week period', () => {
      render(<StatsCard stats={monthlyStats} period="week" />);
      expect(screen.queryByTestId('monthly-stats')).not.toBeInTheDocument();
    });

    it('handles missing monthly fields gracefully', () => {
      const incompleteStats: DashboardStats = {
        totalHours: 100,
        entryCount: 50,
      };
      render(<StatsCard stats={incompleteStats} period="month" />);
      // Should still render without crashing
      expect(screen.getByTestId('stats-card')).toBeInTheDocument();
    });
  });
});
