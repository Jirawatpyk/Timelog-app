/**
 * Departments List Client Component
 * Story 3.7: Department Management (AC: 1, 5, 6)
 *
 * Client-side wrapper for departments list with:
 * - DataTable with sorting
 * - Search filtering
 * - Status filtering
 * - Empty state
 *
 * Note: Department management is restricted to super_admin only.
 * Deactivating a department does NOT affect existing users in that department.
 */

'use client';

import { useState, useMemo } from 'react';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { FilterToolbar, FilterField, type FilterConfig } from '@/components/admin/FilterToolbar';
import { StatusFilter, type StatusFilterValue } from '@/components/admin/StatusFilter';
import { EmptyState } from '@/components/admin/EmptyState';
import { AddDepartmentDialog } from '@/components/admin/AddDepartmentDialog';
import { EditDepartmentDialog } from '@/components/admin/EditDepartmentDialog';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toggleDepartmentActive } from '@/actions/master-data';
import type { Department } from '@/types/domain';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Building2 } from 'lucide-react';

interface DepartmentsListClientProps {
  initialDepartments: Department[];
}

export function DepartmentsListClient({ initialDepartments }: DepartmentsListClientProps) {
  const [departments, setDepartments] = useState(initialDepartments);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>('all');
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  // Toggle state
  const [pendingId, setPendingId] = useState<string | null>(null);

  const filteredDepartments = useMemo(() => {
    return departments.filter((department) => {
      const matchesSearch = department.name
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && department.active) ||
        (statusFilter === 'inactive' && !department.active);

      return matchesSearch && matchesStatus;
    });
  }, [departments, search, statusFilter]);

  const handleToggle = async (department: Department) => {
    // No confirmation needed for departments - deactivating doesn't affect users
    const newActive = !department.active;

    // Optimistic update
    setDepartments((prev) =>
      prev.map((d) =>
        d.id === department.id ? { ...d, active: newActive } : d
      )
    );
    setPendingId(department.id);

    const result = await toggleDepartmentActive(department.id, newActive);
    setPendingId(null);

    if (!result.success) {
      // Revert on error
      setDepartments((prev) =>
        prev.map((d) =>
          d.id === department.id ? { ...d, active: department.active } : d
        )
      );
      toast.error(result.error);
    } else {
      toast.success(newActive ? 'Department activated' : 'Department deactivated');
    }
  };

  const handleDepartmentUpdated = (updated: Department) => {
    setDepartments((prev) =>
      prev.map((d) => (d.id === updated.id ? updated : d))
    );
  };

  const handleDepartmentCreated = (created: Department) => {
    setDepartments((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
    setAddDialogOpen(false);
  };

  // Get display value for filter chips
  const getStatusDisplayValue = () => {
    if (statusFilter === 'all') return '';
    return statusFilter === 'active' ? 'Active' : 'Inactive';
  };

  // Filter configuration for FilterToolbar
  const filterConfigs: FilterConfig[] = [
    {
      key: 'status',
      label: 'Status',
      value: statusFilter,
      displayValue: getStatusDisplayValue(),
    },
  ];

  const handleFilterRemove = (key: string) => {
    if (key === 'status') {
      setStatusFilter('all');
    }
  };

  const handleFiltersClear = () => {
    setStatusFilter('all');
  };

  // Desktop filter controls
  const desktopFilters = (
    <StatusFilter
      value={statusFilter}
      onChange={setStatusFilter}
      className="w-[140px]"
    />
  );

  // Mobile filter controls (in sheet)
  const mobileFilters = (
    <FilterField label="Status">
      <StatusFilter
        value={statusFilter}
        onChange={setStatusFilter}
        className="w-full"
      />
    </FilterField>
  );

  const columns: Column<Department>[] = [
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      className: 'max-w-[200px] sm:max-w-none',
      render: (department) => (
        <span
          className={cn(
            'block truncate',
            !department.active && 'line-through text-muted-foreground'
          )}
          title={department.name}
        >
          {department.name}
        </span>
      ),
    },
    {
      key: 'active',
      header: 'Status',
      sortable: true,
      hideOnMobile: true,
      render: (department) => (
        <Badge variant={department.active ? 'default' : 'secondary'}>
          {department.active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right w-[120px]',
      render: (department) => (
        <div className="flex items-center justify-end gap-2 min-h-[44px]">
          <EditDepartmentDialog
            department={department}
            onDepartmentUpdated={handleDepartmentUpdated}
          />
          <Switch
            checked={department.active ?? true}
            onCheckedChange={() => handleToggle(department)}
            disabled={pendingId === department.id}
            aria-label={department.active ? 'Deactivate department' : 'Activate department'}
            className="touch-manipulation"
          />
        </div>
      ),
    },
  ];

  // Empty state for no departments at all
  if (departments.length === 0) {
    return (
      <div data-testid="departments-list">
        <EmptyState
          title="No departments yet"
          description="Add your first department to organize your team."
          actionLabel="Add Department"
          onAction={() => setAddDialogOpen(true)}
          icon={<Building2 className="h-8 w-8 text-muted-foreground" />}
        />
        <AddDepartmentDialog
          open={addDialogOpen}
          onOpenChange={setAddDialogOpen}
          onDepartmentCreated={handleDepartmentCreated}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="departments-list">
      <FilterToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search departments..."
        filters={filterConfigs}
        onFilterRemove={handleFilterRemove}
        onFiltersClear={handleFiltersClear}
        desktopFilters={desktopFilters}
        mobileFilters={mobileFilters}
        addButtonSlot={
          <AddDepartmentDialog
            onDepartmentCreated={handleDepartmentCreated}
          />
        }
      />

      {filteredDepartments.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No departments match your filters
        </div>
      ) : (
        <DataTable
          data={filteredDepartments}
          columns={columns}
          keyField="id"
        />
      )}
    </div>
  );
}
