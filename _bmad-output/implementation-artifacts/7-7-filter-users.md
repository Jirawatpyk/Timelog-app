# Story 7.7: Filter Users

## Status: done

## Story

As an **admin**,
I want **to filter the user list**,
So that **I can find specific users quickly**.

## Acceptance Criteria

### AC 1: Filter Options Display
- **Given** I am on the user list page
- **When** I click the filter icon
- **Then** I see filter options: Department, Role, Status

### AC 2: Filter by Department
- **Given** I select Department = "Audio Production"
- **When** Filter is applied
- **Then** Only users from that department are shown
- **And** Filter chip shows active filter
- **And** URL updates with `?dept=xxx`

### AC 3: Filter by Role
- **Given** I select Role = "Manager"
- **When** Filter is applied
- **Then** Only managers are shown
- **And** Can combine with department filter

### AC 4: Filter by Status
- **Given** I select Status filter
- **When** Filter is applied
- **Then** Users are filtered by status
- **And** Status options are: All, Active, Inactive, Pending
- **Note:** Pending = users who haven't confirmed invitation yet

### AC 5: Search by Name or Email
- **Given** I type in search box
- **When** Query matches name or email
- **Then** List is filtered to matching users
- **And** Search is debounced (300ms)

### AC 6: Combined Filters
- **Given** Multiple filters are active
- **When** Viewing the list
- **Then** All filters are applied (AND logic)
- **And** Multiple filter chips are shown
- **And** Can clear individual or all filters

### AC 7: Empty State
- **Given** Filters return no results
- **When** Viewing the list
- **Then** I see: "No users found matching your criteria"
- **And** Option to clear filters

## Tasks

### Task 1: Add UserFilters Type
**File:** `src/types/domain.ts`
- [x] Add `UserFilters` interface with dept, role, status, search fields
- [x] Add `UserStatus` to include 'pending' if not already

### Task 2: Extend getUsers with Filters
**File:** `src/actions/user.ts`
- [x] Add optional `filters?: UserFilters` parameter to `getUsers()`
- [x] Build dynamic query based on active filters
- [x] Apply search across name and email (ILIKE with sanitization)
- [x] Handle status filter including 'pending' state
- [x] Return `ActionResult<UserListResponse>`

### Task 3: Create Filter Components
**Files:** `src/app/(app)/admin/users/components/UserFilterSheet.tsx`, `UserSearchInput.tsx`, `ActiveFilters.tsx`
- [x] UserFilterSheet: Sheet with Department, Role, Status selects
- [x] Department select: fetch all departments, include "All" option
- [x] Role select: import from `@/lib/roles` (Staff, Manager, Admin, Super Admin)
- [x] Status select: All, Active, Inactive, Pending
- [x] Apply and Clear buttons
- [x] UserSearchInput: Input with search icon, debounced (300ms), clear button
- [x] ActiveFilters: Display chips for active filters, X to remove, "Clear All" button

### Task 4: Create useUserFilters Hook
**File:** `src/hooks/use-user-filters.ts`
- [x] Read filters from URL search params
- [x] Provide setters that update URL
- [x] Handle filter clearing
- [x] Reset pagination on filter change
- [x] Return current filter state and hasActiveFilters boolean

### Task 5: Integrate Filters into Users Page
**File:** `src/app/(app)/admin/users/page.tsx`
- [x] Read searchParams for filters
- [x] Pass filters to getUsers action
- [x] Display filter button and UserSearchInput in header
- [x] Display ActiveFilters component below header
- [x] Show empty state when no results with "Clear Filters" button

### Task 6: Unit Tests
**Files:** `use-user-filters.test.ts`, `UserFilterSheet.test.tsx`, `UserSearchInput.test.tsx`, `ActiveFilters.test.tsx`
- [x] Test useUserFilters reads/writes URL params correctly
- [x] Test useUserFilters clears filters
- [x] Test UserFilterSheet renders all options
- [x] Test UserFilterSheet applies filters
- [x] Test UserSearchInput debounces correctly
- [x] Test ActiveFilters displays chips
- [x] Test ActiveFilters removes individual filter
- [x] Test ActiveFilters clears all

