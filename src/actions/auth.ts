'use server';

import { createClient } from '@/lib/supabase/server';
import { loginSchema, type LoginInput } from '@/schemas/auth.schema';
import { redirect } from 'next/navigation';

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function login(input: LoginInput): Promise<ActionResult<{ userId: string }>> {
  // Validate input
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: 'Invalid input' };
  }

  try {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });

    if (error) {
      // Generic error message for security
      return { success: false, error: 'Invalid email or password' };
    }

    return { success: true, data: { userId: data.user.id } };
  } catch (err) {
    // Network or unexpected errors
    console.error('Login error:', err);
    return { success: false, error: 'Unable to connect. Please check your internet connection.' };
  }
}

/**
 * Logout server action
 * Story 2.2: Session Persistence & Logout (AC: 5, 6)
 *
 * Terminates the user session and redirects to login page.
 * On success: redirects to /login (never returns)
 * On failure: returns ActionResult with error
 */
export async function logout(): Promise<ActionResult<null> | never> {
  try {
    const supabase = await createClient();

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Logout error:', error);
      return { success: false, error: 'Failed to logout. Please try again.' };
    }

    // Redirect to login page after successful logout
    // Note: redirect() throws an error internally, so it should be the last statement
  } catch (err) {
    // Network or unexpected errors
    console.error('Logout error:', err);
    return { success: false, error: 'Unable to logout. Please check your connection.' };
  }

  // Redirect after try/catch to avoid catching redirect "error"
  redirect('/login');
}
