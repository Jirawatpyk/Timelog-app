---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8, 9]
workflowType: story
epic: 4
story_number: 12
title: "Desktop Header Enhancement"
status: done
created_date: 2026-01-01
completed_date: 2026-01-01
---

# Story 4.12: Desktop Header Enhancement

## Story

As a **user on desktop viewport**,
I want **an enhanced header with user profile and quick actions**,
So that **I can see my identity, role, and access common actions easily**.

## Background

The current header (`src/app/(app)/layout.tsx`) has minimal content:
- Logo link
- DeployButton (development only, hidden on mobile)
- AuthButton (sign out button)

On desktop, we have more screen real estate and can provide a richer header experience with user profile information and better organization.

## Acceptance Criteria

### AC 1: User Profile Display
**Given** I am logged in on desktop viewport (≥768px)
**When** I view the header
**Then** I see my display name or email
**And** I see my role badge (Staff, Manager, Admin, Super Admin)
**And** The profile section is positioned on the right side of the header

### AC 2: User Profile Dropdown
**Given** I am on desktop viewport
**When** I click on my profile section in the header
**Then** A dropdown menu appears with:
- My display name and email
- My role
- "ออกจากระบบ" (Sign Out) option
**And** Clicking outside closes the dropdown

### AC 3: Sign Out from Dropdown
**Given** The profile dropdown is open
**When** I click "ออกจากระบบ"
**Then** I am signed out and redirected to login page
**And** Same behavior as current AuthButton

### AC 4: Role Badge Styling
**Given** I am viewing my profile in the header
**When** I see the role badge
**Then** The badge has appropriate styling per role:
- Staff: Default/neutral style
- Manager: Blue style
- Admin: Purple style
- Super Admin: Red/gold style

### AC 5: Mobile Compatibility
**Given** I am on mobile viewport (<768px)
**When** I view the header
**Then** The enhanced profile section is hidden or simplified
**And** The existing AuthButton behavior is maintained
**And** Header does not overflow or break layout

### AC 6: Loading State
**Given** The page is loading user data
**When** I view the header on desktop
**Then** I see a skeleton placeholder for the profile section
**And** The layout does not shift when data loads

### AC 7: ThemeSwitcher in Header (Desktop)
**Given** I am on desktop viewport
**When** I view the header
**Then** ThemeSwitcher is visible in the header (moved from footer)
**And** On mobile, ThemeSwitcher remains in footer

## Technical Notes

- Use `useUser()` hook to get user data (already exists)
- Create `<UserProfileDropdown />` component in `@/components/shared/`
- Use shadcn/ui `DropdownMenu` component
- Use shadcn/ui `Badge` component for role display
- Reuse sign out logic from existing `AuthButton` component
- Consider extracting shared logout logic to a hook or utility

## Files to Create/Modify

1. **Create:** `src/components/shared/user-profile-dropdown.tsx` - Profile dropdown component
2. **Create:** `src/components/shared/user-profile-dropdown.test.tsx` - Unit tests
3. **Create:** `src/components/shared/role-badge.tsx` - Role badge component
4. **Modify:** `src/app/(app)/layout.tsx` - Replace AuthButton with UserProfileDropdown on desktop
5. **Modify:** Footer section - Conditionally hide ThemeSwitcher on desktop

## UI Mockup (Text)

```
Desktop Header:
┌─────────────────────────────────────────────────────────────────┐
│  Timelog                              🌙  [Avatar] John D. ▼   │
│                                           [Manager]            │
└─────────────────────────────────────────────────────────────────┘

Dropdown (when clicked):
┌──────────────────────┐
│ John Doe             │
│ john@company.com     │
│ ──────────────────── │
│ 🔵 Manager           │
│ ──────────────────── │
│ ออกจากระบบ           │
└──────────────────────┘
```

## Dependencies

- Story 2.2: Session Persistence & Logout (done) - Uses logout functionality
- Story 4.11: Desktop Sidebar Navigation - Coordinates with sidebar for desktop layout

## Out of Scope

- User settings/preferences page
- Profile editing
- Avatar upload
- Notifications

## Dev Notes