### Task 7: E2E Tests
**File:** `test/e2e/admin/filter-users.test.ts`
- [x] Test filter by department shows correct users
- [x] Test filter by role shows correct users
- [x] Test filter by status (active/inactive/pending)
- [x] Test search by name finds user
- [x] Test search by email finds user
- [x] Test combined filters (AND logic)
- [x] Test clear individual filter
- [x] Test clear all filters
- [x] Test empty state displays correctly
- [x] Test URL updates with filter params
- [x] Test pagination resets on filter change

## Dev Notes

### Architecture Pattern
- Server Component reads filters from searchParams
- Filters applied in Server Action query
- URL is source of truth for filter state
- Reuse `ROLE_HIERARCHY` from `@/lib/roles` for role labels

### URL Param Pattern
```
/admin/users?dept=xxx&role=manager&status=active&q=john
```

### UserFilters Type
```typescript
// src/types/domain.ts
export interface UserFilters {
  departmentId?: string;
  role?: UserRole;
  status?: 'active' | 'inactive' | 'pending';
  search?: string;
}
```

### Server Action with Filters
```typescript
// src/actions/user.ts
export async function getUsers(
  params: PaginationParams = { page: 1, limit: DEFAULT_PAGE_SIZE },
  filters?: UserFilters
): Promise<ActionResult<UserListResponse>> {
  const supabase = await createClient();

  let query = supabase
    .from('users')
    .select(`
      id,
      email,
      display_name,
      role,
      is_active,
      confirmed_at,
      department:departments(id, name)
    `, { count: 'exact' });

  // Apply filters
  if (filters?.departmentId) {
    query = query.eq('department_id', filters.departmentId);
  }

  if (filters?.role) {
    query = query.eq('role', filters.role);
  }

  if (filters?.status === 'active') {
    query = query.eq('is_active', true).not('confirmed_at', 'is', null);
  } else if (filters?.status === 'inactive') {
    query = query.eq('is_active', false);
  } else if (filters?.status === 'pending') {
    query = query.eq('is_active', true).is('confirmed_at', null);
  }

  if (filters?.search) {
    // Sanitize search input to prevent SQL injection
    const sanitized = filters.search.replace(/[%_\\]/g, '\\$&');
    query = query.or(`display_name.ilike.%${sanitized}%,email.ilike.%${sanitized}%`);
  }

  // Apply pagination
  const { page, limit } = params;
  const offset = (page - 1) * limit;
  query = query.range(offset, offset + limit - 1).order('display_name');

  const { data, count, error } = await query;

  if (error) {
    return { success: false, error: 'Failed to load users' };
  }

  // Transform data...
  return {
    success: true,
    data: {
      users: transformedUsers,
      totalCount: count || 0,
    },
  };
}
```

### Filter Hook Pattern
```typescript
// src/hooks/use-user-filters.ts
'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import type { UserFilters } from '@/types/domain';

export function useUserFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const filters: UserFilters = useMemo(() => ({
    departmentId: searchParams.get('dept') || undefined,
    role: searchParams.get('role') as UserFilters['role'] || undefined,
    status: searchParams.get('status') as UserFilters['status'] || undefined,
    search: searchParams.get('q') || undefined,
  }), [searchParams]);

  const setFilter = useCallback((key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete('page'); // Reset pagination on filter change
    router.push(`${pathname}?${params.toString()}`);
  }, [searchParams, router, pathname]);

  const clearFilters = useCallback(() => {
    router.push(pathname);
  }, [router, pathname]);

  const hasActiveFilters = Object.values(filters).some(Boolean);

  return { filters, setFilter, clearFilters, hasActiveFilters };
}
```

### Filter Sheet Pattern
```typescript
// UserFilterSheet.tsx
import { ROLE_HIERARCHY, type RoleKey } from '@/lib/roles';

const STATUS_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'pending', label: 'Pending' },
];

// Role options from roles.ts
const ROLE_OPTIONS = [
  { value: '', label: 'All' },
  ...Object.entries(ROLE_HIERARCHY).map(([key, { label }]) => ({
    value: key,
    label,
  })),
];

export function UserFilterSheet({
  open,
  onOpenChange,
  departments,
  currentFilters,
  onApply,
}: UserFilterSheetProps) {
  const [localFilters, setLocalFilters] = useState(currentFilters);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Filter Users</SheetTitle>
        </SheetHeader>
        <div className="space-y-4 py-4">
          {/* Department Select */}
          <div className="space-y-2">
            <Label>Department</Label>
            <Select
              value={localFilters.departmentId || ''}
              onValueChange={(v) => setLocalFilters({ ...localFilters, departmentId: v || undefined })}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Role Select */}
          <div className="space-y-2">
            <Label>Role</Label>
            <Select
              value={localFilters.role || ''}
              onValueChange={(v) => setLocalFilters({ ...localFilters, role: v as RoleKey || undefined })}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                {ROLE_OPTIONS.map((role) => (
                  <SelectItem key={role.value} value={role.value}>{role.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status Select */}
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={localFilters.status || ''}
              onValueChange={(v) => setLocalFilters({ ...localFilters, status: v as UserFilters['status'] || undefined })}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((status) => (
                  <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <SheetFooter>
          <Button variant="outline" onClick={() => {
            setLocalFilters({});
            onApply({});
          }}>
            Clear
          </Button>
          <Button onClick={() => onApply(localFilters)}>Apply</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
```

