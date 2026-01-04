import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { OfflineBanner } from './OfflineBanner';

// Mock the useOnlineStatus hook
vi.mock('@/hooks/use-online-status', () => ({
  useOnlineStatus: vi.fn(() => true),
}));

import { useOnlineStatus } from '@/hooks/use-online-status';

const mockUseOnlineStatus = vi.mocked(useOnlineStatus);

describe('OfflineBanner', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockUseOnlineStatus.mockReturnValue(true);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe('when online', () => {
    it('does not render the banner when online', () => {
      mockUseOnlineStatus.mockReturnValue(true);
      render(<OfflineBanner />);

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  describe('when offline', () => {
    it('renders the banner when offline', () => {
      mockUseOnlineStatus.mockReturnValue(false);
      render(<OfflineBanner />);

      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('displays the offline message in English', () => {
      mockUseOnlineStatus.mockReturnValue(false);
      render(<OfflineBanner />);

      expect(screen.getByText('No internet connection')).toBeInTheDocument();
    });

    it('has correct styling classes for amber/yellow background', () => {
      mockUseOnlineStatus.mockReturnValue(false);
      render(<OfflineBanner />);

      const banner = screen.getByRole('alert');
      expect(banner).toHaveClass('bg-amber-500');
      expect(banner).toHaveClass('text-white');
    });

    it('is positioned fixed at top', () => {
      mockUseOnlineStatus.mockReturnValue(false);
      render(<OfflineBanner />);

      const banner = screen.getByRole('alert');
      expect(banner).toHaveClass('fixed');
      expect(banner).toHaveClass('top-0');
    });

    it('has z-index 50 for proper stacking', () => {
      mockUseOnlineStatus.mockReturnValue(false);
      render(<OfflineBanner />);

      const banner = screen.getByRole('alert');
      expect(banner).toHaveClass('z-50');
    });
  });

  describe('when transitioning from offline to online', () => {
    it('shows online restored toast after going from offline to online', () => {
      // Start offline
      mockUseOnlineStatus.mockReturnValue(false);
      const { rerender } = render(<OfflineBanner />);

      expect(screen.getByText('No internet connection')).toBeInTheDocument();

      // Go back online
      mockUseOnlineStatus.mockReturnValue(true);
      rerender(<OfflineBanner />);

      // Should show online toast
      expect(screen.getByText('Back online')).toBeInTheDocument();
    });

    it('auto-dismisses the online toast after 3 seconds', () => {
      // Start offline
      mockUseOnlineStatus.mockReturnValue(false);
      const { rerender } = render(<OfflineBanner />);

      // Go back online
      mockUseOnlineStatus.mockReturnValue(true);
      rerender(<OfflineBanner />);

      expect(screen.getByText('Back online')).toBeInTheDocument();

      // Fast-forward 3 seconds
      act(() => {
        vi.advanceTimersByTime(3000);
      });

      expect(screen.queryByText('Back online')).not.toBeInTheDocument();
    });

    it('does not show toast when first loading while online', () => {
      // First render while online (no previous offline state)
      mockUseOnlineStatus.mockReturnValue(true);
      render(<OfflineBanner />);

      expect(screen.queryByText('Back online')).not.toBeInTheDocument();
    });

    it('has green styling for online toast', () => {
      // Start offline
      mockUseOnlineStatus.mockReturnValue(false);
      const { rerender } = render(<OfflineBanner />);

      // Go back online
      mockUseOnlineStatus.mockReturnValue(true);
      rerender(<OfflineBanner />);

      const toast = screen.getByText('Back online').closest('div');
      expect(toast).toHaveClass('bg-green-500');
    });
  });
});
