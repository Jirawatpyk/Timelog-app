/**
 * Unit tests for Sidebar component
 * Story 4.11: Desktop Sidebar Navigation
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Sidebar, SidebarSkeleton } from './Sidebar';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/entry'),
}));

// Mock useUser hook
const mockUseUser = vi.fn();
vi.mock('@/hooks/use-user', () => ({
  useUser: () => mockUseUser(),
}));

describe('Sidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Admin section hiding (Story 7.1a)', () => {
    it('should return null when pathname starts with /admin', async () => {
      const { usePathname } = await import('next/navigation');
      vi.mocked(usePathname).mockReturnValue('/admin');

      mockUseUser.mockReturnValue({
        role: 'admin',
        isLoading: false,
      });

      const { container } = render(<Sidebar />);
      expect(container.firstChild).toBeNull();
    });

    it('should return null when on /admin/master-data', async () => {
      const { usePathname } = await import('next/navigation');
      vi.mocked(usePathname).mockReturnValue('/admin/master-data');

      mockUseUser.mockReturnValue({
        role: 'admin',
        isLoading: false,
      });

      const { container } = render(<Sidebar />);
      expect(container.firstChild).toBeNull();
    });

    it('should return null when on /admin/users', async () => {
      const { usePathname } = await import('next/navigation');
      vi.mocked(usePathname).mockReturnValue('/admin/users');

      mockUseUser.mockReturnValue({
        role: 'admin',
        isLoading: false,
      });

      const { container } = render(<Sidebar />);
      expect(container.firstChild).toBeNull();
    });

    it('should render normally for non-admin paths', async () => {
      const { usePathname } = await import('next/navigation');
      vi.mocked(usePathname).mockReturnValue('/dashboard');

      mockUseUser.mockReturnValue({
        role: 'admin',
        isLoading: false,
      });

      render(<Sidebar />);
      expect(screen.getByRole('navigation', { name: /sidebar/i })).toBeInTheDocument();
    });

    it('should render normally for /entry path', async () => {
      const { usePathname } = await import('next/navigation');
      vi.mocked(usePathname).mockReturnValue('/entry');

      mockUseUser.mockReturnValue({
        role: 'staff',
        isLoading: false,
      });

      render(<Sidebar />);
      expect(screen.getByRole('navigation', { name: /sidebar/i })).toBeInTheDocument();
    });
  });

  describe('Role-based navigation rendering', () => {
    it('should render Entry and Dashboard for staff role', () => {
      mockUseUser.mockReturnValue({
        role: 'staff',
        isLoading: false,
      });

      render(<Sidebar />);

      expect(screen.getByText('Entry')).toBeInTheDocument();
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.queryByText('Team')).not.toBeInTheDocument();
      expect(screen.queryByText('Admin')).not.toBeInTheDocument();
    });

    it('should render Entry, Dashboard, and Team for manager role', () => {
      mockUseUser.mockReturnValue({
        role: 'manager',
        isLoading: false,
      });

      render(<Sidebar />);

      expect(screen.getByText('Entry')).toBeInTheDocument();
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Team')).toBeInTheDocument();
      expect(screen.queryByText('Admin')).not.toBeInTheDocument();
    });

    it('should render all navigation items for admin role', () => {
      mockUseUser.mockReturnValue({
        role: 'admin',
        isLoading: false,
      });

      render(<Sidebar />);

      expect(screen.getByText('Entry')).toBeInTheDocument();
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Team')).toBeInTheDocument();
      expect(screen.getByText('Admin')).toBeInTheDocument();
    });

    it('should render all navigation items for super_admin role', () => {
      mockUseUser.mockReturnValue({
        role: 'super_admin',
        isLoading: false,
      });

      render(<Sidebar />);

      expect(screen.getByText('Entry')).toBeInTheDocument();
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Team')).toBeInTheDocument();
      expect(screen.getByText('Admin')).toBeInTheDocument();
    });
  });

  describe('Active state highlighting', () => {
    it('should highlight active navigation item', async () => {
      const { usePathname } = await import('next/navigation');
      vi.mocked(usePathname).mockReturnValue('/entry');

      mockUseUser.mockReturnValue({
        role: 'staff',
        isLoading: false,
      });

      render(<Sidebar />);

      const entryLink = screen.getByRole('link', { name: /entry/i });
      expect(entryLink).toHaveClass('text-primary');
      expect(entryLink).toHaveClass('border-l-2');
    });

    it('should highlight parent route when on sub-route', async () => {
      const { usePathname } = await import('next/navigation');
      // Sub-route like /entry/123 should highlight /entry
      vi.mocked(usePathname).mockReturnValue('/entry/123');

      mockUseUser.mockReturnValue({
        role: 'staff',
        isLoading: false,
      });

      render(<Sidebar />);

      const entryLink = screen.getByRole('link', { name: /entry/i });
      expect(entryLink).toHaveClass('text-primary');
      expect(entryLink).toHaveClass('border-l-2');
      expect(entryLink).toHaveAttribute('aria-current', 'page');
    });

    it('should not highlight inactive navigation items', async () => {
      const { usePathname } = await import('next/navigation');
      vi.mocked(usePathname).mockReturnValue('/entry');

      mockUseUser.mockReturnValue({
        role: 'staff',
        isLoading: false,
      });

      render(<Sidebar />);

      const dashboardLink = screen.getByRole('link', { name: /dashboard/i });
      expect(dashboardLink).not.toHaveClass('text-primary');
      expect(dashboardLink).toHaveClass('text-muted-foreground');
      expect(dashboardLink).not.toHaveAttribute('aria-current');
    });

    it('should have hover classes for inactive items', () => {
      mockUseUser.mockReturnValue({
        role: 'staff',
        isLoading: false,
      });

      render(<Sidebar />);

      const dashboardLink = screen.getByRole('link', { name: /dashboard/i });
      // Verify hover classes exist (JSDOM can't simulate :hover pseudo-class)
      expect(dashboardLink).toHaveClass('hover:text-foreground');
      expect(dashboardLink).toHaveClass('hover:bg-muted');
    });
  });

  describe('Loading state', () => {
    it('should render skeleton when loading', () => {
      mockUseUser.mockReturnValue({
        role: null,
        isLoading: true,
      });

      render(<Sidebar />);

      expect(screen.getByLabelText('Sidebar navigation loading')).toBeInTheDocument();
    });

    it('should render skeleton when role is null', () => {
      mockUseUser.mockReturnValue({
        role: null,
        isLoading: false,
      });

      render(<Sidebar />);

      expect(screen.getByLabelText('Sidebar navigation loading')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper navigation landmark', () => {
      mockUseUser.mockReturnValue({
        role: 'staff',
        isLoading: false,
      });

      render(<Sidebar />);

      expect(screen.getByRole('navigation', { name: /sidebar/i })).toBeInTheDocument();
    });

    it('should use proper link elements for navigation', () => {
      mockUseUser.mockReturnValue({
        role: 'staff',
        isLoading: false,
      });

      render(<Sidebar />);

      const links = screen.getAllByRole('link');
      expect(links.length).toBeGreaterThan(0);
    });
  });
});

describe('SidebarSkeleton', () => {
  it('should render skeleton placeholder items', () => {
    render(<SidebarSkeleton />);

    expect(screen.getByLabelText('Sidebar navigation loading')).toBeInTheDocument();
    // Should have animated pulse elements
    const skeletonItems = document.querySelectorAll('.animate-pulse');
    expect(skeletonItems.length).toBeGreaterThan(0);
  });
});