### Active Filters Pattern
```typescript
// ActiveFilters.tsx
import { ROLE_HIERARCHY } from '@/lib/roles';

interface ActiveFiltersProps {
  filters: UserFilters;
  departments: DepartmentOption[];
  onRemove: (key: string) => void;
  onClearAll: () => void;
}

export function ActiveFilters({ filters, departments, onRemove, onClearAll }: ActiveFiltersProps) {
  const chips: { key: string; label: string }[] = [];

  if (filters.departmentId) {
    const dept = departments.find((d) => d.id === filters.departmentId);
    chips.push({ key: 'dept', label: `Department: ${dept?.name || 'Unknown'}` });
  }

  if (filters.role) {
    chips.push({ key: 'role', label: `Role: ${ROLE_HIERARCHY[filters.role]?.label || filters.role}` });
  }

  if (filters.status) {
    const statusLabels = { active: 'Active', inactive: 'Inactive', pending: 'Pending' };
    chips.push({ key: 'status', label: `Status: ${statusLabels[filters.status]}` });
  }

  if (filters.search) {
    chips.push({ key: 'q', label: `Search: "${filters.search}"` });
  }

  if (chips.length === 0) return null;

  return (
    <div className="flex gap-2 flex-wrap items-center">
      {chips.map((chip) => (
        <Badge key={chip.key} variant="secondary" className="gap-1 pr-1">
          {chip.label}
          <button
            onClick={() => onRemove(chip.key)}
            className="ml-1 rounded-full hover:bg-muted p-0.5"
            aria-label={`Remove ${chip.label} filter`}
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
      {chips.length > 1 && (
        <Button variant="ghost" size="sm" onClick={onClearAll}>
          Clear All
        </Button>
      )}
    </div>
  );
}
```

### Search Input Pattern
```typescript
// UserSearchInput.tsx
import { useDebouncedCallback } from 'use-debounce';

export function UserSearchInput() {
  const { filters, setFilter } = useUserFilters();
  const [value, setValue] = useState(filters.search || '');

  const debouncedSearch = useDebouncedCallback((query: string) => {
    setFilter('q', query || null);
  }, 300);

  // Sync with URL when filters change externally
  useEffect(() => {
    setValue(filters.search || '');
  }, [filters.search]);

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Search by name or email..."
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          debouncedSearch(e.target.value);
        }}
        className="pl-9 pr-9"
        aria-label="Search users"
      />
      {value && (
        <button
          onClick={() => {
            setValue('');
            setFilter('q', null);
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
```

### Empty State Pattern
```typescript
// In users page
{users.length === 0 && hasActiveFilters && (
  <div className="flex flex-col items-center justify-center py-10 text-center">
    <SearchX className="h-12 w-12 text-muted-foreground/50 mb-4" />
    <p className="text-muted-foreground mb-4">No users found matching your criteria</p>
    <Button variant="outline" onClick={clearFilters}>
      Clear Filters
    </Button>
  </div>
)}
```

### Component Dependencies
- Uses Sheet, Select, Badge, Button from shadcn/ui
- Uses `use-debounce` package for search debounce
- Imports role labels from `@/lib/roles`
- Builds on UserTable from Story 7.1

### Import Convention
```typescript
import { useUserFilters } from '@/hooks/use-user-filters';
import { UserFilterSheet } from './components/UserFilterSheet';
import { UserSearchInput } from './components/UserSearchInput';
import { ActiveFilters } from './components/ActiveFilters';
import { ROLE_HIERARCHY } from '@/lib/roles';
```

