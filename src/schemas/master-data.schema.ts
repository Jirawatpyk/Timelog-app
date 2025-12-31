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
 * UUID validation schema
 *
 * Validates that a string is a valid UUID format
 */
export const uuidSchema = z.string().uuid('Invalid ID format');
