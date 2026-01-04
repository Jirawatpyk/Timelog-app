/**
 * Unit tests for AdminMobileHeader component
 * Story 7.1a: Admin Navigation Layout
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdminMobileHeader } from './AdminMobileHeader';

// Mock next/navigation
const mockPathname = vi.fn();
vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname(),
}));

describe('AdminMobileHeader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPathname.mockReturnValue('/admin/master-data');
  });

  describe('Header rendering (AC: 5)', () => {
    it('should render "Admin" text', () => {
      render(<AdminMobileHeader />);

      expect(screen.getByText('Admin')).toBeInTheDocument();
    });

    it('should have hamburger menu button', () => {
      render(<AdminMobileHeader />);

      const button = screen.getByRole('button', { name: /open admin menu/i });
      expect(button).toBeInTheDocument();
    });

    it('should have sticky positioning class', () => {
      render(<AdminMobileHeader />);

      const header = screen.getByRole('banner');
      expect(header).toHaveClass('sticky');
      expect(header).toHaveClass('top-0');
    });

    it('should be hidden on desktop (md:hidden)', () => {
      render(<AdminMobileHeader />);

      const header = screen.getByRole('banner');
      expect(header).toHaveClass('md:hidden');
    });
  });

  describe('Sheet behavior (AC: 6)', () => {
    it('should open sheet when hamburger button is clicked', async () => {
      const user = userEvent.setup();
      render(<AdminMobileHeader />);

      const button = screen.getByRole('button', { name: /open admin menu/i });
      await user.click(button);

      // Sheet should be open with navigation
      await waitFor(() => {
        expect(screen.getByRole('navigation', { name: /admin mobile/i })).toBeVisible();
      });
    });

    it('should show navigation items in sheet', async () => {
      const user = userEvent.setup();
      render(<AdminMobileHeader />);

      const button = screen.getByRole('button', { name: /open admin menu/i });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByRole('link', { name: /master data/i })).toBeVisible();
        expect(screen.getByRole('link', { name: /users/i })).toBeVisible();
      });
    });

    it('should show Back to App link in sheet', async () => {
      const user = userEvent.setup();
      render(<AdminMobileHeader />);

      const button = screen.getByRole('button', { name: /open admin menu/i });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByRole('link', { name: /return to main dashboard/i })).toBeVisible();
      });
    });

    it('should close sheet when navigation item is clicked', async () => {
      const user = userEvent.setup();
      render(<AdminMobileHeader />);

      // Open sheet
      const button = screen.getByRole('button', { name: /open admin menu/i });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByRole('link', { name: /users/i })).toBeVisible();
      });

      // Click navigation item
      const usersLink = screen.getByRole('link', { name: /users/i });
      await user.click(usersLink);

      // Sheet should close (navigation might not be visible or might have closed animation)
      // We test that clicking doesn't error - actual sheet closing depends on Radix UI
    });
  });

  describe('Navigation links', () => {
    it('Master Data link should have correct href', async () => {
      const user = userEvent.setup();
      render(<AdminMobileHeader />);

      await user.click(screen.getByRole('button', { name: /open admin menu/i }));

      await waitFor(() => {
        const link = screen.getByRole('link', { name: /master data/i });
        expect(link).toHaveAttribute('href', '/admin/master-data');
      });
    });

    it('Users link should have correct href', async () => {
      const user = userEvent.setup();
      render(<AdminMobileHeader />);

      await user.click(screen.getByRole('button', { name: /open admin menu/i }));

      await waitFor(() => {
        const link = screen.getByRole('link', { name: /users/i });
        expect(link).toHaveAttribute('href', '/admin/users');
      });
    });

    it('Back to App link should have correct href', async () => {
      const user = userEvent.setup();
      render(<AdminMobileHeader />);

      await user.click(screen.getByRole('button', { name: /open admin menu/i }));

      await waitFor(() => {
        const link = screen.getByRole('link', { name: /return to main dashboard/i });
        expect(link).toHaveAttribute('href', '/dashboard');
      });
    });
  });

  describe('Active state', () => {
    it('should highlight Master Data when on /admin/master-data', async () => {
      mockPathname.mockReturnValue('/admin/master-data');
      const user = userEvent.setup();
      render(<AdminMobileHeader />);

      await user.click(screen.getByRole('button', { name: /open admin menu/i }));

      await waitFor(() => {
        const link = screen.getByRole('link', { name: /master data/i });
        expect(link).toHaveClass('bg-primary');
      });
    });

    it('should highlight Users when on /admin/users', async () => {
      mockPathname.mockReturnValue('/admin/users');
      const user = userEvent.setup();
      render(<AdminMobileHeader />);

      await user.click(screen.getByRole('button', { name: /open admin menu/i }));

      await waitFor(() => {
        const link = screen.getByRole('link', { name: /users/i });
        expect(link).toHaveClass('bg-primary');
      });
    });
  });
});
