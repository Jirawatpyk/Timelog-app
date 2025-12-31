# Story 4.1: Bottom Navigation Component

Status: ready-for-dev

## Story

As a **user**,
I want **a persistent bottom navigation bar**,
So that **I can quickly switch between Entry, Dashboard, and other sections**.

## Acceptance Criteria

1. **AC1: Bottom Navigation Visibility**
   - Given I am logged in on any page
   - When I view the screen on mobile
   - Then I see a bottom navigation bar fixed at the bottom
   - And it contains icons for: Entry, Dashboard, Team, Admin

2. **AC2: Role-Based Navigation Items**
   - Given I am logged in as staff
   - When I view the navigation bar
   - Then I see only Entry and Dashboard icons
   - Given I am logged in as manager
   - Then I also see the Team icon
   - Given I am logged in as admin/super_admin
   - Then I also see the Admin icon

3. **AC3: Active State Indication**
   - Given I am on any page
   - When I view the navigation bar
   - Then the current page icon is highlighted/active
   - And other icons are in default state

4. **AC4: Touch Target Size**
   - Given the navigation bar is visible
   - When measuring touch targets
   - Then all navigation items are minimum 44x44px
   - And there is adequate spacing between items

5. **AC5: Client-Side Navigation**
   - Given I tap a navigation icon
   - When the navigation completes
   - Then I am taken to that page without full page reload
   - And the navigation bar remains fixed at the bottom
   - And navigation is smooth and instant

6. **AC6: Desktop Layout**
   - Given I am on desktop viewport (>768px)
   - When I view the page
   - Then the bottom navigation may be hidden or converted to sidebar
   - Or remains visible if design preference

7. **AC7: Safe Area Padding**
   - Given I am on iOS with home indicator
   - When I view the navigation bar
   - Then there is proper safe area padding at the bottom
   - And the navigation bar doesn't overlap with system UI

## Tasks / Subtasks

- [ ] **Task 1: Create BottomNav Component** (AC: 1, 3)
  - [ ] 1.1 Create `components/navigation/BottomNav.tsx`
  - [ ] 1.2 Define navigation items with icons
  - [ ] 1.3 Implement active state detection using usePathname
  - [ ] 1.4 Style with fixed positioning at bottom

- [ ] **Task 2: Implement Role-Based Items** (AC: 2)
  - [ ] 2.1 Create `hooks/use-user-role.ts` to get current user role
  - [ ] 2.2 Filter navigation items based on role
  - [ ] 2.3 Define ROUTE_PERMISSIONS constant for consistency

- [ ] **Task 3: Add Navigation Icons** (AC: 1, 4)
  - [ ] 3.1 Select icons from lucide-react
  - [ ] 3.2 Ensure 44x44px touch targets
  - [ ] 3.3 Add labels below icons
  - [ ] 3.4 Style active vs inactive states

- [ ] **Task 4: Implement Client-Side Navigation** (AC: 5)
  - [ ] 4.1 Use Next.js Link component
  - [ ] 4.2 Add prefetch for fast navigation
  - [ ] 4.3 Test navigation performance

- [ ] **Task 5: Add Safe Area Support** (AC: 7)
  - [ ] 5.1 Add CSS for safe-area-inset-bottom
  - [ ] 5.2 Test on iOS simulator/device
  - [ ] 5.3 Ensure content doesn't overlap

- [ ] **Task 6: Responsive Design** (AC: 6)
  - [ ] 6.1 Hide on desktop or convert to sidebar (design decision)
  - [ ] 6.2 Add responsive breakpoints
  - [ ] 6.3 Test on various viewport sizes

- [ ] **Task 7: Integrate into App Layout** (AC: 1)
  - [ ] 7.1 Add BottomNav to `app/(app)/layout.tsx`
  - [ ] 7.2 Adjust main content padding to not overlap
  - [ ] 7.3 Verify on all protected pages

## Dev Notes

### Navigation Items Configuration

```typescript
// src/constants/navigation.ts
import { Home, LayoutDashboard, Users, Settings } from 'lucide-react';
import type { UserRole } from '@/types/domain';

export interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: UserRole[];
}

export const NAV_ITEMS: NavItem[] = [
  {
    href: '/entry',
    label: 'Entry',
    icon: Home,
    roles: ['staff', 'manager', 'admin', 'super_admin'],
  },
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    roles: ['staff', 'manager', 'admin', 'super_admin'],
  },
  {
    href: '/team',
    label: 'Team',
    icon: Users,
    roles: ['manager', 'admin', 'super_admin'],
  },
  {
    href: '/admin',
    label: 'Admin',
    icon: Settings,
    roles: ['admin', 'super_admin'],
  },
];

export function getNavItemsForRole(role: UserRole): NavItem[] {
  return NAV_ITEMS.filter((item) => item.roles.includes(role));
}
```

### BottomNav Component

```typescript
// src/components/navigation/BottomNav.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV_ITEMS, getNavItemsForRole } from '@/constants/navigation';
import { useUserRole } from '@/hooks/use-user-role';
import { cn } from '@/lib/utils';

export function BottomNav() {
  const pathname = usePathname();
  const { role, isLoading } = useUserRole();

  if (isLoading || !role) {
    return <BottomNavSkeleton />;
  }

  const navItems = getNavItemsForRole(role);

  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50',
        'bg-background border-t',
        'pb-[env(safe-area-inset-bottom)]',
        'md:hidden' // Hide on desktop - can change to sidebar if needed
      )}
    >
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={true}
              className={cn(
                'flex flex-col items-center justify-center',
                'min-w-[64px] min-h-[44px] px-3 py-2',
                'touch-manipulation',
                'transition-colors duration-200',
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

function BottomNavSkeleton() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t pb-[env(safe-area-inset-bottom)] md:hidden">
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
```

