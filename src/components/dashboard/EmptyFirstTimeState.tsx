/**
 * EmptyFirstTimeState Component - Story 5.8
 *
 * Welcoming empty state for users with zero entries.
 * AC8: Welcoming message with extra prominent CTA
 */

import { Sparkles } from 'lucide-react';
import { EmptyStateBase } from '@/components/dashboard/EmptyStateBase';

export function EmptyFirstTimeState() {
  return (
    <EmptyStateBase
      icon={Sparkles}
      title="Welcome!"
      description="Log your first entry! It takes less than 30 seconds."
      action={{
        label: 'Add First Entry',
        href: '/entry',
      }}
      data-testid="empty-first-time-state"
    />
  );
}
