/**
 * Unit tests for AdminSidebar component
 * Story 7.1a: Admin Navigation Layout
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AdminSidebar } from './AdminSidebar';

// Mock next/navigation
const mockPathname = vi.fn();
vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname(),
}));

describe('AdminSidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPathname.mockReturnValue('/admin/master-data');
  });

  describe('Header rendering (AC: 1)', () => {
    it('should render "Admin" header', () => {
      render(<AdminSidebar />);

      expect(screen.getByText('Admin')).toBeInTheDocument();
    });
  });

  describe('Navigation items (AC: 1)', () => {
    it('should render Master Data link', () => {
      render(<AdminSidebar />);

      const masterDataLink = screen.getByRole('link', { name: /master data/i });
      expect(masterDataLink).toBeInTheDocument();
      expect(masterDataLink).toHaveAttribute('href', '/admin/master-data');
    });

    it('should render Users link', () => {
      render(<AdminSidebar />);

      const usersLink = screen.getByRole('link', { name: /users/i });
      expect(usersLink).toBeInTheDocument();
      expect(usersLink).toHaveAttribute('href', '/admin/users');
    });

    it('should render all navigation items', () => {
      render(<AdminSidebar />);

      const links = screen.getAllByRole('link');
      // Master Data, Users, Back to App = 3 links
      expect(links).toHaveLength(3);
    });
  });

  describe('Active state (AC: 3)', () => {
    it('should highlight Master Data when on /admin/master-data', () => {
      mockPathname.mockReturnValue('/admin/master-data');
      render(<AdminSidebar />);

      const masterDataLink = screen.getByRole('link', { name: /master data/i });
      expect(masterDataLink).toHaveClass('bg-primary');
      expect(masterDataLink).toHaveClass('text-primary-foreground');
    });

    it('should highlight Master Data when on /admin (landing page)', () => {
      mockPathname.mockReturnValue('/admin');
      render(<AdminSidebar />);

      const masterDataLink = screen.getByRole('link', { name: /master data/i });
      expect(masterDataLink).toHaveClass('bg-primary');
    });

    it('should not highlight Users when on Master Data', () => {
      mockPathname.mockReturnValue('/admin/master-data');
      render(<AdminSidebar />);

      const usersLink = screen.getByRole('link', { name: /users/i });
      expect(usersLink).not.toHaveClass('bg-primary');
      expect(usersLink).toHaveClass('text-muted-foreground');
    });

    it('should highlight Users when on /admin/users', () => {
      mockPathname.mockReturnValue('/admin/users');
      render(<AdminSidebar />);

      const usersLink = screen.getByRole('link', { name: /users/i });
      expect(usersLink).toHaveClass('bg-primary');
      expect(usersLink).toHaveClass('text-primary-foreground');
    });

    it('should not highlight Master Data when on Users', () => {
      mockPathname.mockReturnValue('/admin/users');
      render(<AdminSidebar />);

      const masterDataLink = screen.getByRole('link', { name: /master data/i });
      expect(masterDataLink).not.toHaveClass('bg-primary');
    });
  });

  describe('Back to App link (AC: 4)', () => {
    it('should render Back to App link', () => {
      render(<AdminSidebar />);

      const backLink = screen.getByRole('link', { name: /return to main dashboard/i });
      expect(backLink).toBeInTheDocument();
      expect(backLink).toHaveTextContent('Back to App');
    });

    it('should link to /dashboard', () => {
      render(<AdminSidebar />);

      const backLink = screen.getByRole('link', { name: /return to main dashboard/i });
      expect(backLink).toHaveAttribute('href', '/dashboard');
    });
  });

  describe('Accessibility (AC: 7)', () => {
    it('should have aria-current="page" for active item', () => {
      mockPathname.mockReturnValue('/admin/master-data');
      render(<AdminSidebar />);

      const masterDataLink = screen.getByRole('link', { name: /master data/i });
      expect(masterDataLink).toHaveAttribute('aria-current', 'page');
    });

    it('should not have aria-current for inactive items', () => {
      mockPathname.mockReturnValue('/admin/master-data');
      render(<AdminSidebar />);

      const usersLink = screen.getByRole('link', { name: /users/i });
      expect(usersLink).not.toHaveAttribute('aria-current');
    });

    it('should have proper navigation landmark', () => {
      render(<AdminSidebar />);

      expect(screen.getByRole('navigation', { name: /admin/i })).toBeInTheDocument();
    });
  });

  describe('Desktop visibility (AC: 1)', () => {
    it('should have hidden on mobile, visible on desktop classes', () => {
      render(<AdminSidebar />);

      const sidebar = screen.getByRole('complementary');
      expect(sidebar).toHaveClass('hidden');
      expect(sidebar).toHaveClass('md:flex');
    });

    it('should have correct width class', () => {
      render(<AdminSidebar />);

      const sidebar = screen.getByRole('complementary');
      expect(sidebar).toHaveClass('w-56');
    });
  });
});
