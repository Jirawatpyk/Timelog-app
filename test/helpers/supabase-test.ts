/**
 * Supabase test client utilities for RLS testing
 * Story 1.4: RLS Policies for All Roles (AC: 8, 9, 10)
 *
 * This module provides utilities for testing RLS policies:
 * - createServiceClient(): Bypasses RLS for setup/cleanup
 * - createUserClient(): Creates authenticated client for RLS testing
 * - createAuthUser/deleteAuthUser: Manage test users in auth.users
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

let _serviceClient: SupabaseClient<Database> | null = null;
const TEST_PASSWORD = 'test-password-12345';

/**
 * Create a Supabase client with service role (bypasses RLS)
 * Used for test setup and cleanup
 * Returns a singleton to avoid "Multiple GoTrueClient instances" warning
 */
export function createServiceClient(): SupabaseClient<Database> {
  if (_serviceClient) {
    return _serviceClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables'
    );
  }

  _serviceClient = createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return _serviceClient;
}

/**
 * Create a test user in auth.users (required before creating in public.users)
 * Uses Supabase Admin API
 */
export async function createAuthUser(
  userId: string,
  email: string
): Promise<{ success: boolean; error?: string }> {
  const client = createServiceClient();

  // First check if user already exists
  const { data: existingUser } = await client.auth.admin.getUserById(userId);
  if (existingUser?.user) {
    return { success: true };
  }

  // Create user in auth.users
  const { error } = await client.auth.admin.createUser({
    id: userId,
    email,
    email_confirm: true,
    password: TEST_PASSWORD,
  });

  if (error) {
    // If user already exists, that's fine
    if (error.message?.includes('already been registered')) {
      return { success: true };
    }
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Delete a test user from auth.users
 */
export async function deleteAuthUser(userId: string): Promise<void> {
  const client = createServiceClient();
  await client.auth.admin.deleteUser(userId).catch(() => {
    // Ignore errors - user may not exist
  });
}

/**
 * Create an authenticated Supabase client for a specific user
 * This client respects RLS policies - use for actual RLS testing
 *
 * @param email - The user's email address
 * @returns Authenticated Supabase client that respects RLS
 */
export async function createUserClient(
  email: string
): Promise<SupabaseClient<Database>> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables'
    );
  }

  // Create a new client instance for this user
  const supabase = createClient<Database>(supabaseUrl, anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  // Sign in as the user
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: TEST_PASSWORD,
  });

  if (error) {
    throw new Error(`Failed to sign in as ${email}: ${error.message}`);
  }

  return supabase;
}

/**
 * Execute a query as a specific user (for RLS testing)
 * Signs in as the user and executes the query with RLS enforced
 *
 * @param email - The user's email address
 * @param query - A function that receives the authenticated client
 * @returns The result of the query
 *
 * @example
 * const entries = await asUser(testUsers.staff.email, (supabase) =>
 *   supabase.from('time_entries').select('*')
 * );
 */
export async function asUser<T>(
  email: string,
  query: (supabase: SupabaseClient<Database>) => Promise<T>
): Promise<T> {
  const userClient = await createUserClient(email);
  return query(userClient);
}
