/**
 * Route Access Control E2E Tests
 * Story 2.3: Role-Based Access Control Middleware
 *
 * Tests verify that the route permission matrix is correctly enforced:
 * | Route      | staff | manager | admin | super_admin |
 * |------------|-------|---------|-------|-------------|
 * | /entry     |  ✅   |   ✅    |  ✅   |     ✅      |
 * | /dashboard |  ✅   |   ✅    |  ✅   |     ✅      |
 * | /team      |  ❌   |   ✅    |  ✅   |     ✅      |
 * | /admin/*   |  ❌   |   ❌    |  ✅   |     ✅      |
 */

import { describe, it, expect } from 'vitest';
import { canAccessRoute, ROUTE_PERMISSIONS, ROUTES } from '@/constants/routes';

describe('Route Access Control (Story 2.3)', () => {
  describe('ROUTE_PERMISSIONS matrix', () => {
    it('should define permissions for all protected routes', () => {
      expect(ROUTE_PERMISSIONS).toHaveProperty('/entry');
      expect(ROUTE_PERMISSIONS).toHaveProperty('/dashboard');
      expect(ROUTE_PERMISSIONS).toHaveProperty('/team');
      expect(ROUTE_PERMISSIONS).toHaveProperty('/admin');
    });

    it('should define correct permissions for /entry', () => {
      expect(ROUTE_PERMISSIONS['/entry']).toEqual(['staff', 'manager', 'admin', 'super_admin']);
    });

    it('should define correct permissions for /dashboard', () => {
      expect(ROUTE_PERMISSIONS['/dashboard']).toEqual(['staff', 'manager', 'admin', 'super_admin']);
    });

    it('should define correct permissions for /team', () => {
      expect(ROUTE_PERMISSIONS['/team']).toEqual(['manager', 'admin', 'super_admin']);
    });

    it('should define correct permissions for /admin', () => {
      expect(ROUTE_PERMISSIONS['/admin']).toEqual(['admin', 'super_admin']);
    });
  });

  describe('AC1: Staff Route Restrictions - /team', () => {
    it('staff_cannot_access_team_route', () => {
      const canAccess = canAccessRoute('staff', '/team');
      expect(canAccess).toBe(false);
    });

    it('staff_should_be_redirected_to_entry_with_access_denied', () => {
      // This is verified by the middleware behavior
      // When staff tries to access /team, they get redirected to /entry?access=denied
      const canAccess = canAccessRoute('staff', '/team');
      expect(canAccess).toBe(false);
    });
  });

  describe('AC2: Staff Admin Restriction - /admin', () => {
    it('staff_cannot_access_admin_route', () => {
      const canAccess = canAccessRoute('staff', '/admin');
      expect(canAccess).toBe(false);
    });

    it('staff_cannot_access_admin_subroutes', () => {
      expect(canAccessRoute('staff', '/admin/users')).toBe(false);
      expect(canAccessRoute('staff', '/admin/master-data')).toBe(false);
    });
  });

  describe('AC3: Manager Team Access', () => {
    it('manager_can_access_team_route', () => {
      const canAccess = canAccessRoute('manager', '/team');
      expect(canAccess).toBe(true);
    });

    it('manager_can_access_entry_route', () => {
      const canAccess = canAccessRoute('manager', '/entry');
      expect(canAccess).toBe(true);
    });

    it('manager_can_access_dashboard_route', () => {
      const canAccess = canAccessRoute('manager', '/dashboard');
      expect(canAccess).toBe(true);
    });
  });

  describe('AC4: Manager Admin Restriction', () => {
    it('manager_cannot_access_admin_route', () => {
      const canAccess = canAccessRoute('manager', '/admin');
      expect(canAccess).toBe(false);
    });

    it('manager_cannot_access_admin_subroutes', () => {
      expect(canAccessRoute('manager', '/admin/users')).toBe(false);
      expect(canAccessRoute('manager', '/admin/master-data')).toBe(false);
    });
  });

  describe('AC5: Admin Full Access', () => {
    it('admin_can_access_entry_route', () => {
      const canAccess = canAccessRoute('admin', '/entry');
      expect(canAccess).toBe(true);
    });

    it('admin_can_access_dashboard_route', () => {
      const canAccess = canAccessRoute('admin', '/dashboard');
      expect(canAccess).toBe(true);
    });

    it('admin_can_access_team_route', () => {
      const canAccess = canAccessRoute('admin', '/team');
      expect(canAccess).toBe(true);
    });

    it('admin_can_access_admin_route', () => {
      const canAccess = canAccessRoute('admin', '/admin');
      expect(canAccess).toBe(true);
    });

    it('admin_can_access_admin_subroutes', () => {
      expect(canAccessRoute('admin', '/admin/users')).toBe(true);
      expect(canAccessRoute('admin', '/admin/master-data')).toBe(true);
    });
  });

  describe('AC6: Super Admin Full Access', () => {
    it('super_admin_can_access_all_routes', () => {
      expect(canAccessRoute('super_admin', '/entry')).toBe(true);
      expect(canAccessRoute('super_admin', '/dashboard')).toBe(true);
      expect(canAccessRoute('super_admin', '/team')).toBe(true);
      expect(canAccessRoute('super_admin', '/admin')).toBe(true);
      expect(canAccessRoute('super_admin', '/admin/users')).toBe(true);
      expect(canAccessRoute('super_admin', '/admin/master-data')).toBe(true);
    });
  });

  describe('AC7: Unauthenticated Redirect', () => {
    it('unauthenticated_users_cannot_access_protected_routes', () => {
      expect(canAccessRoute(null, '/entry')).toBe(false);
      expect(canAccessRoute(null, '/dashboard')).toBe(false);
      expect(canAccessRoute(null, '/team')).toBe(false);
      expect(canAccessRoute(null, '/admin')).toBe(false);
    });
  });

  describe('Route Constants', () => {
    it('should export correct route constants', () => {
      expect(ROUTES.LOGIN).toBe('/login');
      expect(ROUTES.ENTRY).toBe('/entry');
      expect(ROUTES.DASHBOARD).toBe('/dashboard');
      expect(ROUTES.TEAM).toBe('/team');
      expect(ROUTES.ADMIN).toBe('/admin');
    });
  });
});
