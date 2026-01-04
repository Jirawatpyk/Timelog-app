import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UpdateNotification } from './UpdateNotification';

// Mock the useServiceWorker hook
const mockUpdate = vi.fn();
const mockDismissUpdate = vi.fn();

vi.mock('@/hooks/use-service-worker', () => ({
  useServiceWorker: vi.fn(() => ({
    updateAvailable: true,
    isReady: true,
    update: mockUpdate,
    dismissUpdate: mockDismissUpdate,
  })),
}));

// Import the mock to control it
import { useServiceWorker } from '@/hooks/use-service-worker';
const mockedUseServiceWorker = vi.mocked(useServiceWorker);

describe('UpdateNotification', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default: update available
    mockedUseServiceWorker.mockReturnValue({
      updateAvailable: true,
      isReady: true,
      update: mockUpdate,
      dismissUpdate: mockDismissUpdate,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('when update is available', () => {
    it('should render the notification', () => {
      render(<UpdateNotification />);

      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('Update available')).toBeInTheDocument();
    });

    it('should render Refresh button', () => {
      render(<UpdateNotification />);

      expect(
        screen.getByRole('button', { name: /refresh/i })
      ).toBeInTheDocument();
    });

    it('should render dismiss button', () => {
      render(<UpdateNotification />);

      expect(
        screen.getByRole('button', { name: /dismiss/i })
      ).toBeInTheDocument();
    });

    it('should call update when Refresh is clicked', async () => {
      const user = userEvent.setup();
      render(<UpdateNotification />);

      await user.click(screen.getByRole('button', { name: /refresh/i }));

      expect(mockUpdate).toHaveBeenCalledTimes(1);
    });

    it('should call dismissUpdate when dismiss button is clicked', async () => {
      const user = userEvent.setup();
      render(<UpdateNotification />);

      await user.click(screen.getByRole('button', { name: /dismiss/i }));

      expect(mockDismissUpdate).toHaveBeenCalledTimes(1);
    });

    it('should have correct aria attributes for accessibility', () => {
      render(<UpdateNotification />);

      const alert = screen.getByRole('alert');
      expect(alert).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('when update is not available', () => {
    it('should not render anything', () => {
      mockedUseServiceWorker.mockReturnValue({
        updateAvailable: false,
        isReady: true,
        update: mockUpdate,
        dismissUpdate: mockDismissUpdate,
      });

      const { container } = render(<UpdateNotification />);

      expect(container).toBeEmptyDOMElement();
    });
  });

  describe('auto-dismiss timer', () => {
    it('should set up auto-dismiss timer on mount', () => {
      vi.useFakeTimers();
      render(<UpdateNotification />);

      // Fast-forward 30 seconds
      vi.advanceTimersByTime(30000);

      // Should have called dismissUpdate
      expect(mockDismissUpdate).toHaveBeenCalledTimes(1);

      vi.useRealTimers();
    });

    it('should clear timeout on unmount', () => {
      vi.useFakeTimers();
      const { unmount } = render(<UpdateNotification />);

      // Unmount before timeout
      unmount();

      // Advance timers - dismissUpdate should not be called
      vi.advanceTimersByTime(30000);

      expect(mockDismissUpdate).not.toHaveBeenCalled();

      vi.useRealTimers();
    });

    it('should not start timeout when updateAvailable is false', () => {
      vi.useFakeTimers();
      mockedUseServiceWorker.mockReturnValue({
        updateAvailable: false,
        isReady: true,
        update: mockUpdate,
        dismissUpdate: mockDismissUpdate,
      });

      render(<UpdateNotification />);

      vi.advanceTimersByTime(30000);

      expect(mockDismissUpdate).not.toHaveBeenCalled();

      vi.useRealTimers();
    });
  });

  describe('visual elements', () => {
    it('should show spinning refresh icon', () => {
      render(<UpdateNotification />);

      // Find the icon by checking the SVG with animate-spin class
      const container = screen.getByRole('alert');
      const spinningIcon = container.querySelector('.animate-spin');
      expect(spinningIcon).toBeInTheDocument();
    });

    it('should have fixed positioning styles', () => {
      render(<UpdateNotification />);

      const alert = screen.getByRole('alert');
      expect(alert).toHaveClass('fixed');
      expect(alert).toHaveClass('top-20');
    });
  });
});
