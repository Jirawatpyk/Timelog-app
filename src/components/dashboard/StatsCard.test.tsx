/**
 * Stats Card Tests - Story 5.2, 5.5
 *
 * Tests for StatsCard component enhancements
 * AC3: Total hours display with < 8 hours indicator
 * Story 5.5: "Done for today! ✓" message, averagePerDay from actual days
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

    it('shows "Done for today! ✓" when at target (AC6)', () => {
      const fullDay = { ...baseStats, totalHours: 8 };
      render(<StatsCard stats={fullDay} period="today" />);
      expect(screen.getByTestId('done-for-today')).toHaveTextContent(
        'Done for today! ✓'
      );
    });

    it('shows "Done for today! ✓" when over target (AC6)', () => {
      const overtime = { ...baseStats, totalHours: 10 };
      render(<StatsCard stats={overtime} period="today" />);
      expect(screen.getByTestId('done-for-today')).toHaveTextContent(
        'Done for today! ✓'
      );
    });

    it('does not show "Done for today! ✓" when under target', () => {
      render(<StatsCard stats={baseStats} period="today" />);
      expect(screen.queryByTestId('done-for-today')).not.toBeInTheDocument();
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

  describe('Weekly Stats Display (AC3 - Story 5.5)', () => {
    it('shows average per day based on actual days with entries', () => {
      // 21 hours logged over 3 days = 7.0 hr/day
      const weeklyStats: DashboardStats = {
        ...baseStats,
        totalHours: 21,
        daysWithEntries: 3,
        averagePerDay: 7.0,
      };
      render(<StatsCard stats={weeklyStats} period="week" />);
      expect(screen.getByText(/Avg.*day/i)).toBeInTheDocument();
      expect(screen.getByTestId('weekly-avg')).toHaveTextContent('7.0 hr/day');
    });

    it('shows days logged for week period', () => {
      const weeklyStats: DashboardStats = {
        ...baseStats,
        totalHours: 40,
        daysWithEntries: 5,
        averagePerDay: 8.0,
      };
      render(<StatsCard stats={weeklyStats} period="week" />);
      expect(screen.getByText('Days logged')).toBeInTheDocument();
      expect(screen.getByTestId('days-logged-week')).toHaveTextContent('5 days');
    });

    it('shows singular "day" when only 1 day logged', () => {
      const weeklyStats: DashboardStats = {
        ...baseStats,
        totalHours: 8,
        daysWithEntries: 1,
        averagePerDay: 8.0,
      };
      render(<StatsCard stats={weeklyStats} period="week" />);
      expect(screen.getByTestId('days-logged-week')).toHaveTextContent('1 day');
    });

    it('does not show weekly stats for today period', () => {
      render(<StatsCard stats={baseStats} period="today" />);
      expect(screen.queryByTestId('weekly-stats')).not.toBeInTheDocument();
    });

    it('does not show weekly stats for month period', () => {
      render(<StatsCard stats={baseStats} period="month" />);
      expect(screen.queryByTestId('weekly-stats')).not.toBeInTheDocument();
    });

    it('handles missing averagePerDay gracefully', () => {
      const incompleteStats: DashboardStats = {
        ...baseStats,
        totalHours: 20,
        // No averagePerDay
      };
      render(<StatsCard stats={incompleteStats} period="week" />);
      expect(screen.queryByTestId('weekly-avg')).not.toBeInTheDocument();
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

  describe('Monthly Stats Display (Story 5.4, 5.5 - AC4)', () => {
    const monthlyStats: DashboardStats = {
      totalHours: 160,
      entryCount: 80,
      topClient: { id: 'c1', name: 'Test Client', hours: 60 },
      daysWithEntries: 20,
      averagePerDay: 8.0,
      weeksInMonth: 4,
      averagePerWeek: 40.0,
    };

    it('shows average per week for month period', () => {
      render(<StatsCard stats={monthlyStats} period="month" />);
      expect(screen.getByTestId('monthly-stats')).toBeInTheDocument();
      expect(screen.getByTestId('weekly-avg-month')).toHaveTextContent('40.0 hr/wk');
    });

    it('shows average per day for month period', () => {
      render(<StatsCard stats={monthlyStats} period="month" />);
      expect(screen.getByTestId('daily-avg-month')).toHaveTextContent('8.0 hr/day');
    });

    it('shows days with entries for month period', () => {
      render(<StatsCard stats={monthlyStats} period="month" />);
      expect(screen.getByText('Days logged')).toBeInTheDocument();
      expect(screen.getByTestId('days-logged')).toHaveTextContent('20 days');
    });

    it('shows singular "day" when only 1 day logged in month', () => {
      const singleDayStats: DashboardStats = {
        ...monthlyStats,
        daysWithEntries: 1,
      };
      render(<StatsCard stats={singleDayStats} period="month" />);
      expect(screen.getByTestId('days-logged')).toHaveTextContent('1 day');
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
