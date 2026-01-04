'use client';

import { useState, useEffect } from 'react';

/**
 * Hook to track browser online/offline status
 * Handles SSR by defaulting to true when navigator is undefined
 */
export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Check if navigator exists (SSR safety)
    if (typeof navigator === 'undefined') {
      return;
    }

    // Set initial state from navigator.onLine
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
