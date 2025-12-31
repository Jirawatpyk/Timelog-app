/**
 * Tests for AddServiceDialog Component
 * Story 3.1: Service Type Management (AC: 2, 3)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AddServiceDialog } from './AddServiceDialog';

// Mock server action
const mockCreateService = vi.fn();

vi.mock('@/actions/master-data', () => ({
  createService: (input: unknown) => mockCreateService(input),
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('AddServiceDialog', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders Add Service button', () => {
    render(<AddServiceDialog />);

    expect(screen.getByRole('button', { name: /add service/i })).toBeInTheDocument();
  });

  it('opens dialog when button is clicked', async () => {
    render(<AddServiceDialog />);

    await user.click(screen.getByRole('button', { name: /add service/i }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /add new service/i })).toBeInTheDocument();
  });

  it('renders form with name input', async () => {
    render(<AddServiceDialog />);

    await user.click(screen.getByRole('button', { name: /add service/i }));

    expect(screen.getByPlaceholderText(/service name/i)).toBeInTheDocument();
  });

  it('renders submit button', async () => {
    render(<AddServiceDialog />);

    await user.click(screen.getByRole('button', { name: /add service/i }));

    expect(screen.getByRole('button', { name: /create service/i })).toBeInTheDocument();
  });

  it('shows validation error when submitting empty form', async () => {
    render(<AddServiceDialog />);

    await user.click(screen.getByRole('button', { name: /add service/i }));
    await user.click(screen.getByRole('button', { name: /create service/i }));

    await waitFor(() => {
      expect(screen.getByText(/service name is required/i)).toBeInTheDocument();
    });
  });

  it('submits form with valid data', async () => {
    mockCreateService.mockResolvedValue({ success: true, data: { id: '1', name: 'Dubbing', active: true } });

    render(<AddServiceDialog />);

    await user.click(screen.getByRole('button', { name: /add service/i }));
    await user.type(screen.getByPlaceholderText(/service name/i), 'Dubbing');
    await user.click(screen.getByRole('button', { name: /create service/i }));

    await waitFor(() => {
      expect(mockCreateService).toHaveBeenCalledWith({ name: 'Dubbing' });
    });
  });

  it('closes dialog after successful submission', async () => {
    mockCreateService.mockResolvedValue({ success: true, data: { id: '1', name: 'Dubbing', active: true } });

    render(<AddServiceDialog />);

    await user.click(screen.getByRole('button', { name: /add service/i }));
    await user.type(screen.getByPlaceholderText(/service name/i), 'Dubbing');
    await user.click(screen.getByRole('button', { name: /create service/i }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('shows error message when service name already exists', async () => {
    mockCreateService.mockResolvedValue({ success: false, error: 'Service name already exists' });

    render(<AddServiceDialog />);

    await user.click(screen.getByRole('button', { name: /add service/i }));
    await user.type(screen.getByPlaceholderText(/service name/i), 'Existing Service');
    await user.click(screen.getByRole('button', { name: /create service/i }));

    await waitFor(() => {
      expect(screen.getByText(/service name already exists/i)).toBeInTheDocument();
    });
  });

  it('shows loading state during submission', async () => {
    mockCreateService.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ success: true, data: { id: '1', name: 'Dubbing', active: true } }), 100))
    );

    render(<AddServiceDialog />);

    await user.click(screen.getByRole('button', { name: /add service/i }));
    await user.type(screen.getByPlaceholderText(/service name/i), 'Dubbing');

    const submitButton = screen.getByRole('button', { name: /create service/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /creating/i })).toBeInTheDocument();
    });
  });

  it('resets form after dialog closes', async () => {
    mockCreateService.mockResolvedValue({ success: true, data: { id: '1', name: 'Dubbing', active: true } });

    render(<AddServiceDialog />);

    // First submission
    await user.click(screen.getByRole('button', { name: /add service/i }));
    await user.type(screen.getByPlaceholderText(/service name/i), 'Dubbing');
    await user.click(screen.getByRole('button', { name: /create service/i }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    // Reopen dialog - form should be reset
    await user.click(screen.getByRole('button', { name: /add service/i }));

    expect(screen.getByPlaceholderText(/service name/i)).toHaveValue('');
  });
});
