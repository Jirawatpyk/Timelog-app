/**
 * Client-side hook for handling server action results with auth error support
 * Story 2.4: Session Timeout Handling (AC: 4)
 *
 * Provides utilities for handling action results that may include auth errors,
 * automatically redirecting to login when session expires.
 */

'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useCallback } from 'react';
import { isAuthError, type ActionResult } from '@/lib/auth-guard';
import { AUTH_MESSAGES, AUTH_ROUTES } from '@/constants/messages';

/**
 * Hook for handling server action results with automatic auth error handling
 *
 * @returns Object containing handleResult function
 *
 * @example
 * const { handleResult } = useAuthAction();
 *
 * const onSubmit = async (data) => {
 *   const result = await createEntry(data);
 *   const entry = handleResult(result);
 *   if (entry) {
 *     // Success - entry is the data
 *     toast.success('Entry created!');
 *   }
 *   // If auth error, user is already redirected
 *   // If other error, toast is shown
 * };
 */
export function useAuthAction() {
  const router = useRouter();

  /**
   * Handles an action result, showing appropriate feedback
   *
   * @param result - The ActionResult from a server action
   * @param options - Optional configuration
   * @returns The data if successful, null otherwise
   */
  const handleResult = useCallback(
    <T>(
      result: ActionResult<T>,
      options?: {
        /** Custom error message to show (overrides result.error) */
        errorMessage?: string;
        /** Whether to show error toast (default: true) */
        showErrorToast?: boolean;
      }
    ): T | null => {
      const { errorMessage, showErrorToast = true } = options ?? {};

      if (result.success) {
        return result.data;
      }

      // Handle auth errors - redirect to login
      if (isAuthError(result)) {
        toast.error(AUTH_MESSAGES.SESSION_EXPIRED_TITLE, {
          description: AUTH_MESSAGES.PLEASE_LOGIN_AGAIN,
        });
        router.push(AUTH_ROUTES.LOGIN_EXPIRED);
        return null;
      }

      // Handle other errors - show toast
      if (showErrorToast) {
        toast.error(errorMessage ?? result.error);
      }

      return null;
    },
    [router]
  );

  return { handleResult };
}

/**
 * Standalone function to check if result is auth error and handle redirect
 * Use this when you need to check without the hook context
 *
 * @param result - The ActionResult to check
 * @param router - Next.js router instance
 * @returns true if it was an auth error (and redirect was initiated)
 */
export function handleAuthError<T>(
  result: ActionResult<T>,
  router: ReturnType<typeof useRouter>
): boolean {
  if (isAuthError(result)) {
    toast.error(AUTH_MESSAGES.SESSION_EXPIRED_TITLE, {
      description: AUTH_MESSAGES.PLEASE_LOGIN_AGAIN,
    });
    router.push(AUTH_ROUTES.LOGIN_EXPIRED);
    return true;
  }
  return false;
}
