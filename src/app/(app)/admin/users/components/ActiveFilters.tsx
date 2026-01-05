'use client';

import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ROLE_HIERARCHY } from '@/lib/roles';
import type { DepartmentOption, UserFilters } from '@/types/domain';

/**
 * Status labels for display
 */
const STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  inactive: 'Inactive',
  pending: 'Pending',
};

interface ActiveFiltersProps {
  /** Current filter values */
  filters: UserFilters;
  /** Available departments for name lookup */
  departments: DepartmentOption[];
  /** Callback to remove a single filter */
  onRemove: (key: string) => void;
  /** Callback to clear all filters */
  onClearAll: () => void;
}

/**
 * Display active filters as chips with remove buttons
 * Story 7.7: Filter Users (AC 6)
 *
 * Features:
 * - Shows chip for each active filter
 * - X button to remove individual filter
 * - "Clear All" button when multiple filters active
 */
export function ActiveFilters({ filters, departments, onRemove, onClearAll }: ActiveFiltersProps) {
  // Build list of active filter chips
  const chips: { key: string; label: string }[] = [];

  if (filters.departmentId) {
    const dept = departments.find((d) => d.id === filters.departmentId);
    chips.push({ key: 'dept', label: `Department: ${dept?.name || 'Unknown'}` });
  }

  if (filters.role) {
    const roleLabel = ROLE_HIERARCHY[filters.role]?.label || filters.role;
    chips.push({ key: 'role', label: `Role: ${roleLabel}` });
  }

  if (filters.status) {
    chips.push({ key: 'status', label: `Status: ${STATUS_LABELS[filters.status]}` });
  }

  if (filters.search) {
    chips.push({ key: 'q', label: `Search: "${filters.search}"` });
  }

  // Don't render if no active filters
  if (chips.length === 0) {
    return null;
  }

  return (
    <div className="flex gap-2 flex-wrap items-center" role="region" aria-label="Active filters">
      {chips.map((chip) => (
        <Badge key={chip.key} variant="secondary" className="gap-1 pr-1">
          {chip.label}
          <button
            type="button"
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
