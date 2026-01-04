import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BottomNav, BottomNavSkeleton } from './BottomNav';
import type { UserRole } from '@/types/domain';

// Mock next/navigation
const mockPathname = vi.fn();
vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname(),
}));

// Mock the useUser hook
const mockUseUser = vi.fn();
vi.mock('@/hooks/use-user', () => ({
  useUser: () => mockUseUser(),
}));

describe('BottomNav', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPathname.mockReturnValue('/entry');
  });

  describe('Admin section hiding (Story 7.1a)', () => {
    it('should return null when pathname starts with /admin', () => {
      mockPathname.mockReturnValue('/admin');
      mockUseUser.mockReturnValue({
        role: 'admin',
        isLoading: false,
        error: null,
      });

      const { container } = render(<BottomNav />);
      expect(container.firstChild).toBeNull();
    });

    it('should return null when on /admin/master-data', () => {
      mockPathname.mockReturnValue('/admin/master-data');
      mockUseUser.mockReturnValue({
        role: 'admin',
        isLoading: false,
        error: null,
      });

      const { container } = render(<BottomNav />);
      expect(container.firstChild).toBeNull();
    });

    it('should return null when on /admin/users', () => {
      mockPathname.mockReturnValue('/admin/users');
      mockUseUser.mockReturnValue({
        role: 'admin',
        isLoading: false,
        error: null,
      });

      const { container } = render(<BottomNav />);
      expect(container.firstChild).toBeNull();
    });

    it('should render normally for non-admin paths', () => {
      mockPathname.mockReturnValue('/dashboard');
      mockUseUser.mockReturnValue({
        role: 'admin',
        isLoading: false,
        error: null,
      });

      render(<BottomNav />);
      expect(screen.getByRole('navigation', { name: /bottom navigation/i })).toBeInTheDocument();
    });

    it('should render normally for /entry path', () => {
      mockPathname.mockReturnValue('/entry');
      mockUseUser.mockReturnValue({
        role: 'staff',
        isLoading: false,
        error: null,
      });

      render(<BottomNav />);
      expect(screen.getByRole('navigation', { name: /bottom navigation/i })).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should render skeleton when loading', () => {
      mockUseUser.mockReturnValue({
        role: null,
        isLoading: true,
        error: null,
      });

      render(<BottomNav />);

      // Should render skeleton placeholders
      const nav = screen.getByRole('navigation');
      expect(nav).toHaveClass('md:hidden');
    });
  });

  describe('Staff Role (AC: 2)', () => {
    beforeEach(() => {
      mockUseUser.mockReturnValue({
        role: 'staff' as UserRole,
        isLoading: false,
        error: null,
      });
    });

    it('should show Entry and Dashboard only', () => {
      render(<BottomNav />);

      expect(screen.getByRole('link', { name: /entry/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument();
      expect(screen.queryByRole('link', { name: /team/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('link', { name: /admin/i })).not.toBeInTheDocument();
    });
  });

  describe('Manager Role (AC: 2)', () => {
    beforeEach(() => {
      mockUseUser.mockReturnValue({
        role: 'manager' as UserRole,
        isLoading: false,
        error: null,
      });
    });

    it('should show Entry, Dashboard, and Team', () => {
      render(<BottomNav />);

      expect(screen.getByRole('link', { name: /entry/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /team/i })).toBeInTheDocument();
      expect(screen.queryByRole('link', { name: /admin/i })).not.toBeInTheDocument();
    });
  });

  describe('Admin Role (AC: 2)', () => {
    beforeEach(() => {
      mockUseUser.mockReturnValue({
        role: 'admin' as UserRole,
        isLoading: false,
        error: null,
      });
    });

    it('should show all navigation items', () => {
      render(<BottomNav />);

      expect(screen.getByRole('link', { name: /entry/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /team/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /admin/i })).toBeInTheDocument();
    });
  });

  describe('Super Admin Role (AC: 2)', () => {
    beforeEach(() => {
      mockUseUser.mockReturnValue({
        role: 'super_admin' as UserRole,
        isLoading: false,
        error: null,
      });
    });

    it('should show all navigation items', () => {
      render(<BottomNav />);

      expect(screen.getByRole('link', { name: /entry/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /team/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /admin/i })).toBeInTheDocument();
    });
  });

  describe('Active State (AC: 3)', () => {
    beforeEach(() => {
      mockUseUser.mockReturnValue({
        role: 'admin' as UserRole,
        isLoading: false,
        error: null,
      });
    });

    it('should highlight Entry when on /entry', () => {
      mockPathname.mockReturnValue('/entry');
      render(<BottomNav />);

      const entryLink = screen.getByRole('link', { name: /entry/i });
      const dashboardLink = screen.getByRole('link', { name: /dashboard/i });

      expect(entryLink).toHaveClass('text-primary');
      expect(dashboardLink).not.toHaveClass('text-primary');
    });

    it('should highlight Dashboard when on /dashboard', () => {
      mockPathname.mockReturnValue('/dashboard');
      render(<BottomNav />);

      const entryLink = screen.getByRole('link', { name: /entry/i });
      const dashboardLink = screen.getByRole('link', { name: /dashboard/i });

      expect(entryLink).not.toHaveClass('text-primary');
      expect(dashboardLink).toHaveClass('text-primary');
    });

    it('should highlight Team when on /team', () => {
      mockPathname.mockReturnValue('/team');
      render(<BottomNav />);

      const teamLink = screen.getByRole('link', { name: /team/i });
      expect(teamLink).toHaveClass('text-primary');
    });

    // Note: BottomNav now returns null on /admin/* paths (Story 7.1a)
    // Admin navigation is handled by AdminMobileHeader component

    it('should NOT highlight Entry when on /entry-reports (edge case)', () => {
      mockPathname.mockReturnValue('/entry-reports');
      render(<BottomNav />);

      const entryLink = screen.getByRole('link', { name: /entry/i });
      expect(entryLink).not.toHaveClass('text-primary');
    });
  });

  describe('Touch Targets (AC: 4)', () => {
    beforeEach(() => {
      mockUseUser.mockReturnValue({
        role: 'admin' as UserRole,
        isLoading: false,
        error: null,
      });
    });

    it('should have minimum touch target size classes', () => {
      render(<BottomNav />);

      const links = screen.getAllByRole('link');
      links.forEach((link) => {
        expect(link).toHaveClass('min-h-[44px]');
        expect(link).toHaveClass('min-w-[64px]');
      });
    });
  });

  describe('Fixed Position (AC: 1)', () => {
    beforeEach(() => {
      mockUseUser.mockReturnValue({
        role: 'staff' as UserRole,
        isLoading: false,
        error: null,
      });
    });

    it('should be fixed at the bottom', () => {
      render(<BottomNav />);

      const nav = screen.getByRole('navigation');
      expect(nav).toHaveClass('fixed');
      expect(nav).toHaveClass('bottom-0');
      expect(nav).toHaveClass('left-0');
      expect(nav).toHaveClass('right-0');
    });
  });

  describe('Safe Area Support (AC: 7)', () => {
    beforeEach(() => {
      mockUseUser.mockReturnValue({
        role: 'staff' as UserRole,
        isLoading: false,
        error: null,
      });
    });

    it('should have safe area padding class', () => {
      render(<BottomNav />);

      const nav = screen.getByRole('navigation');
      expect(nav).toHaveClass('pb-[env(safe-area-inset-bottom)]');
    });
  });

  describe('Responsive Design (AC: 6)', () => {
    beforeEach(() => {
      mockUseUser.mockReturnValue({
        role: 'staff' as UserRole,
        isLoading: false,
        error: null,
      });
    });

    it('should be hidden on desktop (md breakpoint)', () => {
      render(<BottomNav />);

      const nav = screen.getByRole('navigation');
      expect(nav).toHaveClass('md:hidden');
    });
  });

  describe('No Role', () => {
    it('should render skeleton when role is null', () => {
      mockUseUser.mockReturnValue({
        role: null,
        isLoading: false,
        error: null,
      });

      render(<BottomNav />);

      // Should not show any navigation links
      expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });
  });

  describe('Keyboard Accessibility', () => {
    beforeEach(() => {
      mockUseUser.mockReturnValue({
        role: 'admin' as UserRole,
        isLoading: false,
        error: null,
      });
    });

    it('should have all links focusable via keyboard', () => {
      render(<BottomNav />);

      const links = screen.getAllByRole('link');
      links.forEach((link) => {
        // Links are focusable by default, verify they exist in tab order
        expect(link).not.toHaveAttribute('tabindex', '-1');
      });
    });

    it('should have correct aria-label on navigation', () => {
      render(<BottomNav />);

      const nav = screen.getByRole('navigation');
      expect(nav).toHaveAttribute('aria-label', 'Bottom navigation');
    });
  });
});

describe('BottomNavSkeleton', () => {
  it('should render skeleton placeholders', () => {
    render(<BottomNavSkeleton />);

    const nav = screen.getByRole('navigation');
    expect(nav).toBeInTheDocument();
    expect(nav).toHaveClass('fixed');
    expect(nav).toHaveClass('md:hidden');
  });

  it('should show 2 skeleton items', () => {
    render(<BottomNavSkeleton />);

    // Looking for skeleton animation elements
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThanOrEqual(2);
  });
});
