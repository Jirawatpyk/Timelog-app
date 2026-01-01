import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SuccessAnimation } from './SuccessAnimation';

// Mock framer-motion to avoid animation timing issues in tests
vi.mock('framer-motion', () => {
  const MockMotionDiv = ({ children, className, onAnimationComplete, ...props }: React.ComponentProps<'div'> & { onAnimationComplete?: () => void }) => {
    // Call onAnimationComplete asynchronously to simulate animation
    if (onAnimationComplete) {
      setTimeout(onAnimationComplete, 10);
    }
    return (
      <div {...props} className={className} data-testid="motion-div">
        {children}
      </div>
    );
  };

  const MockMotionP = ({ children, className, ...props }: React.ComponentProps<'p'>) => (
    <p {...props} className={className}>{children}</p>
  );

  return {
    motion: {
      div: MockMotionDiv,
      p: MockMotionP,
    },
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

describe('SuccessAnimation', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Visibility (AC5)', () => {
    it('renders when show is true', () => {
      render(<SuccessAnimation show={true} />);
      expect(screen.getByText(/Saved!/)).toBeInTheDocument();
    });

    it('does not render when show is false', () => {
      render(<SuccessAnimation show={false} />);
      expect(screen.queryByText(/Saved!/)).not.toBeInTheDocument();
    });
  });

  describe('Content (AC5)', () => {
    it('shows success message', () => {
      render(<SuccessAnimation show={true} />);
      expect(screen.getByText(/Saved!/)).toBeInTheDocument();
    });

    it('shows checkmark icon', () => {
      render(<SuccessAnimation show={true} />);
      // Check component has SVG for checkmark
      const motionDivs = screen.getAllByTestId('motion-div');
      const hasCheckIcon = motionDivs.some(div => div.querySelector('svg') !== null);
      expect(hasCheckIcon).toBe(true);
    });

    it('has green success styling', () => {
      render(<SuccessAnimation show={true} />);
      const successText = screen.getByText(/Saved!/);
      expect(successText.className).toContain('text-green');
    });
  });

  describe('Overlay (AC5)', () => {
    it('has backdrop overlay', () => {
      render(<SuccessAnimation show={true} />);
      const overlay = screen.getAllByTestId('motion-div')[0];
      // Check for backdrop classes
      expect(overlay.className).toContain('fixed');
      expect(overlay.className).toContain('inset-0');
    });

    it('centers content', () => {
      render(<SuccessAnimation show={true} />);
      const overlay = screen.getAllByTestId('motion-div')[0];
      expect(overlay.className).toContain('flex');
      expect(overlay.className).toContain('items-center');
      expect(overlay.className).toContain('justify-center');
    });
  });

  describe('Callback Props', () => {
    it('accepts onComplete callback prop', () => {
      const mockOnComplete = vi.fn();
      // Just verify component renders with callback without error
      const { unmount } = render(<SuccessAnimation show={true} onComplete={mockOnComplete} />);
      expect(screen.getByText(/Saved!/)).toBeInTheDocument();
      unmount();
    });
  });

  describe('Accessibility', () => {
    it('has high z-index for overlay', () => {
      render(<SuccessAnimation show={true} />);
      const overlay = screen.getAllByTestId('motion-div')[0];
      expect(overlay.className).toContain('z-50');
    });
  });
});
