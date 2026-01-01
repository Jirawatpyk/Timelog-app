/**
 * EmptyState Component Tests
 * Story 3.5: Master Data Admin UI Layout (AC: 7)
 *
 * Tests for empty state display with action button
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { EmptyState } from './EmptyState';
import { Plus } from 'lucide-react';

describe('EmptyState', () => {
  describe('Rendering', () => {
    it('renders title', () => {
      render(<EmptyState title="No items found" />);

      expect(screen.getByRole('heading', { name: 'No items found' })).toBeInTheDocument();
    });

    it('renders description when provided', () => {
      render(
        <EmptyState
          title="No services"
          description="Add your first service to get started."
        />
      );

      expect(screen.getByText('Add your first service to get started.')).toBeInTheDocument();
    });

    it('does not render description when not provided', () => {
      render(<EmptyState title="No items found" />);

      const container = screen.getByRole('heading').parentElement;
      expect(container?.querySelectorAll('p')).toHaveLength(0);
    });

    it('renders default icon when not provided', () => {
      render(<EmptyState title="No items found" />);

      expect(screen.getByTestId('empty-state-icon')).toBeInTheDocument();
    });

    it('renders custom icon when provided', () => {
      render(
        <EmptyState
          title="No items found"
          icon={<Plus data-testid="custom-icon" />}
        />
      );

      expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    });
  });

  describe('Action button', () => {
    it('renders action button when both label and handler provided', () => {
      render(
        <EmptyState
          title="No items"
          actionLabel="Add Item"
          onAction={() => {}}
        />
      );

      expect(screen.getByRole('button', { name: /add item/i })).toBeInTheDocument();
    });

    it('does not render button when only label is provided', () => {
      render(
        <EmptyState
          title="No items"
          actionLabel="Add Item"
        />
      );

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('does not render button when only handler is provided', () => {
      render(
        <EmptyState
          title="No items"
          onAction={() => {}}
        />
      );

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('calls onAction when button is clicked', async () => {
      const user = userEvent.setup();
      const handleAction = vi.fn();

      render(
        <EmptyState
          title="No items"
          actionLabel="Add Item"
          onAction={handleAction}
        />
      );

      await user.click(screen.getByRole('button', { name: /add item/i }));

      expect(handleAction).toHaveBeenCalledTimes(1);
    });

    it('shows plus icon in button', () => {
      render(
        <EmptyState
          title="No items"
          actionLabel="Add Item"
          onAction={() => {}}
        />
      );

      const button = screen.getByRole('button', { name: /add item/i });
      expect(button.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper heading structure', () => {
      render(<EmptyState title="No items found" />);

      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toHaveTextContent('No items found');
    });

    it('button is keyboard focusable', async () => {
      const user = userEvent.setup();
      render(
        <EmptyState
          title="No items"
          actionLabel="Add Item"
          onAction={() => {}}
        />
      );

      await user.tab();

      expect(screen.getByRole('button', { name: /add item/i })).toHaveFocus();
    });
  });

  describe('Styling', () => {
    it('centers content', () => {
      render(<EmptyState title="No items found" />);

      const container = screen.getByRole('heading').closest('div');
      expect(container).toHaveClass('flex', 'flex-col', 'items-center', 'text-center');
    });

    it('has proper padding', () => {
      render(<EmptyState title="No items found" />);

      const container = screen.getByRole('heading').closest('div');
      expect(container).toHaveClass('py-12', 'px-4');
    });
  });
});
