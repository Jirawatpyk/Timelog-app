import type { UserRole } from '@/types/domain';

/**
 * Route constants for the application
 */
export const ROUTES = {
  LOGIN: '/login',
  SIGN_UP: '/sign-up',
  FORGOT_PASSWORD: '/forgot-password',
  UPDATE_PASSWORD: '/update-password',
  WELCOME: '/welcome',
  ENTRY: '/entry',
  DASHBOARD: '/dashboard',
  TEAM: '/team',
  ADMIN: '/admin',
  ADMIN_USERS: '/admin/users',
  ADMIN_MASTER_DATA: '/admin/master-data',
} as const;

/**
 * Public routes accessible without authentication
 */
export const PUBLIC_ROUTES = [
  ROUTES.LOGIN,
  ROUTES.SIGN_UP,
  ROUTES.FORGOT_PASSWORD,
  ROUTES.UPDATE_PASSWORD,
  '/sign-up-success',
  '/error',
  '/confirm',
] as const;

/**
 * Route Permission Matrix
 *
 * | Route      | staff | manager | admin | super_admin |
 * |------------|-------|---------|-------|-------------|
 * | /welcome   |  ✅   |   ✅    |  ✅   |     ✅      |
 * | /entry     |  ✅   |   ✅    |  ✅   |     ✅      |
 * | /dashboard |  ✅   |   ✅    |  ✅   |     ✅      |
 * | /team      |  ❌   |   ✅    |  ✅   |     ✅      |
 * | /admin/*   |  ❌   |   ❌    |  ✅   |     ✅      |
 */
export const ROUTE_PERMISSIONS: Record<string, UserRole[]> = {
  '/welcome': ['staff', 'manager', 'admin', 'super_admin'],
  '/entry': ['staff', 'manager', 'admin', 'super_admin'],
  '/dashboard': ['staff', 'manager', 'admin', 'super_admin'],
  '/team': ['manager', 'admin', 'super_admin'],
  '/admin': ['admin', 'super_admin'],
};

/**
 * Check if a user role can access a given route
 *
 * @param role - The user's role (null for unauthenticated)
 * @param pathname - The route pathname to check
 * @returns boolean indicating if access is allowed
 */
export function canAccessRoute(role: UserRole | null, pathname: string): boolean {
  if (!role) return false;

  // Check route permissions in order of specificity (most specific first)
  // Admin routes need special handling for sub-routes
  if (pathname.startsWith('/admin')) {
    const allowedRoles = ROUTE_PERMISSIONS['/admin'];
    return allowedRoles.includes(role);
  }

  // Check exact matches and prefix matches for other routes
  for (const [route, allowedRoles] of Object.entries(ROUTE_PERMISSIONS)) {
    if (pathname === route || pathname.startsWith(`${route}/`)) {
      return allowedRoles.includes(role);
    }
  }

  // For routes not in the permission matrix, allow authenticated users
  // This handles API routes, static assets, etc.
  return true;
}

/**
 * Get the default route for a user role after login
 *
 * Reserved for future use: Allows role-specific landing pages
 * (e.g., managers land on /team, admins on /admin)
 *
 * @param _role - The user's role (currently unused, all roles default to /entry)
 * @returns The default route pathname
 */
export function getDefaultRouteForRole(_role: UserRole | null): string {
  // All roles default to /entry (the Quick Entry page)
  // Future: return role-specific defaults
  return ROUTES.ENTRY;
}

/**
 * Get the redirect route when access is denied
 *
 * Reserved for future use: Allows role-specific fallback routes
 * (e.g., staff denied /admin could go to /dashboard instead of /entry)
 *
 * @param _role - The user's role (currently unused)
 * @returns The route to redirect to
 */
export function getAccessDeniedRedirect(_role: UserRole | null): string {
  // Future: return role-specific fallbacks
  return ROUTES.ENTRY;
}

/**
 * Check if a route is public (no authentication required)
 *
 * Public routes include login, sign-up, password reset, and confirmation pages.
 * These routes are accessible without authentication.
 *
 * @param pathname - The route pathname to check (e.g., '/login', '/sign-up')
 * @returns boolean indicating if the route is public (true) or requires auth (false)
 *
 * @example
 * isPublicRoute('/login') // true
 * isPublicRoute('/entry') // false
 */
export function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(
    route => pathname === route || pathname.startsWith(`${route}/`)
  );
}

/**
 * Check if a route is protected (requires authentication)
 *
 * Protected routes require the user to be logged in. The middleware
 * will redirect unauthenticated users to /login.
 *
 * @param pathname - The route pathname to check (e.g., '/entry', '/admin/users')
 * @returns boolean indicating if the route requires authentication
 *
 * @example
 * isProtectedRoute('/entry') // true
 * isProtectedRoute('/admin/users') // true
 * isProtectedRoute('/login') // false
 */
export function isProtectedRoute(pathname: string): boolean {
  const protectedPrefixes = ['/welcome', '/entry', '/dashboard', '/team', '/admin'];
  return protectedPrefixes.some(prefix => pathname.startsWith(prefix));
}
