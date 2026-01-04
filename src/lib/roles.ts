/**
 * Role Helper Functions
 * Story 7.5: Assign Roles (Task 1)
 *
 * Provides role hierarchy definitions and helper functions for role assignment.
 */

/**
 * Role hierarchy with display labels and levels
 * Higher level = more permissions
 */
export const ROLE_HIERARCHY = {
  staff: { label: 'Staff', level: 1 },
  manager: { label: 'Manager', level: 2 },
  admin: { label: 'Admin', level: 3 },
  super_admin: { label: 'Super Admin', level: 4 },
} as const;

/**
 * Role key type derived from ROLE_HIERARCHY
 */
export type RoleKey = keyof typeof ROLE_HIERARCHY;

/**
 * Role option for select dropdown
 */
export interface RoleOption {
  value: RoleKey;
  label: string;
}

/**
 * Get available role options based on current user's role
 *
 * - Admin users can only see/assign: staff, manager, admin
 * - Super Admin users can see/assign all roles including super_admin
 *
 * @param currentUserRole - The role of the current user making the assignment
 * @returns Array of role options available for selection
 */
export function getRoleOptions(currentUserRole: RoleKey): RoleOption[] {
  const options: RoleOption[] = [
    { value: 'staff', label: 'Staff' },
    { value: 'manager', label: 'Manager' },
    { value: 'admin', label: 'Admin' },
  ];

  if (currentUserRole === 'super_admin') {
    options.push({ value: 'super_admin', label: 'Super Admin' });
  }

  return options;
}

/**
 * Check if current user can assign a target role
 *
 * Only super_admin can assign the super_admin role.
 * All other roles can be assigned by admin or higher.
 *
 * @param currentUserRole - The role of the current user
 * @param targetRole - The role to be assigned
 * @returns true if the assignment is allowed
 */
export function canAssignRole(currentUserRole: RoleKey, targetRole: RoleKey): boolean {
  if (targetRole === 'super_admin' && currentUserRole !== 'super_admin') {
    return false;
  }
  return true;
}

/**
 * Get the numeric level for a role
 *
 * Note: Currently used for testing/validation. May be used in future stories
 * for role comparison operations (e.g., "can user A edit user B based on roles").
 *
 * @param role - The role key
 * @returns The numeric level (1-4)
 */
export function getRoleLevel(role: RoleKey): number {
  return ROLE_HIERARCHY[role].level;
}
