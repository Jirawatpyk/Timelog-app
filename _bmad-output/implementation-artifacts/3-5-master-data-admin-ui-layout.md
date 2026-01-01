# Story 3.5: Master Data Admin UI Layout

Status: done

## Story

As an **admin**,
I want **a consistent admin interface for managing master data with sorting and filtering**,
So that **I can efficiently manage all configuration data**.

## Acceptance Criteria

1. **AC1: Tab Navigation**
   - Given I am logged in as admin or super_admin
   - When I navigate to /admin/master-data
   - Then I see tabs for Services, Clients, Tasks
   - And clicking a tab shows the corresponding list

2. **AC2: DataTable Layout**
   - Given I am viewing any master data list
   - When the list loads
   - Then I see a table with columns: Name, Status, Actions
   - And each row displays the item data clearly

3. **AC3: Sorting**
   - Given I am viewing a master data list
   - When I click a column header
   - Then the list sorts by that column
   - And clicking again toggles ascending/descending

4. **AC4: Search/Filter**
   - Given I am viewing a master data list
   - When I type in the search input
   - Then the list filters to show only matching items
   - And the filter is case-insensitive

5. **AC5: Status Filter**
   - Given I am viewing a master data list
   - When I select a status filter (All/Active/Inactive)
   - Then the list shows only items matching that status

6. **AC6: Responsive Mobile Layout**
   - Given I am on a mobile viewport
   - When viewing the master data admin
   - Then the layout adapts responsively
   - And all CRUD operations remain accessible
   - And touch targets are at least 44x44px

7. **AC7: Empty State**
   - Given there are no items in a category
   - When I view that list
   - Then I see a friendly empty state message
   - And a button to add the first item

## Tasks / Subtasks

- [x] **Task 1: Create Reusable DataTable Component** (AC: 2, 3)
  - [x] 1.1 Create `components/admin/DataTable.tsx`
  - [x] 1.2 Implement column header click for sorting
  - [x] 1.3 Add sort direction indicators (arrows)
  - [x] 1.4 Support generic row type via TypeScript generics

- [x] **Task 2: Add Search Input** (AC: 4)
  - [x] 2.1 Create `components/admin/SearchInput.tsx`
  - [x] 2.2 Implement debounced search (300ms)
  - [x] 2.3 Add clear button when search has value
  - [x] 2.4 Integrate with list components

- [x] **Task 3: Add Status Filter** (AC: 5)
  - [x] 3.1 Create status filter dropdown/toggle
  - [x] 3.2 Options: All, Active Only, Inactive Only
  - [ ] 3.3 Persist filter state in URL params (optional - not implemented)

- [x] **Task 4: Refactor List Components** (AC: 2, 3, 4, 5)
  - [x] 4.1 Update ServicesList to use DataTable
  - [x] 4.2 Update ClientsList to use DataTable
  - [x] 4.3 Update TasksList to use DataTable
  - [x] 4.4 Add local state for sorting and filtering

- [x] **Task 5: Mobile Responsive Design** (AC: 6)
  - [x] 5.1 Add responsive breakpoints to DataTable
  - [x] 5.2 Stack actions vertically on mobile
  - [x] 5.3 Ensure touch targets meet 44x44px minimum
  - [x] 5.4 Test on mobile viewport sizes

- [x] **Task 6: Empty State Component** (AC: 7)
  - [x] 6.1 Create `components/admin/EmptyState.tsx`
  - [x] 6.2 Add icon, message, and action button
  - [x] 6.3 Integrate with all list components

- [x] **Task 7: Enhance Tab Navigation** (AC: 1)
  - [x] 7.1 Add URL sync for active tab
  - [x] 7.2 Preserve tab state on navigation
  - [x] 7.3 Add keyboard navigation support

## Dev Notes

### DataTable Component

```typescript
// src/components/admin/DataTable.tsx
'use client';

import { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Column<T> {
  key: keyof T | string;
  header: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyField: keyof T;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
}

type SortDirection = 'asc' | 'desc' | null;

export function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  keyField,
  emptyMessage = 'No items found',
  onRowClick,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      // Cycle: asc -> desc -> null
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortDirection(null);
        setSortKey(null);
      }
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const sortedData = useMemo(() => {
    if (!sortKey || !sortDirection) return data;

    return [...data].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];

      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      const comparison = aVal < bVal ? -1 : 1;
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [data, sortKey, sortDirection]);

  const getSortIcon = (key: string) => {
    if (sortKey !== key) return <ArrowUpDown className="h-4 w-4 ml-1" />;
    if (sortDirection === 'asc') return <ArrowUp className="h-4 w-4 ml-1" />;
    if (sortDirection === 'desc') return <ArrowDown className="h-4 w-4 ml-1" />;
    return <ArrowUpDown className="h-4 w-4 ml-1" />;
  };

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead
                key={String(column.key)}
                className={cn(column.className)}
              >
                {column.sortable ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="-ml-3 h-8"
                    onClick={() => handleSort(String(column.key))}
                  >
                    {column.header}
                    {getSortIcon(String(column.key))}
                  </Button>
                ) : (
                  column.header
                )}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.map((item) => (
            <TableRow
              key={String(item[keyField])}
              onClick={() => onRowClick?.(item)}
              className={cn(onRowClick && 'cursor-pointer hover:bg-muted/50')}
            >
              {columns.map((column) => (
                <TableCell
                  key={String(column.key)}
                  className={cn(column.className)}
                >
                  {column.render
                    ? column.render(item)
                    : String(item[column.key as keyof T] ?? '')}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
```

