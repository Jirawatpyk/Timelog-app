/**
 * Component tests for AddClientDialog
 * Story 3.2: Client Management (AC: 2, 3)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AddClientDialog } from './AddClientDialog';

// Mock the server action
vi.mock('@/actions/master-data', () => ({
  createClientAction: vi.fn(),
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

import { createClientAction } from '@/actions/master-data';
import { toast } from 'sonner';
import type { ActionResult } from '@/types/domain';
import type { Client } from '@/types/domain';

const mockCreateClientAction = vi.mocked(createClientAction);
type _ClientActionResult = ActionResult<Client>;

describe('AddClientDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('renders correctly', () => {
    it('should render add client button', () => {
      render(<AddClientDialog />);
      expect(screen.getByRole('button', { name: /add client/i })).toBeInTheDocument();
    });

    it('should open dialog when button is clicked', async () => {
      const user = userEvent.setup();
      render(<AddClientDialog />);

      await user.click(screen.getByRole('button', { name: /add client/i }));

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Add New Client')).toBeInTheDocument();
      expect(screen.getByLabelText(/client name/i)).toBeInTheDocument();
    });
  });

  describe('form validation (AC3)', () => {
    it('should show error when name is empty', async () => {
      const user = userEvent.setup();
      render(<AddClientDialog />);

      // Open dialog
      await user.click(screen.getByRole('button', { name: /add client/i }));

      // Submit empty form
      await user.click(screen.getByRole('button', { name: /create client/i }));

      await waitFor(() => {
        expect(screen.getByText('Client name is required')).toBeInTheDocument();
      });
    });

    it('should not call createClientAction when form is invalid', async () => {
      const user = userEvent.setup();
      render(<AddClientDialog />);

      await user.click(screen.getByRole('button', { name: /add client/i }));
      await user.click(screen.getByRole('button', { name: /create client/i }));

      await waitFor(() => {
        expect(screen.getByText('Client name is required')).toBeInTheDocument();
      });

      expect(mockCreateClientAction).not.toHaveBeenCalled();
    });
  });

  describe('form submission (AC2)', () => {
    it('should call createClientAction with trimmed name', async () => {
      const user = userEvent.setup();
      const mockClient: Client = {
        id: 'test-id',
        name: 'Test Client',
        active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockCreateClientAction.mockResolvedValue({ success: true, data: mockClient });

      render(<AddClientDialog />);

      await user.click(screen.getByRole('button', { name: /add client/i }));
      await user.type(screen.getByLabelText(/client name/i), '  Test Client  ');
      await user.click(screen.getByRole('button', { name: /create client/i }));

      await waitFor(() => {
        expect(mockCreateClientAction).toHaveBeenCalledWith({ name: 'Test Client' });
      });
    });

    it('should show success toast and close dialog on success', async () => {
      const user = userEvent.setup();
      const mockClient: Client = {
        id: 'test-id',
        name: 'New Client',
        active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockCreateClientAction.mockResolvedValue({ success: true, data: mockClient });

      render(<AddClientDialog />);

      await user.click(screen.getByRole('button', { name: /add client/i }));
      await user.type(screen.getByLabelText(/client name/i), 'New Client');
      await user.click(screen.getByRole('button', { name: /create client/i }));

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Client created');
      });

      // Dialog should be closed
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('should show error message when creation fails', async () => {
      const user = userEvent.setup();

      mockCreateClientAction.mockResolvedValue({
        success: false,
        error: 'Client name already exists',
      });

      render(<AddClientDialog />);

      await user.click(screen.getByRole('button', { name: /add client/i }));
      await user.type(screen.getByLabelText(/client name/i), 'Existing Client');
      await user.click(screen.getByRole('button', { name: /create client/i }));

      await waitFor(() => {
        expect(screen.getByText('Client name already exists')).toBeInTheDocument();
      });

      // Dialog should remain open
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  describe('dialog state', () => {
    it('should reset form when dialog is closed', async () => {
      const user = userEvent.setup();
      render(<AddClientDialog />);

      // Open and type something
      await user.click(screen.getByRole('button', { name: /add client/i }));
      await user.type(screen.getByLabelText(/client name/i), 'Some Client');

      // Close dialog (press escape)
      await user.keyboard('{Escape}');

      // Reopen dialog
      await user.click(screen.getByRole('button', { name: /add client/i }));

      // Form should be empty
      expect(screen.getByLabelText(/client name/i)).toHaveValue('');
    });
  });
});
