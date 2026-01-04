/**
 * Tests for AddDepartmentDialog Component
 * Story 3.7: Department Management (AC: 3, 4)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AddDepartmentDialog } from './AddDepartmentDialog';

// Mock server action
const mockCreateDepartment = vi.fn();

vi.mock('@/actions/master-data', () => ({
  createDepartment: (input: unknown) => mockCreateDepartment(input),
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('AddDepartmentDialog', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders Add Department button', () => {
    render(<AddDepartmentDialog />);

    expect(screen.getByRole('button', { name: /add department/i })).toBeInTheDocument();
  });

  it('opens dialog when button is clicked', async () => {
    render(<AddDepartmentDialog />);

    await user.click(screen.getByRole('button', { name: /add department/i }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /add new department/i })).toBeInTheDocument();
  });

  it('renders form with name input', async () => {
    render(<AddDepartmentDialog />);

    await user.click(screen.getByRole('button', { name: /add department/i }));

    expect(screen.getByPlaceholderText(/department name/i)).toBeInTheDocument();
  });

  it('renders submit button', async () => {
    render(<AddDepartmentDialog />);

    await user.click(screen.getByRole('button', { name: /add department/i }));

    expect(screen.getByRole('button', { name: /create department/i })).toBeInTheDocument();
  });

  it('shows validation error when submitting empty form', async () => {
    render(<AddDepartmentDialog />);

    await user.click(screen.getByRole('button', { name: /add department/i }));
    await user.click(screen.getByRole('button', { name: /create department/i }));

    await waitFor(() => {
      expect(screen.getByText(/department name must be at least 2 characters/i)).toBeInTheDocument();
    });
  });

  it('shows validation error for single character name', async () => {
    render(<AddDepartmentDialog />);

    await user.click(screen.getByRole('button', { name: /add department/i }));
    await user.type(screen.getByPlaceholderText(/department name/i), 'A');
    await user.click(screen.getByRole('button', { name: /create department/i }));

    await waitFor(() => {
      expect(screen.getByText(/department name must be at least 2 characters/i)).toBeInTheDocument();
    });
  });

  it('submits form with valid data', async () => {
    mockCreateDepartment.mockResolvedValue({ success: true, data: { id: '1', name: 'Audio Production', active: true } });

    render(<AddDepartmentDialog />);

    await user.click(screen.getByRole('button', { name: /add department/i }));
    await user.type(screen.getByPlaceholderText(/department name/i), 'Audio Production');
    await user.click(screen.getByRole('button', { name: /create department/i }));

    await waitFor(() => {
      expect(mockCreateDepartment).toHaveBeenCalledWith({ name: 'Audio Production' });
    });
  });

  it('closes dialog after successful submission', async () => {
    mockCreateDepartment.mockResolvedValue({ success: true, data: { id: '1', name: 'Audio Production', active: true } });

    render(<AddDepartmentDialog />);

    await user.click(screen.getByRole('button', { name: /add department/i }));
    await user.type(screen.getByPlaceholderText(/department name/i), 'Audio Production');
    await user.click(screen.getByRole('button', { name: /create department/i }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('shows error message when department name already exists', async () => {
    mockCreateDepartment.mockResolvedValue({ success: false, error: 'Department name already exists' });

    render(<AddDepartmentDialog />);

    await user.click(screen.getByRole('button', { name: /add department/i }));
    await user.type(screen.getByPlaceholderText(/department name/i), 'Existing Department');
    await user.click(screen.getByRole('button', { name: /create department/i }));

    await waitFor(() => {
      expect(screen.getByText(/department name already exists/i)).toBeInTheDocument();
    });
  });

  it('shows loading state during submission', async () => {
    mockCreateDepartment.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ success: true, data: { id: '1', name: 'Audio Production', active: true } }), 100))
    );

    render(<AddDepartmentDialog />);

    await user.click(screen.getByRole('button', { name: /add department/i }));
    await user.type(screen.getByPlaceholderText(/department name/i), 'Audio Production');

    const submitButton = screen.getByRole('button', { name: /create department/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /creating/i })).toBeInTheDocument();
    });
  });

  it('resets form after dialog closes', async () => {
    mockCreateDepartment.mockResolvedValue({ success: true, data: { id: '1', name: 'Audio Production', active: true } });

    render(<AddDepartmentDialog />);

    // First submission
    await user.click(screen.getByRole('button', { name: /add department/i }));
    await user.type(screen.getByPlaceholderText(/department name/i), 'Audio Production');
    await user.click(screen.getByRole('button', { name: /create department/i }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    // Reopen dialog - form should be reset
    await user.click(screen.getByRole('button', { name: /add department/i }));

    expect(screen.getByPlaceholderText(/department name/i)).toHaveValue('');
  });

  it('calls onDepartmentCreated callback when successful', async () => {
    const onDepartmentCreated = vi.fn();
    const mockDepartment = { id: '1', name: 'Audio Production', active: true };
    mockCreateDepartment.mockResolvedValue({ success: true, data: mockDepartment });

    render(<AddDepartmentDialog onDepartmentCreated={onDepartmentCreated} />);

    await user.click(screen.getByRole('button', { name: /add department/i }));
    await user.type(screen.getByPlaceholderText(/department name/i), 'Audio Production');
    await user.click(screen.getByRole('button', { name: /create department/i }));

    await waitFor(() => {
      expect(onDepartmentCreated).toHaveBeenCalledWith(mockDepartment);
    });
  });

  it('shows super admin access error when returned from action', async () => {
    mockCreateDepartment.mockResolvedValue({ success: false, error: 'Super Admin access required' });

    render(<AddDepartmentDialog />);

    await user.click(screen.getByRole('button', { name: /add department/i }));
    await user.type(screen.getByPlaceholderText(/department name/i), 'Audio Production');
    await user.click(screen.getByRole('button', { name: /create department/i }));

    await waitFor(() => {
      expect(screen.getByText(/super admin access required/i)).toBeInTheDocument();
    });
  });
});
