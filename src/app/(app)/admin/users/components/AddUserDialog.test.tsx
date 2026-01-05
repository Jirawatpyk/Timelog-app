/**
 * AddUserDialog Component Tests
 * Story 7.2: Create New User
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AddUserDialog } from './AddUserDialog';

// Mock server actions
vi.mock('@/actions/user', () => ({
  createUser: vi.fn(),
  getActiveDepartments: vi.fn(),
  getCurrentUserRole: vi.fn(),
}));

// Valid UUID for test data
const TEST_DEPT_ID = '550e8400-e29b-41d4-a716-446655440000';

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('AddUserDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders Add User button', async () => {
    const { getActiveDepartments, getCurrentUserRole } = await import('@/actions/user');
    vi.mocked(getActiveDepartments).mockResolvedValue({
      success: true,
      data: [{ id: TEST_DEPT_ID, name: 'Engineering' }],
    });
    vi.mocked(getCurrentUserRole).mockResolvedValue({
      success: true,
      data: 'admin',
    });

    render(<AddUserDialog />);

    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByText('Add User')).toBeInTheDocument();
  });

  it('opens dialog when button is clicked', async () => {
    const { getActiveDepartments, getCurrentUserRole } = await import('@/actions/user');
    vi.mocked(getActiveDepartments).mockResolvedValue({
      success: true,
      data: [{ id: TEST_DEPT_ID, name: 'Engineering' }],
    });
    vi.mocked(getCurrentUserRole).mockResolvedValue({
      success: true,
      data: 'admin',
    });

    render(<AddUserDialog />);

    const button = screen.getByRole('button', { name: /add user/i });
    await userEvent.click(button);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
    expect(screen.getByText('Add New User')).toBeInTheDocument();
  });

  it('displays form with all required fields', async () => {
    const { getActiveDepartments, getCurrentUserRole } = await import('@/actions/user');
    vi.mocked(getActiveDepartments).mockResolvedValue({
      success: true,
      data: [{ id: TEST_DEPT_ID, name: 'Engineering' }],
    });
    vi.mocked(getCurrentUserRole).mockResolvedValue({
      success: true,
      data: 'admin',
    });

    render(<AddUserDialog />);

    const button = screen.getByRole('button', { name: /add user/i });
    await userEvent.click(button);

    await waitFor(() => {
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    });
    expect(screen.getByLabelText(/display name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/role/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/department/i)).toBeInTheDocument();
  });

  it('shows validation errors for empty fields', async () => {
    const { getActiveDepartments, getCurrentUserRole } = await import('@/actions/user');
    vi.mocked(getActiveDepartments).mockResolvedValue({
      success: true,
      data: [{ id: TEST_DEPT_ID, name: 'Engineering' }],
    });
    vi.mocked(getCurrentUserRole).mockResolvedValue({
      success: true,
      data: 'admin',
    });

    render(<AddUserDialog />);

    const button = screen.getByRole('button', { name: /add user/i });
    await userEvent.click(button);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    // Try to submit without filling fields
    const submitButton = screen.getByRole('button', { name: /create user/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
    });
  });

  it('loads departments when dialog opens', async () => {
    const { getActiveDepartments, getCurrentUserRole } = await import('@/actions/user');
    vi.mocked(getActiveDepartments).mockResolvedValue({
      success: true,
      data: [
        { id: TEST_DEPT_ID, name: 'Engineering' },
        { id: '660e8400-e29b-41d4-a716-446655440001', name: 'Marketing' },
      ],
    });
    vi.mocked(getCurrentUserRole).mockResolvedValue({
      success: true,
      data: 'admin',
    });

    render(<AddUserDialog />);

    const button = screen.getByRole('button', { name: /add user/i });
    await userEvent.click(button);

    await waitFor(() => {
      expect(getActiveDepartments).toHaveBeenCalled();
    });
  });

  it('filters out super_admin role for admin users', async () => {
    const { getActiveDepartments, getCurrentUserRole } = await import('@/actions/user');
    vi.mocked(getActiveDepartments).mockResolvedValue({
      success: true,
      data: [{ id: TEST_DEPT_ID, name: 'Engineering' }],
    });
    vi.mocked(getCurrentUserRole).mockResolvedValue({
      success: true,
      data: 'admin', // Current user is admin, not super_admin
    });

    render(<AddUserDialog />);

    const button = screen.getByRole('button', { name: /add user/i });
    await userEvent.click(button);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    // Open role select using combobox role
    const roleSelect = screen.getByRole('combobox', { name: /role/i });
    await userEvent.click(roleSelect);

    await waitFor(() => {
      expect(screen.getByRole('option', { name: /staff/i })).toBeInTheDocument();
    });

    // super_admin should not be available
    expect(screen.queryByRole('option', { name: /super admin/i })).not.toBeInTheDocument();
  });

  it('shows super_admin role for super_admin users', async () => {
    const { getActiveDepartments, getCurrentUserRole } = await import('@/actions/user');
    vi.mocked(getActiveDepartments).mockResolvedValue({
      success: true,
      data: [{ id: TEST_DEPT_ID, name: 'Engineering' }],
    });
    vi.mocked(getCurrentUserRole).mockResolvedValue({
      success: true,
      data: 'super_admin', // Current user is super_admin
    });

    render(<AddUserDialog />);

    const button = screen.getByRole('button', { name: /add user/i });
    await userEvent.click(button);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    // Open role select using combobox role
    const roleSelect = screen.getByRole('combobox', { name: /role/i });
    await userEvent.click(roleSelect);

    await waitFor(() => {
      expect(screen.getByRole('option', { name: /super admin/i })).toBeInTheDocument();
    });
  });

  it('submits form when createUser succeeds', async () => {
    const { createUser, getActiveDepartments, getCurrentUserRole } = await import('@/actions/user');
    const { toast } = await import('sonner');

    vi.mocked(getActiveDepartments).mockResolvedValue({
      success: true,
      data: [{ id: TEST_DEPT_ID, name: 'Engineering' }],
    });
    vi.mocked(getCurrentUserRole).mockResolvedValue({
      success: true,
      data: 'admin',
    });
    vi.mocked(createUser).mockResolvedValue({
      success: true,
      data: {
        id: 'new-user-id',
        email: 'test@example.com',
        display_name: 'Test User',
        role: 'staff',
        department_id: TEST_DEPT_ID,
        is_active: true,
        has_completed_onboarding: false,
        created_at: new Date().toISOString(),
      },
    });

    render(<AddUserDialog />);

    // Open dialog
    const button = screen.getByRole('button', { name: /add user/i });
    await userEvent.click(button);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    // Fill in email and display name
    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/display name/i), 'Test User');

    // Select role
    const roleSelect = screen.getByRole('combobox', { name: /role/i });
    await userEvent.click(roleSelect);
    await waitFor(() => {
      expect(screen.getByRole('option', { name: /staff/i })).toBeInTheDocument();
    });
    await userEvent.click(screen.getByRole('option', { name: /staff/i }));

    // Wait for role select to close
    await waitFor(() => {
      expect(screen.queryByRole('option', { name: /staff/i })).not.toBeInTheDocument();
    });

    // Select department
    const deptSelect = screen.getByRole('combobox', { name: /department/i });
    await userEvent.click(deptSelect);
    await waitFor(() => {
      expect(screen.getByRole('option', { name: /engineering/i })).toBeInTheDocument();
    });
    await userEvent.click(screen.getByRole('option', { name: /engineering/i }));

    // Wait for dept select to close
    await waitFor(() => {
      expect(screen.queryByRole('option', { name: /engineering/i })).not.toBeInTheDocument();
    });

    // Submit form
    const submitButton = screen.getByRole('button', { name: /create user/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(createUser).toHaveBeenCalled();
    });

    await waitFor(() => {
      // Story 7.2a: Toast includes invitation confirmation
      expect(toast.success).toHaveBeenCalledWith(
        'User created. Invitation sent to test@example.com'
      );
    });
  });

  it('displays server error when createUser fails', async () => {
    const { createUser, getActiveDepartments, getCurrentUserRole } = await import('@/actions/user');
    vi.mocked(getActiveDepartments).mockResolvedValue({
      success: true,
      data: [{ id: TEST_DEPT_ID, name: 'Engineering' }],
    });
    vi.mocked(getCurrentUserRole).mockResolvedValue({
      success: true,
      data: 'admin',
    });
    vi.mocked(createUser).mockResolvedValue({
      success: false,
      error: 'Email already exists',
    });

    render(<AddUserDialog />);

    // Open dialog
    const button = screen.getByRole('button', { name: /add user/i });
    await userEvent.click(button);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    // Fill in form
    await userEvent.type(screen.getByLabelText(/email/i), 'existing@example.com');
    await userEvent.type(screen.getByLabelText(/display name/i), 'Test User');

    // Select role
    const roleSelect = screen.getByRole('combobox', { name: /role/i });
    await userEvent.click(roleSelect);
    await waitFor(() => {
      expect(screen.getByRole('option', { name: /staff/i })).toBeInTheDocument();
    });
    await userEvent.click(screen.getByRole('option', { name: /staff/i }));

    // Wait for role select to close
    await waitFor(() => {
      expect(screen.queryByRole('option', { name: /staff/i })).not.toBeInTheDocument();
    });

    // Select department
    const deptSelect = screen.getByRole('combobox', { name: /department/i });
    await userEvent.click(deptSelect);
    await waitFor(() => {
      expect(screen.getByRole('option', { name: /engineering/i })).toBeInTheDocument();
    });
    await userEvent.click(screen.getByRole('option', { name: /engineering/i }));

    // Wait for dept select to close
    await waitFor(() => {
      expect(screen.queryByRole('option', { name: /engineering/i })).not.toBeInTheDocument();
    });

    // Submit form
    const submitButton = screen.getByRole('button', { name: /create user/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(createUser).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByText('Email already exists')).toBeInTheDocument();
    });
  });

  it('shows loading spinner while fetching data', async () => {
    const { getActiveDepartments, getCurrentUserRole } = await import('@/actions/user');
    // Create a promise that never resolves to simulate loading
    let resolvePromise: () => void;
    const pendingPromise = new Promise<{ success: true; data: { id: string; name: string }[] }>(
      (resolve) => {
        resolvePromise = () => resolve({ success: true, data: [] });
      }
    );
    vi.mocked(getActiveDepartments).mockReturnValue(pendingPromise);
    vi.mocked(getCurrentUserRole).mockResolvedValue({
      success: true,
      data: 'admin',
    });

    render(<AddUserDialog />);

    const button = screen.getByRole('button', { name: /add user/i });
    await userEvent.click(button);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    // Check for loading spinner (Loader2 component)
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();

    // Resolve the promise to cleanup
    resolvePromise!();
  });

  it('shows error state when department fetch fails', async () => {
    const { getActiveDepartments, getCurrentUserRole } = await import('@/actions/user');
    vi.mocked(getActiveDepartments).mockResolvedValue({
      success: false,
      error: 'Network error',
    });
    vi.mocked(getCurrentUserRole).mockResolvedValue({
      success: true,
      data: 'admin',
    });

    render(<AddUserDialog />);

    const button = screen.getByRole('button', { name: /add user/i });
    await userEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Failed to load departments')).toBeInTheDocument();
    });

    // Close button in error state should be visible (not the dialog X button)
    const closeButtons = screen.getAllByRole('button', { name: /close/i });
    expect(closeButtons.length).toBeGreaterThanOrEqual(1);
  });

  it('resets form when cancel is clicked', async () => {
    const { getActiveDepartments, getCurrentUserRole } = await import('@/actions/user');
    vi.mocked(getActiveDepartments).mockResolvedValue({
      success: true,
      data: [{ id: TEST_DEPT_ID, name: 'Engineering' }],
    });
    vi.mocked(getCurrentUserRole).mockResolvedValue({
      success: true,
      data: 'admin',
    });

    render(<AddUserDialog />);

    // Open dialog
    const button = screen.getByRole('button', { name: /add user/i });
    await userEvent.click(button);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    // Fill in email
    const emailInput = screen.getByLabelText(/email/i);
    await userEvent.type(emailInput, 'test@example.com');
    expect(emailInput).toHaveValue('test@example.com');

    // Click cancel
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await userEvent.click(cancelButton);

    // Re-open dialog
    await userEvent.click(button);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    // Email should be reset
    await waitFor(() => {
      expect(screen.getByLabelText(/email/i)).toHaveValue('');
    });
  });

  it('validates email on blur (AC 5)', async () => {
    const { getActiveDepartments, getCurrentUserRole } = await import('@/actions/user');
    vi.mocked(getActiveDepartments).mockResolvedValue({
      success: true,
      data: [{ id: TEST_DEPT_ID, name: 'Engineering' }],
    });
    vi.mocked(getCurrentUserRole).mockResolvedValue({
      success: true,
      data: 'admin',
    });

    render(<AddUserDialog />);

    const button = screen.getByRole('button', { name: /add user/i });
    await userEvent.click(button);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    // Type invalid email and blur
    const emailInput = screen.getByLabelText(/email/i);
    await userEvent.type(emailInput, 'invalid-email');
    await userEvent.tab(); // Trigger blur

    // Should show validation error after blur
    await waitFor(() => {
      expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
    });
  });
});
