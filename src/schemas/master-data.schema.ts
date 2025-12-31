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
 * UUID validation schema
 *
 * Validates that a string is a valid UUID format
 */
export const uuidSchema = z.string().uuid('Invalid ID format');
