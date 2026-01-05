'use client';

import { useState, useEffect } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useUserFilters } from '@/hooks/use-user-filters';

/**
 * Search input for user list with debounce
 * Story 7.7: Filter Users (AC 5)
 *
 * Features:
 * - Search icon
 * - 300ms debounce
 * - Clear button
 * - Syncs with URL params
 */
export function UserSearchInput() {
  const { filters, setFilter } = useUserFilters();
  const [value, setValue] = useState(filters.search || '');

  // Debounce search query updates to URL
  const debouncedSearch = useDebouncedCallback((query: string) => {
    setFilter('q', query || null);
  }, 300);

  // Sync local value with URL when filters change externally
  useEffect(() => {
    setValue(filters.search || '');
  }, [filters.search]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    debouncedSearch(newValue);
  };

  const handleClear = () => {
    setValue('');
    setFilter('q', null);
  };

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Search by name or email..."
        value={value}
        onChange={handleChange}
        className="pl-9 pr-9"
        aria-label="Search users"
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
