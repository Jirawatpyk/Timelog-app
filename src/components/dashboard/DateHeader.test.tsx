/**
 * DateHeader Component Tests - Story 5.3
 *
 * Tests for the date header component showing day name, date, and subtotal.
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DateHeader } from './DateHeader';

describe('DateHeader', () => {
  describe('date formatting (AC2)', () => {
    it('displays day name with date in English format', () => {
      // Jan 13, 2025 is a Monday
      render(
        <DateHeader
          date="2025-01-13"
          totalHours={4.5}
          entryCount={3}
        />
      );

      // Should show: "Mon, Jan 13"
      expect(screen.getByText(/Mon.*Jan.*13/i)).toBeInTheDocument();
    });

    it('displays different day names correctly', () => {
      // Jan 15, 2025 is a Wednesday
      render(
        <DateHeader
          date="2025-01-15"
          totalHours={2}
          entryCount={1}
        />
      );

      expect(screen.getByText(/Wed.*Jan.*15/i)).toBeInTheDocument();
    });
  });

  describe('daily subtotal display (AC3)', () => {
    it('shows hours in format X.X hr', () => {
      render(
        <DateHeader
          date="2025-01-15"
          totalHours={4.5}
          entryCount={3}
        />
      );

      expect(screen.getByText(/4\.5.*hr/i)).toBeInTheDocument();
    });

    it('shows entry count', () => {
      render(
        <DateHeader
          date="2025-01-15"
          totalHours={4.5}
          entryCount={3}
        />
      );

      expect(screen.getByText(/3.*entries?/i)).toBeInTheDocument();
    });

    it('shows singular entry for count of 1', () => {
      render(
        <DateHeader
          date="2025-01-15"
          totalHours={1.5}
          entryCount={1}
        />
      );

      expect(screen.getByText(/1.*entry/i)).toBeInTheDocument();
    });

    it('shows 0.0 hr for days with no entries', () => {
      render(
        <DateHeader
          date="2025-01-14"
          totalHours={0}
          entryCount={0}
          isEmpty
        />
      );

      expect(screen.getByText(/0\.0.*hr/i)).toBeInTheDocument();
    });
  });

  describe('empty day styling (AC5)', () => {
    it('applies muted styling when isEmpty is true', () => {
      const { container } = render(
        <DateHeader
          date="2025-01-14"
          totalHours={0}
          entryCount={0}
          isEmpty
        />
      );

      // Should have opacity class for muted styling
      expect(container.firstChild).toHaveClass('opacity-50');
    });

    it('does not have muted styling when isEmpty is false', () => {
      const { container } = render(
        <DateHeader
          date="2025-01-15"
          totalHours={4.5}
          entryCount={3}
        />
      );

      expect(container.firstChild).not.toHaveClass('opacity-50');
    });

    it('hides entry count when isEmpty is true', () => {
      render(
        <DateHeader
          date="2025-01-14"
          totalHours={0}
          entryCount={0}
          isEmpty
        />
      );

      // Should not show "(0 entries)"
      expect(screen.queryByText(/entries?/i)).not.toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('has appropriate data-testid for testing', () => {
      render(
        <DateHeader
          date="2025-01-15"
          totalHours={4.5}
          entryCount={3}
        />
      );

      expect(screen.getByTestId('date-header')).toBeInTheDocument();
    });

    it('has semantic heading role for screen readers', () => {
      render(
        <DateHeader
          date="2025-01-15"
          totalHours={4.5}
          entryCount={3}
        />
      );

      const header = screen.getByRole('heading', { level: 3 });
      expect(header).toBeInTheDocument();
    });
  });
});
