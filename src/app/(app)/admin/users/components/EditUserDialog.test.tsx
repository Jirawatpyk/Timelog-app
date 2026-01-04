/**
 * Edit User Dialog Tests
 * Story 7.3: Edit User Information (AC 1, 2, 3, 4, 5)
 * Story 7.5: Assign Roles (AC 1, AC 3, AC 4, AC 6)
 *
 * Tests for editing existing users with pre-populated data and role assignment
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EditUserDialog } from './EditUserDialog';
import type { UserListItem } from '@/types/domain';
import * as userActions from '@/actions/user';

// Mock server actions
vi.mock('@/actions/user', () => ({
  updateUser: vi.fn(),
  getActiveDepartments: vi.fn(),
  getCurrentUserRole: vi.fn(),
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: vi.fn(),
  }),
}));

describe('EditUserDialog', () => {
  // Use valid UUIDs for schema validation
  const DEPT_1_ID = '00000000-0000-0000-0000-000000000001';
  const DEPT_2_ID = '00000000-0000-0000-0000-000000000002';
  const USER_ID = '00000000-0000-0000-0000-000000000123';

  const mockUser: UserListItem = {
    id: USER_ID,
    email: 'test@example.com',
    displayName: 'Test User',
    role: 'staff',
    department: { id: DEPT_1_ID, name: 'Engineering' },
    isActive: true,
    status: 'active',
    confirmedAt: '2026-01-01T00:00:00Z',
  };

  const mockDepartments = [
    { id: DEPT_1_ID, name: 'Engineering' },
    { id: DEPT_2_ID, name: 'Marketing' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mocks
    vi.mocked(userActions.getActiveDepartments).mockResolvedValue({
      success: true,
      data: mockDepartments,
    });
    vi.mocked(userActions.getCurrentUserRole).mockResolvedValue({
      success: true,
      data: 'admin',
    });
  });

  it('renders dialog with pre-populated user data', async () => {
    render(<EditUserDialog user={mockUser} open={true} onOpenChange={() => {}} />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
    });
  });

  it('shows Save button instead of Create', async () => {
    render(<EditUserDialog user={mockUser} open={true} onOpenChange={() => {}} />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /create/i })).not.toBeInTheDocument();
    });
  });

  it('calls onOpenChange(false) when Cancel is clicked', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    render(<EditUserDialog user={mockUser} open={true} onOpenChange={onOpenChange} />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /cancel/i }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('has submit button that can be clicked', async () => {
    render(<EditUserDialog user={mockUser} open={true} onOpenChange={() => {}} />);

    // Wait for form to load
    await waitFor(() => {
      expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
    });

    // Verify Save button exists and is clickable
    const submitButton = screen.getByRole('button', { name: /save/i });
    expect(submitButton).toBeInTheDocument();
    expect(submitButton).not.toBeDisabled();
  });

  it('displays all form fields from user data', async () => {
    render(<EditUserDialog user={mockUser} open={true} onOpenChange={() => {}} />);

    await waitFor(() => {
      // Email field
      expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
      // Display name field
      expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
    });

    // Role and Department selectors should be visible
    expect(screen.getByLabelText(/role/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/department/i)).toBeInTheDocument();
  });

  it('displays loading state while fetching data', async () => {
    // Make the fetch take longer
    vi.mocked(userActions.getActiveDepartments).mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve({ success: true, data: mockDepartments }), 100)
        )
    );

    render(<EditUserDialog user={mockUser} open={true} onOpenChange={() => {}} />);

    // Should show loading indicator
    expect(screen.getByRole('status') || screen.getByText(/loading/i)).toBeTruthy();
  });

  it('resets form when dialog opens with different user', async () => {
    const { rerender } = render(
      <EditUserDialog user={mockUser} open={true} onOpenChange={() => {}} />
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
    });

    const differentUser: UserListItem = {
      ...mockUser,
      id: 'user-456',
      email: 'different@example.com',
      displayName: 'Different User',
    };

    rerender(<EditUserDialog user={differentUser} open={true} onOpenChange={() => {}} />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('different@example.com')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Different User')).toBeInTheDocument();
    });
  });

  it('has accessible edit user dialog title', async () => {
    render(<EditUserDialog user={mockUser} open={true} onOpenChange={() => {}} />);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText(/edit user/i)).toBeInTheDocument();
    });
  });

  // Story 7.5: Assign Roles Tests
  describe('Story 7.5: Role Assignment', () => {
    it('AC 1: admin sees staff, manager, admin options (not super_admin)', async () => {
      const user = userEvent.setup();
      vi.mocked(userActions.getCurrentUserRole).mockResolvedValue({
        success: true,
        data: 'admin',
      });

      render(<EditUserDialog user={mockUser} open={true} onOpenChange={() => {}} />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
      });

      // Open role dropdown
      await user.click(screen.getByLabelText(/role/i));

      // Should see staff, manager, admin
      await waitFor(() => {
        expect(screen.getByRole('option', { name: /staff/i })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: /manager/i })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: /^admin$/i })).toBeInTheDocument();
      });

      // Should NOT see super_admin
      expect(screen.queryByRole('option', { name: /super admin/i })).not.toBeInTheDocument();
    });

    it('AC 4: super_admin sees all 4 role options including super_admin', async () => {
      const user = userEvent.setup();
      vi.mocked(userActions.getCurrentUserRole).mockResolvedValue({
        success: true,
        data: 'super_admin',
      });

      render(<EditUserDialog user={mockUser} open={true} onOpenChange={() => {}} />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
      });

      // Open role dropdown
      await user.click(screen.getByLabelText(/role/i));

      // Should see all 4 options
      await waitFor(() => {
        expect(screen.getByRole('option', { name: /staff/i })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: /manager/i })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: /^admin$/i })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: /super admin/i })).toBeInTheDocument();
      });
    });

    it('AC 3: calls onManagerRoleAssigned when role changes to manager', async () => {
      const user = userEvent.setup();
      const onManagerRoleAssigned = vi.fn();

      // Mock updateUser to return promptDepartment: true
      // Note: user in response is database User type (snake_case), not UserListItem
      vi.mocked(userActions.updateUser).mockResolvedValue({
        success: true,
        data: {
          user: {
            id: USER_ID,
            email: mockUser.email,
            display_name: mockUser.displayName,
            role: 'manager',
            department_id: DEPT_1_ID,
            is_active: true,
            created_at: '2026-01-01T00:00:00Z',
          },
          promptDepartment: true,
        },
      });

      render(
        <EditUserDialog
          user={mockUser}
          open={true}
          onOpenChange={() => {}}
          onManagerRoleAssigned={onManagerRoleAssigned}
        />
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
      });

      // Change role to manager
      await user.click(screen.getByLabelText(/role/i));
      await user.click(screen.getByRole('option', { name: /manager/i }));

      // Submit form
      await user.click(screen.getByRole('button', { name: /save/i }));

      await waitFor(() => {
        expect(onManagerRoleAssigned).toHaveBeenCalledWith(USER_ID);
      });
    });

    it('AC 3: does not call onManagerRoleAssigned when promptDepartment is false', async () => {
      const user = userEvent.setup();
      const onManagerRoleAssigned = vi.fn();

      // Mock updateUser to return promptDepartment: false
      // Note: user in response is database User type (snake_case), not UserListItem
      vi.mocked(userActions.updateUser).mockResolvedValue({
        success: true,
        data: {
          user: {
            id: USER_ID,
            email: mockUser.email,
            display_name: mockUser.displayName,
            role: 'admin',
            department_id: DEPT_1_ID,
            is_active: true,
            created_at: '2026-01-01T00:00:00Z',
          },
          promptDepartment: false,
        },
      });

      render(
        <EditUserDialog
          user={mockUser}
          open={true}
          onOpenChange={() => {}}
          onManagerRoleAssigned={onManagerRoleAssigned}
        />
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
      });

      // Submit form without changing role
      await user.click(screen.getByRole('button', { name: /save/i }));

      await waitFor(() => {
        expect(onManagerRoleAssigned).not.toHaveBeenCalled();
      });
    });

    it('AC 6: shows error toast when self-role-change is attempted', async () => {
      const user = userEvent.setup();
      const sonner = await import('sonner');

      // Mock updateUser to return self-role-change error
      vi.mocked(userActions.updateUser).mockResolvedValue({
        success: false,
        error: 'Cannot change your own role',
      });

      render(<EditUserDialog user={mockUser} open={true} onOpenChange={() => {}} />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
      });

      // Change role and submit
      await user.click(screen.getByLabelText(/role/i));
      await user.click(screen.getByRole('option', { name: /manager/i }));
      await user.click(screen.getByRole('button', { name: /save/i }));

      await waitFor(() => {
        expect(sonner.toast.error).toHaveBeenCalledWith('Cannot change your own role');
      });
    });
  });
});
