'use client';

import { useEffect } from 'react';
import { RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useServiceWorker } from '@/hooks/use-service-worker';

/**
 * Update Notification Component
 *
 * Story 8.2: Service Worker & Caching
 * - Shows toast-like notification when SW update is available
 * - "Update available" message
 * - "Refresh" button to activate new version
 * - "Dismiss" button to hide notification
 *
 * Design:
 * - Fixed position at top of screen (below header)
 * - Non-blocking (can be dismissed)
 * - Keyboard accessible
 * - Announced to screen readers
 *
 * @example
 * ```tsx
 * // In layout.tsx
 * <UpdateNotification />
 * ```
 */
export function UpdateNotification() {
  const { updateAvailable, update, dismissUpdate } = useServiceWorker();

  // Auto-dismiss after 30 seconds if user doesn't interact
  useEffect(() => {
    if (!updateAvailable) {
      return;
    }

    const timer = setTimeout(() => {
      dismissUpdate();
    }, 30000);

    return () => {
      clearTimeout(timer);
    };
  }, [updateAvailable, dismissUpdate]);

  if (!updateAvailable) {
    return null;
  }

  return (
    <div
      role="alert"
      aria-live="polite"
      className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-2 fade-in duration-300"
    >
      <div className="flex items-center gap-3 rounded-lg border bg-background px-4 py-3 shadow-lg">
        <RefreshCw className="h-4 w-4 text-primary animate-spin" />
        <span className="text-sm font-medium">Update available</span>

        <div className="flex items-center gap-2 ml-2">
          <Button
            variant="default"
            size="sm"
            onClick={update}
            className="h-7 px-2 text-xs"
          >
            Refresh
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={dismissUpdate}
            className="h-7 w-7 p-0"
            aria-label="Dismiss update notification"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
