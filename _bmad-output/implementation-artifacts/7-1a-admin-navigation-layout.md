# Story 7.1a: Admin Navigation Layout

## Status: ready-for-dev

## Story

As an **admin**,
I want **a dedicated navigation layout when in the Admin section**,
So that **I can focus on admin tasks without distraction from the main app navigation**.

## Design Decision

**Option A - Context-Switching Sidebar (Enterprise Standard)**

When entering `/admin/*`:
- Desktop: Replace App Sidebar content with Admin Nav (same position)
- Mobile: Hide Bottom Nav, show Admin Header with hamburger menu
- Clear "Back to App" exit point

Reference: AWS Console, Azure Portal, Stripe Dashboard, Salesforce Setup

## Acceptance Criteria

### AC 1: Desktop Admin Sidebar
- **Given** I am logged in as admin and on any `/admin/*` page
- **When** I view the page on desktop (≥768px)
- **Then** The left sidebar shows Admin navigation (not App navigation)
- **And** The sidebar shows: "Admin" header, "Master Data", "Users"
- **And** The sidebar shows "Back to App" link at the bottom
- **And** The sidebar is in the same position as App sidebar (w-56, left side)

### AC 2: Hide App Navigation in Admin
- **Given** I am on any `/admin/*` page
- **When** I view the page on desktop
- **Then** The App sidebar (Entry, Dashboard, Team, Admin) is NOT visible
- **And** Only Admin sidebar is visible

- **Given** I am on any `/admin/*` page
- **When** I view the page on mobile
- **Then** The Bottom Nav (Entry, Dashboard, Team, Admin) is NOT visible

### AC 3: Active State Highlighting
- **Given** I am on `/admin/master-data`
- **When** I view the sidebar
- **Then** "Master Data" item is visually highlighted as active
- **And** "Users" item is not highlighted

- **Given** I am on `/admin/users`
- **When** I view the sidebar
- **Then** "Users" item is visually highlighted as active

### AC 4: Navigation Functionality
- **Given** I am on `/admin/master-data`
- **When** I click "Users" in the sidebar
- **Then** I am navigated to `/admin/users`
- **And** Navigation is client-side (no full page reload)

- **Given** I am on any admin page
- **When** I click "Back to App"
- **Then** I am navigated to `/dashboard`
- **And** The App navigation is restored

### AC 5: Mobile Admin Header
- **Given** I am on any `/admin/*` page on mobile (<768px)
- **When** I view the page
- **Then** I see a header with "Admin" text and hamburger menu button
- **And** The header is sticky at top

### AC 6: Mobile Hamburger Menu
- **Given** I am on mobile and tap the hamburger menu
- **When** The menu opens
- **Then** I see a slide-in sheet from the left
- **And** The sheet shows: "Admin" header, "Master Data", "Users", "Back to App"
- **And** The background is dimmed

- **Given** The mobile menu is open
- **When** I tap a navigation item
- **Then** I am navigated to that page
- **And** The menu closes automatically

- **Given** The mobile menu is open
- **When** I tap outside the menu (on dimmed area)
- **Then** The menu closes

### AC 7: Keyboard Accessibility
- **Given** I am using keyboard navigation
- **When** I tab through the admin sidebar
- **Then** All navigation items are focusable
- **And** Enter/Space activates the focused item
- **And** Focus indicators are visible

### AC 8: Admin Landing Page
- **Given** I navigate to `/admin` directly
- **When** The page loads
- **Then** I am redirected to `/admin/master-data`
- **And** "Master Data" is highlighted as active in sidebar

## Tasks

### Task 1: Create Admin Navigation Constants
**File:** `src/constants/admin-navigation.ts`
- [ ] Create `AdminNavItem` interface (href, label, icon)
- [ ] Define `ADMIN_NAV_ITEMS` array: Master Data, Users
- [ ] Export `isActiveAdminRoute(pathname, href)` helper
- [ ] Add tests

### Task 2: Modify App Sidebar to Hide in Admin
**File:** `src/components/navigation/Sidebar.tsx`
- [ ] Import `usePathname` from next/navigation
- [ ] Add condition: if pathname starts with `/admin`, return null
- [ ] Add test: `should return null when pathname starts with /admin`
- [ ] Add test: `should render normally for non-admin paths`

