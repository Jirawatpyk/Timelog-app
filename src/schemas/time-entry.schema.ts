import { z } from 'zod';

/**
 * Cascading selectors schema (Client → Project → Job)
 * Used in Story 4.2 for validation of the cascading dropdowns
 * Story 4.8: Updated with English error messages
 */
export const cascadingSelectorsSchema = z.object({
  clientId: z.string().uuid('Please select a Client'),
  projectId: z.string().uuid('Please select a Project'),
  jobId: z.string().uuid('Please select a Job'),
});

/**
 * Duration in hours schema (for form input)
 * Story 4.3 - AC6: 0.25-24 hours in 0.25 increments
 * Story 4.8: Updated with English error messages
 */
export const durationHoursSchema = z
  .number({
    required_error: 'Please enter duration',
    invalid_type_error: 'Please enter a valid number',
  })
  .min(0.25, 'Duration must be at least 15 minutes (0.25 hours)')
  .max(24, 'Duration cannot exceed 24 hours')
  .refine(
    (val) => val * 4 === Math.round(val * 4),
    'Duration must be in 15-minute increments (0.25, 0.5, 0.75...)'
  );

/**
 * Full time entry schema (for API/database submission)
 * - Story 4.2: clientId, projectId, jobId (cascading selectors)
 * - Story 4.3: serviceId, taskId, durationMinutes
 * - Story 4.4: entryDate, notes, submission
 * Story 4.8: Updated with English error messages
 */
export const timeEntrySchema = cascadingSelectorsSchema.extend({
  serviceId: z.string().uuid('Please select a Service'),
  taskId: z.string().uuid().nullable().optional(),
  durationMinutes: z.number().int().min(1, 'Duration must be at least 1 minute').max(1440, 'Duration cannot exceed 24 hours'),
  entryDate: z.string().min(1, 'Please select a date'),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
});

/**
 * Time entry form schema (uses hours for user input)
 * Story 4.3: For form validation before converting to minutes
 * Story 4.8: Updated with English error messages
 */
export const timeEntryFormSchema = cascadingSelectorsSchema.extend({
  serviceId: z.string().uuid('Please select a Service'),
  taskId: z.string().uuid().nullable().optional(),
  durationHours: durationHoursSchema,
  entryDate: z.string().min(1, 'Please select a date'),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
});

/**
 * Validation helper for pre-submit check
 * Story 4.8: Helper for form validation
 */
export function validateTimeEntry(data: unknown) {
  return timeEntryFormSchema.safeParse(data);
}

export type CascadingSelectorsInput = z.infer<typeof cascadingSelectorsSchema>;
export type TimeEntryInput = z.infer<typeof timeEntrySchema>;
export type TimeEntryFormInput = z.infer<typeof timeEntryFormSchema>;
export type DurationHoursInput = z.infer<typeof durationHoursSchema>;
