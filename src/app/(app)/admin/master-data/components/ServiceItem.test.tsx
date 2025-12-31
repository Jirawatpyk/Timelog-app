/**
 * Tests for ServiceItem Component
 * Story 3.1: Service Type Management (AC: 4, 5, 6)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ServiceItem } from './ServiceItem';
import type { Service } from '@/types/domain';

// Mock server actions
const mockToggleServiceActive = vi.fn();

vi.mock('@/actions/master-data', () => ({
  toggleServiceActive: (id: string, active: boolean) => mockToggleServiceActive(id, active),
  updateService: vi.fn(),
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock EditServiceDialog
vi.mock('@/components/admin/EditServiceDialog', () => ({
  EditServiceDialog: ({ service }: { service: Service }) => (
    <button data-testid={`edit-dialog-${service.id}`}>Edit</button>
  ),
}));

const mockActiveService: Service = {
  id: '1',
  name: 'Dubbing',
  active: true,
  created_at: '2024-01-01',
};

const mockInactiveService: Service = {
  id: '2',
  name: 'Old Service',
  active: false,
  created_at: '2024-01-01',
};

describe('ServiceItem', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders service name', () => {
      render(<ServiceItem service={mockActiveService} />);

      expect(screen.getByText('Dubbing')).toBeInTheDocument();
    });

    it('renders edit button', () => {
      render(<ServiceItem service={mockActiveService} />);

      expect(screen.getByTestId('edit-dialog-1')).toBeInTheDocument();
    });

    it('renders toggle switch', () => {
      render(<ServiceItem service={mockActiveService} />);

      expect(screen.getByRole('switch')).toBeInTheDocument();
    });

    it('shows switch as checked for active service', () => {
      render(<ServiceItem service={mockActiveService} />);

      expect(screen.getByRole('switch')).toBeChecked();
    });

    it('shows switch as unchecked for inactive service', () => {
      render(<ServiceItem service={mockInactiveService} />);

      expect(screen.getByRole('switch')).not.toBeChecked();
    });
  });

  describe('visual distinction for inactive services (AC: 6)', () => {
    it('applies opacity to inactive service container', () => {
      render(<ServiceItem service={mockInactiveService} />);

      const container = screen.getByTestId('service-item');
      expect(container).toHaveClass('opacity-50');
    });

    it('does not apply opacity to active service container', () => {
      render(<ServiceItem service={mockActiveService} />);

      const container = screen.getByTestId('service-item');
      expect(container).not.toHaveClass('opacity-50');
    });

    it('applies line-through to inactive service name', () => {
      render(<ServiceItem service={mockInactiveService} />);

      const name = screen.getByTestId('service-name-2');
      expect(name).toHaveClass('line-through');
    });

    it('does not apply line-through to active service name', () => {
      render(<ServiceItem service={mockActiveService} />);

      const name = screen.getByTestId('service-name-1');
      expect(name).not.toHaveClass('line-through');
    });
  });

  describe('toggle active status (AC: 5)', () => {
    it('calls toggleServiceActive when switch is clicked', async () => {
      mockToggleServiceActive.mockResolvedValue({ success: true, data: { ...mockActiveService, active: false } });

      render(<ServiceItem service={mockActiveService} />);

      await user.click(screen.getByRole('switch'));

      await waitFor(() => {
        expect(mockToggleServiceActive).toHaveBeenCalledWith('1', false);
      });
    });

    it('applies optimistic update when toggling', async () => {
      mockToggleServiceActive.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ success: true, data: { ...mockActiveService, active: false } }), 100))
      );

      render(<ServiceItem service={mockActiveService} />);

      // Click toggle
      await user.click(screen.getByRole('switch'));

      // Should immediately show unchecked (optimistic update)
      await waitFor(() => {
        expect(screen.getByRole('switch')).not.toBeChecked();
      });
    });

    it('reverts optimistic update on error', async () => {
      mockToggleServiceActive.mockResolvedValue({ success: false, error: 'Failed to update' });

      render(<ServiceItem service={mockActiveService} />);

      await user.click(screen.getByRole('switch'));

      await waitFor(() => {
        // Should revert back to checked
        expect(screen.getByRole('switch')).toBeChecked();
      });
    });

    it('disables switch during toggle operation', async () => {
      mockToggleServiceActive.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ success: true, data: { ...mockActiveService, active: false } }), 100))
      );

      render(<ServiceItem service={mockActiveService} />);

      await user.click(screen.getByRole('switch'));

      // Switch should be disabled while pending
      expect(screen.getByRole('switch')).toBeDisabled();
    });

    it('re-enables switch after toggle completes', async () => {
      mockToggleServiceActive.mockResolvedValue({ success: true, data: { ...mockActiveService, active: false } });

      render(<ServiceItem service={mockActiveService} />);

      await user.click(screen.getByRole('switch'));

      await waitFor(() => {
        expect(screen.getByRole('switch')).not.toBeDisabled();
      });
    });
  });
});
