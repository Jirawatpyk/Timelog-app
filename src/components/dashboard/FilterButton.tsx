/**
 * FilterButton Component - Story 5.6
 *
 * Button to open the filter sheet. Shows a badge indicator when
 * a filter is active.
 */

'use client';

import { Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FilterButtonProps {
  hasActiveFilter: boolean;
  onClick: () => void;
}

export function FilterButton({ hasActiveFilter, onClick }: FilterButtonProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      className="relative"
      aria-label="Filter entries"
    >
      <Filter className="h-5 w-5" />
      {hasActiveFilter && (
        <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-primary" />
      )}
    </Button>
  );
}
