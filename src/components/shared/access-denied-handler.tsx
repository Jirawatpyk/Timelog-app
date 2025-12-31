'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { toast } from 'sonner';

/**
 * AccessDeniedHandler - Handles access denied query parameter
 *
 * This component listens for the ?access=denied query parameter
 * and shows a toast notification when access is denied.
 * After showing the toast, it cleans up the URL.
 */
export function AccessDeniedHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const access = searchParams.get('access');

    if (access === 'denied') {
      toast.error('Access Denied', {
        description: 'You do not have permission to access that page.',
        duration: 4000,
      });

      // Clean up URL by removing the access parameter
      // Build clean URL from pathname and remaining search params
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.delete('access');
      const search = newParams.toString();
      router.replace(pathname + (search ? `?${search}` : ''), { scroll: false });
    }
  }, [searchParams, router, pathname]);

  return null;
}
