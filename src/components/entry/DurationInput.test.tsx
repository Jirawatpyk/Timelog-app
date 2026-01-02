import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DurationInput } from './DurationInput';
import { DURATION_PRESETS } from '@/lib/duration';

describe('DurationInput', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Preset Buttons (AC4)', () => {
    it('renders all preset buttons', () => {
      render(<DurationInput value={0} onChange={mockOnChange} />);

      DURATION_PRESETS.forEach((preset) => {
        expect(screen.getByRole('button', { name: `${preset}h` })).toBeInTheDocument();
      });
    });

    it('calls onChange when preset button is clicked', async () => {
      const user = userEvent.setup();
      render(<DurationInput value={0} onChange={mockOnChange} />);

      await user.click(screen.getByRole('button', { name: '1h' }));

      expect(mockOnChange).toHaveBeenCalledWith(1);
    });

    it('highlights selected preset button', () => {
      render(<DurationInput value={2} onChange={mockOnChange} />);

      const selectedButton = screen.getByRole('button', { name: '2h' });
      // The selected button should have the default variant (not outline)
      expect(selectedButton).toHaveAttribute('data-selected', 'true');
    });

    it('does not highlight non-selected presets', () => {
      render(<DurationInput value={2} onChange={mockOnChange} />);

      const otherButton = screen.getByRole('button', { name: '1h' });
      expect(otherButton).toHaveAttribute('data-selected', 'false');
    });
  });

  describe('Custom Input (AC3, AC5)', () => {
    it('renders duration input field', () => {
      render(<DurationInput value={0} onChange={mockOnChange} />);

      expect(screen.getByRole('spinbutton')).toBeInTheDocument();
    });

    it('accepts decimal input', async () => {
      const user = userEvent.setup();
      render(<DurationInput value={0} onChange={mockOnChange} />);

      const input = screen.getByRole('spinbutton');
      await user.clear(input);
      await user.type(input, '1.5');

      expect(mockOnChange).toHaveBeenLastCalledWith(1.5);
    });

    it('displays current value in input', () => {
      render(<DurationInput value={2.5} onChange={mockOnChange} />);

      const input = screen.getByRole('spinbutton');
      expect(input).toHaveValue(2.5);
    });

    it('has step of 0.25', () => {
      render(<DurationInput value={0} onChange={mockOnChange} />);

      const input = screen.getByRole('spinbutton');
      expect(input).toHaveAttribute('step', '0.25');
    });

    it('has min value of 0.25', () => {
      render(<DurationInput value={0} onChange={mockOnChange} />);

      const input = screen.getByRole('spinbutton');
      expect(input).toHaveAttribute('min', '0.25');
    });

    it('has max value of 24', () => {
      render(<DurationInput value={0} onChange={mockOnChange} />);

      const input = screen.getByRole('spinbutton');
      expect(input).toHaveAttribute('max', '24');
    });

    it('shows hrs suffix', () => {
      render(<DurationInput value={0} onChange={mockOnChange} />);

      expect(screen.getByText('hrs')).toBeInTheDocument();
    });

    it('shows helper text', () => {
      render(<DurationInput value={0} onChange={mockOnChange} />);

      expect(screen.getByText(/Enter hours/)).toBeInTheDocument();
    });

    it('rounds to nearest 0.25 on blur', async () => {
      const user = userEvent.setup();
      render(<DurationInput value={0} onChange={mockOnChange} />);

      const input = screen.getByRole('spinbutton');
      await user.clear(input);
      await user.type(input, '1.3');

      // Trigger blur
      fireEvent.blur(input);

      // Should round 1.3 to 1.25
      expect(mockOnChange).toHaveBeenLastCalledWith(1.25);
    });
  });

  describe('Label and Error (AC6)', () => {
    it('shows required indicator', () => {
      render(<DurationInput value={0} onChange={mockOnChange} />);

      expect(screen.getByText('Duration (hours) *')).toBeInTheDocument();
    });

    it('displays validation error when provided', () => {
      render(
        <DurationInput
          value={0}
          onChange={mockOnChange}
          error="กรุณาใส่เวลาที่ถูกต้อง (0.25-24 ชั่วโมง)"
        />
      );

      expect(
        screen.getByText('กรุณาใส่เวลาที่ถูกต้อง (0.25-24 ชั่วโมง)')
      ).toBeInTheDocument();
    });

    it('applies error styling when error is provided', () => {
      render(
        <DurationInput value={0} onChange={mockOnChange} error="Error message" />
      );

      const input = screen.getByRole('spinbutton');
      expect(input.className).toContain('border-destructive');
    });
  });

  describe('Accessibility', () => {
    it('has correct aria attributes', () => {
      render(<DurationInput value={1.5} onChange={mockOnChange} />);

      const input = screen.getByRole('spinbutton');
      expect(input).toHaveAttribute('id', 'durationHours');
    });

    it('preset buttons have type button to prevent form submission', () => {
      render(<DurationInput value={0} onChange={mockOnChange} />);

      DURATION_PRESETS.forEach((preset) => {
        const button = screen.getByRole('button', { name: `${preset}h` });
        expect(button).toHaveAttribute('type', 'button');
      });
    });
  });
});
