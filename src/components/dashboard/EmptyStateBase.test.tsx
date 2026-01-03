/**
 * EmptyStateBase Tests - Story 5.8
 *
 * Tests for the base EmptyStateBase component.
 * AC7: Visual design - muted colors, centered layout, encouraging feel
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Calendar } from 'lucide-react';
import { EmptyStateBase } from './EmptyStateBase';

describe('EmptyStateBase', () => {
  it('renders icon, title, and description', () => {
    render(
      <EmptyStateBase
        icon={Calendar}
        title="Test Title"
        description="Test description"
      />
    );

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  it('renders only title without description', () => {
    render(<EmptyStateBase icon={Calendar} title="Title Only" />);

    expect(screen.getByText('Title Only')).toBeInTheDocument();
  });

  it('renders action button with href', () => {
    render(
      <EmptyStateBase
        icon={Calendar}
        title="Test"
        action={{ label: 'Click me', href: '/test' }}
      />
    );

    const link = screen.getByRole('link', { name: 'Click me' });
    expect(link).toHaveAttribute('href', '/test');
  });

  it('renders action button with onClick', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <EmptyStateBase
        icon={Calendar}
        title="Test"
        action={{ label: 'Click me', onClick }}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Click me' }));
    expect(onClick).toHaveBeenCalled();
  });

  it('renders secondary action button', async () => {
    const user = userEvent.setup();
    const onSecondaryClick = vi.fn();
    render(
      <EmptyStateBase
        icon={Calendar}
        title="Test"
        action={{ label: 'Primary', href: '/primary' }}
        secondaryAction={{ label: 'Secondary', onClick: onSecondaryClick }}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Secondary' }));
    expect(onSecondaryClick).toHaveBeenCalled();
  });

  it('applies custom className', () => {
    const { container } = render(
      <EmptyStateBase
        icon={Calendar}
        title="Test"
        className="custom-class"
      />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('renders icon with muted styling', () => {
    const { container } = render(
      <EmptyStateBase icon={Calendar} title="Test" />
    );

    // Icon container should have bg-muted class
    const iconContainer = container.querySelector('.bg-muted');
    expect(iconContainer).toBeInTheDocument();
  });

  it('has centered layout', () => {
    const { container } = render(
      <EmptyStateBase icon={Calendar} title="Test" />
    );

    expect(container.firstChild).toHaveClass('items-center');
    expect(container.firstChild).toHaveClass('justify-center');
    expect(container.firstChild).toHaveClass('text-center');
  });

  it('has testid for testing', () => {
    render(<EmptyStateBase icon={Calendar} title="Test" />);

    expect(screen.getByTestId('empty-state-base')).toBeInTheDocument();
  });
});
