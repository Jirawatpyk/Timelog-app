'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import {
  createUserSchema,
  editUserSchema,
  type CreateUserInput,
  type EditUserInput,
} from '@/schemas/user.schema';
import type {
  ActionResult,
  DepartmentOption,
  PaginationParams,
  UpdateUserResult,
  User,
  UserFilters,
  UserListItem,
  UserListResponse,
  UserRole,
  UserStatus,
} from '@/types/domain';
import { canAssignRole, type RoleKey } from '@/lib/roles';

const DEFAULT_PAGE_SIZE = 20;

/**
 * Get paginated list of users for admin user management
 * Story 7.7: Filter Users - Added filters parameter
 *
 * @param params - Pagination parameters (page, limit)
 * @param filters - Optional filters for department, role, status, search
 * @returns ActionResult with users array and total count
 */
export async function getUsers(
  params: PaginationParams = { page: 1, limit: DEFAULT_PAGE_SIZE },
  filters?: UserFilters
): Promise<ActionResult<UserListResponse>> {
  const supabase = await createClient();

  const { page, limit } = params;
  const offset = (page - 1) * limit;

  // Start building the query
  let query = supabase
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
    );

  // Apply filters (Story 7.7)
  if (filters?.departmentId) {
    query = query.eq('department_id', filters.departmentId);
  }

  if (filters?.role) {
    query = query.eq('role', filters.role);
  }

  if (filters?.status === 'active') {
    // Active: is_active = true AND confirmed_at is not null
    query = query.eq('is_active', true).not('confirmed_at', 'is', null);
  } else if (filters?.status === 'inactive') {
    // Inactive: is_active = false
    query = query.eq('is_active', false);
  } else if (filters?.status === 'pending') {
    // Pending: is_active = true AND confirmed_at is null (not yet confirmed)
    query = query.eq('is_active', true).is('confirmed_at', null);
  }

  if (filters?.search) {
    // Sanitize search input to prevent SQL pattern injection
    const sanitized = filters.search.replace(/[%_\\]/g, '\\$&');
    query = query.or(`display_name.ilike.%${sanitized}%,email.ilike.%${sanitized}%`);
  }

  // Apply pagination and ordering
  const { data, error, count } = await query
    .range(offset, offset + limit - 1)
    .order('display_name', { ascending: true, nullsFirst: false });

  if (error) {
    return { success: false, error: error.message };
  }

  // Story 7.6: Fetch manager departments for managers in this page
  const managerIds = (data ?? [])
    .filter((row) => row.role === 'manager')
    .map((row) => row.id);

  // Build map of manager_id -> departments
  const managerDepartmentsMap = new Map<string, DepartmentOption[]>();
  if (managerIds.length > 0) {
    const { data: mdData } = await supabase
      .from('manager_departments')
      .select('manager_id, department:departments(id, name)')
      .in('manager_id', managerIds);

    for (const md of mdData ?? []) {
      const dept = md.department as unknown as DepartmentOption;
      if (dept) {
        const existing = managerDepartmentsMap.get(md.manager_id) ?? [];
        existing.push(dept);
        managerDepartmentsMap.set(md.manager_id, existing);
      }
    }
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

    // Story 7.6: Include managed departments for managers
    const managedDepartments =
      row.role === 'manager' ? managerDepartmentsMap.get(row.id) ?? [] : undefined;

    return {
      id: row.id,
      email: row.email,
      displayName: row.display_name,
      role: row.role as UserRole,
      department: dept,
      isActive: row.is_active,
      status,
      confirmedAt: row.confirmed_at,
      managedDepartments,
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

  // Check authorization - only admin/super_admin can resend invitations
  const { data: currentUserProfile, error: profileError } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileError || !currentUserProfile?.role) {
    return { success: false, error: 'Failed to verify permissions' };
  }

  const currentRole = currentUserProfile.role as UserRole;
  if (currentRole !== 'admin' && currentRole !== 'super_admin') {
    return { success: false, error: 'Insufficient permissions' };
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

/**
 * Update an existing user's information
 * Story 7.3: Edit User Information (AC 1, 2, 3, 4)
 * Story 7.5: Assign Roles (AC 2, 3, 5, 6)
 *
 * Flow:
 * 1. Validate input
 * 2. Check authentication and current user's role
 * 3. Check target user exists and get their role
 * 4. Story 7.5 AC 6: Prevent self-role-change
 * 5. Prevent admin from editing super_admin
 * 6. Story 7.5 AC 1/4: Validate role assignment permission
 * 7. Check for duplicate email (excluding current user)
 * 8. Story 7.5 AC 5: If downgrading from manager, clean up manager_departments
 * 9. Update user
 * 10. Story 7.5 AC 3: Return promptDepartment flag if becoming manager
 *
 * Note: Audit logging is handled by database trigger (see Epic 1)
 *
 * @param id - User ID to update
 * @param input - User update input
 * @returns ActionResult with updated user and promptDepartment flag
 */
export async function updateUser(id: string, input: EditUserInput): Promise<ActionResult<UpdateUserResult>> {
  // Validate input first
  const parsed = editUserSchema.safeParse(input);
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

  // Get target user's current role
  const { data: targetUser, error: targetError } = await supabase
    .from('users')
    .select('role')
    .eq('id', id)
    .single();

  if (targetError || !targetUser) {
    return { success: false, error: 'User not found' };
  }

  const targetCurrentRole = targetUser.role as UserRole;
  const newRole = parsed.data.role as RoleKey;
  const isRoleChanging = targetCurrentRole !== newRole;

  // Story 7.5 AC 6: Prevent self-role-change
  if (user.id === id && isRoleChanging) {
    return { success: false, error: 'Cannot change your own role' };
  }

  // AC 3 (Story 7.3): Prevent admin from editing super_admin
  if (targetCurrentRole === 'super_admin' && currentRole !== 'super_admin') {
    return { success: false, error: 'Cannot edit Super Admin' };
  }

  // Story 7.5 AC 1/4: Validate role assignment permission
  if (isRoleChanging && !canAssignRole(currentRole as RoleKey, newRole)) {
    return { success: false, error: 'Cannot assign Super Admin role' };
  }

  // AC 4: Check duplicate email (excluding current user)
  const { data: existingEmail } = await supabase
    .from('users')
    .select('id')
    .ilike('email', parsed.data.email)
    .neq('id', id)
    .single();

  if (existingEmail) {
    return { success: false, error: 'Email already exists' };
  }

  // Story 7.5 AC 5: Clean up manager_departments if downgrading from manager
  if (targetCurrentRole === 'manager' && newRole !== 'manager') {
    await supabase
      .from('manager_departments')
      .delete()
      .eq('manager_id', id);
  }

  // Determine if we should prompt for department assignment
  // Story 7.5 AC 3: Prompt when role changed TO manager
  const becomingManager = newRole === 'manager' && targetCurrentRole !== 'manager';

  // Update user
  const { data: updatedUser, error: updateError } = await supabase
    .from('users')
    .update({
      email: parsed.data.email,
      display_name: parsed.data.displayName,
      role: parsed.data.role,
      department_id: parsed.data.departmentId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (updateError || !updatedUser) {
    return { success: false, error: 'Failed to update user' };
  }

  revalidatePath('/admin/users');
  return {
    success: true,
    data: {
      user: updatedUser,
      promptDepartment: becomingManager,
    },
  };
}

/**
 * Deactivate a user account
 * Story 7.4: Deactivate User (AC 1, 2, 4, 5)
 *
 * Flow:
 * 1. Check authentication
 * 2. Prevent self-deactivation (AC 5)
 * 3. Get current user's role
 * 4. Get target user's role
 * 5. Prevent admin from deactivating super_admin (AC 4)
 * 6. Set is_active = false (AC 2)
 *
 * Note: Session invalidation via Admin API handled separately (Task 5)
 *
 * @param id - User ID to deactivate
 * @returns ActionResult with deactivated user or error
 */
export async function deactivateUser(id: string): Promise<ActionResult<User>> {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  // AC 5: Prevent self-deactivation
  if (user.id === id) {
    return { success: false, error: 'Cannot deactivate your own account' };
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

  // Get target user's role
  const { data: targetUser, error: targetError } = await supabase
    .from('users')
    .select('role')
    .eq('id', id)
    .single();

  if (targetError || !targetUser) {
    return { success: false, error: 'User not found' };
  }

  // AC 4: Prevent admin from deactivating super_admin
  if (targetUser.role === 'super_admin' && currentRole !== 'super_admin') {
    return { success: false, error: 'Cannot deactivate Super Admin' };
  }

  // Deactivate user
  const { data: updatedUser, error: updateError } = await supabase
    .from('users')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (updateError || !updatedUser) {
    return { success: false, error: 'Failed to deactivate user' };
  }

  // Session invalidation will be handled by middleware checking is_active
  // For immediate invalidation, use Admin API (requires service_role key)

  revalidatePath('/admin/users');
  return { success: true, data: updatedUser };
}

/**
 * Reactivate a deactivated user account
 * Story 7.4: Deactivate User (AC 3)
 *
 * Flow:
 * 1. Check authentication
 * 2. Verify current user has admin/super_admin role
 * 3. Set is_active = true
 *
 * @param id - User ID to reactivate
 * @returns ActionResult with reactivated user or error
 */
export async function reactivateUser(id: string): Promise<ActionResult<User>> {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  // Verify current user has admin permissions
  const { data: currentUserProfile, error: profileError } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileError || !currentUserProfile?.role) {
    return { success: false, error: 'Failed to verify permissions' };
  }

  const currentRole = currentUserProfile.role as UserRole;
  if (currentRole !== 'admin' && currentRole !== 'super_admin') {
    return { success: false, error: 'Insufficient permissions' };
  }

  // Reactivate user
  const { data: updatedUser, error: updateError } = await supabase
    .from('users')
    .update({ is_active: true, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (updateError || !updatedUser) {
    return { success: false, error: 'Failed to reactivate user' };
  }

  revalidatePath('/admin/users');
  return { success: true, data: updatedUser };
}

/**
 * Get departments assigned to a manager
 * Story 7.6: Assign Manager Departments (AC 1)
 *
 * @param managerId - The manager's user ID
 * @returns ActionResult with array of DepartmentOption
 */
export async function getManagerDepartments(
  managerId: string
): Promise<ActionResult<DepartmentOption[]>> {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  const { data, error } = await supabase
    .from('manager_departments')
    .select('department:departments(id, name)')
    .eq('manager_id', managerId);

  if (error) {
    return { success: false, error: 'Failed to load departments' };
  }

  // Transform joined data - Supabase returns FK join as object at runtime
  const departments = (data ?? [])
    .map((d) => d.department as unknown as DepartmentOption)
    .filter(Boolean);

  return { success: true, data: departments };
}

/**
 * Update departments assigned to a manager
 * Story 7.6: Assign Manager Departments (AC 2, AC 3)
 *
 * Uses atomic delete + insert pattern for consistency
 *
 * @param managerId - The manager's user ID
 * @param departmentIds - Array of department IDs to assign
 * @returns ActionResult with updated DepartmentOption array
 */
export async function updateManagerDepartments(
  managerId: string,
  departmentIds: string[]
): Promise<ActionResult<DepartmentOption[]>> {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  // Verify current user has admin permissions
  const { data: currentUserProfile, error: profileError } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileError || !currentUserProfile?.role) {
    return { success: false, error: 'Failed to verify permissions' };
  }

  const currentRole = currentUserProfile.role as UserRole;
  if (currentRole !== 'admin' && currentRole !== 'super_admin') {
    return { success: false, error: 'Insufficient permissions' };
  }

  // Verify target user is a manager
  const { data: targetUser, error: targetError } = await supabase
    .from('users')
    .select('role')
    .eq('id', managerId)
    .single();

  if (targetError || !targetUser) {
    return { success: false, error: 'User not found' };
  }

  if (targetUser.role !== 'manager') {
    return { success: false, error: 'User is not a manager' };
  }

  // Atomic update: delete all existing assignments, then insert new ones
  const { error: deleteError } = await supabase
    .from('manager_departments')
    .delete()
    .eq('manager_id', managerId);

  if (deleteError) {
    return { success: false, error: 'Failed to update departments' };
  }

  // Insert new assignments (if any)
  if (departmentIds.length > 0) {
    const { error: insertError } = await supabase
      .from('manager_departments')
      .insert(
        departmentIds.map((deptId) => ({
          manager_id: managerId,
          department_id: deptId,
        }))
      );

    if (insertError) {
      return { success: false, error: 'Failed to save departments' };
    }
  }

  // Fetch updated departments for return
  const { data: updated } = await supabase
    .from('manager_departments')
    .select('department:departments(id, name)')
    .eq('manager_id', managerId);

  const departments = (updated ?? [])
    .map((d) => d.department as unknown as DepartmentOption)
    .filter(Boolean);

  revalidatePath('/admin/users');
  revalidatePath('/team');

  return { success: true, data: departments };
}
