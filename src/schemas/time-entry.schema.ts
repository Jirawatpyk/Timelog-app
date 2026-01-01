import { z } from 'zod';

/**
 * Cascading selectors schema (Client → Project → Job)
 * Used in Story 4.2 for validation of the cascading dropdowns
 */
export const cascadingSelectorsSchema = z.object({
  clientId: z.string().uuid('Please select a client'),
  projectId: z.string().uuid('Please select a project'),
  jobId: z.string().uuid('Please select a job'),
});

/**
 * Full time entry schema
 * - Story 4.2: clientId, projectId, jobId (cascading selectors)
 * - Story 4.3: serviceId, taskId, durationMinutes
 * - Story 4.4: entryDate, notes, submission
 */
export const timeEntrySchema = cascadingSelectorsSchema.extend({
  serviceId: z.string().uuid('Please select a service'),
  taskId: z.string().uuid().nullable().optional(),
  durationMinutes: z.number().int().min(1, 'Duration must be at least 1 minute').max(1440, 'Duration cannot exceed 24 hours'),
  entryDate: z.string().min(1, 'Please select a date'),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
});

export type CascadingSelectorsInput = z.infer<typeof cascadingSelectorsSchema>;
export type TimeEntryInput = z.infer<typeof timeEntrySchema>;
