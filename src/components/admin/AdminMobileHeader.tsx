'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { ADMIN_NAV_ITEMS, isActiveAdminRoute } from '@/constants/admin-navigation';

/**
 * Admin Mobile Header Component
 * Story 7.1a: Admin Navigation Layout
 *
 * Provides mobile navigation header for admin section
 *
 * Features:
 * - Visible only on mobile (md:hidden) (AC: 5)
 * - Sticky at top (AC: 5)
 * - Shows "Admin" text (AC: 5)
 * - Hamburger menu button (AC: 5)
 * - Sheet slides in from left (AC: 6)
 * - Sheet shows nav items (AC: 6)
 * - Sheet closes on navigation (AC: 6)
 * - Background dimmed when sheet open (AC: 6)
 */
export function AdminMobileHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="md:hidden sticky top-0 z-40 h-14 flex items-center gap-4 border-b bg-background px-4">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Open admin menu">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-56 p-0 flex flex-col">
          <SheetHeader className="h-14 flex items-center justify-center border-b px-4">
            <SheetTitle>Admin</SheetTitle>
            <SheetDescription className="sr-only">
              Admin navigation menu
            </SheetDescription>
          </SheetHeader>

          <nav className="flex-1 p-2 space-y-1" aria-label="Admin mobile navigation">
            {ADMIN_NAV_ITEMS.map((item) => {
              const isActive = isActiveAdminRoute(pathname, item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
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

          <div className="p-2 border-t mt-auto">
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to App
            </Link>
          </div>
        </SheetContent>
      </Sheet>

      <span className="font-semibold">Admin</span>
    </header>
  );
}