### Search Input Component

```typescript
// src/components/admin/SearchInput.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';
import { useDebouncedCallback } from 'use-debounce';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'Search...',
  debounceMs = 300,
}: SearchInputProps) {
  const [localValue, setLocalValue] = useState(value);

  const debouncedOnChange = useDebouncedCallback(onChange, debounceMs);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    debouncedOnChange(newValue);
  };

  const handleClear = () => {
    setLocalValue('');
    onChange('');
  };

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        value={localValue}
        onChange={handleChange}
        placeholder={placeholder}
        className="pl-9 pr-9"
      />
      {localValue && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
          onClick={handleClear}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Clear search</span>
        </Button>
      )}
    </div>
  );
}
```

### Status Filter Component

```typescript
// src/components/admin/StatusFilter.tsx
'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type StatusFilterValue = 'all' | 'active' | 'inactive';

interface StatusFilterProps {
  value: StatusFilterValue;
  onChange: (value: StatusFilterValue) => void;
}

export function StatusFilter({ value, onChange }: StatusFilterProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[140px]">
        <SelectValue placeholder="Status" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All</SelectItem>
        <SelectItem value="active">Active</SelectItem>
        <SelectItem value="inactive">Inactive</SelectItem>
      </SelectContent>
    </Select>
  );
}
```

### Empty State Component

```typescript
// src/components/admin/EmptyState.tsx
import { Button } from '@/components/ui/button';
import { Plus, FileQuestion } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="rounded-full bg-muted p-4 mb-4">
        {icon || <FileQuestion className="h-8 w-8 text-muted-foreground" />}
      </div>
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      {description && (
        <p className="text-muted-foreground mb-4 max-w-sm">{description}</p>
      )}
      {actionLabel && onAction && (
        <Button onClick={onAction}>
          <Plus className="h-4 w-4 mr-2" />
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
```

### Refactored Services List with DataTable

```typescript
// src/app/(app)/admin/master-data/components/ServicesList.tsx
'use client';

import { useState, useMemo } from 'react';
import { DataTable } from '@/components/admin/DataTable';
import { SearchInput } from '@/components/admin/SearchInput';
import { StatusFilter } from '@/components/admin/StatusFilter';
import { EmptyState } from '@/components/admin/EmptyState';
import { AddServiceDialog } from '@/components/admin/AddServiceDialog';
import { EditServiceDialog } from '@/components/admin/EditServiceDialog';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toggleServiceActive } from '@/actions/master-data';
import type { Service } from '@/types/domain';
import { toast } from 'sonner';

interface ServicesListClientProps {
  initialServices: Service[];
}

export function ServicesListClient({ initialServices }: ServicesListClientProps) {
  const [services, setServices] = useState(initialServices);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      // Search filter
      const matchesSearch = service.name
        .toLowerCase()
        .includes(search.toLowerCase());

      // Status filter
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && service.active) ||
        (statusFilter === 'inactive' && !service.active);

      return matchesSearch && matchesStatus;
    });
  }, [services, search, statusFilter]);

  const handleToggle = async (service: Service) => {
    // Optimistic update
    setServices((prev) =>
      prev.map((s) =>
        s.id === service.id ? { ...s, active: !s.active } : s
      )
    );

    const result = await toggleServiceActive(service.id, !service.active);

    if (!result.success) {
      // Revert on error
      setServices((prev) =>
        prev.map((s) =>
          s.id === service.id ? { ...s, active: service.active } : s
        )
      );
      toast.error(result.error);
    } else {
      toast.success(service.active ? 'Service deactivated' : 'Service activated');
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      render: (service: Service) => (
        <span className={!service.active ? 'line-through opacity-50' : ''}>
          {service.name}
        </span>
      ),
    },
    {
      key: 'active',
      header: 'Status',
      sortable: true,
      render: (service: Service) => (
        <Badge variant={service.active ? 'default' : 'secondary'}>
          {service.active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (service: Service) => (
        <div className="flex items-center justify-end gap-2">
          <EditServiceDialog service={service} />
          <Switch
            checked={service.active}
            onCheckedChange={() => handleToggle(service)}
            aria-label={`Toggle ${service.name}`}
          />
        </div>
      ),
    },
  ];

  if (services.length === 0) {
    return (
      <EmptyState
        title="No services yet"
        description="Add your first service to get started with time tracking."
        actionLabel="Add Service"
        onAction={() => setAddDialogOpen(true)}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex flex-col sm:flex-row gap-2 flex-1">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search services..."
          />
          <StatusFilter value={statusFilter} onChange={setStatusFilter} />
        </div>
        <AddServiceDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />
      </div>

      {/* Table */}
      <DataTable
        data={filteredServices}
        columns={columns}
        keyField="id"
        emptyMessage="No services match your filters"
      />
    </div>
  );
}

// Server Component wrapper
import { createClient } from '@/lib/supabase/server';

export async function ServicesList() {
  const supabase = await createClient();

  const { data: services } = await supabase
    .from('services')
    .select('*')
    .order('name');

  return <ServicesListClient initialServices={services ?? []} />;
}
```

