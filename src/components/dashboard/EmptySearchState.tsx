/**
 * EmptySearchState Component - Story 5.7
 *
 * Displays when a search returns no results.
 * Shows the search query and provides option to clear search.
 */

'use client';

import { Search } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';

interface EmptySearchStateProps {
  query: string;
  onClear?: () => void;
}

export function EmptySearchState({ query, onClear }: EmptySearchStateProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleClearSearch = () => {
    if (onClear) {
      onClear();
      return;
    }

    // Default behavior: clear q param from URL
    const params = new URLSearchParams(searchParams.toString());
    params.delete('q');
    const queryString = params.toString();
    router.push(queryString ? `/dashboard?${queryString}` : '/dashboard');
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-muted p-4 mb-4">
        <Search className="h-8 w-8 text-muted-foreground" />
      </div>

      <h3 className="text-lg font-medium mb-2">
        No entries found
      </h3>

      <p className="text-muted-foreground mb-4">
        No results for &quot;<span className="font-medium">{query}</span>&quot;
      </p>

      <Button variant="outline" onClick={handleClearSearch}>
        Clear Search
      </Button>
    </div>
  );
}
