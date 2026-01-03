/**
 * EmptySearchState Component - Story 5.7, 5.8
 *
 * Displays when a search returns no results.
 * Shows the search query and provides option to clear search.
 * AC5: Show search query in message, provide clear option
 */

'use client';

import { Search } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { EmptyStateBase } from '@/components/dashboard/EmptyStateBase';

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
    <EmptyStateBase
      icon={Search}
      title="No entries found"
      description={
        <>
          No results for &quot;<span className="font-medium">{query}</span>&quot;
        </>
      }
      action={{
        label: 'Clear Search',
        onClick: handleClearSearch,
      }}
    />
  );
}