### Task 3: Modify Bottom Nav to Hide in Admin
**File:** `src/components/navigation/BottomNav.tsx`
- [ ] Import `usePathname` from next/navigation
- [ ] Add condition: if pathname starts with `/admin`, return null
- [ ] Add test: `should return null when pathname starts with /admin`
- [ ] Add test: `should render normally for non-admin paths`

### Task 4: Create AdminSidebar Component
**File:** `src/components/admin/AdminSidebar.tsx`
- [ ] Create sidebar container (w-56, border-r, flex-col)
- [ ] Render "Admin" header at top
- [ ] Map through `ADMIN_NAV_ITEMS` with icons
- [ ] Apply active state styling (bg-primary)
- [ ] Add "Back to App" link at bottom with ArrowLeft icon
- [ ] Add aria-current="page" for active item
- [ ] Hidden on mobile (hidden md:flex)

### Task 5: Create AdminSidebar Tests
**File:** `src/components/admin/AdminSidebar.test.tsx`
- [ ] Test renders "Admin" header
- [ ] Test renders all navigation items
- [ ] Test active state on current route
- [ ] Test links have correct hrefs
- [ ] Test "Back to App" links to /dashboard
- [ ] Test aria-current attribute

### Task 6: Create AdminMobileHeader Component
**File:** `src/components/admin/AdminMobileHeader.tsx`
- [ ] Create sticky header with "Admin" text
- [ ] Add hamburger menu button (Menu icon)
- [ ] Use Sheet component for slide-in menu
- [ ] Render same nav items as AdminSidebar in sheet
- [ ] Close sheet on navigation
- [ ] Visible only on mobile (md:hidden)

### Task 7: Create AdminMobileHeader Tests
**File:** `src/components/admin/AdminMobileHeader.test.tsx`
- [ ] Test renders "Admin" text
- [ ] Test hamburger button visible
- [ ] Test sheet opens on button click
- [ ] Test navigation items in sheet
- [ ] Test sheet closes on item click

### Task 8: Create Admin Components Index
**File:** `src/components/admin/index.ts`
- [ ] Export AdminSidebar
- [ ] Export AdminMobileHeader

### Task 9: Update Admin Layout
**File:** `src/app/(app)/admin/layout.tsx`
- [ ] Import AdminSidebar, AdminMobileHeader
- [ ] Restructure layout to use flex container
- [ ] Add AdminSidebar (desktop)
- [ ] Add AdminMobileHeader (mobile)
- [ ] Content area takes flex-1

### Task 10: Update App Layout (if needed)
**File:** `src/app/(app)/layout.tsx`
- [ ] Verify Sidebar and BottomNav hide correctly in Admin
- [ ] No duplicate navigation when in Admin section

## Dev Notes

### Component Hierarchy

```
/dashboard, /entry, /team:
┌─────────────────────────────────────┐
│ AppLayout                           │
│ ├── Sidebar (visible)               │
│ ├── Content                         │
│ └── BottomNav (visible on mobile)   │
└─────────────────────────────────────┘

/admin/*:
┌─────────────────────────────────────┐
│ AppLayout                           │
│ ├── Sidebar (HIDDEN)                │
│ ├── AdminLayout                     │
│ │   ├── AdminSidebar (desktop)      │
│ │   ├── AdminMobileHeader (mobile)  │
│ │   └── Content                     │
│ └── BottomNav (HIDDEN)              │
└─────────────────────────────────────┘
```

### Admin Navigation Items

```typescript
// src/constants/admin-navigation.ts
import { Database, Users, type LucideIcon } from 'lucide-react';

export interface AdminNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { href: '/admin/master-data', label: 'Master Data', icon: Database },
  { href: '/admin/users', label: 'Users', icon: Users },
];

export function isActiveAdminRoute(pathname: string, href: string): boolean {
  if (href === '/admin/master-data') {
    return pathname === '/admin/master-data' || pathname === '/admin';
  }
  return pathname.startsWith(href);
}
```

### Hiding App Navigation

