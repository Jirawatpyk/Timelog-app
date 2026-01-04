import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DepartmentAssignDialog } from './DepartmentAssignDialog';

// Mock server actions
vi.mock('@/actions/user', () => ({
  getActiveDepartments: vi.fn(),
  getManagerDepartments: vi.fn(),
  updateManagerDepartments: vi.fn(),
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockDepartments = [
  { id: 'dept-1', name: 'Engineering' },
  { id: 'dept-2', name: 'Marketing' },
];

describe('DepartmentAssignDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders dialog with manager name', async () => {
    const { getActiveDepartments, getManagerDepartments } = await import(
      '@/actions/user'
    );
    vi.mocked(getActiveDepartments).mockResolvedValue({
      success: true,
      data: mockDepartments,
    });
    vi.mocked(getManagerDepartments).mockResolvedValue({
      success: true,
      data: [],
    });

    render(
      <DepartmentAssignDialog
        managerId="manager-1"
        managerName="John Doe"
        open={true}
        onOpenChange={() => {}}
      />
    );

    expect(screen.getByText('Assign Departments')).toBeInTheDocument();
    expect(
      screen.getByText(/Select departments for John Doe to manage/)
    ).toBeInTheDocument();
  });

  it('loads departments on open', async () => {
    const { getActiveDepartments, getManagerDepartments } = await import(
      '@/actions/user'
    );
    vi.mocked(getActiveDepartments).mockResolvedValue({
      success: true,
      data: mockDepartments,
    });
    vi.mocked(getManagerDepartments).mockResolvedValue({
      success: true,
      data: [mockDepartments[0]],
    });

    render(
      <DepartmentAssignDialog
        managerId="manager-1"
        managerName="John Doe"
        open={true}
        onOpenChange={() => {}}
      />
    );

    await waitFor(() => {
      expect(getActiveDepartments).toHaveBeenCalled();
      expect(getManagerDepartments).toHaveBeenCalledWith('manager-1');
    });

    // Engineering should be pre-selected
    await waitFor(() => {
      expect(screen.getByText('Engineering')).toBeInTheDocument();
    });
  });

  it('shows loading state while fetching', async () => {
    const { getActiveDepartments, getManagerDepartments } = await import(
      '@/actions/user'
    );
    vi.mocked(getActiveDepartments).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );
    vi.mocked(getManagerDepartments).mockImplementation(
      () => new Promise(() => {})
    );

    render(
      <DepartmentAssignDialog
        managerId="manager-1"
        managerName="John Doe"
        open={true}
        onOpenChange={() => {}}
      />
    );

    // Should show loading spinner (Loader2 icon)
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('calls updateManagerDepartments on save', async () => {
    const user = userEvent.setup();
    const {
      getActiveDepartments,
      getManagerDepartments,
      updateManagerDepartments,
    } = await import('@/actions/user');
    const onSuccess = vi.fn();

    vi.mocked(getActiveDepartments).mockResolvedValue({
      success: true,
      data: mockDepartments,
    });
    vi.mocked(getManagerDepartments).mockResolvedValue({
      success: true,
      data: [],
    });
    vi.mocked(updateManagerDepartments).mockResolvedValue({
      success: true,
      data: [mockDepartments[0]],
    });

    render(
      <DepartmentAssignDialog
        managerId="manager-1"
        managerName="John Doe"
        open={true}
        onOpenChange={() => {}}
        onSuccess={onSuccess}
      />
    );

    // Wait for departments to load
    await waitFor(() => {
      expect(screen.getByText('Engineering')).toBeInTheDocument();
    });

    // Select a department
    await user.click(screen.getByText('Engineering'));

    // Click save
    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(updateManagerDepartments).toHaveBeenCalledWith('manager-1', [
        'dept-1',
      ]);
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it('shows error toast on save failure', async () => {
    const user = userEvent.setup();
    const {
      getActiveDepartments,
      getManagerDepartments,
      updateManagerDepartments,
    } = await import('@/actions/user');
    const { toast } = await import('sonner');

    vi.mocked(getActiveDepartments).mockResolvedValue({
      success: true,
      data: mockDepartments,
    });
    vi.mocked(getManagerDepartments).mockResolvedValue({
      success: true,
      data: [],
    });
    vi.mocked(updateManagerDepartments).mockResolvedValue({
      success: false,
      error: 'Failed to save',
    });

    render(
      <DepartmentAssignDialog
        managerId="manager-1"
        managerName="John Doe"
        open={true}
        onOpenChange={() => {}}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Engineering')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to save');
    });
  });

  it('calls onOpenChange with false when cancel clicked', async () => {
    const user = userEvent.setup();
    const { getActiveDepartments, getManagerDepartments } = await import(
      '@/actions/user'
    );
    const onOpenChange = vi.fn();

    vi.mocked(getActiveDepartments).mockResolvedValue({
      success: true,
      data: mockDepartments,
    });
    vi.mocked(getManagerDepartments).mockResolvedValue({
      success: true,
      data: [],
    });

    render(
      <DepartmentAssignDialog
        managerId="manager-1"
        managerName="John Doe"
        open={true}
        onOpenChange={onOpenChange}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Engineering')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /cancel/i }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
