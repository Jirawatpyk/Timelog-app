'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getNavItemsForRole } from '@/constants/navigation';
import { useUser } from '@/hooks/use-user';
import { cn } from '@/lib/utils';

/**
 * Desktop Sidebar Navigation Component
 * Story 4.11: Desktop Sidebar Navigation
 * Story 7.1a: Hide in Admin section - Admin has its own sidebar
 *
 * Provides persistent navigation for desktop viewports with role-based items
 *
 * Features:
 * - Hidden on mobile, visible on desktop (md:flex) (AC: 1)
 * - Role-based navigation items (AC: 2)
 * - Active state indication with left border (AC: 3)
 * - Client-side navigation with Next.js Link (AC: 4)
 * - Fixed width w-60 (240px) (AC: 5)
 * - 44px minimum height for navigation items (AC: 6)
 * - Hidden in Admin section (/admin/*) (Story 7.1a AC: 2)
 */
export function Sidebar() {
  const pathname = usePathname();
  const { role, isLoading } = useUser();

  // Hide in Admin section - Admin has its own sidebar (Story 7.1a)
  if (pathname.startsWith('/admin')) {
    return null;
  }

  if (isLoading || !role) {
    return <SidebarSkeleton />;
  }

  const navItems = getNavItemsForRole(role);

  return (
    <nav
      className={cn(
        // Hidden on mobile, flex column on desktop (AC: 1)
        'hidden md:flex flex-col',
        // Fixed width (AC: 5)
        'w-60 min-w-60',
        // Styling
        'bg-background border-r',
        // Full height
        'min-h-screen'
      )}
      aria-label="Sidebar navigation"
    >
      {/* Navigation items container with padding */}
      <div className="flex flex-col gap-1 p-4 pt-6">
        {navItems.map((item) => {
          // Exact match or sub-route match
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={true}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                // Layout
                'flex items-center gap-3 px-3',
                // Minimum 44px height for clickability (AC: 6)
                'min-h-[44px]',
                // Rounded corners
                'rounded-md',
                // Transitions
                'transition-colors duration-200',
                // Active state styling with left border (AC: 3)
                isActive
                  ? 'text-primary bg-primary/10 border-l-2 border-l-primary font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              <Icon
                className={cn(
                  'h-5 w-5 flex-shrink-0',
                  isActive && 'stroke-[2.5px]'
                )}
              />
              <span className="text-sm">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

/**
 * Skeleton loading state for Sidebar
 * Shows placeholder items while user role is loading
 * Note: Admin path check happens in Sidebar before skeleton is rendered
 */
export function SidebarSkeleton() {
  return (
    <nav
      className={cn(
        'hidden md:flex flex-col',
        'w-60 min-w-60',
        'bg-background border-r',
        'min-h-screen'
      )}
      aria-label="Sidebar navigation loading"
    >
      <div className="flex flex-col gap-1 p-4 pt-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex items-center gap-3 px-3 min-h-[44px]"
          >
            <div className="w-5 h-5 bg-muted rounded animate-pulse" />
            <div className="w-20 h-4 bg-muted rounded animate-pulse" />
          </div>
        ))}
      </div>
    </nav>
  );
}