```typescript
// src/components/navigation/Sidebar.tsx
'use client';

import { usePathname } from 'next/navigation';
// ... other imports

export function Sidebar({ userRole }: SidebarProps) {
  const pathname = usePathname();

  // Hide in Admin section - Admin has its own sidebar
  if (pathname.startsWith('/admin')) {
    return null;
  }

  // ... existing sidebar code
}
```

```typescript
// src/components/navigation/BottomNav.tsx
'use client';

import { usePathname } from 'next/navigation';
// ... other imports

export function BottomNav({ userRole }: BottomNavProps) {
  const pathname = usePathname();

  // Hide in Admin section - Admin has its own navigation
  if (pathname.startsWith('/admin')) {
    return null;
  }

  // ... existing bottom nav code
}
```

### AdminSidebar Component

```typescript
// src/components/admin/AdminSidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ADMIN_NAV_ITEMS, isActiveAdminRoute } from '@/constants/admin-navigation';

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-56 flex-col border-r bg-background">
      {/* Header */}
      <div className="h-14 flex items-center px-4 border-b">
        <span className="font-semibold text-lg">Admin</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1">
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
```

### AdminMobileHeader Component

```typescript
// src/components/admin/AdminMobileHeader.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { ADMIN_NAV_ITEMS, isActiveAdminRoute } from '@/constants/admin-navigation';

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
        <SheetContent side="left" className="w-64 p-0">
          <SheetHeader className="h-14 flex items-center justify-center border-b">
            <SheetTitle>Admin</SheetTitle>
          </SheetHeader>

          <nav className="flex-1 p-2 space-y-1">
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

          <div className="absolute bottom-0 left-0 right-0 p-2 border-t">
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
```

### Admin Layout

```typescript
// src/app/(app)/admin/layout.tsx
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminMobileHeader } from '@/components/admin/AdminMobileHeader';
import type { UserRole } from '@/types/domain';

const allowedRoles: UserRole[] = ['admin', 'super_admin'];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || !allowedRoles.includes(profile.role as UserRole)) {
    redirect('/dashboard?access=denied');
  }

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] md:min-h-screen">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <AdminMobileHeader />
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
```

### Styling Guidelines

| Element | Style |
|---------|-------|
| Sidebar width | `w-56` (224px) |
| Header height | `h-14` (56px) - **Must match App header height** |
| Active state | `bg-primary text-primary-foreground` |
| Hover state | `hover:bg-accent hover:text-accent-foreground` |
| Inactive text | `text-muted-foreground` |
| Border | `border-r` (sidebar), `border-b` (header) |

**Note:** Verify App header height in `src/components/navigation/Header.tsx` and ensure Admin header matches.

### Prerequisites

Before starting implementation:
1. Verify Sheet component exists: `src/components/ui/sheet.tsx`
2. If not, install: `npx shadcn@latest add sheet`

### Accessibility

- All links have visible focus indicators
- Active link has `aria-current="page"`
- Hamburger button has `aria-label="Open admin menu"`
- Sheet traps focus when open
- Keyboard navigation works (Tab, Enter, Space, Escape)

## Dependencies

- Story 3.5 (Master Data Admin UI) - provides `/admin/master-data`
- Story 7.1 (User List View) - provides `/admin/users`
- shadcn/ui Sheet component

## Definition of Done

- [ ] App Sidebar hides when on `/admin/*`
- [ ] App Bottom Nav hides when on `/admin/*`
- [ ] Admin Sidebar shows on desktop with correct items
- [ ] Admin Mobile Header shows on mobile with hamburger
- [ ] Active state highlights current page
- [ ] Navigation between Master Data and Users works
- [ ] "Back to App" returns to dashboard and restores App nav
- [ ] `/admin` redirects to `/admin/master-data`
- [ ] Mobile sheet opens/closes correctly
- [ ] Keyboard navigation works
- [ ] All tests pass (including nav hiding tests)
- [ ] No TypeScript errors
- [ ] No console errors

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-01-04 | Story created - Option A (Enterprise Standard) | Party Mode Team |
| 2026-01-04 | Added AC 8 (landing page), explicit nav hiding tests, header height note, prerequisites | Party Mode Review |
