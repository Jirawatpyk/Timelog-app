/**
 * User Validation Schemas
 * Story 7.2: Create New User
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
