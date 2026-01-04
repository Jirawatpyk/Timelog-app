'use client';

import { useEffect, useState } from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { useOnlineStatus } from '@/hooks/use-online-status';
import { cn } from '@/lib/utils';

/**
 * Displays a banner when the user goes offline
 * Shows a toast notification when connection is restored
 */
export function OfflineBanner() {
  const isOnline = useOnlineStatus();
  const [showOnlineToast, setShowOnlineToast] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      // User went offline - track this state
      setWasOffline(true);
    } else if (wasOffline) {
      // User was offline and is now online - show toast
      setShowOnlineToast(true);
      const timer = setTimeout(() => {
        setShowOnlineToast(false);
        setWasOffline(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  // Don't render anything if online and no toast to show
  if (isOnline && !showOnlineToast) return null;

  return (
    <>
      {/* Offline Banner */}
      {!isOnline && (
        <div
          role="alert"
          className={cn(
            'fixed top-0 left-0 right-0 z-50',
            'bg-amber-500 text-white',
            'px-4 py-2',
            'flex items-center justify-center gap-2',
            'shadow-md',
            'animate-in slide-in-from-top duration-300'
          )}
        >
          <WifiOff className="h-4 w-4" aria-hidden="true" />
          <span className="text-sm font-medium">No internet connection</span>
        </div>
      )}

      {/* Online Restored Toast */}
      {showOnlineToast && (
        <div
          role="status"
          aria-live="polite"
          className={cn(
            'fixed top-4 left-1/2 -translate-x-1/2 z-50',
            'bg-green-500 text-white',
            'px-4 py-2 rounded-lg',
            'flex items-center gap-2',
            'shadow-lg',
            'animate-in fade-in slide-in-from-top duration-300'
          )}
        >
          <Wifi className="h-4 w-4" aria-hidden="true" />
          <span className="text-sm font-medium">Back online</span>
        </div>
      )}
    </>
  );
}
