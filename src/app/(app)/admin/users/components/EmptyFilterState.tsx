'use client';

import { SearchX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUserFilters } from '@/hooks/use-user-filters';

/**
 * Empty state when filters return no results
 * Story 7.7: Filter Users (AC 7)
 */
export function EmptyFilterState() {
  const { clearFilters } = useUserFilters();

  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <SearchX className="h-12 w-12 text-muted-foreground/50 mb-4" />
      <p className="text-muted-foreground mb-4">No users found matching your criteria</p>
      <Button variant="outline" onClick={clearFilters}>
        Clear Filters
      </Button>
    </div>
  );
}
