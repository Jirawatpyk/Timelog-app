/**
 * Tests for TaskItem Component
 * Story 3.3: Task Management (AC: 4, 5, 6)
 * Story 3.4: Soft Delete Protection (AC: 1)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskItem } from './TaskItem';
import type { Task } from '@/types/domain';

// Mock server actions
const mockToggleTaskActive = vi.fn();
const mockCheckTaskUsage = vi.fn();

vi.mock('@/actions/master-data', () => ({
  toggleTaskActive: (id: string, active: boolean) => mockToggleTaskActive(id, active),
  checkTaskUsage: (id: string) => mockCheckTaskUsage(id),
  updateTask: vi.fn(),
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock EditTaskDialog
vi.mock('@/components/admin/EditTaskDialog', () => ({
  EditTaskDialog: ({ task }: { task: Task }) => (
    <button data-testid={`edit-dialog-${task.id}`}>Edit</button>
  ),
}));

// Mock DeactivateConfirmDialog to simplify testing
vi.mock('@/components/admin/DeactivateConfirmDialog', () => ({
  DeactivateConfirmDialog: ({
    open,
    onConfirm,
    onOpenChange,
    itemName,
    usageCount,
    isPending,
  }: {
    open: boolean;
    onConfirm: () => void;
    onOpenChange: (open: boolean) => void;
    itemName: string;
    usageCount: number;
    isPending: boolean;
  }) =>
    open ? (
      <div data-testid="deactivate-dialog">
        <span data-testid="usage-count">{usageCount}</span>
        <span data-testid="item-name">{itemName}</span>
        <button data-testid="confirm-deactivate" onClick={onConfirm} disabled={isPending}>
          Confirm
        </button>
        <button data-testid="cancel-deactivate" onClick={() => onOpenChange(false)}>
          Cancel
        </button>
      </div>
    ) : null,
}));

const mockActiveTask: Task = {
  id: '1',
  name: 'Translation',
  active: true,
  created_at: '2024-01-01',
};

const mockInactiveTask: Task = {
  id: '2',
  name: 'Old Task',
  active: false,
  created_at: '2024-01-01',
};

describe('TaskItem', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders task name', () => {
      render(<TaskItem task={mockActiveTask} />);

      expect(screen.getByText('Translation')).toBeInTheDocument();
    });

    it('renders edit button', () => {
      render(<TaskItem task={mockActiveTask} />);

      expect(screen.getByTestId('edit-dialog-1')).toBeInTheDocument();
    });

    it('renders toggle switch', () => {
      render(<TaskItem task={mockActiveTask} />);

      expect(screen.getByRole('switch')).toBeInTheDocument();
    });

    it('shows switch as checked for active task', () => {
      render(<TaskItem task={mockActiveTask} />);

      expect(screen.getByRole('switch')).toBeChecked();
    });

    it('shows switch as unchecked for inactive task', () => {
      render(<TaskItem task={mockInactiveTask} />);

      expect(screen.getByRole('switch')).not.toBeChecked();
    });
  });

  describe('visual distinction for inactive tasks (AC: 6)', () => {
    it('applies opacity to inactive task container', () => {
      render(<TaskItem task={mockInactiveTask} />);

      const container = screen.getByTestId('task-item');
      expect(container).toHaveClass('opacity-50');
    });

    it('does not apply opacity to active task container', () => {
      render(<TaskItem task={mockActiveTask} />);

      const container = screen.getByTestId('task-item');
      expect(container).not.toHaveClass('opacity-50');
    });

    it('applies line-through to inactive task name', () => {
      render(<TaskItem task={mockInactiveTask} />);

      const name = screen.getByTestId('task-name-2');
      expect(name).toHaveClass('line-through');
    });

    it('does not apply line-through to active task name', () => {
      render(<TaskItem task={mockActiveTask} />);

      const name = screen.getByTestId('task-name-1');
      expect(name).not.toHaveClass('line-through');
    });
  });

  describe('toggle active status (AC: 5)', () => {
    describe('deactivation with confirmation dialog (Story 3.4 AC: 1)', () => {
      it('shows confirmation dialog when deactivating', async () => {
        mockCheckTaskUsage.mockResolvedValue({ success: true, data: { used: true, count: 5 } });

        render(<TaskItem task={mockActiveTask} />);

        await user.click(screen.getByRole('switch'));

        await waitFor(() => {
          expect(screen.getByTestId('deactivate-dialog')).toBeInTheDocument();
        });
      });

      it('shows usage count in confirmation dialog', async () => {
        mockCheckTaskUsage.mockResolvedValue({ success: true, data: { used: true, count: 8 } });

        render(<TaskItem task={mockActiveTask} />);

        await user.click(screen.getByRole('switch'));

        await waitFor(() => {
          expect(screen.getByTestId('usage-count')).toHaveTextContent('8');
        });
      });

      it('calls toggleTaskActive after confirming deactivation', async () => {
        mockCheckTaskUsage.mockResolvedValue({ success: true, data: { used: false, count: 0 } });
        mockToggleTaskActive.mockResolvedValue({ success: true, data: { ...mockActiveTask, active: false } });

        render(<TaskItem task={mockActiveTask} />);

        await user.click(screen.getByRole('switch'));

        await waitFor(() => {
          expect(screen.getByTestId('confirm-deactivate')).toBeInTheDocument();
        });

        await user.click(screen.getByTestId('confirm-deactivate'));

        await waitFor(() => {
          expect(mockToggleTaskActive).toHaveBeenCalledWith('1', false);
        });
      });

      it('does not call toggleTaskActive when cancelling', async () => {
        mockCheckTaskUsage.mockResolvedValue({ success: true, data: { used: true, count: 5 } });

        render(<TaskItem task={mockActiveTask} />);

        await user.click(screen.getByRole('switch'));

        await waitFor(() => {
          expect(screen.getByTestId('cancel-deactivate')).toBeInTheDocument();
        });

        await user.click(screen.getByTestId('cancel-deactivate'));

        expect(mockToggleTaskActive).not.toHaveBeenCalled();
      });
    });

    describe('activation without confirmation', () => {
      it('calls toggleTaskActive directly when activating', async () => {
        mockToggleTaskActive.mockResolvedValue({ success: true, data: { ...mockInactiveTask, active: true } });

        render(<TaskItem task={mockInactiveTask} />);

        await user.click(screen.getByRole('switch'));

        await waitFor(() => {
          expect(mockToggleTaskActive).toHaveBeenCalledWith('2', true);
        });
      });

      it('applies optimistic update when activating', async () => {
        mockToggleTaskActive.mockImplementation(
          () => new Promise((resolve) => setTimeout(() => resolve({ success: true, data: { ...mockInactiveTask, active: true } }), 100))
        );

        render(<TaskItem task={mockInactiveTask} />);

        await user.click(screen.getByRole('switch'));

        // Should immediately show checked (optimistic update)
        await waitFor(() => {
          expect(screen.getByRole('switch')).toBeChecked();
        });
      });

      it('reverts optimistic update on error', async () => {
        mockToggleTaskActive.mockResolvedValue({ success: false, error: 'Failed to update' });

        render(<TaskItem task={mockInactiveTask} />);

        await user.click(screen.getByRole('switch'));

        await waitFor(() => {
          // Should revert back to unchecked
          expect(screen.getByRole('switch')).not.toBeChecked();
        });
      });
    });

    describe('pending state', () => {
      it('disables switch during usage check', async () => {
        mockCheckTaskUsage.mockImplementation(
          () => new Promise((resolve) => setTimeout(() => resolve({ success: true, data: { used: false, count: 0 } }), 100))
        );

        render(<TaskItem task={mockActiveTask} />);

        await user.click(screen.getByRole('switch'));

        // Switch should be disabled while checking usage
        expect(screen.getByRole('switch')).toBeDisabled();
      });

      it('re-enables switch after dialog is shown', async () => {
        mockCheckTaskUsage.mockResolvedValue({ success: true, data: { used: false, count: 0 } });

        render(<TaskItem task={mockActiveTask} />);

        await user.click(screen.getByRole('switch'));

        await waitFor(() => {
          expect(screen.getByTestId('deactivate-dialog')).toBeInTheDocument();
        });

        await waitFor(() => {
          expect(screen.getByRole('switch')).not.toBeDisabled();
        });
      });
    });
  });
});
