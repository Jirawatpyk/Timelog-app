'use client';

import { useEffect, useRef } from 'react';

/**
 * Service Worker Registration Component
 *
 * Story 8.2: Service Worker & Caching
 * - Registers the service worker on page load
 * - Dispatches 'swUpdate' event when new version is available
 * - Handles registration errors gracefully
 *
 * Usage: Add to root layout (app/layout.tsx or app/(app)/layout.tsx)
 *
 * @example
 * ```tsx
 * <ServiceWorkerRegistration />
 * ```
 */
export function ServiceWorkerRegistration() {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Skip if service worker not supported
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    // Skip in development (SW can cause caching issues)
    if (process.env.NODE_ENV === 'development') {
      return;
    }

    const registerServiceWorker = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });

        // Check for updates on registration
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;

          if (!newWorker) {
            return;
          }

          newWorker.addEventListener('statechange', () => {
            // New SW installed and there's already an active controller
            // This means an update is available
            if (
              newWorker.state === 'installed' &&
              navigator.serviceWorker.controller
            ) {
              // Dispatch custom event for useServiceWorker hook
              window.dispatchEvent(new CustomEvent('swUpdate'));
            }
          });
        });

        // Check for updates periodically (every hour)
        // Store interval ID for cleanup
        intervalRef.current = setInterval(
          () => {
            registration.update();
          },
          60 * 60 * 1000
        );
      } catch {
        // Registration failed - silently ignore in production
      }
    };

    // Register after page load
    if (document.readyState === 'complete') {
      registerServiceWorker();
    } else {
      window.addEventListener('load', registerServiceWorker);
    }

    // Cleanup function
    return () => {
      window.removeEventListener('load', registerServiceWorker);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return null;
}
