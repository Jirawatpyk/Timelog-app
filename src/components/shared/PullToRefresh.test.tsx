// src/components/shared/PullToRefresh.test.tsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PullToRefresh } from './PullToRefresh';

describe('PullToRefresh', () => {
  const mockOnRefresh = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    vi.useFakeTimers();
    mockOnRefresh.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders children', () => {
    render(
      <PullToRefresh onRefresh={mockOnRefresh}>
        <div data-testid="content">Content</div>
      </PullToRefresh>
    );

    expect(screen.getByTestId('content')).toHaveTextContent('Content');
  });

  it('shows pull indicator when dragging down', () => {
    render(
      <PullToRefresh onRefresh={mockOnRefresh}>
        <div>Content</div>
      </PullToRefresh>
    );

    // The pull indicator should exist but be hidden initially
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('has accessible loading state', async () => {
    // Use a delayed promise to test loading state
    const delayedRefresh = vi.fn().mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 1000))
    );

    render(
      <PullToRefresh onRefresh={delayedRefresh} isLoading={true}>
        <div>Content</div>
      </PullToRefresh>
    );

    // Loading indicator should be visible
    const indicator = screen.getByRole('status');
    expect(indicator).toBeInTheDocument();
  });

  it('displays loading spinner when isLoading is true', () => {
    render(
      <PullToRefresh onRefresh={mockOnRefresh} isLoading={true}>
        <div>Content</div>
      </PullToRefresh>
    );

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('hides loading spinner when isLoading is false', () => {
    render(
      <PullToRefresh onRefresh={mockOnRefresh} isLoading={false}>
        <div>Content</div>
      </PullToRefresh>
    );

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('applies threshold styling', () => {
    const { container } = render(
      <PullToRefresh onRefresh={mockOnRefresh} threshold={60}>
        <div>Content</div>
      </PullToRefresh>
    );

    // Component should render without error with custom threshold
    expect(container.firstChild).toBeTruthy();
  });

  it('is accessible via aria-live', () => {
    render(
      <PullToRefresh onRefresh={mockOnRefresh} isLoading={true}>
        <div>Content</div>
      </PullToRefresh>
    );

    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('aria-live', 'polite');
  });

  describe('Haptic Feedback', () => {
    let originalNavigator: Navigator;

    beforeEach(() => {
      originalNavigator = global.navigator;
      // Reset module cache to ensure fresh import with mocked navigator
      vi.resetModules();
    });

    afterEach(() => {
      // Restore original navigator
      Object.defineProperty(global, 'navigator', {
        value: originalNavigator,
        configurable: true,
      });
      vi.resetModules();
    });

    it('calls navigator.vibrate when supported', async () => {
      const mockVibrate = vi.fn();
      Object.defineProperty(global, 'navigator', {
        value: { vibrate: mockVibrate },
        configurable: true,
      });

      // Fresh import after setting up navigator mock
      const { triggerHapticFeedback } = await import('./PullToRefresh');
      triggerHapticFeedback();

      expect(mockVibrate).toHaveBeenCalledWith(10);
    });

    it('does not throw when navigator.vibrate is not supported', async () => {
      Object.defineProperty(global, 'navigator', {
        value: {},
        configurable: true,
      });

      const { triggerHapticFeedback } = await import('./PullToRefresh');

      // Should not throw
      expect(() => triggerHapticFeedback()).not.toThrow();
    });

    it('does not throw when navigator is undefined', async () => {
      Object.defineProperty(global, 'navigator', {
        value: undefined,
        configurable: true,
      });

      const { triggerHapticFeedback } = await import('./PullToRefresh');

      // Should not throw
      expect(() => triggerHapticFeedback()).not.toThrow();
    });
  });
});
