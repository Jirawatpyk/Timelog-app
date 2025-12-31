/**
 * Tests for ClientItem Component
 * Story 3.2: Client Management (AC: 4, 5, 6)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ClientItem } from './ClientItem';
import type { Client } from '@/types/domain';

// Mock server actions
const mockToggleClientActive = vi.fn();

vi.mock('@/actions/master-data', () => ({
  toggleClientActive: (id: string, active: boolean) => mockToggleClientActive(id, active),
  updateClientAction: vi.fn(),
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock EditClientDialog
vi.mock('@/components/admin/EditClientDialog', () => ({
  EditClientDialog: ({ client }: { client: Client }) => (
    <button data-testid={`edit-dialog-${client.id}`}>Edit</button>
  ),
}));

const mockActiveClient: Client = {
  id: '1',
  name: 'Netflix',
  active: true,
  created_at: '2024-01-01',
};

const mockInactiveClient: Client = {
  id: '2',
  name: 'Old Client',
  active: false,
  created_at: '2024-01-01',
};

describe('ClientItem', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders client name', () => {
      render(<ClientItem client={mockActiveClient} />);

      expect(screen.getByText('Netflix')).toBeInTheDocument();
    });

    it('renders edit button', () => {
      render(<ClientItem client={mockActiveClient} />);

      expect(screen.getByTestId('edit-dialog-1')).toBeInTheDocument();
    });

    it('renders toggle switch', () => {
      render(<ClientItem client={mockActiveClient} />);

      expect(screen.getByRole('switch')).toBeInTheDocument();
    });

    it('shows switch as checked for active client', () => {
      render(<ClientItem client={mockActiveClient} />);

      expect(screen.getByRole('switch')).toBeChecked();
    });

    it('shows switch as unchecked for inactive client', () => {
      render(<ClientItem client={mockInactiveClient} />);

      expect(screen.getByRole('switch')).not.toBeChecked();
    });
  });

  describe('visual distinction for inactive clients (AC: 6)', () => {
    it('applies opacity to inactive client container', () => {
      render(<ClientItem client={mockInactiveClient} />);

      const container = screen.getByTestId('client-item');
      expect(container).toHaveClass('opacity-50');
    });

    it('does not apply opacity to active client container', () => {
      render(<ClientItem client={mockActiveClient} />);

      const container = screen.getByTestId('client-item');
      expect(container).not.toHaveClass('opacity-50');
    });

    it('applies line-through to inactive client name', () => {
      render(<ClientItem client={mockInactiveClient} />);

      const name = screen.getByTestId('client-name-2');
      expect(name).toHaveClass('line-through');
    });

    it('does not apply line-through to active client name', () => {
      render(<ClientItem client={mockActiveClient} />);

      const name = screen.getByTestId('client-name-1');
      expect(name).not.toHaveClass('line-through');
    });
  });

  describe('toggle active status (AC: 5)', () => {
    it('calls toggleClientActive when switch is clicked', async () => {
      mockToggleClientActive.mockResolvedValue({ success: true, data: { ...mockActiveClient, active: false } });

      render(<ClientItem client={mockActiveClient} />);

      await user.click(screen.getByRole('switch'));

      await waitFor(() => {
        expect(mockToggleClientActive).toHaveBeenCalledWith('1', false);
      });
    });

    it('applies optimistic update when toggling', async () => {
      mockToggleClientActive.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ success: true, data: { ...mockActiveClient, active: false } }), 100))
      );

      render(<ClientItem client={mockActiveClient} />);

      // Click toggle
      await user.click(screen.getByRole('switch'));

      // Should immediately show unchecked (optimistic update)
      await waitFor(() => {
        expect(screen.getByRole('switch')).not.toBeChecked();
      });
    });

    it('reverts optimistic update on error', async () => {
      mockToggleClientActive.mockResolvedValue({ success: false, error: 'Failed to update' });

      render(<ClientItem client={mockActiveClient} />);

      await user.click(screen.getByRole('switch'));

      await waitFor(() => {
        // Should revert back to checked
        expect(screen.getByRole('switch')).toBeChecked();
      });
    });

    it('disables switch during toggle operation', async () => {
      mockToggleClientActive.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ success: true, data: { ...mockActiveClient, active: false } }), 100))
      );

      render(<ClientItem client={mockActiveClient} />);

      await user.click(screen.getByRole('switch'));

      // Switch should be disabled while pending
      expect(screen.getByRole('switch')).toBeDisabled();
    });

    it('re-enables switch after toggle completes', async () => {
      mockToggleClientActive.mockResolvedValue({ success: true, data: { ...mockActiveClient, active: false } });

      render(<ClientItem client={mockActiveClient} />);

      await user.click(screen.getByRole('switch'));

      await waitFor(() => {
        expect(screen.getByRole('switch')).not.toBeDisabled();
      });
    });
  });
});
