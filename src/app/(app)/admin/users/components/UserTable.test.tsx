import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserTable } from './UserTable';
import type { UserListItem } from '@/types/domain';

// Mock Next.js navigation
const mockRefresh = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: mockRefresh,
    push: vi.fn(),
    back: vi.fn(),
  }),
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock user actions
const mockResendInvitation = vi.fn();
const mockDeactivateUser = vi.fn();
const mockReactivateUser = vi.fn();
vi.mock('@/actions/user', () => ({
  resendInvitation: (...args: unknown[]) => mockResendInvitation(...args),
  deactivateUser: (...args: unknown[]) => mockDeactivateUser(...args),
  reactivateUser: (...args: unknown[]) => mockReactivateUser(...args),
}));

const CURRENT_USER_ID = 'current-admin-id';

const mockUsers: UserListItem[] = [
  {
    id: 'user-1',
    email: 'alice@example.com',
    displayName: 'Alice Smith',
    role: 'staff',
    department: { id: 'dept-1', name: 'Engineering' },
    isActive: true,
    status: 'active',
    confirmedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'user-2',
    email: 'bob@example.com',
    displayName: 'Bob Jones',
    role: 'manager',
    department: { id: 'dept-2', name: 'Marketing' },
    isActive: true,
    status: 'active',
    confirmedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'user-3',
    email: 'carol@example.com',
    displayName: null,
    role: 'admin',
    department: null,
    isActive: false,
    status: 'inactive',
    confirmedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'user-4',
    email: 'dave@example.com',
    displayName: 'Dave Pending',
    role: 'staff',
    department: { id: 'dept-1', name: 'Engineering' },
    isActive: true,
    status: 'pending',
    confirmedAt: null,
  },
];

