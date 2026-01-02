/**
 * Empty State Component - Story 5.2
 *
 * Displays when user has no entries for the selected period.
 * AC7: Empty state for today with CTA
 */

import Link from 'next/link';
import { Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  message?: string;
  showCta?: boolean;
}

export function EmptyState({
  message = 'No entries for today',
  showCta = true,
}: EmptyStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center py-12 px-4 text-center"
      data-testid="empty-state"
    >
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <Clock className="w-8 h-8 text-muted-foreground" aria-hidden="true" />
      </div>

      <p className="text-muted-foreground mb-4">{message}</p>

      {showCta && (
        <Button asChild>
          <Link href="/entry">Add Entry</Link>
        </Button>
      )}
    </div>
  );
}
