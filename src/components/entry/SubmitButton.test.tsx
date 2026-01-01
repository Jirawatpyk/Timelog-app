import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SubmitButton } from './SubmitButton';

describe('SubmitButton', () => {
  describe('Default State (AC6)', () => {
    it('renders with submit text', () => {
      render(<SubmitButton isLoading={false} />);
      expect(screen.getByRole('button')).toHaveTextContent('Save');
    });

    it('is not disabled by default', () => {
      render(<SubmitButton isLoading={false} />);
      expect(screen.getByRole('button')).not.toBeDisabled();
    });

    it('has type submit', () => {
      render(<SubmitButton isLoading={false} />);
      expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
    });
  });

  describe('Loading State (AC6)', () => {
    it('shows loading spinner when isLoading is true', () => {
      render(<SubmitButton isLoading={true} />);
      expect(screen.getByText('Saving...')).toBeInTheDocument();
    });

    it('is disabled when loading', () => {
      render(<SubmitButton isLoading={true} />);
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('shows spinner icon when loading', () => {
      render(<SubmitButton isLoading={true} />);
      const button = screen.getByRole('button');
      // Loader2 icon with animate-spin class
      expect(button.querySelector('svg.animate-spin')).toBeInTheDocument();
    });
  });

  describe('Success State', () => {
    it('shows success text when isSuccess is true', () => {
      render(<SubmitButton isLoading={false} isSuccess={true} />);
      expect(screen.getByText('Saved!')).toBeInTheDocument();
    });

    it('shows checkmark icon when success', () => {
      render(<SubmitButton isLoading={false} isSuccess={true} />);
      const button = screen.getByRole('button');
      expect(button.querySelector('svg')).toBeInTheDocument();
    });

    it('applies success styling', () => {
      render(<SubmitButton isLoading={false} isSuccess={true} />);
      const button = screen.getByRole('button');
      expect(button.className).toContain('bg-green');
    });
  });

  describe('Disabled State', () => {
    it('is disabled when disabled prop is true', () => {
      render(<SubmitButton isLoading={false} disabled={true} />);
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('is disabled when both loading and disabled', () => {
      render(<SubmitButton isLoading={true} disabled={true} />);
      expect(screen.getByRole('button')).toBeDisabled();
    });
  });

  describe('Click Handler', () => {
    it('calls onClick when clicked', async () => {
      const mockOnClick = vi.fn();
      const user = userEvent.setup();
      render(<SubmitButton isLoading={false} onClick={mockOnClick} />);

      await user.click(screen.getByRole('button'));

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('does not call onClick when loading (double submission prevention)', async () => {
      const mockOnClick = vi.fn();
      const user = userEvent.setup();
      render(<SubmitButton isLoading={true} onClick={mockOnClick} />);

      await user.click(screen.getByRole('button'));

      expect(mockOnClick).not.toHaveBeenCalled();
    });
  });

  describe('Mobile Touch Support', () => {
    it('has minimum touch target size (48px)', () => {
      render(<SubmitButton isLoading={false} />);
      const button = screen.getByRole('button');
      // min-h-[48px] class should be present
      expect(button.className).toContain('min-h-[48px]');
    });

    it('has touch-manipulation class', () => {
      render(<SubmitButton isLoading={false} />);
      const button = screen.getByRole('button');
      expect(button.className).toContain('touch-manipulation');
    });
  });

  describe('Accessibility', () => {
    it('is focusable', () => {
      render(<SubmitButton isLoading={false} />);
      const button = screen.getByRole('button');
      button.focus();
      expect(button).toHaveFocus();
    });

    it('has full width styling', () => {
      render(<SubmitButton isLoading={false} />);
      const button = screen.getByRole('button');
      expect(button.className).toContain('w-full');
    });
  });
});
