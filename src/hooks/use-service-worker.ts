'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * Service Worker update state
 */
export interface ServiceWorkerState {
  /**
   * Whether a new service worker update is available
   */
  updateAvailable: boolean;

  /**
   * Whether service worker is registered and active
   */
  isReady: boolean;

  /**
   * Trigger update by telling waiting SW to skip waiting and reload
   */
  update: () => void;

  /**
   * Dismiss the update notification without updating
   */
  dismissUpdate: () => void;
}

/**
 * Hook to manage service worker registration and updates
 *
 * Story 8.2: Service Worker & Caching
 * - Detects when new SW is waiting
 * - Provides update function to activate new SW
 * - Handles page reload after update
 *
 * @example
 * ```tsx
 * const { updateAvailable, update, dismissUpdate } = useServiceWorker();
 *
 * if (updateAvailable) {
 *   return <UpdateNotification onUpdate={update} onDismiss={dismissUpdate} />;
 * }
 * ```
 */
export function useServiceWorker(): ServiceWorkerState {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Skip if service worker not supported or not available
    if (!('serviceWorker' in navigator) || !navigator.serviceWorker) {
      return;
    }

    // Listen for custom swUpdate event dispatched by registration component
    const handleUpdate = () => {
      setUpdateAvailable(true);
    };

    window.addEventListener('swUpdate', handleUpdate);

    // Check if SW is already ready
    navigator.serviceWorker.ready
      .then(() => {
        setIsReady(true);
      })
      .catch(() => {
        // Ignore errors - SW may not be available
      });

    return () => {
      window.removeEventListener('swUpdate', handleUpdate);
    };
  }, []);

  /**
   * Activate the waiting service worker and reload
   */
  const update = useCallback(() => {
    if (!('serviceWorker' in navigator) || !navigator.serviceWorker) {
      return;
    }

    // Define handler for controller change
    const handleControllerChange = () => {
      window.location.reload();
    };

    // Add listener BEFORE sending skip waiting to avoid race condition
    // Use { once: true } to automatically remove after firing (prevents accumulation)
    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange, {
      once: true,
    });

    // Now tell waiting SW to skip waiting
    navigator.serviceWorker.ready.then((registration) => {
      if (registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
    });
  }, []);

  /**
   * Dismiss update notification without updating
   */
  const dismissUpdate = useCallback(() => {
    setUpdateAvailable(false);
  }, []);

  return {
    updateAvailable,
    isReady,
    update,
    dismissUpdate,
  };
}