describe('UserTable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockResendInvitation.mockResolvedValue({ success: true, data: null });
    mockDeactivateUser.mockResolvedValue({ success: true, data: {} });
    mockReactivateUser.mockResolvedValue({ success: true, data: {} });
  });

  it('renders table headers', () => {
    render(<UserTable users={mockUsers} currentUserId={CURRENT_USER_ID} />);

    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Role')).toBeInTheDocument();
    expect(screen.getByText('Department')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });

  it('renders user data correctly', () => {
    render(<UserTable users={mockUsers} currentUserId={CURRENT_USER_ID} />);

    // Both desktop table and mobile cards are rendered (responsive design)
    // Use getAllByText since elements appear twice
    expect(screen.getAllByText('Alice Smith')).toHaveLength(2);
    expect(screen.getAllByText('alice@example.com')).toHaveLength(2);
    // Engineering appears for Alice and Dave (4 times total)
    expect(screen.getAllByText('Engineering')).toHaveLength(4);
  });

  it('renders role badges for all users', () => {
    render(<UserTable users={mockUsers} currentUserId={CURRENT_USER_ID} />);

    // Staff: Alice + Dave = 4 (2 users × 2 views)
    // Manager: Bob = 2 (1 user × 2 views)
    // Admin: Carol = 2 (1 user × 2 views)
    expect(screen.getAllByText('Staff')).toHaveLength(4);
    expect(screen.getAllByText('Manager')).toHaveLength(2);
    expect(screen.getAllByText('Admin')).toHaveLength(2);
  });

  it('renders status badges with emojis correctly (AC 7)', () => {
    render(<UserTable users={mockUsers} currentUserId={CURRENT_USER_ID} />);

    // Active badges: Alice + Bob = 2 users × 2 views = 4
    // Inactive badges: Carol = 1 user × 2 views = 2
    // Pending badges: Dave = 1 user × 2 views = 2
    const activeBadges = screen.getAllByText('🟢 Active');
    const inactiveBadges = screen.getAllByText('🔴 Inactive');
    const pendingBadges = screen.getAllByText('🟡 Pending');

    expect(activeBadges).toHaveLength(4);
    expect(inactiveBadges).toHaveLength(2);
    expect(pendingBadges).toHaveLength(2);
  });

  it('uses email prefix when displayName is null', () => {
    render(<UserTable users={mockUsers} currentUserId={CURRENT_USER_ID} />);

    // Carol has null displayName, should show 'carol' from email
    // Appears in both desktop and mobile views
    expect(screen.getAllByText('carol')).toHaveLength(2);
  });

  it('shows dash for null department', () => {
    render(<UserTable users={mockUsers} currentUserId={CURRENT_USER_ID} />);

    // Carol has null department - only shown in desktop table view
    // Mobile view doesn't show dash for null department
    expect(screen.getByText('-')).toBeInTheDocument();
  });

  it('renders empty state when users array is empty', () => {
    render(<UserTable users={[]} currentUserId={CURRENT_USER_ID} />);

    expect(screen.getByText('No users found')).toBeInTheDocument();
  });

  it('does not render table when empty', () => {
    render(<UserTable users={[]} currentUserId={CURRENT_USER_ID} />);

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  describe('Inactive user visual indicator (Story 7.4)', () => {
    it('applies opacity and background styling to inactive user rows', () => {
      const { container } = render(
        <UserTable users={mockUsers} currentUserId={CURRENT_USER_ID} />
      );

      // Find the table rows (desktop view)
      const tableRows = container.querySelectorAll('tbody tr');

      // Carol (user-3) is inactive - should have opacity class
      // Carol is the third user in the list
      const carolRow = tableRows[2];
      expect(carolRow).toHaveClass('opacity-50');
      expect(carolRow).toHaveClass('bg-muted/50');
    });

    it('does not apply opacity styling to active user rows', () => {
      const { container } = render(
        <UserTable users={mockUsers} currentUserId={CURRENT_USER_ID} />
      );

      const tableRows = container.querySelectorAll('tbody tr');

      // Alice (user-1) is active - should NOT have opacity class
      const aliceRow = tableRows[0];
      expect(aliceRow).not.toHaveClass('opacity-50');
    });
  });

  describe('Resend Invite button (Story 7.2a)', () => {
    it('shows Resend button for pending users', () => {
      render(<UserTable users={mockUsers} currentUserId={CURRENT_USER_ID} />);

      // Dave is pending - should have Resend button (appears twice: desktop + mobile)
      const resendButtons = screen.getAllByRole('button', {
        name: /resend invitation to dave@example.com/i,
      });
      expect(resendButtons).toHaveLength(2);
    });

    it('does not show Resend button for active users', () => {
      const activeOnlyUsers = mockUsers.filter((u) => u.status === 'active');
      render(<UserTable users={activeOnlyUsers} currentUserId={CURRENT_USER_ID} />);

      expect(screen.queryByRole('button', { name: /resend/i })).not.toBeInTheDocument();
    });

    it('does not show Resend button for inactive users', () => {
      const inactiveOnlyUsers = mockUsers.filter((u) => u.status === 'inactive');
      render(<UserTable users={inactiveOnlyUsers} currentUserId={CURRENT_USER_ID} />);

      expect(screen.queryByRole('button', { name: /resend/i })).not.toBeInTheDocument();
    });

    it('calls resendInvitation and shows success toast on click', async () => {
      const { toast } = await import('sonner');
      const pendingUser = mockUsers.find((u) => u.status === 'pending')!;
      render(<UserTable users={[pendingUser]} currentUserId={CURRENT_USER_ID} />);

      // Click first Resend button (desktop view)
      const resendButton = screen.getAllByRole('button', {
        name: /resend invitation to dave@example.com/i,
      })[0];
      await userEvent.click(resendButton);

      await waitFor(() => {
        expect(mockResendInvitation).toHaveBeenCalledWith(pendingUser.id);
      });

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          `Invitation resent to ${pendingUser.email}`
        );
      });

      expect(mockRefresh).toHaveBeenCalled();
    });

    it('shows error toast when resendInvitation fails', async () => {
      const { toast } = await import('sonner');
      mockResendInvitation.mockResolvedValue({
        success: false,
        error: 'Failed to resend',
      });

      const pendingUser = mockUsers.find((u) => u.status === 'pending')!;
      render(<UserTable users={[pendingUser]} currentUserId={CURRENT_USER_ID} />);

      const resendButton = screen.getAllByRole('button', {
        name: /resend invitation to dave@example.com/i,
      })[0];
      await userEvent.click(resendButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to resend');
      });
    });
  });
});