### Security Note
- Search input is sanitized before use in ILIKE query
- Special characters `%`, `_`, `\` are escaped to prevent SQL pattern injection
- All user input is validated before database query

### Accessibility
- Filter button has aria-label
- Sheet has proper heading
- Filter chips are keyboard accessible with aria-labels
- Search input has aria-label
- Empty state is announced to screen readers
- All interactive elements are focusable

## Definition of Done

- [x] Filter button opens filter sheet
- [x] Can filter by department
- [x] Can filter by role (using labels from roles.ts)
- [x] Can filter by status (Active, Inactive, Pending)
- [x] Search works with debounce (300ms)
- [x] Search input is sanitized
- [x] Multiple filters combine correctly (AND logic)
- [x] Filter chips display and can be removed
- [x] "Clear All" button works
- [x] URL reflects active filters
- [x] Empty state shows when no results
- [x] Pagination resets on filter change
- [x] All text in English (per project-context.md)
- [x] No TypeScript errors
- [x] All imports use @/ aliases
- [x] Server Actions return ActionResult<T>
- [x] Unit tests pass
- [x] E2E tests pass

## Dev Agent Record

### Implementation Plan
1. Added `UserFilters` interface to `src/types/domain.ts`
2. Extended `getUsers()` in `src/actions/user.ts` with optional filters parameter
3. Created `useUserFilters` hook for URL-based filter state management
4. Created filter components: `UserFilterSheet`, `UserSearchInput`, `ActiveFilters`
5. Created `UserFiltersClient` wrapper for client-side filter controls
6. Created `EmptyFilterState` component for no-results state
7. Integrated filters into Users page with parallel data fetching
8. Added comprehensive unit tests (54 tests passing)
9. Added comprehensive E2E tests (21 scenarios)

### Technical Decisions
- Used `__all__` placeholder for "All" option in Radix Select (doesn't allow empty string)
- Filter state managed via URL search params for bookmarkability and refresh persistence
- Search debounced at 300ms using `use-debounce` package
- SQL pattern injection prevented by escaping `%`, `_`, `\` characters in search
- Departments fetched in parallel with users for performance

### Completion Notes
- All 7 tasks completed
- All unit tests passing (54 tests)
- TypeScript compilation clean
- ESLint clean
- All Acceptance Criteria satisfied

## File List

### New Files
- `src/hooks/use-user-filters.ts` - URL-based filter state hook
- `src/hooks/use-user-filters.test.ts` - Unit tests (16 tests)
- `src/app/(app)/admin/users/components/UserFilterSheet.tsx` - Filter sheet component
- `src/app/(app)/admin/users/components/UserFilterSheet.test.tsx` - Unit tests (12 tests)
- `src/app/(app)/admin/users/components/UserSearchInput.tsx` - Search input component
- `src/app/(app)/admin/users/components/UserSearchInput.test.tsx` - Unit tests (10 tests)
- `src/app/(app)/admin/users/components/ActiveFilters.tsx` - Filter chips component
- `src/app/(app)/admin/users/components/ActiveFilters.test.tsx` - Unit tests (16 tests)
- `src/app/(app)/admin/users/components/UserFiltersClient.tsx` - Client wrapper
- `src/app/(app)/admin/users/components/EmptyFilterState.tsx` - Empty state component
- `test/e2e/admin/filter-users.test.ts` - E2E tests (21 scenarios)

### Modified Files
- `src/types/domain.ts` - Added `UserFilters` interface
- `src/actions/user.ts` - Added filters parameter to getUsers()
- `src/app/(app)/admin/users/page.tsx` - Integrated filter components
- `src/components/shared/Pagination.tsx` - Added searchParams prop to preserve filters

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-01-05 | Story 7.7 implementation complete - all tasks done | Dev Agent |
| 2026-01-05 | Code Review: Fixed Pagination losing filter params on page change | Dev Agent |
| 2026-01-05 | Code Review: Added E2E test for pagination preserving filters | Dev Agent |
| 2026-01-05 | Code Review: Fixed File List section (New vs Modified) | Dev Agent |
| 2026-01-05 | Code Review: Refactored UserFilterSheet to use shared FilterSheet component | Dev Agent |
| 2026-01-05 | Code Review: Added side/showTrigger props to shared FilterSheet for flexibility | Dev Agent |
| 2026-01-05 | Code Review: Added htmlFor prop to FilterField for accessibility | Dev Agent |
