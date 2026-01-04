/**
 * Edit User Dialog Tests
 * Story 7.3: Edit User Information (AC 1, 2, 3, 4, 5)
 *
 * Tests for editing existing users with pre-populated data
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
  const mockUser: UserListItem = {
    id: 'user-123',
    email: 'test@example.com',
    displayName: 'Test User',
    role: 'staff',
    department: { id: 'dept-1', name: 'Engineering' },
    isActive: true,
    status: 'active',
    confirmedAt: '2026-01-01T00:00:00Z',
  };

  const mockDepartments = [
    { id: 'dept-1', name: 'Engineering' },
    { id: 'dept-2', name: 'Marketing' },
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
});
