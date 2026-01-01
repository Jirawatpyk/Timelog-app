/**
 * Unit tests for UserProfileDropdown component
 * Story 4.12: Desktop Header Enhancement (AC 1, 2, 3, 6)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserProfileDropdown, UserProfileDropdownSkeleton } from './user-profile-dropdown';

// Mock useUser hook
const mockUseUser = vi.fn();
vi.mock('@/hooks/use-user', () => ({
  useUser: () => mockUseUser(),
}));

// Mock logout action
const mockLogout = vi.fn();
vi.mock('@/actions/auth', () => ({
  logout: () => mockLogout(),
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: vi.fn(),
  }),
}));

describe('UserProfileDropdown', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLogout.mockReset();
  });

  describe('User Profile Display (AC 1)', () => {
    it('should display user display name', () => {
      mockUseUser.mockReturnValue({
        user: { email: 'john@company.com' },
        role: 'staff',
        displayName: 'John Doe',
        isLoading: false,
      });

      render(<UserProfileDropdown />);

      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('should display email when no display name', () => {
      mockUseUser.mockReturnValue({
        user: { email: 'john@company.com' },
        role: 'staff',
        displayName: null,
        isLoading: false,
      });

      render(<UserProfileDropdown />);

      expect(screen.getByText('john@company.com')).toBeInTheDocument();
    });

    it('should display role badge', () => {
      mockUseUser.mockReturnValue({
        user: { email: 'john@company.com' },
        role: 'manager',
        displayName: 'John Doe',
        isLoading: false,
      });

      render(<UserProfileDropdown />);

      expect(screen.getByText('Manager')).toBeInTheDocument();
    });
  });

  describe('Dropdown Menu (AC 2)', () => {
    it('should open dropdown when clicked', async () => {
      const user = userEvent.setup();
      mockUseUser.mockReturnValue({
        user: { email: 'john@company.com' },
        role: 'staff',
        displayName: 'John Doe',
        isLoading: false,
      });

      render(<UserProfileDropdown />);

      const trigger = screen.getByRole('button');
      await user.click(trigger);

      // Should show email in dropdown
      expect(screen.getByText('john@company.com')).toBeInTheDocument();
    });

    it('should display sign out option in dropdown', async () => {
      const user = userEvent.setup();
      mockUseUser.mockReturnValue({
        user: { email: 'john@company.com' },
        role: 'staff',
        displayName: 'John Doe',
        isLoading: false,
      });

      render(<UserProfileDropdown />);

      const trigger = screen.getByRole('button');
      await user.click(trigger);

      expect(screen.getByText('ออกจากระบบ')).toBeInTheDocument();
    });
  });

  describe('Sign Out (AC 3)', () => {
    it('should call logout when clicking sign out button', async () => {
      const user = userEvent.setup();
      mockLogout.mockResolvedValue({ success: true });
      mockUseUser.mockReturnValue({
        user: { email: 'john@company.com' },
        role: 'staff',
        displayName: 'John Doe',
        isLoading: false,
      });

      render(<UserProfileDropdown />);

      // Open dropdown
      const trigger = screen.getByRole('button');
      await user.click(trigger);

      // Click sign out
      const signOutButton = screen.getByText('ออกจากระบบ');
      await user.click(signOutButton);

      // Verify logout was called
      expect(mockLogout).toHaveBeenCalled();
    });
  });

  describe('Role Badge in Trigger (AC 4)', () => {
    it('should show staff badge with correct styling', () => {
      mockUseUser.mockReturnValue({
        user: { email: 'test@example.com' },
        role: 'staff',
        displayName: 'Test User',
        isLoading: false,
      });

      render(<UserProfileDropdown />);

      const badge = screen.getByText('Staff');
      expect(badge).toHaveClass('bg-slate-100');
    });

    it('should show admin badge with correct styling', () => {
      mockUseUser.mockReturnValue({
        user: { email: 'admin@example.com' },
        role: 'admin',
        displayName: 'Admin User',
        isLoading: false,
      });

      render(<UserProfileDropdown />);

      const badge = screen.getByText('Admin');
      expect(badge).toHaveClass('bg-purple-100');
    });
  });

  describe('Loading State (AC 6)', () => {
    it('should show skeleton when loading', () => {
      mockUseUser.mockReturnValue({
        user: null,
        role: null,
        displayName: null,
        isLoading: true,
      });

      render(<UserProfileDropdown />);

      expect(screen.getByLabelText('Loading user profile')).toBeInTheDocument();
    });

    it('should show skeleton when user is null', () => {
      mockUseUser.mockReturnValue({
        user: null,
        role: null,
        displayName: null,
        isLoading: false,
      });

      render(<UserProfileDropdown />);

      expect(screen.getByLabelText('Loading user profile')).toBeInTheDocument();
    });
  });
});

describe('UserProfileDropdownSkeleton', () => {
  it('should render skeleton placeholder', () => {
    render(<UserProfileDropdownSkeleton />);

    expect(screen.getByLabelText('Loading user profile')).toBeInTheDocument();
    const skeletonItems = document.querySelectorAll('.animate-pulse');
    expect(skeletonItems.length).toBeGreaterThan(0);
  });

  it('should render compact skeleton placeholder', () => {
    render(<UserProfileDropdownSkeleton compact />);

    expect(screen.getByLabelText('Loading user profile')).toBeInTheDocument();
    const skeletonItems = document.querySelectorAll('.animate-pulse');
    expect(skeletonItems.length).toBeGreaterThan(0);
  });
});

describe('UserProfileDropdown Compact Mode (AC 5)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display short name in compact mode', () => {
    mockUseUser.mockReturnValue({
      user: { email: 'john@company.com' },
      role: 'staff',
      displayName: 'John Doe',
      isLoading: false,
    });

    render(<UserProfileDropdown compact />);

    // Should show first name only
    expect(screen.getByText('John')).toBeInTheDocument();
    // Should NOT show full name
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
  });

  it('should display email prefix when no display name in compact mode', () => {
    mockUseUser.mockReturnValue({
      user: { email: 'john@company.com' },
      role: 'staff',
      displayName: null,
      isLoading: false,
    });

    render(<UserProfileDropdown compact />);

    // Should show email prefix only
    expect(screen.getByText('john')).toBeInTheDocument();
  });

  it('should not show role badge in trigger in compact mode', () => {
    mockUseUser.mockReturnValue({
      user: { email: 'jane@company.com' },
      role: 'super_admin',
      displayName: 'Jane Smith',
      isLoading: false,
    });

    render(<UserProfileDropdown compact />);

    // Compact mode shows only short name (Jane), not role badge (Super Admin)
    const trigger = screen.getByRole('button');
    expect(trigger).toHaveTextContent('Jane');
    expect(trigger).not.toHaveTextContent('Super Admin');
  });

  it('should show full info in dropdown when compact', async () => {
    const user = userEvent.setup();
    mockUseUser.mockReturnValue({
      user: { email: 'john@company.com' },
      role: 'manager',
      displayName: 'John Doe',
      isLoading: false,
    });

    render(<UserProfileDropdown compact />);

    const trigger = screen.getByRole('button');
    await user.click(trigger);

    // Dropdown should show full name and email
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@company.com')).toBeInTheDocument();
    expect(screen.getByText('ออกจากระบบ')).toBeInTheDocument();
  });
});
