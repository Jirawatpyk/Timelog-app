'use client';

/**
 * Client-side auth state listener
 * Story 2.4: Session Timeout Handling (AC: 5)
 *
 * Listens for auth state changes and handles session expiry gracefully.
 * Should be placed in the authenticated app layout.
 */

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { AUTH_MESSAGES, AUTH_ROUTES } from '@/constants/messages';

export function AuthStateListener({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const hasRedirected = useRef(false);

  useEffect(() => {
    const supabase = createClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      // Handle sign out event
      if (event === 'SIGNED_OUT') {
        // Prevent multiple redirects
        if (hasRedirected.current) return;
        hasRedirected.current = true;

        toast.info(AUTH_MESSAGES.SIGNED_OUT_TITLE, {
          description: AUTH_MESSAGES.SIGNED_OUT_DESCRIPTION,
        });
        router.push(AUTH_ROUTES.LOGIN);
      }

      // Handle token refresh failure (session expired during use)
      if (event === 'TOKEN_REFRESHED' && !session) {
        if (hasRedirected.current) return;
        hasRedirected.current = true;

        toast.info(AUTH_MESSAGES.SESSION_EXPIRED_TITLE, {
          description: AUTH_MESSAGES.PLEASE_LOGIN_AGAIN,
        });
        router.push(AUTH_ROUTES.LOGIN_EXPIRED);
      }
    });

    // Reset redirect flag on mount
    hasRedirected.current = false;

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  return <>{children}</>;
}
