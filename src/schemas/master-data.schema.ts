/**
 * Master Data Validation Schemas
 * Story 3.1: Service Type Management (AC: 3)
 *
 * Zod schemas for validating master data entities (services, clients, tasks)
 */

import { z } from 'zod';

/**
 * Service validation schema
 *
 * Validates service input with:
 * - Required name field
 * - Max 100 characters
 * - Automatic whitespace trimming
 */
export const serviceSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Service name is required')
    .max(100, 'Service name must be 100 characters or less'),
});

/**
 * Service input type derived from schema
 */
export type ServiceInput = z.infer<typeof serviceSchema>;

/**
 * Client validation schema
 * Story 3.2: Client Management (AC: 3)
 *
 * Validates client input with:
 * - Required name field
 * - Max 100 characters
 * - Automatic whitespace trimming
 */
export const clientSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Client name is required')
    .max(100, 'Client name must be 100 characters or less'),
});

/**
 * Client input type derived from schema
 */
export type ClientInput = z.infer<typeof clientSchema>;

/**
 * Task validation schema
 * Story 3.3: Task Management (AC: 3)
 *
 * Validates task input with:
 * - Required name field
 * - Max 100 characters
 * - Automatic whitespace trimming
 */
export const taskSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Task name is required')
    .max(100, 'Task name must be 100 characters or less'),
});

/**
 * Task input type derived from schema
 */
export type TaskInput = z.infer<typeof taskSchema>;

/**
 * UUID validation schema
 *
 * Validates that a string is a valid UUID format
 */
export const uuidSchema = z.string().uuid('Invalid ID format');

// ============================================================================
// Project Schemas
// Story 3.6: Projects & Jobs Admin UI (AC: 2, 3)
// ============================================================================

/**
 * Create project validation schema
 *
 * Validates project creation with:
 * - Required client_id (UUID)
 * - Required name field
 * - Max 100 characters
 * - Automatic whitespace trimming
 */
export const createProjectSchema = z.object({
  clientId: z.string().uuid('Please select a client'),
  name: z
    .string()
    .trim()
    .min(1, 'Project name is required')
    .max(100, 'Project name must be 100 characters or less'),
});

/**
 * Create project input type
 */
export type CreateProjectInput = z.infer<typeof createProjectSchema>;

/**
 * Update project validation schema
 *
 * Only name can be updated (client is read-only)
 */
export const updateProjectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Project name is required')
    .max(100, 'Project name must be 100 characters or less'),
});

/**
 * Update project input type
 */
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;

// ============================================================================
// Job Schemas
// Story 3.6: Projects & Jobs Admin UI (AC: 6, 7)
// ============================================================================

/**
 * Create job validation schema
 *
 * Validates job creation with:
 * - Required project_id (UUID)
 * - Required name field
 * - Optional job_no and so_no
 */
export const createJobSchema = z.object({
  projectId: z.string().uuid('Please select a project'),
  name: z
    .string()
    .trim()
    .min(1, 'Job name is required')
    .max(100, 'Job name must be 100 characters or less'),
  jobNo: z
    .string()
    .trim()
    .max(50, 'Job No must be 50 characters or less')
    .nullish()
    .transform((val) => val || null),
  soNo: z
    .string()
    .trim()
    .max(50, 'SO No must be 50 characters or less')
    .nullish()
    .transform((val) => val || null),
});

/**
 * Create job input type
 */
export type CreateJobInput = z.infer<typeof createJobSchema>;

/**
 * Update job validation schema
 *
 * Name, Job No, SO No can be updated (project is read-only)
 */
export const updateJobSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Job name is required')
    .max(100, 'Job name must be 100 characters or less'),
  jobNo: z
    .string()
    .trim()
    .max(50, 'Job No must be 50 characters or less')
    .nullish()
    .transform((val) => val || null),
  soNo: z
    .string()
    .trim()
    .max(50, 'SO No must be 50 characters or less')
    .nullish()
    .transform((val) => val || null),
});

/**
 * Update job input type
 */
export type UpdateJobInput = z.infer<typeof updateJobSchema>;

// ============================================================================
// Department Schema
// Story 3.7: Department Management (AC: 4, 7)
// ============================================================================

/**
 * Department validation schema
 *
 * Validates department input with:
 * - Required name field
 * - Min 2 characters
 * - Max 100 characters
 * - Automatic whitespace trimming
 */
export const departmentSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Department name must be at least 2 characters')
    .max(100, 'Department name must be 100 characters or less'),
});

/**
 * Department input type derived from schema
 */
export type DepartmentInput = z.infer<typeof departmentSchema>;
