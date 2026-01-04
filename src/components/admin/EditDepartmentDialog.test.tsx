/**
 * Tests for EditDepartmentDialog Component
 * Story 3.7: Department Management (AC: 5, 4)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EditDepartmentDialog } from './EditDepartmentDialog';
import type { Department } from '@/types/domain';

// Mock server action
const mockUpdateDepartment = vi.fn();

vi.mock('@/actions/master-data', () => ({
  updateDepartment: (id: string, input: unknown) => mockUpdateDepartment(id, input),
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockDepartment: Department = {
  id: '1',
  name: 'Audio Production',
  active: true,
  created_at: '2024-01-01',
};

describe('EditDepartmentDialog', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders Edit button', () => {
    render(<EditDepartmentDialog department={mockDepartment} />);

    expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
  });

  it('opens dialog when button is clicked', async () => {
    render(<EditDepartmentDialog department={mockDepartment} />);

    await user.click(screen.getByRole('button', { name: /edit/i }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /edit department/i })).toBeInTheDocument();
  });

  it('pre-populates form with existing department name', async () => {
    render(<EditDepartmentDialog department={mockDepartment} />);

    await user.click(screen.getByRole('button', { name: /edit/i }));

    const input = screen.getByDisplayValue('Audio Production');
    expect(input).toBeInTheDocument();
  });

  it('renders save button', async () => {
    render(<EditDepartmentDialog department={mockDepartment} />);

    await user.click(screen.getByRole('button', { name: /edit/i }));

    expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();
  });

  it('shows validation error when submitting empty form', async () => {
    render(<EditDepartmentDialog department={mockDepartment} />);

    await user.click(screen.getByRole('button', { name: /edit/i }));

    const input = screen.getByDisplayValue('Audio Production');
    await user.clear(input);
    await user.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(screen.getByText(/department name must be at least 2 characters/i)).toBeInTheDocument();
    });
  });

  it('shows validation error when name is too short', async () => {
    render(<EditDepartmentDialog department={mockDepartment} />);

    await user.click(screen.getByRole('button', { name: /edit/i }));

    const input = screen.getByDisplayValue('Audio Production');
    await user.clear(input);
    await user.type(input, 'A');
    await user.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(screen.getByText(/department name must be at least 2 characters/i)).toBeInTheDocument();
    });
  });

  it('submits form with updated data', async () => {
    mockUpdateDepartment.mockResolvedValue({ success: true, data: { id: '1', name: 'Video Production', active: true } });

    render(<EditDepartmentDialog department={mockDepartment} />);

    await user.click(screen.getByRole('button', { name: /edit/i }));

    const input = screen.getByDisplayValue('Audio Production');
    await user.clear(input);
    await user.type(input, 'Video Production');
    await user.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(mockUpdateDepartment).toHaveBeenCalledWith('1', { name: 'Video Production' });
    });
  });

  it('closes dialog after successful update', async () => {
    mockUpdateDepartment.mockResolvedValue({ success: true, data: { id: '1', name: 'Video Production', active: true } });

    render(<EditDepartmentDialog department={mockDepartment} />);

    await user.click(screen.getByRole('button', { name: /edit/i }));

    const input = screen.getByDisplayValue('Audio Production');
    await user.clear(input);
    await user.type(input, 'Video Production');
    await user.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('shows error message when department name already exists', async () => {
    mockUpdateDepartment.mockResolvedValue({ success: false, error: 'Department name already exists' });

    render(<EditDepartmentDialog department={mockDepartment} />);

    await user.click(screen.getByRole('button', { name: /edit/i }));

    const input = screen.getByDisplayValue('Audio Production');
    await user.clear(input);
    await user.type(input, 'Existing Name');
    await user.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(screen.getByText(/department name already exists/i)).toBeInTheDocument();
    });
  });

  it('shows loading state during submission', async () => {
    mockUpdateDepartment.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ success: true, data: mockDepartment }), 100))
    );

    render(<EditDepartmentDialog department={mockDepartment} />);

    await user.click(screen.getByRole('button', { name: /edit/i }));

    const input = screen.getByDisplayValue('Audio Production');
    await user.clear(input);
    await user.type(input, 'Updated');
    await user.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /saving/i })).toBeInTheDocument();
    });
  });

  it('resets form to original value when dialog closes and reopens', async () => {
    render(<EditDepartmentDialog department={mockDepartment} />);

    // Open dialog and modify
    await user.click(screen.getByRole('button', { name: /edit/i }));
    const input = screen.getByDisplayValue('Audio Production');
    await user.clear(input);
    await user.type(input, 'Modified');

    // Close dialog by pressing escape
    await user.keyboard('{Escape}');

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    // Reopen - should show original value
    await user.click(screen.getByRole('button', { name: /edit/i }));

    expect(screen.getByDisplayValue('Audio Production')).toBeInTheDocument();
  });

  it('calls onDepartmentUpdated callback when successful', async () => {
    const onDepartmentUpdated = vi.fn();
    const updatedDepartment = { id: '1', name: 'Video Production', active: true };
    mockUpdateDepartment.mockResolvedValue({ success: true, data: updatedDepartment });

    render(<EditDepartmentDialog department={mockDepartment} onDepartmentUpdated={onDepartmentUpdated} />);

    await user.click(screen.getByRole('button', { name: /edit/i }));

    const input = screen.getByDisplayValue('Audio Production');
    await user.clear(input);
    await user.type(input, 'Video Production');
    await user.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(onDepartmentUpdated).toHaveBeenCalledWith(updatedDepartment);
    });
  });

  it('shows super admin access error when returned from action', async () => {
    mockUpdateDepartment.mockResolvedValue({ success: false, error: 'Super Admin access required' });

    render(<EditDepartmentDialog department={mockDepartment} />);

    await user.click(screen.getByRole('button', { name: /edit/i }));

    const input = screen.getByDisplayValue('Audio Production');
    await user.clear(input);
    await user.type(input, 'Video Production');
    await user.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(screen.getByText(/super admin access required/i)).toBeInTheDocument();
    });
  });
});