### Master Data Page with URL-synced Tabs

```typescript
// src/app/(app)/admin/master-data/page.tsx
import { Suspense } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ServicesList } from './components/ServicesList';
import { ClientsList } from './components/ClientsList';
import { TasksList } from './components/TasksList';
import { Skeleton } from '@/components/ui/skeleton';

interface MasterDataPageProps {
  searchParams: { tab?: string };
}

export default function MasterDataPage({ searchParams }: MasterDataPageProps) {
  const activeTab = searchParams.tab || 'services';

  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Master Data Management</h1>

      <Tabs defaultValue={activeTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="services" asChild>
            <a href="?tab=services">Services</a>
          </TabsTrigger>
          <TabsTrigger value="clients" asChild>
            <a href="?tab=clients">Clients</a>
          </TabsTrigger>
          <TabsTrigger value="tasks" asChild>
            <a href="?tab=tasks">Tasks</a>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="services">
          <Suspense fallback={<TableSkeleton />}>
            <ServicesList />
          </Suspense>
        </TabsContent>

        <TabsContent value="clients">
          <Suspense fallback={<TableSkeleton />}>
            <ClientsList />
          </Suspense>
        </TabsContent>

        <TabsContent value="tasks">
          <Suspense fallback={<TableSkeleton />}>
            <TasksList />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-24 ml-auto" />
      </div>
      <div className="border rounded-md">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-4 p-4 border-b last:border-b-0">
            <Skeleton className="h-5 flex-1" />
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-8 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Mobile Responsive Styles

```typescript
// src/components/admin/DataTable.tsx additions

// Add responsive column hiding
interface Column<T> {
  key: keyof T | string;
  header: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
  className?: string;
  hideOnMobile?: boolean;  // NEW
}

// In the render:
<TableHead
  key={String(column.key)}
  className={cn(
    column.className,
    column.hideOnMobile && 'hidden sm:table-cell'
  )}