Role badge colors (Tailwind):
```typescript
const roleBadgeVariants = {
  staff: 'bg-slate-100 text-slate-700',
  manager: 'bg-blue-100 text-blue-700',
  admin: 'bg-purple-100 text-purple-700',
  super_admin: 'bg-amber-100 text-amber-700',
};
```

Layout pattern for responsive header:
```tsx
<header>
  <Logo />

  {/* Desktop: Full profile dropdown with name + role badge */}
  <div className="hidden md:flex items-center gap-4">
    <ThemeSwitcher />
    <UserProfileDropdown />
  </div>

  {/* Mobile: Compact profile dropdown with short name only */}
  <div className="md:hidden">
    <UserProfileDropdown compact />
  </div>
</header>
```

## Tasks/Subtasks

- [x] **Task 1: Create RoleBadge Component** (AC 4)
  - [x] 1.1 Create `role-badge.tsx` with role-specific styling variants
  - [x] 1.2 Create `role-badge.test.tsx` with unit tests for all roles
  - [x] 1.3 Export from shared components (direct import, no index file)

- [x] **Task 2: Create UserProfileDropdown Component** (AC 1, 2, 3, 6)
  - [x] 2.1 Create `user-profile-dropdown.tsx` using shadcn DropdownMenu
  - [x] 2.2 Display name/email, role badge, and sign out option
  - [x] 2.3 Implement sign out using existing logout action
  - [x] 2.4 Add loading skeleton state
  - [x] 2.5 Create `user-profile-dropdown.test.tsx` with unit tests

- [x] **Task 3: Integrate into Layout** (AC 5, 7)
  - [x] 3.1 Update layout.tsx header for desktop/mobile responsive behavior
  - [x] 3.2 Move ThemeSwitcher to header on desktop, keep in footer on mobile
  - [x] 3.3 Desktop: Full UserProfileDropdown with name + role badge
  - [x] 3.4 Mobile: Compact UserProfileDropdown with short name only (consistent UX)

- [x] **Task 4: Run Tests and Verify** (AC 1-7)
  - [x] 4.1 Run all unit tests (20 tests for 4.12 pass)
  - [x] 4.2 Verify all acceptance criteria are met
  - [x] 4.3 Run full test suite (14 failures from Story 4.2 - unrelated)

---

## Dev Agent Record

### Implementation Plan
- Create RoleBadge component with role-variant styling
- Create UserProfileDropdown with shadcn DropdownMenu
- Reuse logout action from existing LogoutButton
- Integrate into layout with responsive desktop/mobile behavior

### Debug Log
- Used shadcn Badge component styling as reference for RoleBadge
- Reused logout logic pattern from LogoutButton component
- Used shadcn DropdownMenu for profile dropdown

### Completion Notes
- RoleBadge: 4 role variants with distinct colors (slate, blue, purple, amber) + dark mode support
- UserProfileDropdown: Shows user avatar, name, role badge, with sign out option
- Compact mode: Mobile shows shortened name only for space efficiency
- Layout integration: Desktop shows full profile dropdown + theme in header, mobile shows compact dropdown
- All 26 unit tests pass (10 RoleBadge + 16 UserProfileDropdown including compact mode + logout test)

---

## File List

**Created:**
- `src/components/shared/role-badge.tsx` - Role badge component with 4 variants + dark mode
- `src/components/shared/role-badge.test.tsx` - 10 unit tests
- `src/components/shared/user-profile-dropdown.tsx` - User profile dropdown with sign out + compact mode
- `src/components/shared/user-profile-dropdown.test.tsx` - 16 unit tests (compact mode + AC 3 logout)

**Modified:**
- `src/app/(app)/layout.tsx` - Desktop/mobile responsive header (compact dropdown on mobile)

---

## Change Log

| Date | Change |
|------|--------|
| 2026-01-01 | Story created |
| 2026-01-01 | Implementation complete - all 4 tasks done, 20 tests passing |
| 2026-01-01 | Enhanced mobile header with compact UserProfileDropdown for consistency |
| 2026-01-01 | Code review fixes: Updated docs, added dark mode, added logout test |

---

## Status

done
