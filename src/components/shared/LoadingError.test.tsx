'use client';

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { LoadingError } from './LoadingError';

describe('LoadingError', () => {
  it('renders default error message', () => {
    const onRetry = vi.fn();
    render(<LoadingError onRetry={onRetry} />);

    expect(screen.getByText('Failed to load data')).toBeInTheDocument();
  });

  it('renders custom error message', () => {
    const onRetry = vi.fn();
    render(<LoadingError message="Custom error" onRetry={onRetry} />);

    expect(screen.getByText('Custom error')).toBeInTheDocument();
  });

  it('renders retry button with correct text', () => {
    const onRetry = vi.fn();
    render(<LoadingError onRetry={onRetry} />);

    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  it('calls onRetry when retry button is clicked', () => {
    const onRetry = vi.fn();
    render(<LoadingError onRetry={onRetry} />);

    fireEvent.click(screen.getByRole('button', { name: /retry/i }));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('shows loading state when isRetrying is true', () => {
    const onRetry = vi.fn();
    render(<LoadingError onRetry={onRetry} isRetrying />);

    expect(screen.getByRole('button', { name: /loading/i })).toBeDisabled();
  });

  it('disables retry button when isRetrying is true', () => {
    const onRetry = vi.fn();
    render(<LoadingError onRetry={onRetry} isRetrying />);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('renders alert icon', () => {
    const onRetry = vi.fn();
    render(<LoadingError onRetry={onRetry} />);

    expect(screen.getByTestId('alert-icon')).toBeInTheDocument();
  });
});
