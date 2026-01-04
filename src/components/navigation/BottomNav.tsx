'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getNavItemsForRole } from '@/constants/navigation';
import { useUser } from '@/hooks/use-user';
import { cn } from '@/lib/utils';

/**
 * Bottom Navigation Component
 * Story 4.1: Bottom Navigation Component
 * Story 7.1a: Hide in Admin section - Admin has its own navigation
 *
 * Provides persistent navigation for mobile devices with role-based items
 *
 * Features:
 * - Fixed position at bottom (AC: 1)
 * - Role-based navigation items (AC: 2)
 * - Active state indication (AC: 3)
 * - Minimum 44x44px touch targets (AC: 4)
 * - Client-side navigation with Next.js Link (AC: 5)
 * - Hidden on desktop (AC: 6)
 * - iOS safe area support (AC: 7)
 * - Hidden in Admin section (/admin/*) (Story 7.1a AC: 2)
 */
export function BottomNav() {
  const pathname = usePathname();
  const { role, isLoading } = useUser();

  // Hide in Admin section - Admin has its own navigation (Story 7.1a)
  if (pathname.startsWith('/admin')) {
    return null;
  }

  if (isLoading || !role) {
    return <BottomNavSkeleton />;
  }

  const navItems = getNavItemsForRole(role);

  return (
    <nav
      className={cn(
        // Fixed positioning at bottom (AC: 1)
        'fixed bottom-0 left-0 right-0 z-50',
        // Styling
        'bg-background border-t',
        // Safe area padding for iOS (AC: 7)
        'pb-[env(safe-area-inset-bottom)]',
        // Hidden on desktop viewport (AC: 6)
        'md:hidden'
      )}
      aria-label="Bottom navigation"
    >
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          // Exact match or sub-route match (prevents /entry matching /entry-reports)
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={true}
              className={cn(
                // Layout
                'flex flex-col items-center justify-center',
                // Touch target minimum 44x44px (AC: 4)
                'min-w-[64px] min-h-[44px] px-3 py-2',
                // Touch behavior
                'touch-manipulation',
                // Transitions
                'transition-colors duration-200',
                // Active state styling (AC: 3)
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon
                className={cn(
                  'h-6 w-6',
                  isActive && 'stroke-[2.5px]'
                )}
              />
              <span
                className={cn(
                  'text-xs mt-1',
                  isActive && 'font-medium'
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

/**
 * Skeleton loading state for BottomNav
 * Shows placeholder items while user role is loading
 */
export function BottomNavSkeleton() {
  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50',
        'bg-background border-t',
        'pb-[env(safe-area-inset-bottom)]',
        'md:hidden'
      )}
      aria-label="Bottom navigation loading"
    >
      <div className="flex justify-around items-center h-16">
        {[1, 2].map((i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <div className="w-6 h-6 bg-muted rounded animate-pulse" />
            <div className="w-10 h-3 bg-muted rounded animate-pulse" />
          </div>
        ))}
      </div>
    </nav>
  );
}
