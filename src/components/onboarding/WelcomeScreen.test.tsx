import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WelcomeScreen } from './WelcomeScreen';

// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock completeOnboarding action
const mockCompleteOnboarding = vi.fn();
vi.mock('@/actions/onboarding', () => ({
  completeOnboarding: () => mockCompleteOnboarding(),
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
  },
}));

describe('WelcomeScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('AC 1: Welcome Screen Display', () => {
    it('displays "Welcome to Timelog!" heading', () => {
      mockCompleteOnboarding.mockResolvedValue({ success: true });
      render(<WelcomeScreen />);

      expect(screen.getByText('Welcome to Timelog!')).toBeInTheDocument();
    });

    it('displays "Get Started" button', () => {
      mockCompleteOnboarding.mockResolvedValue({ success: true });
      render(<WelcomeScreen />);

      expect(screen.getByRole('button', { name: /get started/i })).toBeInTheDocument();
    });

    it('displays Timelog branding', () => {
      mockCompleteOnboarding.mockResolvedValue({ success: true });
      render(<WelcomeScreen />);

      expect(screen.getByText('Timelog')).toBeInTheDocument();
    });
  });

  describe('AC 4: Feature Highlights', () => {
    it('shows feature 1: Easy Time Logging with Clock icon', () => {
      mockCompleteOnboarding.mockResolvedValue({ success: true });
      render(<WelcomeScreen />);

      expect(screen.getByText('Easy Time Logging')).toBeInTheDocument();
      expect(screen.getByText('Record your work hours quickly and easily')).toBeInTheDocument();
    });

    it('shows feature 2: Daily/Weekly Summary with BarChart icon', () => {
      mockCompleteOnboarding.mockResolvedValue({ success: true });
      render(<WelcomeScreen />);

      expect(screen.getByText('Daily/Weekly Summary')).toBeInTheDocument();
      expect(screen.getByText('Track your logged hours at a glance')).toBeInTheDocument();
    });

    it('shows feature 3: Quick Entry from Recent with Zap icon', () => {
      mockCompleteOnboarding.mockResolvedValue({ success: true });
      render(<WelcomeScreen />);

      expect(screen.getByText('Quick Entry from Recent')).toBeInTheDocument();
      expect(screen.getByText('Tap to auto-fill from previous entries')).toBeInTheDocument();
    });

    it('shows all 3 feature cards', () => {
      mockCompleteOnboarding.mockResolvedValue({ success: true });
      render(<WelcomeScreen />);

      const features = [
        'Easy Time Logging',
        'Daily/Weekly Summary',
        'Quick Entry from Recent',
      ];

      features.forEach((feature) => {
        expect(screen.getByText(feature)).toBeInTheDocument();
      });
    });
  });

  describe('AC 2: Complete Onboarding with Get Started', () => {
    it('redirects to /entry when "Get Started" clicked and onboarding succeeds', async () => {
      const user = userEvent.setup();
      mockCompleteOnboarding.mockResolvedValue({ success: true });

      render(<WelcomeScreen />);

      const getStartedButton = screen.getByRole('button', { name: /get started/i });
      await user.click(getStartedButton);

      await waitFor(() => {
        expect(mockCompleteOnboarding).toHaveBeenCalled();
        expect(mockPush).toHaveBeenCalledWith('/entry');
      });
    });

    it('shows loading state during completion', async () => {
      const user = userEvent.setup();
      // Create a delayed promise to see loading state
      mockCompleteOnboarding.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ success: true }), 100))
      );

      render(<WelcomeScreen />);

      const getStartedButton = screen.getByRole('button', { name: /get started/i });
      await user.click(getStartedButton);

      expect(screen.getByRole('button', { name: /loading/i })).toBeInTheDocument();
    });

    it('shows error toast when onboarding fails', async () => {
      const user = userEvent.setup();
      const { toast } = await import('sonner');
      mockCompleteOnboarding.mockResolvedValue({
        success: false,
        error: 'Failed to complete onboarding',
      });

      render(<WelcomeScreen />);

      const getStartedButton = screen.getByRole('button', { name: /get started/i });
      await user.click(getStartedButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to complete onboarding');
      });
    });
  });

  describe('AC 5: Skip Option', () => {
    it('displays "Skip" link', () => {
      mockCompleteOnboarding.mockResolvedValue({ success: true });
      render(<WelcomeScreen />);

      expect(screen.getByRole('button', { name: /skip/i })).toBeInTheDocument();
    });

    it('completes onboarding when Skip is clicked', async () => {
      const user = userEvent.setup();
      mockCompleteOnboarding.mockResolvedValue({ success: true });

      render(<WelcomeScreen />);

      const skipButton = screen.getByRole('button', { name: /skip/i });
      await user.click(skipButton);

      await waitFor(() => {
        expect(mockCompleteOnboarding).toHaveBeenCalled();
        expect(mockPush).toHaveBeenCalledWith('/entry');
      });
    });
  });

  describe('Accessibility', () => {
    it('focuses on Get Started button on mount', () => {
      mockCompleteOnboarding.mockResolvedValue({ success: true });
      render(<WelcomeScreen />);

      const getStartedButton = screen.getByRole('button', { name: /get started/i });
      expect(getStartedButton).toHaveFocus();
    });

    it('disables buttons during loading', async () => {
      const user = userEvent.setup();
      mockCompleteOnboarding.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ success: true }), 100))
      );

      render(<WelcomeScreen />);

      const getStartedButton = screen.getByRole('button', { name: /get started/i });
      await user.click(getStartedButton);

      const skipButton = screen.getByRole('button', { name: /skip/i });
      expect(skipButton).toBeDisabled();
    });
  });
});
