'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import { createUserSchema, type CreateUserInput } from '@/schemas/user.schema';
import type {
  ActionResult,
  DepartmentOption,
  PaginationParams,
  User,
  UserListItem,
  UserListResponse,
  UserRole,
  UserStatus,
} from '@/types/domain';

const DEFAULT_PAGE_SIZE = 20;

/**
 * Get paginated list of users for admin user management
 * @param params - Pagination parameters (page, limit)
 * @returns ActionResult with users array and total count
 */
export async function getUsers(
  params: PaginationParams = { page: 1, limit: DEFAULT_PAGE_SIZE }
): Promise<ActionResult<UserListResponse>> {
  const supabase = await createClient();

  const { page, limit } = params;
  const offset = (page - 1) * limit;

  const { data, error, count } = await supabase
    .from('users')
    .select(
      `
      id,
      email,
      display_name,
      role,
      is_active,
      confirmed_at,
      department:departments(id, name)
    `,
      { count: 'exact' }
    )
    .range(offset, offset + limit - 1)
    .order('display_name', { ascending: true, nullsFirst: false });

  if (error) {
    return { success: false, error: error.message };
  }

  // Transform snake_case to camelCase at boundary
  // Note: Supabase returns FK joins based on relationship type
  const users: UserListItem[] = (data ?? []).map((row) => {
    // Handle department which can be null, object, or array (Supabase types)
    // Runtime: single FK returns object, type system says array - use unknown bridge
    const deptData = row.department as unknown;
    let dept: { id: string; name: string } | null = null;
    if (deptData && typeof deptData === 'object' && 'id' in deptData) {
      dept = deptData as { id: string; name: string };
    }

    // Calculate user status based on confirmed_at and is_active
    // Story 7.2a: AC 7 - Status column logic
    const status: UserStatus = !row.is_active
      ? 'inactive'
      : row.confirmed_at === null
        ? 'pending'
        : 'active';

    return {
      id: row.id,
      email: row.email,
      displayName: row.display_name,
      role: row.role as UserRole,
      department: dept,
      isActive: row.is_active,
      status,
      confirmedAt: row.confirmed_at,
    };
  });

  return {
    success: true,
    data: {
      users,
      totalCount: count ?? 0,
    },
  };
}

/**
 * Get the current user's role
 * Story 7.2: Create New User (AC 4)
 *
 * Used to determine if user can create super_admin
 */
export async function getCurrentUserRole(): Promise<ActionResult<UserRole>> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  const { data: profile, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (error || !profile?.role) {
    return { success: false, error: 'Failed to get user role' };
  }

  return { success: true, data: profile.role as UserRole };
}

/**
 * Get list of active departments for user form
 * Story 7.2: Create New User (AC 1)
 */
export async function getActiveDepartments(): Promise<ActionResult<DepartmentOption[]>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('departments')
    .select('id, name')
    .eq('active', true)
    .order('name');

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: data ?? [] };
}

/**
 * Create a new user with invitation email
 * Story 7.2: Create New User (AC 2, 3, 4, 5, 6)
 * Story 7.2a: User Invitation Email (AC 1, 2, 3, 4, 5)
 *
 * Flow:
 * 1. Validate input and permissions
 * 2. Create auth.users via Admin API (sends invitation email)
 * 3. Create public.users with same ID
 * 4. Rollback auth.users if public.users insert fails
 *
 * @param input - User creation input
 * @returns ActionResult with created user or error
 */
export async function createUser(input: CreateUserInput): Promise<ActionResult<User>> {
  // Validate input first
  const parsed = createUserSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  // Get current user's role
  const { data: currentUserProfile, error: profileError } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileError || !currentUserProfile?.role) {
    return { success: false, error: 'Failed to verify permissions' };
  }

  const currentRole = currentUserProfile.role as UserRole;

  // Check role permission - admin cannot create super_admin
  if (parsed.data.role === 'super_admin' && currentRole !== 'super_admin') {
    return { success: false, error: 'Cannot create Super Admin user' };
  }

  // Check for duplicate email (case-insensitive)
  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .ilike('email', parsed.data.email)
    .single();

  if (existingUser) {
    return { success: false, error: 'Email already exists' };
  }

  // Verify department exists and is active
  const { data: department } = await supabase
    .from('departments')
    .select('id')
    .eq('id', parsed.data.departmentId)
    .eq('active', true)
    .single();

  if (!department) {
    return { success: false, error: 'Invalid or inactive department' };
  }

  // Step 1: Create auth.users via Admin API and send invitation email
  // Story 7.2a: AC 1, 2 - Automatic Invitation Email & Auth User Creation
  const supabaseAdmin = createAdminClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;

  const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
    parsed.data.email,
    {
      data: {
        display_name: parsed.data.displayName,
        role: parsed.data.role,
      },
      redirectTo: `${appUrl}/login`,
    }
  );

  if (authError) {
    // Story 7.2a: AC 5 - Email Send Failure
    return { success: false, error: 'Failed to send invitation email' };
  }

  // Step 2: Create public.users with auth user ID
  const { data: newUser, error: insertError } = await supabase
    .from('users')
    .insert({
      id: authUser.user.id, // Use auth.users ID for consistency
      email: parsed.data.email,
      display_name: parsed.data.displayName,
      role: parsed.data.role,
      department_id: parsed.data.departmentId,
      is_active: true,
      confirmed_at: null, // Pending invitation
    })
    .select()
    .single();

  if (insertError) {
    // Story 7.2a: AC 4 - Rollback on Failure
    // Delete auth user if public.users insert fails
    await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);

    // Handle unique constraint violation
    if (insertError.code === '23505') {
      return { success: false, error: 'Email already exists' };
    }
    return { success: false, error: 'Failed to create user profile' };
  }

  revalidatePath('/admin/users');
  return { success: true, data: newUser };
}

/**
 * Resend invitation email to a pending user
 * Story 7.2a: User Invitation Email (AC 8, 9)
 *
 * @param userId - The user ID to resend invitation to
 * @returns ActionResult indicating success or failure
 */
export async function resendInvitation(userId: string): Promise<ActionResult<null>> {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  // Get user from public.users
  const { data: targetUser, error: fetchError } = await supabase
    .from('users')
    .select('email, confirmed_at')
    .eq('id', userId)
    .single();

  if (fetchError || !targetUser) {
    return { success: false, error: 'User not found' };
  }

  // Check if user already confirmed (AC 9)
  if (targetUser.confirmed_at !== null) {
    return { success: false, error: 'User already confirmed' };
  }

  // Resend invitation via Admin API
  const supabaseAdmin = createAdminClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;

  const { error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
    targetUser.email,
    {
      redirectTo: `${appUrl}/login`,
    }
  );

  if (inviteError) {
    return { success: false, error: 'Failed to resend invitation' };
  }

  return { success: true, data: null };
}
