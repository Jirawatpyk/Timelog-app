'use client';

import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
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

/**
 * Client-side hook to access current user and role
 * Story 2.2: Session Persistence & Logout (AC: 3)
 *
 * Uses onAuthStateChange as the primary mechanism for getting auth state
 * to avoid issues with getSession() hanging on initial load.
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

  // Create client once per hook instance using useMemo
  const supabase = useMemo(() => createClient(), []);

  const fetchUserProfile = useCallback(async (user: User) => {
    if (!isMountedRef.current) return;

    try {
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('role, display_name')
        .eq('id', user.id)
        .single();

      if (!isMountedRef.current) return;

      if (profileError) {
        // User exists in auth but not in public.users
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
        user,
        role: null,
        displayName: null,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Failed to fetch profile',
      });
    }
  }, [supabase]);

  const refetch = useCallback(async () => {
    if (!isMountedRef.current) return;
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const { data: { session }, error: authError } = await supabase.auth.getSession();

      if (!isMountedRef.current) return;

      if (authError) {
        setState({
          user: null,
          role: null,
          displayName: null,
          isLoading: false,
          error: authError.message,
        });
        return;
      }

      if (!session?.user) {
        setState({
          user: null,
          role: null,
          displayName: null,
          isLoading: false,
          error: null,
        });
        return;
      }

      await fetchUserProfile(session.user);
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
  }, [supabase, fetchUserProfile]);

  useEffect(() => {
    isMountedRef.current = true;

    // Use onAuthStateChange as primary mechanism
    // This fires immediately with INITIAL_SESSION event containing current session
    // Note: Don't use async callback directly - it can cause issues with Supabase client
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!isMountedRef.current) return;

        if (event === 'SIGNED_OUT' || !session?.user) {
          setState({
            user: null,
            role: null,
            displayName: null,
            isLoading: false,
            error: null,
          });
          return;
        }

        // For INITIAL_SESSION and SIGNED_IN, fetch the user profile
        // Use setTimeout to break out of the auth callback chain
        setTimeout(() => {
          fetchUserProfile(session.user);
        }, 0);
      }
    );

    return () => {
      isMountedRef.current = false;
      subscription.unsubscribe();
    };
  }, [supabase, fetchUserProfile]);

  return {
    ...state,
    refetch,
  };
}
