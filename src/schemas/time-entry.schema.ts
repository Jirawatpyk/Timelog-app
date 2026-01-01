import { z } from 'zod';

/**
 * Cascading selectors schema (Client → Project → Job)
 * Used in Story 4.2 for validation of the cascading dropdowns
 * Note: Using Thai error messages for consistency (see timeEntryFormSchema)
 */
export const cascadingSelectorsSchema = z.object({
  clientId: z.string().uuid('กรุณาเลือก Client'),
  projectId: z.string().uuid('กรุณาเลือก Project'),
  jobId: z.string().uuid('กรุณาเลือก Job'),
});

/**
 * Duration in hours schema (for form input)
 * Story 4.3 - AC6: 0.25-24 hours in 0.25 increments
 */
export const durationHoursSchema = z
  .number()
  .min(0.25, 'กรุณาใส่เวลาอย่างน้อย 0.25 ชั่วโมง')
  .max(24, 'กรุณาใส่เวลาไม่เกิน 24 ชั่วโมง')
  .refine(
    (val) => val * 4 === Math.round(val * 4),
    'กรุณาใส่เวลาเป็นช่วง 15 นาที (0.25 ชั่วโมง)'
  );

/**
 * Full time entry schema (for API/database submission)
 * - Story 4.2: clientId, projectId, jobId (cascading selectors)
 * - Story 4.3: serviceId, taskId, durationMinutes
 * - Story 4.4: entryDate, notes, submission
 * Note: Using Thai error messages for consistency
 */
export const timeEntrySchema = cascadingSelectorsSchema.extend({
  serviceId: z.string().uuid('กรุณาเลือก Service'),
  taskId: z.string().uuid().nullable().optional(),
  durationMinutes: z.number().int().min(1, 'กรุณาใส่เวลาอย่างน้อย 1 นาที').max(1440, 'กรุณาใส่เวลาไม่เกิน 24 ชั่วโมง'),
  entryDate: z.string().min(1, 'กรุณาเลือกวันที่'),
  notes: z.string().max(500, 'หมายเหตุต้องไม่เกิน 500 ตัวอักษร').optional(),
});

/**
 * Time entry form schema (uses hours for user input)
 * Story 4.3: For form validation before converting to minutes
 */
export const timeEntryFormSchema = cascadingSelectorsSchema.extend({
  serviceId: z.string().uuid('กรุณาเลือก Service'),
  taskId: z.string().uuid().nullable().optional(),
  durationHours: durationHoursSchema,
  entryDate: z.string().min(1, 'กรุณาเลือกวันที่'),
  notes: z.string().max(500, 'หมายเหตุต้องไม่เกิน 500 ตัวอักษร').optional(),
});

export type CascadingSelectorsInput = z.infer<typeof cascadingSelectorsSchema>;
export type TimeEntryInput = z.infer<typeof timeEntrySchema>;
export type TimeEntryFormInput = z.infer<typeof timeEntryFormSchema>;
export type DurationHoursInput = z.infer<typeof durationHoursSchema>;