>
```

### Dependencies

Add `use-debounce` for debounced search:
```bash
npm install use-debounce
```

### Project Structure

```
src/
├── app/
│   └── (app)/
│       └── admin/
│           └── master-data/
│               ├── page.tsx              # Updated with URL params
│               └── components/
│                   ├── ServicesList.tsx  # Refactored with DataTable
│                   ├── ClientsList.tsx   # Refactored with DataTable
│                   └── TasksList.tsx     # Refactored with DataTable
├── components/
│   ├── admin/
│   │   ├── DataTable.tsx                 # NEW - Reusable table
│   │   ├── SearchInput.tsx               # NEW - Debounced search
│   │   ├── StatusFilter.tsx              # NEW - Status filter
│   │   ├── EmptyState.tsx                # NEW - Empty state
│   │   ├── AddServiceDialog.tsx          # Existing
│   │   ├── EditServiceDialog.tsx         # Existing
│   │   ├── AddClientDialog.tsx           # Existing
│   │   ├── EditClientDialog.tsx          # Existing
│   │   ├── AddTaskDialog.tsx             # Existing
│   │   └── EditTaskDialog.tsx            # Existing
│   └── ui/
│       ├── table.tsx                     # shadcn table (add if missing)
│       ├── badge.tsx                     # shadcn badge (add if missing)
│       └── skeleton.tsx                  # shadcn skeleton (add if missing)
```

### Required shadcn Components

Ensure these are installed:
```bash
npx shadcn@latest add table badge skeleton
```

### Accessibility Considerations

- All sortable columns are keyboard accessible
- Screen reader announces sort direction
- Search input has proper labeling
- Status filter is keyboard navigable
- Touch targets meet 44x44px minimum on mobile

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#Admin UI]
- [Source: _bmad-output/planning-artifacts/epics.md#Story 3.5]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Admin Pages]
- [Source: _bmad-output/implementation-artifacts/3-1-service-type-management.md]
- [Source: _bmad-output/implementation-artifacts/3-2-client-management.md]
- [Source: _bmad-output/implementation-artifacts/3-3-task-management.md]

## Definition of Done

- [x] Tab navigation works with URL sync
- [x] DataTable component created and reusable
- [x] Sorting works on Name and Status columns
- [x] Search filters items case-insensitively
- [x] Status filter shows All/Active/Inactive
- [x] Empty state displays when no items
- [x] Mobile layout is responsive and usable
- [x] All touch targets are at least 44x44px
- [x] Keyboard navigation works for all controls
- [x] Loading skeleton displays during data fetch
- [x] All three lists (Services, Clients, Tasks) use DataTable

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Completion Notes List

1. **DataTable Component**: Created reusable generic DataTable with TypeScript generics supporting any data type. Features column sorting (asc/desc/reset), custom renderers, hideOnMobile support, and clickable rows.

2. **SearchInput Component**: Implemented debounced search (300ms default) using `use-debounce` library. Includes clear button and search icon.

3. **StatusFilter Component**: Created dropdown filter with All/Active/Inactive options using shadcn Select component.

4. **EmptyState Component**: Created flexible empty state with customizable icon, title, description, and action button.

5. **List Components Refactored**:
   - Split into Server Components (ServicesList, ClientsList, TasksList) for data fetching
   - Client Components (ServicesListClient, ClientsListClient, TasksListClient) for interactivity
   - Added optimistic updates for toggle operations
   - Integrated all admin components (DataTable, SearchInput, StatusFilter, EmptyState)

6. **Mobile Responsive**: Added `hideOnMobile` column property, responsive toolbar layout (stacks on mobile), min-h-11 for touch targets.

7. **Tab Navigation**: URL-synced tabs using Next.js searchParams, Link-based navigation with scroll={false}, Suspense with skeleton fallback.

8. **Test Setup**: Added Radix UI mocks for jsdom compatibility (hasPointerCapture, scrollIntoView, ResizeObserver).

9. **Test Results**: All 526 tests passing across 44 test files.

### File List

**New Files:**
- `src/components/admin/DataTable.tsx` - Reusable sortable data table
- `src/components/admin/DataTable.test.tsx` - 16 tests
- `src/components/admin/SearchInput.tsx` - Debounced search input
- `src/components/admin/SearchInput.test.tsx` - 14 tests
- `src/components/admin/StatusFilter.tsx` - Status dropdown filter
- `src/components/admin/StatusFilter.test.tsx` - 11 tests
- `src/components/admin/EmptyState.tsx` - Empty state display
- `src/components/admin/EmptyState.test.tsx` - 14 tests
- `src/app/(app)/admin/master-data/components/ServicesListClient.tsx` - Client component
- `src/app/(app)/admin/master-data/components/ClientsListClient.tsx` - Client component
- `src/app/(app)/admin/master-data/components/TasksListClient.tsx` - Client component
- `src/app/(app)/admin/master-data/components/TasksList.test.tsx` - 7 tests
- `src/components/ui/skeleton.tsx` - shadcn skeleton component
- `src/components/ui/table.tsx` - shadcn table component

**Modified Files:**
- `src/app/(app)/admin/master-data/page.tsx` - URL-synced tabs, Suspense
- `src/app/(app)/admin/master-data/page.test.tsx` - Updated for searchParams
- `src/app/(app)/admin/master-data/components/ServicesList.tsx` - Server wrapper
- `src/app/(app)/admin/master-data/components/ServicesList.test.tsx` - Updated mocks
- `src/app/(app)/admin/master-data/components/ClientsList.tsx` - Server wrapper
- `src/app/(app)/admin/master-data/components/ClientsList.test.tsx` - Updated mocks
- `src/app/(app)/admin/master-data/components/TasksList.tsx` - Server wrapper
- `src/components/admin/AddServiceDialog.tsx` - Added onServiceCreated callback
- `src/components/admin/EditServiceDialog.tsx` - Added onServiceUpdated callback
- `src/components/admin/AddClientDialog.tsx` - Added onClientCreated callback
- `src/components/admin/EditClientDialog.tsx` - Added onClientUpdated callback
- `src/components/admin/AddTaskDialog.tsx` - Added onTaskCreated callback
- `src/components/admin/EditTaskDialog.tsx` - Added onTaskUpdated callback
- `test/setup.ts` - Added Radix UI mocks for jsdom
- `package.json` - Added use-debounce dependency
