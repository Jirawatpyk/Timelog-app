'use server';

import { createClient } from '@/lib/supabase/server';
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
    return {
      id: row.id,
      email: row.email,
      displayName: row.display_name,
      role: row.role as UserRole,
      department: dept,
      isActive: row.is_active,
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
 * Create a new user
 * Story 7.2: Create New User (AC 2, 3, 4, 5, 6)
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

  // Create user
  const { data: newUser, error: insertError } = await supabase
    .from('users')
    .insert({
      email: parsed.data.email,
      display_name: parsed.data.displayName,
      role: parsed.data.role,
      department_id: parsed.data.departmentId,
      is_active: true,
    })
    .select()
    .single();

  if (insertError) {
    // Handle unique constraint violation
    if (insertError.code === '23505') {
      return { success: false, error: 'Email already exists' };
    }
    return { success: false, error: 'Failed to create user' };
  }

  revalidatePath('/admin/users');
  return { success: true, data: newUser };
}
