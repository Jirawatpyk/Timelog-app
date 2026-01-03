/**
 * EmptyFilterState Component - Story 5.6, 5.8
 *
 * Displays when a filter returns no results.
 * Shows the client name and provides option to clear filter.
 * AC4: No "Add Entry" CTA (filter context, not data absence issue)
 */

'use client';

import { Filter } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { EmptyStateBase } from '@/components/dashboard/EmptyStateBase';

interface EmptyFilterStateProps {
  clientName: string;
}

export function EmptyFilterState({ clientName }: EmptyFilterStateProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleClearFilter = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('client');
    const queryString = params.toString();
    router.push(queryString ? `/dashboard?${queryString}` : '/dashboard');
  };

  return (
    <EmptyStateBase
      icon={Filter}
      title={`No entries found for ${clientName}`}
      description="Try a different client or view all entries"
      action={{
        label: 'Clear Filter',
        onClick: handleClearFilter,
      }}
    />
  );
}
