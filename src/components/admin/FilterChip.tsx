/**
 * FilterChip Component
 * Displays active filter as a dismissible chip/badge
 * Enterprise Filter Pattern - Part 1
 */

'use client';

import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FilterChipProps {
  label: string;
  value: string;
  onRemove: () => void;
  className?: string;
}

export function FilterChip({ label, value, onRemove, className }: FilterChipProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-2.5 py-1 text-xs',
        className
      )}
    >
      <span className="text-muted-foreground">{label}:</span>
      <span className="font-medium truncate max-w-[120px]" title={value}>
        {value}
      </span>
      <button
        type="button"
        onClick={onRemove}
        className="ml-0.5 rounded-full p-0.5 hover:bg-muted-foreground/20 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
        aria-label={`Remove ${label} filter`}
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}

interface FilterChipsProps {
  filters: Array<{
    key: string;
    label: string;
    value: string;
    displayValue: string;
  }>;
  onRemove: (key: string) => void;
  onClearAll?: () => void;
  className?: string;
}

export function FilterChips({ filters, onRemove, onClearAll, className }: FilterChipsProps) {
  const activeFilters = filters.filter((f) => f.value && f.value !== 'all');

  if (activeFilters.length === 0) return null;

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {activeFilters.map((filter) => (
        <FilterChip
          key={filter.key}
          label={filter.label}
          value={filter.displayValue}
          onRemove={() => onRemove(filter.key)}
        />
      ))}
      {onClearAll && activeFilters.length > 1 && (
        <button
          type="button"
          onClick={onClearAll}
          className="text-xs text-muted-foreground hover:text-foreground underline"
        >
          Clear all
        </button>
      )}
    </div>
  );
}
