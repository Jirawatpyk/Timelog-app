import { Home, LayoutDashboard, Users, Settings, type LucideIcon } from 'lucide-react';
import type { UserRole } from '@/types/domain';
import { ROUTE_PERMISSIONS } from '@/constants/routes';

/**
 * Navigation item configuration
 * Story 4.1: Bottom Navigation Component
 */
export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  roles: UserRole[];
}

/**
 * Bottom navigation items
 * Order determines display order in the navigation bar
 */
export const NAV_ITEMS: NavItem[] = [
  {
    href: '/entry',
    label: 'Entry',
    icon: Home,
    roles: ROUTE_PERMISSIONS['/entry'],
  },
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    roles: ROUTE_PERMISSIONS['/dashboard'],
  },
  {
    href: '/team',
    label: 'Team',
    icon: Users,
    roles: ROUTE_PERMISSIONS['/team'],
  },
  {
    href: '/admin',
    label: 'Admin',
    icon: Settings,
    roles: ROUTE_PERMISSIONS['/admin'],
  },
];

/**
 * Filter navigation items based on user role
 *
 * @param role - Current user's role
 * @returns Navigation items the user can access
 */
export function getNavItemsForRole(role: UserRole): NavItem[] {
  return NAV_ITEMS.filter((item) => item.roles.includes(role));
}
