'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ADMIN_NAV_ITEMS, isActiveAdminRoute } from '@/constants/admin-navigation';

/**
 * Shared Admin Navigation Items Component
 * Story 7.1a: Admin Navigation Layout
 *
 * Reusable component for rendering admin nav items
 * Used by both AdminSidebar and AdminMobileHeader
 */

interface AdminNavItemsProps {
  pathname: string;
  onNavigate?: () => void;
}

/**
 * Renders the main admin navigation links
 */
export function AdminNavLinks({ pathname, onNavigate }: AdminNavItemsProps) {
  return (
    <>
      {ADMIN_NAV_ITEMS.map((item) => {
        const isActive = isActiveAdminRoute(pathname, item.href);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
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
    </>
  );
}

/**
 * Renders the "Back to App" link
 * Styled as secondary button to distinguish from nav items (exit action)
 */
export function BackToAppLink({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <Button
      variant="secondary"
      size="sm"
      className="w-full justify-start gap-3"
      asChild
    >
      <Link
        href="/dashboard"
        onClick={onNavigate}
        aria-label="Return to main dashboard"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to App
      </Link>
    </Button>
  );
}
