---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
workflowType: story
epic: 4
story_number: 11
title: "Desktop Sidebar Navigation"
status: done
created_date: 2026-01-01
completed_date: 2026-01-01
---

# Story 4.11: Desktop Sidebar Navigation

## Story

As a **user on desktop viewport**,
I want **a persistent sidebar navigation**,
So that **I can navigate between sections on larger screens with better visibility and access**.

## Background

Story 4.1 implemented the Bottom Navigation for mobile viewports (hidden on md: and above). Desktop users currently have no persistent navigation, only relying on the top header. This story adds a sidebar navigation that appears on desktop viewport (md: and above) to complement the mobile bottom nav.

## Acceptance Criteria

### AC 1: Sidebar Visibility on Desktop
**Given** I am logged in on desktop viewport (≥768px)
**When** I view any protected page
**Then** I see a persistent sidebar on the left side
**And** The sidebar shows navigation items with icons and labels
**And** The sidebar does not appear on mobile viewport (hidden below md:)

### AC 2: Role-Based Navigation Items
**Given** I am authenticated with a specific role
**When** I view the sidebar
**Then** I see navigation items appropriate to my role:
- Staff: Entry, Dashboard
- Manager: Entry, Dashboard, Team
- Admin: Entry, Dashboard, Team, Admin (Master Data)
- Super Admin: All items

### AC 3: Active State Indication
**Given** I am on a specific page
**When** I view the sidebar
**Then** The current page's navigation item is highlighted
**And** Active state uses primary color styling
**And** Active item shows a left border indicator

### AC 4: Navigation Behavior
**Given** I click a sidebar navigation item
**When** The navigation completes
**Then** I am taken to that page without full page reload (client-side navigation)
**And** The sidebar remains visible
**And** Active state updates to reflect the new page

### AC 5: Consistent Layout with Content
**Given** The sidebar is visible on desktop
**When** I view the main content area
**Then** The content is pushed to the right to accommodate the sidebar
**And** Layout does not overlap or create horizontal scroll
**And** Sidebar width is fixed (e.g., 240px or w-60)

### AC 6: Visual Design
**Given** The sidebar navigation
**When** Rendered on desktop
**Then** It matches the design language of the app (shadcn/ui style)
**And** Navigation items have 44px minimum height for clickability
**And** Icons are visible with appropriate spacing
**And** Hover states provide visual feedback

## Technical Notes

- Reuse `getNavItemsForRole()` from `@/constants/navigation` (same as BottomNav)
- Create `<Sidebar />` component in `@/components/navigation/`
- Use Tailwind responsive classes: `hidden md:flex` to show on desktop only
- Update `src/app/(app)/layout.tsx` to include Sidebar alongside BottomNav
- Sidebar should be placed within the main content area, not as a separate fixed element (to avoid z-index issues with BottomNav)
- Use same icon set as BottomNav for consistency

## Files to Create/Modify

1. **Create:** `src/components/navigation/Sidebar.tsx` - Sidebar component
2. **Create:** `src/components/navigation/Sidebar.test.tsx` - Unit tests
3. **Modify:** `src/components/navigation/index.ts` - Export Sidebar
4. **Modify:** `src/app/(app)/layout.tsx` - Add Sidebar to layout

## Dependencies

- Story 4.1: Bottom Navigation Component (done) - Shares navigation config

## Out of Scope

- Collapsible/expandable sidebar
- Sidebar on mobile (handled by BottomNav)
- User profile section in sidebar
- Settings link in sidebar

## Dev Notes

Pattern from BottomNav:
```typescript
const { role, isLoading } = useUser();
const navItems = getNavItemsForRole(role);
```

Layout structure should be:
```tsx
<AuthStateListener>
  <div className="flex min-h-screen">
    <Sidebar /> {/* hidden md:flex */}
    <main className="flex-1">
      {children}
    </main>
  </div>
  <BottomNav /> {/* md:hidden */}
</AuthStateListener>
```

## Tasks/Subtasks

- [x] **Task 1: Create Sidebar Component** (AC 1, 2, 3, 6)
  - [x] 1.1 Create `Sidebar.tsx` with role-based navigation items
  - [x] 1.2 Implement active state with left border indicator
  - [x] 1.3 Add loading skeleton state (SidebarSkeleton)
  - [x] 1.4 Style with Tailwind: hidden md:flex, w-60, min-h-44px items

- [x] **Task 2: Create Sidebar Unit Tests** (Testing)
  - [x] 2.1 Test role-based navigation rendering (staff, manager, admin, super_admin)
  - [x] 2.2 Test active state highlighting
  - [x] 2.3 Test loading skeleton display

- [x] **Task 3: Update Layout Integration** (AC 4, 5)
  - [x] 3.1 Modify layout.tsx to include Sidebar
  - [x] 3.2 Restructure layout with flex container for sidebar + content
  - [x] 3.3 Ensure content is pushed right (not overlapping)

- [x] **Task 4: Export and Verify** (AC 1-6)
  - [x] 4.1 Export Sidebar from navigation index
  - [x] 4.2 Run all tests to ensure no regressions (573 tests passed)
  - [x] 4.3 Verify all acceptance criteria are met

---

## Dev Agent Record

### Implementation Plan
- Reuse `getNavItemsForRole()` and `useUser()` from existing BottomNav pattern
- Create Sidebar component mirroring BottomNav structure but for desktop
- Use `hidden md:flex` for desktop-only visibility
- Fixed width w-60 (240px) with border-r separator

### Debug Log
(Implementation notes will be added during development)

### Completion Notes
- Created `Sidebar.tsx` with role-based navigation reusing `getNavItemsForRole()`
- Active state uses left border indicator with primary color
- Skeleton loading state displays while user role loads
- Layout restructured with flex container for sidebar + main content
- All 6 acceptance criteria verified

### Code Review Fixes Applied
- Added `aria-current="page"` for active links (accessibility improvement)
- Added test for sub-route active matching (`/entry/123` → highlights `/entry`)
- Added test for hover class verification
- Final: 13 unit tests pass, 575 total tests pass with no regressions

---

## File List

**Created:**
- `src/components/navigation/Sidebar.tsx` - Sidebar component with role-based navigation
- `src/components/navigation/Sidebar.test.tsx` - 11 unit tests

**Modified:**
- `src/components/navigation/index.ts` - Export Sidebar and SidebarSkeleton
- `src/app/(app)/layout.tsx` - Flex container with Sidebar integration

---

## Change Log

| Date | Change |
|------|--------|
| 2026-01-01 | Story created |
| 2026-01-01 | Implementation complete - all tasks done, 11 tests passing |
| 2026-01-01 | Code review complete - added aria-current, 2 new tests, 13 tests total |

---

## Status

done
