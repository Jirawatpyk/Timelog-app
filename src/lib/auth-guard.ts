/**
 * Auth guard utilities for server actions
 * Story 2.4: Session Timeout Handling (AC: 4)
 *
 * Provides utilities for checking authentication in server actions
 * and handling expired sessions gracefully.
 */

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import type { SupabaseClient, User } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

/**
 * Extended ActionResult type that includes auth error indicator
 */
export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; authError?: boolean };

/**
 * Result from getAuthUser
 */
export type AuthResult = ActionResult<{
  user: User;
  supabase: SupabaseClient<Database>;
}>;

/**
 * Requires authentication for a server action.
 * Redirects to login page if not authenticated.
 *
 * Use this when you want to HALT execution and redirect on auth failure.
 *
 * @throws Redirects to /login?expired=true if not authenticated
 * @returns Object containing supabase client and authenticated user
 *
 * @example
 * export async function createEntry(formData: FormData) {
 *   const { supabase, user } = await requireAuth();
 *   // Safe to proceed - user is authenticated
 * }
 */
export async function requireAuth(): Promise<{
  supabase: SupabaseClient<Database>;
  user: User;
}> {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/login?expired=true');
  }

  return { supabase, user };
}

/**
 * Gets the authenticated user without redirecting.
 * Returns an ActionResult that can be handled by the caller.
 *
 * Use this when you want to return an error result instead of redirecting.
 *
 * @returns ActionResult containing user and supabase client, or auth error
 *
 * @example
 * export async function createEntry(formData: FormData) {
 *   const authResult = await getAuthUser();
 *   if (!authResult.success) {
 *     return authResult; // Returns { success: false, error: 'Session expired', authError: true }
 *   }
 *   const { supabase, user } = authResult.data;
 *   // Safe to proceed
 * }
 */
export async function getAuthUser(): Promise<AuthResult> {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return {
        success: false,
        error: 'Session expired',
        authError: true,
      };
    }

    return {
      success: true,
      data: { user, supabase },
    };
  } catch {
    return {
      success: false,
      error: 'Session expired',
      authError: true,
    };
  }
}

/**
 * Type guard to check if an ActionResult is an auth error
 *
 * @param result - Any ActionResult to check
 * @returns true if the result is an auth error
 *
 * @example
 * const result = await someServerAction();
 * if (isAuthError(result)) {
 *   router.push('/login?expired=true');
 * }
 */
export function isAuthError<T>(
  result: ActionResult<T>
): result is { success: false; error: string; authError: true } {
  return !result.success && 'authError' in result && result.authError === true;
}
