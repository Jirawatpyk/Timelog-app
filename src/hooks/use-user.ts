'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import type { UserRole } from '@/types/domain';

export interface UserWithRole {
  user: User | null;
  role: UserRole | null;
  displayName: string | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// Singleton Supabase client to prevent multiple GoTrueClient instances
let supabaseClient: ReturnType<typeof createClient> | null = null;

function getSupabaseClient() {
  if (!supabaseClient) {
    supabaseClient = createClient();
  }
  return supabaseClient;
}

/**
 * Client-side hook to access current user and role
 * Story 2.2: Session Persistence & Logout (AC: 3)
 *
 * @returns UserWithRole object with user, role, loading state, and refetch function
 */
export function useUser(): UserWithRole {
  const [state, setState] = useState<Omit<UserWithRole, 'refetch'>>({
    user: null,
    role: null,
    displayName: null,
    isLoading: true,
    error: null,
  });

  // Track if component is mounted to prevent state updates after unmount
  const isMountedRef = useRef(true);

  const fetchUser = useCallback(async () => {
    if (!isMountedRef.current) return;
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const supabase = getSupabaseClient();
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError) {
        if (!isMountedRef.current) return;
        setState({
          user: null,
          role: null,
          displayName: null,
          isLoading: false,
          error: authError.message,
        });
        return;
      }

      if (!user) {
        if (!isMountedRef.current) return;
        setState({
          user: null,
          role: null,
          displayName: null,
          isLoading: false,
          error: null,
        });
        return;
      }

      // Fetch role and display name from public.users
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('role, display_name')
        .eq('id', user.id)
        .single();

      if (!isMountedRef.current) return;

      if (profileError) {
        // User exists in auth but not in public.users
        // This can happen during signup flow before profile is created
        setState({
          user,
          role: null,
          displayName: null,
          isLoading: false,
          error: null,
        });
        return;
      }

      setState({
        user,
        role: profile.role as UserRole,
        displayName: profile.display_name,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      if (!isMountedRef.current) return;
      setState({
        user: null,
        role: null,
        displayName: null,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Failed to fetch user',
      });
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;

    // Initial fetch
    fetchUser();

    // Listen for auth state changes using singleton client
    const supabase = getSupabaseClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMountedRef.current) return;

        if (event === 'SIGNED_OUT') {
          setState({
            user: null,
            role: null,
            displayName: null,
            isLoading: false,
            error: null,
          });
          return;
        }

        if (session?.user) {
          // Fetch role for new session
          const { data: profile } = await supabase
            .from('users')
            .select('role, display_name')
            .eq('id', session.user.id)
            .single();

          if (!isMountedRef.current) return;

          setState({
            user: session.user,
            role: (profile?.role as UserRole) ?? null,
            displayName: profile?.display_name ?? null,
            isLoading: false,
            error: null,
          });
        }
      }
    );

    return () => {
      isMountedRef.current = false;
      subscription.unsubscribe();
    };
  }, [fetchUser]);

  return {
    ...state,
    refetch: fetchUser,
  };
}
