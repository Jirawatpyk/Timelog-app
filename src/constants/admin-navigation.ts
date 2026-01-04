import { Database, Users, type LucideIcon } from 'lucide-react';

/**
 * Admin navigation item configuration
 * Story 7.1a: Admin Navigation Layout
 */
export interface AdminNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

/**
 * Admin sidebar navigation items
 * Order determines display order in the sidebar
 */
export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { href: '/admin/master-data', label: 'Master Data', icon: Database },
  { href: '/admin/users', label: 'Users', icon: Users },
];

/**
 * Check if a route is active in the admin section
 *
 * Master Data is also active for /admin (landing page redirect target)
 *
 * @param pathname - Current route pathname
 * @param href - Navigation item href to check
 * @returns boolean indicating if the item should be highlighted as active
 */
export function isActiveAdminRoute(pathname: string, href: string): boolean {
  // Master Data is also active for /admin (since /admin redirects to /admin/master-data)
  if (href === '/admin/master-data') {
    return pathname === '/admin/master-data' || pathname === '/admin';
  }
  return pathname.startsWith(href);
}
