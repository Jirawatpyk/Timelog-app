'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ADMIN_NAV_ITEMS, isActiveAdminRoute } from '@/constants/admin-navigation';

/**
 * Admin Sidebar Navigation Component
 * Story 7.1a: Admin Navigation Layout
 *
 * Provides dedicated sidebar navigation for admin section on desktop
 *
 * Features:
 * - Visible only on desktop (md:flex) (AC: 1)
 * - Shows "Admin" header (AC: 1)
 * - Renders Master Data and Users items (AC: 1)
 * - Active state with primary background (AC: 3)
 * - "Back to App" link returns to dashboard (AC: 4)
 * - Same position as App sidebar (w-56) (AC: 1)
 * - aria-current="page" for active item (AC: 7)
 */
export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-56 flex-col border-r bg-background">
      {/* Header */}
      <div className="h-14 flex items-center px-4 border-b">
        <span className="font-semibold text-lg">Admin</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1" aria-label="Admin navigation">
        {ADMIN_NAV_ITEMS.map((item) => {
          const isActive = isActiveAdminRoute(pathname, item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Back to App */}
      <div className="p-2 border-t">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to App
        </Link>
      </div>
    </aside>
  );
}
