'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { AdminNavLinks, BackToAppLink } from './AdminNavItems';

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

  const handleNavigate = () => setOpen(false);

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
            <AdminNavLinks pathname={pathname} onNavigate={handleNavigate} />
          </nav>

          <div className="p-2 border-t mt-auto">
            <BackToAppLink onNavigate={handleNavigate} />
          </div>
        </SheetContent>
      </Sheet>

      <span className="font-semibold">Admin</span>
    </header>
  );
}
