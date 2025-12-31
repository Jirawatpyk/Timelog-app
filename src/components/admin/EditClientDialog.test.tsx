/**
 * Component tests for EditClientDialog
 * Story 3.2: Client Management (AC: 3, 4)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EditClientDialog } from './EditClientDialog';
import type { Client } from '@/types/domain';

// Mock the server action
vi.mock('@/actions/master-data', () => ({
  updateClientAction: vi.fn(),
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

import { updateClientAction } from '@/actions/master-data';
import { toast } from 'sonner';
import type { ActionResult } from '@/types/domain';

const mockUpdateClientAction = vi.mocked(updateClientAction);
type ClientActionResult = ActionResult<Client>;

const mockClient: Client = {
  id: 'client-123',
  name: 'Original Client Name',
  active: true,
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
};

describe('EditClientDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('renders correctly', () => {
    it('should render edit button with pencil icon', () => {
      render(<EditClientDialog client={mockClient} />);
      expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
    });

    it('should open dialog when button is clicked', async () => {
      const user = userEvent.setup();
      render(<EditClientDialog client={mockClient} />);

      await user.click(screen.getByRole('button', { name: /edit/i }));

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Edit Client')).toBeInTheDocument();
      expect(screen.getByLabelText(/client name/i)).toBeInTheDocument();
    });

    it('should pre-populate form with client name', async () => {
      const user = userEvent.setup();
      render(<EditClientDialog client={mockClient} />);

      await user.click(screen.getByRole('button', { name: /edit/i }));

      expect(screen.getByLabelText(/client name/i)).toHaveValue('Original Client Name');
    });
  });

  describe('form validation (AC3)', () => {
    it('should show error when name is cleared', async () => {
      const user = userEvent.setup();
      render(<EditClientDialog client={mockClient} />);

      await user.click(screen.getByRole('button', { name: /edit/i }));

      // Clear the input
      await user.clear(screen.getByLabelText(/client name/i));

      // Submit empty form
      await user.click(screen.getByRole('button', { name: /save changes/i }));

      await waitFor(() => {
        expect(screen.getByText('Client name is required')).toBeInTheDocument();
      });
    });

    it('should not call updateClientAction when form is invalid', async () => {
      const user = userEvent.setup();
      render(<EditClientDialog client={mockClient} />);

      await user.click(screen.getByRole('button', { name: /edit/i }));
      await user.clear(screen.getByLabelText(/client name/i));
      await user.click(screen.getByRole('button', { name: /save changes/i }));

      await waitFor(() => {
        expect(screen.getByText('Client name is required')).toBeInTheDocument();
      });

      expect(mockUpdateClientAction).not.toHaveBeenCalled();
    });
  });

  describe('form submission (AC4)', () => {
    it('should call updateClientAction with client ID and new name', async () => {
      const user = userEvent.setup();
      const updatedClient: Client = {
        ...mockClient,
        name: 'Updated Client Name',
        updated_at: new Date().toISOString(),
      };

      mockUpdateClientAction.mockResolvedValue({ success: true, data: updatedClient });

      render(<EditClientDialog client={mockClient} />);

      await user.click(screen.getByRole('button', { name: /edit/i }));
      await user.clear(screen.getByLabelText(/client name/i));
      await user.type(screen.getByLabelText(/client name/i), 'Updated Client Name');
      await user.click(screen.getByRole('button', { name: /save changes/i }));

      await waitFor(() => {
        expect(mockUpdateClientAction).toHaveBeenCalledWith('client-123', {
          name: 'Updated Client Name',
        });
      });
    });

    it('should show success toast and close dialog on success', async () => {
      const user = userEvent.setup();
      const updatedClient: Client = {
        ...mockClient,
        name: 'Updated Client',
        updated_at: new Date().toISOString(),
      };

      mockUpdateClientAction.mockResolvedValue({ success: true, data: updatedClient });

      render(<EditClientDialog client={mockClient} />);

      await user.click(screen.getByRole('button', { name: /edit/i }));
      await user.clear(screen.getByLabelText(/client name/i));
      await user.type(screen.getByLabelText(/client name/i), 'Updated Client');
      await user.click(screen.getByRole('button', { name: /save changes/i }));

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Client updated');
      });

      // Dialog should be closed
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('should show error message when update fails', async () => {
      const user = userEvent.setup();

      mockUpdateClientAction.mockResolvedValue({
        success: false,
        error: 'Client name already exists',
      });

      render(<EditClientDialog client={mockClient} />);

      await user.click(screen.getByRole('button', { name: /edit/i }));
      await user.clear(screen.getByLabelText(/client name/i));
      await user.type(screen.getByLabelText(/client name/i), 'Duplicate Name');
      await user.click(screen.getByRole('button', { name: /save changes/i }));

      await waitFor(() => {
        expect(screen.getByText('Client name already exists')).toBeInTheDocument();
      });

      // Dialog should remain open
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  describe('dialog state', () => {
    it('should reset to original name when dialog is reopened', async () => {
      const user = userEvent.setup();
      render(<EditClientDialog client={mockClient} />);

      // Open and modify
      await user.click(screen.getByRole('button', { name: /edit/i }));
      await user.clear(screen.getByLabelText(/client name/i));
      await user.type(screen.getByLabelText(/client name/i), 'Modified Name');

      // Close dialog
      await user.keyboard('{Escape}');

      // Reopen dialog
      await user.click(screen.getByRole('button', { name: /edit/i }));

      // Should show original name, not modified
      expect(screen.getByLabelText(/client name/i)).toHaveValue('Original Client Name');
    });

    it('should update form when client prop changes', async () => {
      const user = userEvent.setup();
      const { rerender } = render(<EditClientDialog client={mockClient} />);

      // Open dialog
      await user.click(screen.getByRole('button', { name: /edit/i }));
      expect(screen.getByLabelText(/client name/i)).toHaveValue('Original Client Name');

      // Close and update prop
      await user.keyboard('{Escape}');

      const updatedClient: Client = {
        ...mockClient,
        name: 'New Client Name',
      };

      rerender(<EditClientDialog client={updatedClient} />);

      // Reopen dialog
      await user.click(screen.getByRole('button', { name: /edit/i }));

      // Should show updated name
      expect(screen.getByLabelText(/client name/i)).toHaveValue('New Client Name');
    });
  });
});
