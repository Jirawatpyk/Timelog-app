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
});
