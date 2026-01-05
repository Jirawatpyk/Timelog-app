'use client';

import { useState } from 'react';
import { Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUserFilters } from '@/hooks/use-user-filters';
import { UserFilterSheet } from './UserFilterSheet';
import { UserSearchInput } from './UserSearchInput';
import { ActiveFilters } from './ActiveFilters';
import type { DepartmentOption } from '@/types/domain';

interface UserFiltersClientProps {
  /** Available departments for filter dropdown */
  departments: DepartmentOption[];
}

/**
 * Client-side filter controls wrapper
 * Story 7.7: Filter Users
 *
 * Combines:
 * - Filter button that opens UserFilterSheet
 * - UserSearchInput for text search
 * - ActiveFilters chips below header
 */
export function UserFiltersClient({ departments }: UserFiltersClientProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const { filters, setFilters, setFilter, clearFilters, hasActiveFilters } = useUserFilters();

  const handleRemoveFilter = (key: string) => {
    setFilter(key, null);
  };

  return (
    <>
      {/* Filter controls in header */}
      <div className="flex items-center gap-2">
        <div className="w-64">
          <UserSearchInput />
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setSheetOpen(true)}
          aria-label="Open filters"
          className={hasActiveFilters ? 'border-primary' : ''}
        >
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {/* Active filters chips */}
      <div className="mt-2">
        <ActiveFilters
          filters={filters}
          departments={departments}
          onRemove={handleRemoveFilter}
          onClearAll={clearFilters}
        />
      </div>

      {/* Filter sheet */}
      <UserFilterSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        departments={departments}
        currentFilters={filters}
        onApply={setFilters}
      />
    </>
  );
}
