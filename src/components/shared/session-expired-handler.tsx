'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { AUTH_MESSAGES } from '@/constants/messages';

/**
 * Handles session expired query parameter on login page
 * Story 2.4: Session Timeout Handling (AC: 2)
 *
 * Displays a toast notification when user is redirected due to session expiry
 * and cleans up the URL query parameter.
 */
export function SessionExpiredHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const expired = searchParams.get('expired');
    const message = searchParams.get('message');

    if (expired === 'true') {
      toast.info(AUTH_MESSAGES.SESSION_EXPIRED_TITLE, {
        description: AUTH_MESSAGES.SESSION_EXPIRED_DESCRIPTION,
        duration: 5000,
      });
      // Clean up URL
      const url = new URL(window.location.href);
      url.searchParams.delete('expired');
      router.replace(url.pathname + url.search);
    } else if (message) {
      toast.info(message, {
        duration: 4000,
      });
      // Clean up URL
      const url = new URL(window.location.href);
      url.searchParams.delete('message');
      router.replace(url.pathname + url.search);
    }
  }, [searchParams, router]);

  return null;
}
