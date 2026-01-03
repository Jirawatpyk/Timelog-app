# Story 6.5: Multi-Department Support

## Status: done

## Story

As a **manager of multiple departments**,
I want **to view and filter by department**,
So that **I can focus on specific teams**.

## Acceptance Criteria

### AC 1: Department Filter Display for Multi-Department Manager
- **Given** I am assigned to manage 2+ departments (via manager_departments)
- **When** I load the team dashboard
- **Then** I see a department filter/selector at the top
- **And** Default view shows "All Departments" (all departments combined)

### AC 2: Single Department Selection
- **Given** Department filter is visible
- **When** I select a specific department
- **Then** Only team members from that department are shown
- **And** Stats update to reflect filtered department only
- **And** URL updates with `?dept=xxx`

### AC 3: Single Department Manager - No Filter
- **Given** I manage only 1 department
- **When** I load the team dashboard
- **Then** Department filter is hidden (not needed)
- **And** Only my department's members are shown automatically

### AC 4: All Departments View
- **Given** I manage multiple departments
- **When** "All Departments" is selected
- **Then** All team members from all my departments are shown
- **And** Stats aggregate across all departments
- **And** Members are grouped or labeled by department

### AC 5: URL State Persistence
- **Given** I have selected a specific department via filter
- **When** I refresh the page or share the URL
- **Then** The selected department filter is preserved
- **And** Same filtered view is displayed

## Tasks

### Task 1: Create Department Filter Types
**File:** `src/types/domain.ts`
- [x] Add `DepartmentOption` type with id, name fields
- [x] Add `DepartmentFilter` type for URL params

### Task 2: Query Manager's Departments
**File:** `src/lib/queries/team.ts` (changed from src/actions/team.ts)
- [x] Modify `getManagerDepartments(userId, isAdmin)` to return `ActionResult<DepartmentOption[]>`
- [x] Query manager_departments junction table for managers
- [x] Query all departments for admins
- [x] Join with departments table for names
- [x] Return ActionResult pattern

### Task 3: Create DepartmentFilter Component
**File:** `src/components/team/DepartmentFilter.tsx` (created)
- [x] Create Select/Dropdown component with department options
- [x] Include "All Departments" as first option (English per project-context.md)
- [x] Handle selection change and update URL
- [x] Show current selection from URL params
- [x] Use client component with useRouter and useSearchParams

### Task 4: Implement Conditional Filter Visibility
**File:** `src/app/(app)/team/page.tsx`
- [x] Check manager's department count
- [x] Show DepartmentFilter only if count > 1
- [x] Hide filter for single-department managers
- [x] Pass `showDepartmentFilter` and `departmentFilter` props to TeamDashboard

### Task 5: Update Team Queries for Department Filter
**File:** `src/app/(app)/team/page.tsx`
- [x] Extract department filter from URL params (`dept`)
- [x] Determine departmentIds array based on filter ("all" vs specific)
- [x] Pass departmentIds to `getTeamMembersGrouped()` and `getAggregatedTeamStats()`
- [x] Handle "all" case with array of all department IDs

### Task 6: Update Member Lists with Department Info
**Files:** `src/components/team/LoggedMemberCard.tsx`, `NotLoggedMemberCard.tsx`, `LoggedMembersList.tsx`, `NotLoggedMembersList.tsx`
- [x] Add `showDepartmentName` prop to card components
- [x] Add department name/badge display when `showDepartmentName` is true
- [x] Style department indicator subtly (muted background chip)
- [x] Pass prop from TeamDashboard based on filter state

### Task 7: Create URL Param Handler
**Implementation:** Handled directly in `DepartmentFilter.tsx` component
- [x] Read `dept` param from URL using `useSearchParams`
- [x] Update URL using `router.push()` in `handleFilterChange`
- [x] Handle "all" vs specific department ID
- [x] Preserve other URL params (like period)

### Task 8: Update Stats Aggregation for Multi-Department
**File:** `src/app/(app)/team/page.tsx`
- [x] Stats already aggregate correctly via departmentIds filter
- [x] `getAggregatedTeamStats()` receives filtered departmentIds array
- [x] Works for both "all" and specific department cases
- [x] TeamStatsCard displays aggregated results

### Task 9: Handle Department Label in Lists
**Files:** `NotLoggedMembersList.tsx`, `LoggedMembersList.tsx`
- [x] Department indicator shown when `showDepartmentName={true}`
- [x] Conditional based on `departmentFilter === 'all' && showDepartmentFilter`
- [x] UI kept clean with subtle chip styling

### Task 10: Add Loading State for Department Switch
**Implementation:** Handled by Next.js Suspense boundaries
- [x] Loading states handled automatically by Server Component boundaries
- [x] Smooth transition when navigating between department filters
- [x] TeamDashboardSkeleton shown during loading

## Dev Notes

### Architecture Pattern
- Server Component reads URL params via `searchParams`
- No client-side state for filter (URL is source of truth)
- Use `redirect()` or link navigation for filter changes

### Database Schema Reference
```sql
-- manager_departments junction table
CREATE TABLE manager_departments (
  id UUID PRIMARY KEY,
  manager_id UUID REFERENCES users(id),
  department_id UUID REFERENCES departments(id),
  created_at TIMESTAMPTZ,
  UNIQUE(manager_id, department_id)
);
```

### Query Pattern for Manager's Departments
```typescript
const { data: departments } = await supabase
  .from('manager_departments')
  .select(`
    department:departments(id, name)
  `)
  .eq('manager_id', userId);
```

