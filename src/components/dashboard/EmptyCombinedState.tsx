/**
 * EmptyCombinedState Component - Story 5.8
 *
 * Displays when both filter AND search are active but return no results.
 * AC6: Prioritizes search message, provides clear actions for both
 */

'use client';

import { Search } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { EmptyStateBase } from '@/components/dashboard/EmptyStateBase';

interface EmptyCombinedStateProps {
  query: string;
  clientName: string;
}

export function EmptyCombinedState({ query, clientName }: EmptyCombinedStateProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleClearSearch = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('q');
    const queryString = params.toString();
    router.push(queryString ? `/dashboard?${queryString}` : '/dashboard');
  };

  const handleClearFilter = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('client');
    const queryString = params.toString();
    router.push(queryString ? `/dashboard?${queryString}` : '/dashboard');
  };

  return (
    <div data-testid="empty-combined-state">
      <EmptyStateBase
        icon={Search}
        title="No entries found"
        description={
          <>
            No results for &quot;<span className="font-medium">{query}</span>&quot;
            <br />
            Filtered by <span className="font-medium">{clientName}</span>
          </>
        }
        action={{
          label: 'Clear Search',
          onClick: handleClearSearch,
        }}
        secondaryAction={{
          label: 'Clear Filter',
          onClick: handleClearFilter,
        }}
      />
    </div>
  );
}
