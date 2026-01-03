/**
 * EmptyFilterState Component - Story 5.6
 *
 * Displays when a filter returns no results.
 * Shows the client name and provides option to clear filter.
 */

'use client';

import { Filter } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';

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
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-muted p-4 mb-4">
        <Filter className="h-8 w-8 text-muted-foreground" />
      </div>

      <h3 className="text-lg font-medium mb-2">
        No entries found for {clientName}
      </h3>

      <p className="text-muted-foreground mb-4">
        Try a different client or view all entries
      </p>

      <Button variant="outline" onClick={handleClearFilter}>
        Clear Filter
      </Button>
    </div>
  );
}
