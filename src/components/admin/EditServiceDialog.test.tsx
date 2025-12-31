/**
 * Tests for EditServiceDialog Component
 * Story 3.1: Service Type Management (AC: 4, 3)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EditServiceDialog } from './EditServiceDialog';
import type { Service } from '@/types/domain';

// Mock server action
const mockUpdateService = vi.fn();

vi.mock('@/actions/master-data', () => ({
  updateService: (id: string, input: unknown) => mockUpdateService(id, input),
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockService: Service = {
  id: '1',
  name: 'Dubbing',
  active: true,
  created_at: '2024-01-01',
};

describe('EditServiceDialog', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders Edit button', () => {
    render(<EditServiceDialog service={mockService} />);

    expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
  });

  it('opens dialog when button is clicked', async () => {
    render(<EditServiceDialog service={mockService} />);

    await user.click(screen.getByRole('button', { name: /edit/i }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /edit service/i })).toBeInTheDocument();
  });

  it('pre-populates form with existing service name', async () => {
    render(<EditServiceDialog service={mockService} />);

    await user.click(screen.getByRole('button', { name: /edit/i }));

    const input = screen.getByDisplayValue('Dubbing');
    expect(input).toBeInTheDocument();
  });

  it('renders save button', async () => {
    render(<EditServiceDialog service={mockService} />);

    await user.click(screen.getByRole('button', { name: /edit/i }));

    expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();
  });

  it('shows validation error when submitting empty form', async () => {
    render(<EditServiceDialog service={mockService} />);

    await user.click(screen.getByRole('button', { name: /edit/i }));

    const input = screen.getByDisplayValue('Dubbing');
    await user.clear(input);
    await user.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(screen.getByText(/service name is required/i)).toBeInTheDocument();
    });
  });

  it('submits form with updated data', async () => {
    mockUpdateService.mockResolvedValue({ success: true, data: { id: '1', name: 'Updated Dubbing', active: true } });

    render(<EditServiceDialog service={mockService} />);

    await user.click(screen.getByRole('button', { name: /edit/i }));

    const input = screen.getByDisplayValue('Dubbing');
    await user.clear(input);
    await user.type(input, 'Updated Dubbing');
    await user.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(mockUpdateService).toHaveBeenCalledWith('1', { name: 'Updated Dubbing' });
    });
  });

  it('closes dialog after successful update', async () => {
    mockUpdateService.mockResolvedValue({ success: true, data: { id: '1', name: 'Updated Dubbing', active: true } });

    render(<EditServiceDialog service={mockService} />);

    await user.click(screen.getByRole('button', { name: /edit/i }));

    const input = screen.getByDisplayValue('Dubbing');
    await user.clear(input);
    await user.type(input, 'Updated Dubbing');
    await user.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('shows error message when service name already exists', async () => {
    mockUpdateService.mockResolvedValue({ success: false, error: 'Service name already exists' });

    render(<EditServiceDialog service={mockService} />);

    await user.click(screen.getByRole('button', { name: /edit/i }));

    const input = screen.getByDisplayValue('Dubbing');
    await user.clear(input);
    await user.type(input, 'Existing Name');
    await user.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(screen.getByText(/service name already exists/i)).toBeInTheDocument();
    });
  });

  it('shows loading state during submission', async () => {
    mockUpdateService.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ success: true, data: mockService }), 100))
    );

    render(<EditServiceDialog service={mockService} />);

    await user.click(screen.getByRole('button', { name: /edit/i }));

    const input = screen.getByDisplayValue('Dubbing');
    await user.clear(input);
    await user.type(input, 'Updated');
    await user.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /saving/i })).toBeInTheDocument();
    });
  });

  it('resets form to original value when dialog closes and reopens', async () => {
    render(<EditServiceDialog service={mockService} />);

    // Open dialog and modify
    await user.click(screen.getByRole('button', { name: /edit/i }));
    const input = screen.getByDisplayValue('Dubbing');
    await user.clear(input);
    await user.type(input, 'Modified');

    // Close dialog by pressing escape
    await user.keyboard('{Escape}');

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    // Reopen - should show original value
    await user.click(screen.getByRole('button', { name: /edit/i }));

    expect(screen.getByDisplayValue('Dubbing')).toBeInTheDocument();
  });
});
