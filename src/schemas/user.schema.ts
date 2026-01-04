/**
 * User Validation Schemas
 * Story 7.2: Create New User
 * Story 7.3: Edit User Information
 *
 * Zod schemas for validating user-related forms
 */

import { z } from 'zod';

/**
 * Create user validation schema
 *
 * Validates user creation with:
 * - Required email field (valid email format)
 * - Required display_name (min 2 characters)
 * - Required role (enum: staff, manager, admin, super_admin)
 * - Required department_id (valid UUID)
 */
export const createUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  displayName: z
    .string()
    .trim()
    .min(2, 'Display name must be at least 2 characters'),
  role: z.enum(['staff', 'manager', 'admin', 'super_admin']),
  departmentId: z.string().uuid('Please select a department'),
});

/**
 * Create user input type derived from schema
 */
export type CreateUserInput = z.infer<typeof createUserSchema>;

/**
 * Edit user validation schema
 * Story 7.3: Edit User Information
 *
 * Validates user editing with:
 * - Required email field (valid email format)
 * - Required display_name (min 2 characters)
 * - Required role (enum: staff, manager, admin, super_admin)
 * - Required department_id (valid UUID)
 *
 * Note: Same fields as createUserSchema for edit form consistency
 */
export const editUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  displayName: z
    .string()
    .trim()
    .min(2, 'Display name must be at least 2 characters'),
  role: z.enum(['staff', 'manager', 'admin', 'super_admin']),
  departmentId: z.string().uuid('Please select a department'),
});

/**
 * Edit user input type derived from schema
 */
export type EditUserInput = z.infer<typeof editUserSchema>;
