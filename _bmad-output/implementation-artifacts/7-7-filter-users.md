# Story 7.7: Filter Users

## Status: ready-for-dev

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
- **Given** I select Role = "manager"
- **When** Filter is applied
- **Then** Only managers are shown
- **And** Can combine with department filter

### AC 4: Filter by Status
- **Given** I select Status = "Inactive"
- **When** Filter is applied
- **Then** Only deactivated users are shown

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

## Tasks

### Task 1: Create User Filter Types
**File:** `src/types/domain.ts`
- [ ] Add `UserFilters` interface with dept, role, status, search fields
- [ ] Add `FilterOption` type for dropdown options

### Task 2: Create Get Users with Filters Action
**File:** `src/actions/user.ts`
- [ ] Modify `getUsers()` to accept filters parameter
- [ ] Build dynamic query based on active filters
- [ ] Apply search across name and email (ILIKE)
- [ ] Return `ActionResult<UserListResponse>`

### Task 3: Create Filter Sheet Component
**File:** `src/app/(app)/admin/users/components/UserFilterSheet.tsx`
- [ ] Use Sheet component from shadcn
- [ ] Department select dropdown
- [ ] Role select dropdown
- [ ] Status select (Active/Inactive/All)
- [ ] Apply and Clear buttons

### Task 4: Create Search Input Component
**File:** `src/app/(app)/admin/users/components/UserSearchInput.tsx`
- [ ] Input with search icon
- [ ] Debounced onChange (300ms)
- [ ] Clear button when has value
- [ ] Update URL with `?q=xxx`

### Task 5: Create Filter Chips Display
**File:** `src/app/(app)/admin/users/components/ActiveFilters.tsx`
- [ ] Display chip for each active filter
- [ ] Show filter type and value
- [ ] X button to remove individual filter
- [ ] "ล้างทั้งหมด" button when multiple filters

### Task 6: Create useUserFilters Hook
**File:** `src/hooks/use-user-filters.ts`
- [ ] Read filters from URL search params
- [ ] Provide setters that update URL
- [ ] Handle filter clearing
- [ ] Return current filter state

### Task 7: Integrate Filters into Users Page
**File:** `src/app/(app)/admin/users/page.tsx`
- [ ] Read searchParams for filters
- [ ] Pass to getUsers action
- [ ] Display ActiveFilters component
- [ ] Show UserSearchInput and filter button

### Task 8: Create Department Filter Options
**File:** `src/app/(app)/admin/users/components/UserFilterSheet.tsx`
- [ ] Fetch all departments for dropdown
- [ ] Include "ทั้งหมด" (All) option
- [ ] Show department name as label

### Task 9: Create Role and Status Options
**File:** `src/app/(app)/admin/users/components/UserFilterSheet.tsx`
- [ ] Role options: ทั้งหมด, พนักงาน, หัวหน้า, แอดมิน, ซุปเปอร์แอดมิน
- [ ] Status options: ทั้งหมด, ใช้งาน, ปิดใช้งาน
- [ ] Use consistent styling

### Task 10: Add Empty State for No Results
**File:** `src/app/(app)/admin/users/page.tsx`
- [ ] Show when filters return no users
- [ ] "ไม่พบผู้ใช้ที่ตรงกับเงื่อนไข"
- [ ] Option to clear filters

## Dev Notes

### Architecture Pattern
- Server Component reads filters from searchParams
- Filters applied in Server Action query
- URL is source of truth for filter state

### URL Param Pattern
```
/admin/users?dept=xxx&role=manager&status=active&q=john
```

### Server Action with Filters
```typescript
// src/actions/user.ts
export async function getUsers(
  params: PaginationParams,
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
    query = query.eq('is_active', true);
  } else if (filters?.status === 'inactive') {
    query = query.eq('is_active', false);
  }

  if (filters?.search) {
    query = query.or(`display_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
  }

  // Apply pagination
  const { from, to } = getPaginationRange(params.page, params.limit);
  query = query.range(from, to).order('display_name');

  const { data, count, error } = await query;

  if (error) {
    return { success: false, error: 'ไม่สามารถโหลดรายชื่อผู้ใช้ได้' };
  }

  return {
    success: true,
    data: {
      users: data || [],
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

export function useUserFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const filters = useMemo(() => ({
    departmentId: searchParams.get('dept') || undefined,
    role: searchParams.get('role') || undefined,
    status: searchParams.get('status') || undefined,
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

### Filter Chips Pattern
```typescript
// ActiveFilters.tsx
function ActiveFilters({ filters, onRemove, onClearAll }: ActiveFiltersProps) {
  const chips = [];

  if (filters.departmentId) {
    chips.push({
      key: 'dept',
      label: `แผนก: ${getDeptName(filters.departmentId)}`,
    });
  }

  if (filters.role) {
    chips.push({
      key: 'role',
      label: `Role: ${getRoleLabel(filters.role)}`,
    });
  }

  if (filters.status) {
    chips.push({
      key: 'status',
      label: filters.status === 'active' ? 'ใช้งาน' : 'ปิดใช้งาน',
    });
  }

  if (filters.search) {
    chips.push({
      key: 'q',
      label: `ค้นหา: "${filters.search}"`,
    });
  }

  if (chips.length === 0) return null;

  return (
    <div className="flex gap-2 flex-wrap items-center">
      {chips.map(chip => (
        <Badge key={chip.key} variant="secondary" className="gap-1">
          {chip.label}
          <button onClick={() => onRemove(chip.key)}>
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
      {chips.length > 1 && (
        <Button variant="ghost" size="sm" onClick={onClearAll}>
          ล้างทั้งหมด
        </Button>
      )}
    </div>
  );
}
```

### Debounced Search Pattern
```typescript
// UserSearchInput.tsx
function UserSearchInput() {
  const [value, setValue] = useState('');
  const { setFilter } = useUserFilters();

  const debouncedSearch = useDebouncedCallback((query: string) => {
    setFilter('q', query || null);
  }, 300);

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="ค้นหาชื่อหรือ Email..."
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          debouncedSearch(e.target.value);
        }}
        className="pl-9"
      />
      {value && (
        <button
          onClick={() => {
            setValue('');
            setFilter('q', null);
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
```

### Component Dependencies
- Builds on Users page from Story 7.1
- Uses Sheet from shadcn/ui
- Uses Badge from shadcn/ui
- Uses useDebounce hook or useDebouncedCallback

### Import Convention
```typescript
import { useUserFilters } from '@/hooks/use-user-filters';
import { UserFilterSheet } from './components/UserFilterSheet';
import { UserSearchInput } from './components/UserSearchInput';
import { ActiveFilters } from './components/ActiveFilters';
```

### Accessibility
- Filter button has aria-label
- Sheet has proper heading
- Filter chips are keyboard accessible
- Search input has proper label
- No results state is announced

## Definition of Done

- [ ] Filter button opens filter sheet
- [ ] Can filter by department
- [ ] Can filter by role
- [ ] Can filter by status
- [ ] Search works with debounce
- [ ] Multiple filters combine correctly
- [ ] Filter chips display and can be removed
- [ ] URL reflects active filters
- [ ] Empty state shows when no results
- [ ] Pagination resets on filter change
- [ ] No TypeScript errors
- [ ] All imports use @/ aliases
- [ ] Server Actions return ActionResult<T>
