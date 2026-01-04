'use client';

import { usePathname } from 'next/navigation';
import { AdminNavLinks, BackToAppLink } from './AdminNavItems';

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

      {/* Back to App - Always visible at top for easy access */}
      <div className="p-2 border-b">
        <BackToAppLink />
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1" aria-label="Admin navigation">
        <AdminNavLinks pathname={pathname} />
      </nav>
    </aside>
  );
}
