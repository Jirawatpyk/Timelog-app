import { describe, it, expect } from 'vitest';
import { NAV_ITEMS, getNavItemsForRole } from './navigation';
import type { UserRole } from '@/types/domain';

describe('navigation constants', () => {
  describe('NAV_ITEMS', () => {
    it('should contain exactly 4 navigation items', () => {
      expect(NAV_ITEMS).toHaveLength(4);
    });

    it('should have Entry, Dashboard, Team, Admin in order', () => {
      const labels = NAV_ITEMS.map((item) => item.label);
      expect(labels).toEqual(['Entry', 'Dashboard', 'Team', 'Admin']);
    });

    it('should have correct href paths', () => {
      const hrefs = NAV_ITEMS.map((item) => item.href);
      expect(hrefs).toEqual(['/entry', '/dashboard', '/team', '/admin']);
    });

    it('should have icon for each item', () => {
      NAV_ITEMS.forEach((item) => {
        expect(item.icon).toBeDefined();
        // LucideIcon can be a ForwardRef object or function component
        expect(item.icon).toBeTruthy();
      });
    });

    it('should have roles array for each item', () => {
      NAV_ITEMS.forEach((item) => {
        expect(Array.isArray(item.roles)).toBe(true);
        expect(item.roles.length).toBeGreaterThan(0);
      });
    });
  });

  describe('getNavItemsForRole', () => {
    it('should return Entry and Dashboard for staff role', () => {
      const items = getNavItemsForRole('staff');
      const labels = items.map((item) => item.label);

      expect(labels).toContain('Entry');
      expect(labels).toContain('Dashboard');
      expect(labels).not.toContain('Team');
      expect(labels).not.toContain('Admin');
      expect(items).toHaveLength(2);
    });

    it('should return Entry, Dashboard, and Team for manager role', () => {
      const items = getNavItemsForRole('manager');
      const labels = items.map((item) => item.label);

      expect(labels).toContain('Entry');
      expect(labels).toContain('Dashboard');
      expect(labels).toContain('Team');
      expect(labels).not.toContain('Admin');
      expect(items).toHaveLength(3);
    });

    it('should return all items for admin role', () => {
      const items = getNavItemsForRole('admin');
      const labels = items.map((item) => item.label);

      expect(labels).toContain('Entry');
      expect(labels).toContain('Dashboard');
      expect(labels).toContain('Team');
      expect(labels).toContain('Admin');
      expect(items).toHaveLength(4);
    });

    it('should return all items for super_admin role', () => {
      const items = getNavItemsForRole('super_admin');
      const labels = items.map((item) => item.label);

      expect(labels).toContain('Entry');
      expect(labels).toContain('Dashboard');
      expect(labels).toContain('Team');
      expect(labels).toContain('Admin');
      expect(items).toHaveLength(4);
    });

    it('should maintain order of items for all roles', () => {
      const roles: UserRole[] = ['staff', 'manager', 'admin', 'super_admin'];

      roles.forEach((role) => {
        const items = getNavItemsForRole(role);
        const labels = items.map((item) => item.label);

        // Verify order is preserved (Entry before Dashboard, etc.)
        for (let i = 0; i < labels.length - 1; i++) {
          const currentIndex = NAV_ITEMS.findIndex((item) => item.label === labels[i]);
          const nextIndex = NAV_ITEMS.findIndex((item) => item.label === labels[i + 1]);
          expect(currentIndex).toBeLessThan(nextIndex);
        }
      });
    });
  });
});
