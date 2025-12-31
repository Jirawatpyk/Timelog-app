import { describe, it, expect } from 'vitest';
import { ROUTES, ROUTE_PERMISSIONS, canAccessRoute, getDefaultRouteForRole } from './routes';
import type { UserRole } from '@/types/domain';

describe('routes constants', () => {
  describe('ROUTES', () => {
    it('should define all required routes', () => {
      expect(ROUTES.LOGIN).toBe('/login');
      expect(ROUTES.ENTRY).toBe('/entry');
      expect(ROUTES.DASHBOARD).toBe('/dashboard');
      expect(ROUTES.TEAM).toBe('/team');
      expect(ROUTES.ADMIN).toBe('/admin');
    });
  });

  describe('ROUTE_PERMISSIONS', () => {
    it('should allow all roles access to /entry', () => {
      expect(ROUTE_PERMISSIONS['/entry']).toContain('staff');
      expect(ROUTE_PERMISSIONS['/entry']).toContain('manager');
      expect(ROUTE_PERMISSIONS['/entry']).toContain('admin');
      expect(ROUTE_PERMISSIONS['/entry']).toContain('super_admin');
    });

    it('should allow all roles access to /dashboard', () => {
      expect(ROUTE_PERMISSIONS['/dashboard']).toContain('staff');
      expect(ROUTE_PERMISSIONS['/dashboard']).toContain('manager');
      expect(ROUTE_PERMISSIONS['/dashboard']).toContain('admin');
      expect(ROUTE_PERMISSIONS['/dashboard']).toContain('super_admin');
    });

    it('should restrict /team to manager, admin, super_admin only', () => {
      expect(ROUTE_PERMISSIONS['/team']).not.toContain('staff');
      expect(ROUTE_PERMISSIONS['/team']).toContain('manager');
      expect(ROUTE_PERMISSIONS['/team']).toContain('admin');
      expect(ROUTE_PERMISSIONS['/team']).toContain('super_admin');
    });

    it('should restrict /admin to admin and super_admin only', () => {
      expect(ROUTE_PERMISSIONS['/admin']).not.toContain('staff');
      expect(ROUTE_PERMISSIONS['/admin']).not.toContain('manager');
      expect(ROUTE_PERMISSIONS['/admin']).toContain('admin');
      expect(ROUTE_PERMISSIONS['/admin']).toContain('super_admin');
    });
  });

  describe('canAccessRoute', () => {
    describe('staff role', () => {
      const role: UserRole = 'staff';

      it('should allow access to /entry', () => {
        expect(canAccessRoute(role, '/entry')).toBe(true);
      });

      it('should allow access to /dashboard', () => {
        expect(canAccessRoute(role, '/dashboard')).toBe(true);
      });

      it('should deny access to /team', () => {
        expect(canAccessRoute(role, '/team')).toBe(false);
      });

      it('should deny access to /admin', () => {
        expect(canAccessRoute(role, '/admin')).toBe(false);
      });

      it('should deny access to /admin/users', () => {
        expect(canAccessRoute(role, '/admin/users')).toBe(false);
      });

      it('should deny access to /admin/master-data', () => {
        expect(canAccessRoute(role, '/admin/master-data')).toBe(false);
      });
    });

    describe('manager role', () => {
      const role: UserRole = 'manager';

      it('should allow access to /entry', () => {
        expect(canAccessRoute(role, '/entry')).toBe(true);
      });

      it('should allow access to /dashboard', () => {
        expect(canAccessRoute(role, '/dashboard')).toBe(true);
      });

      it('should allow access to /team', () => {
        expect(canAccessRoute(role, '/team')).toBe(true);
      });

      it('should deny access to /admin', () => {
        expect(canAccessRoute(role, '/admin')).toBe(false);
      });

      it('should deny access to /admin/users', () => {
        expect(canAccessRoute(role, '/admin/users')).toBe(false);
      });
    });

    describe('admin role', () => {
      const role: UserRole = 'admin';

      it('should allow access to /entry', () => {
        expect(canAccessRoute(role, '/entry')).toBe(true);
      });

      it('should allow access to /dashboard', () => {
        expect(canAccessRoute(role, '/dashboard')).toBe(true);
      });

      it('should allow access to /team', () => {
        expect(canAccessRoute(role, '/team')).toBe(true);
      });

      it('should allow access to /admin', () => {
        expect(canAccessRoute(role, '/admin')).toBe(true);
      });

      it('should allow access to /admin/users', () => {
        expect(canAccessRoute(role, '/admin/users')).toBe(true);
      });

      it('should allow access to /admin/master-data', () => {
        expect(canAccessRoute(role, '/admin/master-data')).toBe(true);
      });
    });

    describe('super_admin role', () => {
      const role: UserRole = 'super_admin';

      it('should allow access to all routes', () => {
        expect(canAccessRoute(role, '/entry')).toBe(true);
        expect(canAccessRoute(role, '/dashboard')).toBe(true);
        expect(canAccessRoute(role, '/team')).toBe(true);
        expect(canAccessRoute(role, '/admin')).toBe(true);
        expect(canAccessRoute(role, '/admin/users')).toBe(true);
        expect(canAccessRoute(role, '/admin/master-data')).toBe(true);
      });
    });

    describe('null/undefined role', () => {
      it('should deny access when role is null', () => {
        expect(canAccessRoute(null, '/entry')).toBe(false);
        expect(canAccessRoute(null, '/team')).toBe(false);
        expect(canAccessRoute(null, '/admin')).toBe(false);
      });
    });

    describe('unprotected routes', () => {
      it('should allow authenticated users to access unknown routes', () => {
        expect(canAccessRoute('staff', '/some-unknown-route')).toBe(true);
        expect(canAccessRoute('manager', '/api/something')).toBe(true);
      });
    });
  });

  describe('getDefaultRouteForRole', () => {
    it('should return /entry for staff', () => {
      expect(getDefaultRouteForRole('staff')).toBe('/entry');
    });

    it('should return /entry for manager', () => {
      expect(getDefaultRouteForRole('manager')).toBe('/entry');
    });

    it('should return /entry for admin', () => {
      expect(getDefaultRouteForRole('admin')).toBe('/entry');
    });

    it('should return /entry for super_admin', () => {
      expect(getDefaultRouteForRole('super_admin')).toBe('/entry');
    });

    it('should return /entry for null role', () => {
      expect(getDefaultRouteForRole(null)).toBe('/entry');
    });
  });
});
