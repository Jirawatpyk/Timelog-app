'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';

/**
 * ErrorToast Component - Story 6.1 AC4
 *
 * Handles URL error parameters and shows appropriate toast messages.
 * Used for redirects that need to show user feedback.
 */
export function ErrorToast() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const error = searchParams.get('error');

    if (error === 'no-access') {
      toast.error('No permission to access this page');
      // Clean URL without reloading page
      router.replace(window.location.pathname);
    }
  }, [searchParams, router]);

  return null;
}