### useUserRole Hook

```typescript
// src/hooks/use-user-role.ts
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { UserRole } from '@/types/domain';

interface UseUserRoleResult {
  role: UserRole | null;
  isLoading: boolean;
  error: Error | null;
}

export function useUserRole(): UseUserRoleResult {
  const [role, setRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const supabase = createClient();

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setRole(null);
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;

        setRole(profile?.role as UserRole);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch role'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchRole();
  }, []);

  return { role, isLoading, error };
}
```

### App Layout Integration

```typescript
// src/app/(app)/layout.tsx
import { BottomNav } from '@/components/navigation/BottomNav';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen pb-20 md:pb-0">
      {/* Header if needed */}
      <main className="container">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
```

### CSS for Safe Area

```css
/* In globals.css or component styles */

/* Ensure safe area support */
@supports (padding-bottom: env(safe-area-inset-bottom)) {
  .safe-area-bottom {
    padding-bottom: env(safe-area-inset-bottom);
  }
}

/* Alternative using Tailwind */
/* Already handled with pb-[env(safe-area-inset-bottom)] */
```

### Touch Target Guidelines

Per Apple HIG and Material Design:
- Minimum touch target: 44x44px (iOS) / 48x48dp (Android)
- We use 44x44px as the baseline
- Icons are 24x24 but wrapped in 64x44px clickable area
- Spacing between items prevents accidental taps

### Icon Selection (lucide-react)

| Page | Icon | Reasoning |
|------|------|-----------|
| Entry | `Home` or `Clock` | Primary action, feels like "home" |
| Dashboard | `LayoutDashboard` | Standard dashboard icon |
| Team | `Users` | Represents team/people |
| Admin | `Settings` | Standard admin/settings icon |

Alternative icons:
- Entry: `PlusCircle`, `Clock`, `FileEdit`
- Dashboard: `BarChart3`, `Activity`
- Team: `Users2`, `UserCog`
- Admin: `Shield`, `Cog`, `Wrench`

### Desktop Behavior Options

1. **Hide on desktop** (current implementation):
   ```css
   md:hidden
   ```

2. **Convert to sidebar**:
   - Create `SideNav.tsx` for desktop
   - Show SideNav on `md:block`, hide BottomNav

3. **Keep at bottom**:
   - Remove `md:hidden`
   - Adjust styling for larger screens

### Project Structure

```
src/
├── components/
│   └── navigation/
│       └── BottomNav.tsx         # NEW
├── constants/
│   └── navigation.ts             # NEW
├── hooks/
│   └── use-user-role.ts          # NEW (or extend existing)
└── app/
    └── (app)/
        └── layout.tsx            # MODIFY - add BottomNav
```

### Performance Considerations

1. **Prefetch**: All links use `prefetch={true}` for instant navigation
2. **Role caching**: Consider caching role in React context to avoid refetch
3. **Skeleton**: Show skeleton while loading to prevent layout shift
4. **Minimal re-renders**: usePathname is already optimized

### Accessibility

- All navigation items are focusable
- Active state is visually and semantically indicated
- Labels provide text alternative to icons
- Touch targets exceed minimum requirements
- Keyboard navigation works (Tab, Enter)

### Testing Considerations

```typescript
// test/e2e/navigation/bottom-nav.test.ts
import { test, expect } from '@playwright/test';

test.describe('Bottom Navigation', () => {
  test('shows correct items for staff role', async ({ page }) => {
    // Login as staff
    await page.goto('/login');
    // ... login steps

    await page.goto('/entry');
    const nav = page.locator('nav').filter({ has: page.locator('a[href="/entry"]') });

    await expect(nav.locator('a[href="/entry"]')).toBeVisible();
    await expect(nav.locator('a[href="/dashboard"]')).toBeVisible();
    await expect(nav.locator('a[href="/team"]')).not.toBeVisible();
    await expect(nav.locator('a[href="/admin"]')).not.toBeVisible();
  });

  test('highlights active page', async ({ page }) => {
    await page.goto('/dashboard');
    const dashboardLink = page.locator('a[href="/dashboard"]');
    await expect(dashboardLink).toHaveClass(/text-primary/);
  });

  test('navigates without full page reload', async ({ page }) => {
    await page.goto('/entry');

    // Start listening for navigation
    const navigationPromise = page.waitForURL('/dashboard');

    await page.click('a[href="/dashboard"]');
    await navigationPromise;

    // Verify client-side navigation (no full reload)
    // Check that React state is preserved or use performance API
  });
});
```

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#Navigation]
- [Source: _bmad-output/planning-artifacts/epics.md#Story 4.1]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Bottom Navigation]
- [Source: _bmad-output/project-context.md#Mobile-First Design]
- [Source: _bmad-output/implementation-artifacts/2-3-role-based-access-control-middleware.md]

## Definition of Done

- [ ] BottomNav component created and styled
- [ ] Navigation items filtered by user role
- [ ] Active state correctly indicates current page
- [ ] Touch targets are 44x44px minimum
- [ ] Client-side navigation works (no full reload)
- [ ] Safe area padding works on iOS
- [ ] Hidden on desktop viewport (or converted to sidebar)
- [ ] Integrated into app layout
- [ ] Skeleton loading state implemented
- [ ] All navigation links are accessible via keyboard
- [ ] E2E tests pass for role-based visibility

## Dev Agent Record

### Agent Model Used

_To be filled by dev agent_

### Completion Notes List

_To be filled during implementation_

### File List

_To be filled with all created/modified files_
