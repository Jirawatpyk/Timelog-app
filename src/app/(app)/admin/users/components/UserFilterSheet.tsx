'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FilterSheet, FilterField } from '@/components/admin/FilterSheet';
import { ROLE_HIERARCHY, type RoleKey } from '@/lib/roles';
import type { DepartmentOption, UserFilters, UserStatus } from '@/types/domain';

// Placeholder value for "All" option (Radix Select doesn't allow empty string)
const ALL_VALUE = '__all__';

/**
 * Status filter options
 */
const STATUS_OPTIONS: { value: UserStatus | typeof ALL_VALUE; label: string }[] = [
  { value: ALL_VALUE, label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'pending', label: 'Pending' },
];

/**
 * Role filter options from ROLE_HIERARCHY
 */
const ROLE_OPTIONS: { value: RoleKey | typeof ALL_VALUE; label: string }[] = [
  { value: ALL_VALUE, label: 'All' },
  ...Object.entries(ROLE_HIERARCHY).map(([key, { label }]) => ({
    value: key as RoleKey,
    label,
  })),
];

interface UserFilterSheetProps {
  /** Whether the sheet is open */
  open: boolean;
  /** Callback when open state changes */
  onOpenChange: (open: boolean) => void;
  /** Available departments for filter */
  departments: DepartmentOption[];
  /** Current filter values */
  currentFilters: UserFilters;
  /** Callback when filters are applied */
  onApply: (filters: UserFilters) => void;
}

/**
 * Filter sheet for user list
 * Story 7.7: Filter Users (AC 1, 2, 3, 4)
 *
 * Uses shared FilterSheet component from admin/FilterSheet.
 * Provides filter options for:
 * - Department
 * - Role (from ROLE_HIERARCHY)
 * - Status (All, Active, Inactive, Pending)
 */
export function UserFilterSheet({
  open,
  onOpenChange,
  departments,
  currentFilters,
  onApply,
}: UserFilterSheetProps) {
  // Local state for filter values (apply on button click)
  const [localFilters, setLocalFilters] = useState<UserFilters>(currentFilters);

  // Sync local state when sheet opens with current filters
  useEffect(() => {
    if (open) {
      setLocalFilters(currentFilters);
    }
  }, [open, currentFilters]);

  // Count active filters (excluding search which is handled separately)
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (localFilters.departmentId) count++;
    if (localFilters.role) count++;
    if (localFilters.status) count++;
    return count;
  }, [localFilters]);

  const handleApply = () => {
    onApply(localFilters);
  };

  const handleClear = () => {
    setLocalFilters({});
    onApply({});
    onOpenChange(false);
  };

  return (
    <FilterSheet
      title="Filter Users"
      open={open}
      onOpenChange={onOpenChange}
      onApply={handleApply}
      onClear={handleClear}
      activeFilterCount={activeFilterCount}
      side="bottom"
      showTrigger={false}
    >
      {/* Department Select */}
      <FilterField label="Department" htmlFor="filter-department">
        <Select
          value={localFilters.departmentId || ALL_VALUE}
          onValueChange={(v) =>
            setLocalFilters({
              ...localFilters,
              departmentId: v === ALL_VALUE ? undefined : v,
            })
          }
        >
          <SelectTrigger id="filter-department">
            <SelectValue placeholder="All Departments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_VALUE}>All</SelectItem>
            {departments.map((dept) => (
              <SelectItem key={dept.id} value={dept.id}>
                {dept.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterField>

      {/* Role Select */}
      <FilterField label="Role" htmlFor="filter-role">
        <Select
          value={localFilters.role || ALL_VALUE}
          onValueChange={(v) =>
            setLocalFilters({
              ...localFilters,
              role: v === ALL_VALUE ? undefined : (v as RoleKey),
            })
          }
        >
          <SelectTrigger id="filter-role">
            <SelectValue placeholder="All Roles" />
          </SelectTrigger>
          <SelectContent>
            {ROLE_OPTIONS.map((role) => (
              <SelectItem key={role.value} value={role.value}>
                {role.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterField>

      {/* Status Select */}
      <FilterField label="Status" htmlFor="filter-status">
        <Select
          value={localFilters.status || ALL_VALUE}
          onValueChange={(v) =>
            setLocalFilters({
              ...localFilters,
              status: v === ALL_VALUE ? undefined : (v as UserStatus),
            })
          }
        >
          <SelectTrigger id="filter-status">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterField>
    </FilterSheet>
  );
}
