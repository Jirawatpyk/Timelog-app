/**
 * EmptyPeriodState Tests - Story 5.8
 *
 * Tests for period-specific empty states.
 * AC1: Empty Today State with CTA
 * AC2: Empty Week State with CTA
 * AC3: Empty Month State with CTA
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EmptyPeriodState } from './EmptyPeriodState';

describe('EmptyPeriodState', () => {
  describe('today period', () => {
    it('renders today empty state message', () => {
      render(<EmptyPeriodState period="today" />);

      expect(screen.getByText('No entries for today')).toBeInTheDocument();
    });

    it('renders encouraging description', () => {
      render(<EmptyPeriodState period="today" />);

      expect(screen.getByText(/Start logging your time today/i)).toBeInTheDocument();
    });

    it('renders Add Entry CTA linking to /entry', () => {
      render(<EmptyPeriodState period="today" />);

      const link = screen.getByRole('link', { name: 'Add Entry' });
      expect(link).toHaveAttribute('href', '/entry');
    });
  });

  describe('week period', () => {
    it('renders week empty state message', () => {
      render(<EmptyPeriodState period="week" />);

      expect(screen.getByText('No entries this week')).toBeInTheDocument();
    });

    it('renders Add Entry CTA', () => {
      render(<EmptyPeriodState period="week" />);

      const link = screen.getByRole('link', { name: 'Add Entry' });
      expect(link).toHaveAttribute('href', '/entry');
    });
  });

  describe('month period', () => {
    it('renders month empty state message', () => {
      render(<EmptyPeriodState period="month" />);

      expect(screen.getByText('No entries this month')).toBeInTheDocument();
    });

    it('renders Add Entry CTA', () => {
      render(<EmptyPeriodState period="month" />);

      const link = screen.getByRole('link', { name: 'Add Entry' });
      expect(link).toHaveAttribute('href', '/entry');
    });
  });

  it('has testid for testing', () => {
    render(<EmptyPeriodState period="today" />);

    expect(screen.getByTestId('empty-period-state')).toBeInTheDocument();
  });
});
