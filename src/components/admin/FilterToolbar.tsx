/**
 * FilterToolbar Component
 * Responsive filter toolbar with desktop inline filters and mobile sheet
 * Enterprise Filter Pattern - Part 3
 */

'use client';

import { ReactNode, useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SearchInput } from './SearchInput';
import { FilterSheet } from './FilterSheet';
import { FilterChips } from './FilterChip';
import { cn } from '@/lib/utils';

export interface FilterConfig {
  key: string;
  label: string;
  value: string;
  displayValue: string;
}

interface FilterToolbarProps {
  // Search
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;

  // Filters
  filters: FilterConfig[];
  onFilterRemove: (key: string) => void;
  onFiltersClear: () => void;

  // Desktop filter controls (rendered inline on desktop)
  desktopFilters: ReactNode;

  // Mobile filter controls (rendered in sheet)
  mobileFilters: ReactNode;

  // Add button (use addButtonSlot OR addButton, not both)
  addButton?: {
    label: string;
    onClick: () => void;
  };

  // Add button as ReactNode (e.g., Dialog with trigger)
  addButtonSlot?: ReactNode;

  className?: string;
}

export function FilterToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search...',
  filters,
  onFilterRemove,
  onFiltersClear,
  desktopFilters,
  mobileFilters,
  addButton,
  addButtonSlot,
  className,
}: FilterToolbarProps) {
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const activeFilterCount = filters.filter((f) => f.value && f.value !== 'all').length;

  return (
    <div className={cn('space-y-3', className)}>
      {/* Main toolbar row */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-center sm:justify-between">
        {/* Search + Mobile filter button + Add button (mobile) */}
        <div className="flex items-center gap-2">
          <SearchInput
            value={searchValue}
            onChange={onSearchChange}
            placeholder={searchPlaceholder}
            className="flex-1 sm:w-64 sm:flex-none"
          />

          {/* Mobile: Filter button */}
          <FilterSheet
            title="Filters"
            open={filterSheetOpen}
            onOpenChange={setFilterSheetOpen}
            onApply={() => {}}
            onClear={onFiltersClear}
            activeFilterCount={activeFilterCount}
          >
            {mobileFilters}
          </FilterSheet>

          {/* Mobile: Add button (icon only) - only when using addButton prop */}
          {addButton && (
            <Button
              onClick={addButton.onClick}
              size="icon"
              className="sm:hidden"
              aria-label={addButton.label}
            >
              <Plus className="h-4 w-4" />
            </Button>
          )}

          {/* Mobile: Add button slot (custom component like Dialog) */}
          {addButtonSlot && (
            <div className="sm:hidden">{addButtonSlot}</div>
          )}
        </div>

        {/* Desktop: Filters + Add button */}
        <div className="hidden sm:flex sm:items-center sm:gap-2">
          {desktopFilters}
          {addButton && (
            <Button onClick={addButton.onClick}>
              <Plus className="h-4 w-4 mr-1" />
              {addButton.label}
            </Button>
          )}
          {addButtonSlot}
        </div>
      </div>

      {/* Filter chips (shown on both mobile and desktop when filters active) */}
      <FilterChips
        filters={filters}
        onRemove={onFilterRemove}
        onClearAll={activeFilterCount > 1 ? onFiltersClear : undefined}
      />
    </div>
  );
}

// Re-export for convenience
export { FilterField } from './FilterSheet';
