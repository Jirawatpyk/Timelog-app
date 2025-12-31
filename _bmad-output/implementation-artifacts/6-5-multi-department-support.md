# Story 6.5: Multi-Department Support

## Status: ready-for-dev

## Story

As a **manager of multiple departments**,
I want **to view and filter by department**,
So that **I can focus on specific teams**.

## Acceptance Criteria

### AC 1: Department Filter Display for Multi-Department Manager
- **Given** I am assigned to manage 2+ departments (via manager_departments)
- **When** I load the team dashboard
- **Then** I see a department filter/selector at the top
- **And** Default view shows "ทั้งหมด" (All departments combined)

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
- **When** "ทั้งหมด" is selected
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
- [ ] Add `DepartmentOption` type with id, name fields
- [ ] Add `DepartmentFilter` type for URL params

### Task 2: Query Manager's Departments
**File:** `src/actions/team.ts`
- [ ] Create `getManagerDepartments(managerId: string)` function
- [ ] Query manager_departments junction table
- [ ] Join with departments table for names
- [ ] Return `ActionResult<DepartmentOption[]>`

### Task 3: Create DepartmentFilter Component
**File:** `src/app/(app)/team/components/DepartmentFilter.tsx`
- [ ] Create Select/Dropdown component with department options
- [ ] Include "ทั้งหมด" as first option
- [ ] Handle selection change and update URL
- [ ] Show current selection from URL params

### Task 4: Implement Conditional Filter Visibility
**File:** `src/app/(app)/team/page.tsx`
- [ ] Check manager's department count
- [ ] Show DepartmentFilter only if count > 1
- [ ] Hide filter for single-department managers

### Task 5: Update Team Queries for Department Filter
**File:** `src/actions/team.ts`
- [ ] Modify `getTeamMembers()` to accept departmentId param
- [ ] Modify `getTeamStats()` to filter by departmentId
- [ ] Handle "all" case with array of department IDs

### Task 6: Update Member Lists with Department Info
**File:** `src/app/(app)/team/components/LoggedMembersList.tsx`
- [ ] Add department name/badge to each member when showing all
- [ ] Group members by department optionally
- [ ] Style department indicator subtly

### Task 7: Create URL Param Handler Hook
**File:** `src/hooks/use-department-filter.ts`
- [ ] Read `dept` param from URL
- [ ] Provide setter function that updates URL
- [ ] Handle "all" vs specific department ID

### Task 8: Update Stats Aggregation for Multi-Department
**File:** `src/app/(app)/team/components/TeamStatsCard.tsx`
- [ ] Show aggregated stats when "ทั้งหมด" selected
- [ ] Show department-specific stats when filtered
- [ ] Optionally show per-department breakdown

### Task 9: Handle Department Label in Lists
**File:** `src/app/(app)/team/components/NotLoggedMembersList.tsx`
- [ ] Add department indicator when showing all departments
- [ ] Keep UI clean and not cluttered

### Task 10: Add Loading State for Department Switch
- [ ] Show loading indicator when switching departments
- [ ] Disable filter during loading
- [ ] Smooth transition between views

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
  { value: 'all', label: 'ทั้งหมด' },
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
import { getManagerDepartments, getTeamMembers } from '@/actions/team';
import { DepartmentFilter } from './components/DepartmentFilter';
import { useDepartmentFilter } from '@/hooks/use-department-filter';
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

- [ ] Multi-department managers see department filter
- [ ] Single-department managers don't see filter
- [ ] "ทั้งหมด" shows aggregated view from all departments
- [ ] Selecting department filters members and stats
- [ ] URL reflects selected department
- [ ] Page refresh preserves filter selection
- [ ] Department names display correctly
- [ ] Loading states during filter switch
- [ ] No TypeScript errors
- [ ] All imports use @/ aliases
- [ ] Server Actions return ActionResult<T>