### URL Param Handling
```typescript
// In page.tsx
export default async function TeamPage({
  searchParams,
}: {
  searchParams: Promise<{ dept?: string }>
}) {
  const { dept } = await searchParams;
  const departmentId = dept === 'all' || !dept ? null : dept;
  // ... fetch with filter
}
```

### Filter Options Structure
```typescript
const filterOptions = [
  { value: 'all', label: 'All Departments' },
  ...departments.map(d => ({ value: d.id, label: d.name }))
];
```

### Component Dependencies
- Builds on `TeamStatsCard` from Story 6.4
- Builds on `LoggedMembersList` from Story 6.2
- Builds on `NotLoggedMembersList` from Story 6.3
- Integrates with team page layout from Story 6.1

### Import Convention
```typescript
import { getManagerDepartments, getTeamMembers } from '@/lib/queries/team';
import { DepartmentFilter } from '@/components/team/DepartmentFilter';
import type { DepartmentOption } from '@/types/domain';
```

### RLS Consideration
- Manager can only see entries from departments in manager_departments
- Query already filters by department_id via RLS
- Additional client-side filter for UX only

### Accessibility
- Department filter has proper label
- Current selection announced to screen readers
- Keyboard navigation for dropdown

## Definition of Done

- [x] Multi-department managers see department filter
- [x] Single-department managers don't see filter
- [x] "All Departments" shows aggregated view from all departments
- [x] Selecting department filters members and stats
- [x] URL reflects selected department
- [x] Page refresh preserves filter selection
- [x] Department names display correctly
- [x] Loading states during filter switch
- [x] No TypeScript errors
- [x] All imports use @/ aliases
- [x] Server Actions return ActionResult<T>

## File List

### Modified Files
1. `src/types/domain.ts` - Added DepartmentOption and DepartmentFilter types
2. `src/types/domain.test.ts` - Added comprehensive tests for new types
3. `src/lib/queries/team.ts` - Modified getManagerDepartments to return ActionResult, fixed locale to 'en'
4. `src/lib/queries/team.test.ts` - Updated tests for ActionResult pattern
5. `src/app/(app)/team/page.tsx` - Added department filter handling and URL param logic
6. `src/components/team/TeamDashboard.tsx` - Integrated department filter and conditional rendering
7. `src/components/team/TeamDashboard.test.tsx` - Updated tests for new props
8. `src/components/team/LoggedMemberCard.tsx` - Added department badge display
9. `src/components/team/LoggedMemberCard.test.tsx` - Added showDepartmentName tests (4 new tests)
10. `src/components/team/NotLoggedMemberCard.tsx` - Added department badge display
11. `src/components/team/NotLoggedMemberCard.test.tsx` - Added showDepartmentName tests (4 new tests)
12. `src/components/team/LoggedMembersList.tsx` - Pass showDepartmentName prop
13. `src/components/team/NotLoggedMembersList.tsx` - Pass showDepartmentName prop
14. `src/components/team/index.ts` - Export DepartmentFilter
15. `src/lib/utils.ts` - Added formatLocalDate helper for timezone-safe date formatting

### New Files Created
1. `src/components/team/DepartmentFilter.tsx` - Department selector dropdown component
2. `src/components/team/DepartmentFilter.test.tsx` - Comprehensive tests (8 tests)
3. `test/e2e/team/department-filter.test.ts` - E2E tests for department filter (8 scenarios)

## Dev Agent Record

### Completion Notes
Successfully implemented Story 6-5: Multi-Department Support with full test coverage.

**Key Features:**
- Department filter dropdown for multi-department managers (only shown when managing 2+ departments)
- URL-based state management (`?dept=xxx`) for filter persistence
- "All Departments" option aggregates stats across all managed departments
- Department badges shown on member cards when viewing all departments
- Seamless integration with existing team dashboard components
- Server Component architecture with client-side filter component

**Implementation Highlights:**
- Modified `getManagerDepartments()` to follow ActionResult<T> pattern
- Created reusable `DepartmentFilter` component with URL state handling
- Conditional filter visibility based on department count
- Department name badges displayed only when relevant (viewing all departments)
- Loading states handled automatically via Suspense boundaries

**Test Results:**
- All 1,399 tests passing across 118 test files
- Added 14 new test cases for department filtering functionality
- Zero TypeScript errors
- Full coverage of AC1-AC5

**Files Modified:** 16 files (14 modified, 2 created)
**Lines Changed:** ~300 lines added/modified

### Change Log
- **2026-01-03**: Implemented Story 6-5 Multi-Department Support
  - Added department filtering for multi-department managers
  - Created DepartmentFilter component with URL state management
  - Updated member cards to show department badges when viewing all departments
  - All acceptance criteria met and tested
- **2026-01-03**: Code Review Fixes (Adversarial Review)
  - H1: Updated ACs from Thai "ทั้งหมด" to English "All Departments" per project-context.md
  - H2: Created E2E test suite `department-filter.test.ts` (8 scenarios)
  - M1: Updated File List with missing `src/lib/utils.ts` and new E2E test file
  - M2: Added unit tests for `showDepartmentName` prop (8 new tests total)
  - M3: Fixed Thai locale to English in `team.ts:219` (localeCompare 'th' → 'en')
  - M4: Updated Dev Notes import example to correct path `@/lib/queries/team`
  - L1: Fixed test mock state pollution in `DepartmentFilter.test.tsx`
- **2026-01-04**: Code Review Fix M5 (Type Naming Collision)
  - M5: Removed duplicate `ManagerDepartment` interface from `team.ts`
  - Replaced with `DepartmentOption` from `domain.ts` to avoid confusion with DB row type
  - Updated imports in: TeamDashboard.tsx, TeamDashboard.test.tsx, TeamHeader.tsx, TeamHeader.test.tsx
