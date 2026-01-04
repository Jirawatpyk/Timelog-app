import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

/**
 * Creates a Supabase client with Service Role Key.
 *
 * @warning This client bypasses RLS (Row Level Security).
 * @warning Use ONLY in server actions for admin operations.
 * @warning NEVER expose to client-side code.
 * @warning NEVER import this module in client components.
 *
 * @throws Error if SUPABASE_SERVICE_ROLE_KEY is not set
 * @throws Error if NEXT_PUBLIC_SUPABASE_URL is not set
 *
 * @example
 * ```typescript
 * // In a server action only
 * const supabaseAdmin = createAdminClient();
 * const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email);
 * ```
 */
export function createAdminClient(): SupabaseClient<Database> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set');
  }

  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
