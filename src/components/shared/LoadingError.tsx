'use client';

import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LoadingErrorProps {
  /** Custom error message to display */
  message?: string;
  /** Callback when retry button is clicked */
  onRetry: () => void;
  /** Whether retry is in progress */
  isRetrying?: boolean;
}

/**
 * Loading Error Component with Retry
 * Story 4.9 - AC5: Error state with "Retry" button
 *
 * Reusable error component for when data fails to load.
 * Shows error message with retry functionality.
 */
export function LoadingError({
  message = 'Failed to load data',
  onRetry,
  isRetrying = false,
}: LoadingErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <AlertCircle
        className="h-10 w-10 text-muted-foreground mb-3"
        data-testid="alert-icon"
      />
      <p className="text-sm text-muted-foreground mb-4">{message}</p>
      <Button
        variant="outline"
        size="sm"
        onClick={onRetry}
        disabled={isRetrying}
        aria-label={isRetrying ? 'Loading...' : 'Retry'}
      >
        {isRetrying ? (
          <>
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            Loading...
          </>
        ) : (
          <>
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </>
        )}
      </Button>
    </div>
  );
}
