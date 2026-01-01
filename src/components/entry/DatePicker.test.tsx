import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DatePicker } from './DatePicker';

describe('DatePicker', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Display (AC1, AC3)', () => {
    it('renders date field with label', () => {
      render(<DatePicker value="2024-12-31" onChange={mockOnChange} />);
      expect(screen.getByText('Date *')).toBeInTheDocument();
    });

    it('displays date in English format', () => {
      render(<DatePicker value="2024-12-31" onChange={mockOnChange} />);
      expect(screen.getByRole('button')).toHaveTextContent('Dec 31, 2024');
    });

    it('shows Gregorian year', () => {
      render(<DatePicker value="2025-01-01" onChange={mockOnChange} />);
      expect(screen.getByRole('button')).toHaveTextContent('2025');
    });

    it('shows placeholder when no value', () => {
      render(<DatePicker value="" onChange={mockOnChange} />);
      expect(screen.getByRole('button')).toHaveTextContent('Select date');
    });

    it('shows calendar icon', () => {
      render(<DatePicker value="2024-12-31" onChange={mockOnChange} />);
      // lucide-react Calendar icon should be present
      const button = screen.getByRole('button');
      expect(button.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('Date Picker Interaction (AC2)', () => {
    it('opens calendar when button is clicked', async () => {
      const user = userEvent.setup();
      render(<DatePicker value="2024-12-31" onChange={mockOnChange} />);

      await user.click(screen.getByRole('button'));

      // Calendar should be visible (grid role is used by react-day-picker)
      await waitFor(() => {
        expect(screen.getByRole('grid')).toBeInTheDocument();
      });
    });

    it('renders calendar with correct structure', async () => {
      const user = userEvent.setup();
      render(<DatePicker value="2024-12-31" onChange={mockOnChange} />);

      await user.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(screen.getByRole('grid')).toBeInTheDocument();
      });

      // Calendar should have navigation and day cells
      expect(screen.getAllByRole('gridcell').length).toBeGreaterThan(0);
    });
  });

  describe('Future Date Warning (AC4)', () => {
    beforeEach(() => {
      // Mock today for future date warning tests
      vi.useFakeTimers();
      vi.setSystemTime(new Date(2024, 11, 31, 12, 0, 0));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('shows warning for dates more than 1 day in future', () => {
      // Today is 2024-12-31, so 2025-01-02 is 2 days ahead
      render(<DatePicker value="2025-01-02" onChange={mockOnChange} />);
      expect(screen.getByText(/Selected date is in the future/)).toBeInTheDocument();
    });

    it('does not show warning for tomorrow', () => {
      // Today is 2024-12-31, tomorrow is 2025-01-01
      render(<DatePicker value="2025-01-01" onChange={mockOnChange} />);
      expect(screen.queryByText(/Selected date is in the future/)).not.toBeInTheDocument();
    });

    it('does not show warning for today', () => {
      render(<DatePicker value="2024-12-31" onChange={mockOnChange} />);
      expect(screen.queryByText(/Selected date is in the future/)).not.toBeInTheDocument();
    });

    it('does not show warning for past dates', () => {
      render(<DatePicker value="2024-12-25" onChange={mockOnChange} />);
      expect(screen.queryByText(/Selected date is in the future/)).not.toBeInTheDocument();
    });
  });

  describe('Future Date Warning - Interaction', () => {
    it('warning does not block selection', async () => {
      // Use real timers for interaction but check warning exists with specific date
      const user = userEvent.setup();

      // Use a far future date that will definitely show warning
      const farFutureDate = new Date();
      farFutureDate.setDate(farFutureDate.getDate() + 30); // 30 days from now
      const futureISO = farFutureDate.toISOString().split('T')[0];

      render(<DatePicker value={futureISO} onChange={mockOnChange} />);

      // Warning is shown but button is still clickable
      expect(screen.getByText(/Selected date is in the future/)).toBeInTheDocument();

      // Can still interact with the picker
      await user.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(screen.getByRole('grid')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('displays error message when provided', () => {
      render(
        <DatePicker
          value="2024-12-31"
          onChange={mockOnChange}
          error="กรุณาเลือกวันที่"
        />
      );
      expect(screen.getByText('กรุณาเลือกวันที่')).toBeInTheDocument();
    });

    it('applies error styling when error is provided', () => {
      render(
        <DatePicker
          value="2024-12-31"
          onChange={mockOnChange}
          error="Error"
        />
      );
      const button = screen.getByRole('button');
      expect(button.className).toContain('border-destructive');
    });
  });

  describe('Accessibility', () => {
    it('has accessible label', () => {
      render(<DatePicker value="2024-12-31" onChange={mockOnChange} />);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('id', 'entry-date');
    });

    it('button is accessible with proper attributes', () => {
      render(<DatePicker value="2024-12-31" onChange={mockOnChange} />);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'button');
    });
  });

  describe('Mobile Touch Support', () => {
    it('has minimum touch target size', () => {
      render(<DatePicker value="2024-12-31" onChange={mockOnChange} />);
      const button = screen.getByRole('button');
      // min-h-[44px] class should be present
      expect(button.className).toContain('min-h-[44px]');
    });
  });
});
