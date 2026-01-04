import { describe, it, expect } from 'vitest';
import { Database, Users } from 'lucide-react';
import {
  ADMIN_NAV_ITEMS,
  isActiveAdminRoute,
  type AdminNavItem,
} from './admin-navigation';

describe('admin-navigation', () => {
  describe('ADMIN_NAV_ITEMS', () => {
    it('contains Master Data and Users items', () => {
      expect(ADMIN_NAV_ITEMS).toHaveLength(2);
    });

    it('has Master Data as first item', () => {
      const masterData = ADMIN_NAV_ITEMS[0];
      expect(masterData).toEqual<AdminNavItem>({
        href: '/admin/master-data',
        label: 'Master Data',
        icon: Database,
      });
    });

    it('has Users as second item', () => {
      const users = ADMIN_NAV_ITEMS[1];
      expect(users).toEqual<AdminNavItem>({
        href: '/admin/users',
        label: 'Users',
        icon: Users,
      });
    });

    it('all items have required properties', () => {
      ADMIN_NAV_ITEMS.forEach((item) => {
        expect(item.href).toBeDefined();
        expect(item.label).toBeDefined();
        expect(item.icon).toBeDefined();
        expect(typeof item.href).toBe('string');
        expect(typeof item.label).toBe('string');
      });
    });
  });

  describe('isActiveAdminRoute', () => {
    describe('Master Data route', () => {
      it('returns true for exact /admin/master-data match', () => {
        expect(isActiveAdminRoute('/admin/master-data', '/admin/master-data')).toBe(true);
      });

      it('returns true for /admin (landing page redirects to master-data)', () => {
        expect(isActiveAdminRoute('/admin', '/admin/master-data')).toBe(true);
      });

      it('returns false for /admin/users when checking master-data', () => {
        expect(isActiveAdminRoute('/admin/users', '/admin/master-data')).toBe(false);
      });
    });

    describe('Users route', () => {
      it('returns true for exact /admin/users match', () => {
        expect(isActiveAdminRoute('/admin/users', '/admin/users')).toBe(true);
      });

      it('returns true for sub-routes like /admin/users/123', () => {
        expect(isActiveAdminRoute('/admin/users/123', '/admin/users')).toBe(true);
      });

      it('returns false for /admin/master-data when checking users', () => {
        expect(isActiveAdminRoute('/admin/master-data', '/admin/users')).toBe(false);
      });

      it('returns false for /admin when checking users', () => {
        expect(isActiveAdminRoute('/admin', '/admin/users')).toBe(false);
      });
    });

    describe('edge cases', () => {
      it('handles empty pathname', () => {
        expect(isActiveAdminRoute('', '/admin/master-data')).toBe(false);
        expect(isActiveAdminRoute('', '/admin/users')).toBe(false);
      });

      it('handles non-admin routes', () => {
        expect(isActiveAdminRoute('/dashboard', '/admin/master-data')).toBe(false);
        expect(isActiveAdminRoute('/entry', '/admin/users')).toBe(false);
      });
    });
  });
});
