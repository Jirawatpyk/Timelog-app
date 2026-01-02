import { describe, it, expect } from 'vitest';
import {
  cascadingSelectorsSchema,
  timeEntrySchema,
  durationHoursSchema,
  timeEntryFormSchema,
  validateTimeEntry,
} from './time-entry.schema';

describe('cascadingSelectorsSchema', () => {
  it('validates valid UUIDs for all fields', () => {
    const validData = {
      clientId: '550e8400-e29b-41d4-a716-446655440000',
      projectId: '550e8400-e29b-41d4-a716-446655440001',
      jobId: '550e8400-e29b-41d4-a716-446655440002',
    };

    const result = cascadingSelectorsSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('rejects empty clientId with English message', () => {
    const invalidData = {
      clientId: '',
      projectId: '550e8400-e29b-41d4-a716-446655440001',
      jobId: '550e8400-e29b-41d4-a716-446655440002',
    };

    const result = cascadingSelectorsSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Please select a Client');
    }
  });

  it('rejects empty projectId with English message', () => {
    const invalidData = {
      clientId: '550e8400-e29b-41d4-a716-446655440000',
      projectId: '',
      jobId: '550e8400-e29b-41d4-a716-446655440002',
    };

    const result = cascadingSelectorsSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Please select a Project');
    }
  });

  it('rejects empty jobId with English message', () => {
    const invalidData = {
      clientId: '550e8400-e29b-41d4-a716-446655440000',
      projectId: '550e8400-e29b-41d4-a716-446655440001',
      jobId: '',
    };

    const result = cascadingSelectorsSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Please select a Job');
    }
  });

  it('rejects invalid UUID format', () => {
    const invalidData = {
      clientId: 'not-a-uuid',
      projectId: '550e8400-e29b-41d4-a716-446655440001',
      jobId: '550e8400-e29b-41d4-a716-446655440002',
    };

    const result = cascadingSelectorsSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});

describe('timeEntrySchema', () => {
  const validCascadingData = {
    clientId: '550e8400-e29b-41d4-a716-446655440000',
    projectId: '550e8400-e29b-41d4-a716-446655440001',
    jobId: '550e8400-e29b-41d4-a716-446655440002',
  };

  it('validates full time entry data', () => {
    const validData = {
      ...validCascadingData,
      serviceId: '550e8400-e29b-41d4-a716-446655440003',
      taskId: null,
      durationMinutes: 60,
      entryDate: '2025-01-01',
      notes: 'Test notes',
    };

    const result = timeEntrySchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('validates with optional taskId', () => {
    const validData = {
      ...validCascadingData,
      serviceId: '550e8400-e29b-41d4-a716-446655440003',
      taskId: '550e8400-e29b-41d4-a716-446655440004',
      durationMinutes: 60,
      entryDate: '2025-01-01',
    };

    const result = timeEntrySchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('rejects duration less than 1 minute with English message', () => {
    const invalidData = {
      ...validCascadingData,
      serviceId: '550e8400-e29b-41d4-a716-446655440003',
      durationMinutes: 0,
      entryDate: '2025-01-01',
    };

    const result = timeEntrySchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Duration must be at least 1 minute');
    }
  });

  it('rejects duration over 1440 minutes (24 hours) with English message', () => {
    const invalidData = {
      ...validCascadingData,
      serviceId: '550e8400-e29b-41d4-a716-446655440003',
      durationMinutes: 1441,
      entryDate: '2025-01-01',
    };

    const result = timeEntrySchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Duration cannot exceed 24 hours');
    }
  });

  it('rejects notes over 500 characters with English message', () => {
    const invalidData = {
      ...validCascadingData,
      serviceId: '550e8400-e29b-41d4-a716-446655440003',
      durationMinutes: 60,
      entryDate: '2025-01-01',
      notes: 'x'.repeat(501),
    };

    const result = timeEntrySchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Notes cannot exceed 500 characters');
    }
  });

  it('rejects empty entryDate with English message', () => {
    const invalidData = {
      ...validCascadingData,
      serviceId: '550e8400-e29b-41d4-a716-446655440003',
      durationMinutes: 60,
      entryDate: '',
    };

    const result = timeEntrySchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Please select a date');
    }
  });
});

describe('durationHoursSchema (Story 4.3 - AC6, Story 4.8)', () => {
  it('accepts valid 0.25 hour increments', () => {
    expect(durationHoursSchema.safeParse(0.25).success).toBe(true);
    expect(durationHoursSchema.safeParse(0.5).success).toBe(true);
    expect(durationHoursSchema.safeParse(0.75).success).toBe(true);
    expect(durationHoursSchema.safeParse(1).success).toBe(true);
    expect(durationHoursSchema.safeParse(1.5).success).toBe(true);
    expect(durationHoursSchema.safeParse(2).success).toBe(true);
    expect(durationHoursSchema.safeParse(8).success).toBe(true);
    expect(durationHoursSchema.safeParse(24).success).toBe(true);
  });

  it('rejects values less than 0.25 with English message', () => {
    const result = durationHoursSchema.safeParse(0);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Duration must be at least 15 minutes (0.25 hours)');
    }
  });

  it('rejects values greater than 24 with English message', () => {
    const result = durationHoursSchema.safeParse(25);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Duration cannot exceed 24 hours');
    }
  });

  it('rejects invalid increments with English error message', () => {
    const result = durationHoursSchema.safeParse(1.3);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Duration must be in 15-minute increments (0.25, 0.5, 0.75...)');
    }
  });

  it('rejects negative values', () => {
    const result = durationHoursSchema.safeParse(-1);
    expect(result.success).toBe(false);
  });
});

describe('timeEntryFormSchema (Story 4.3, Story 4.8)', () => {
  const validCascadingData = {
    clientId: '550e8400-e29b-41d4-a716-446655440000',
    projectId: '550e8400-e29b-41d4-a716-446655440001',
    jobId: '550e8400-e29b-41d4-a716-446655440002',
  };

  it('validates complete form data with hours', () => {
    const validData = {
      ...validCascadingData,
      serviceId: '550e8400-e29b-41d4-a716-446655440003',
      taskId: null,
      durationHours: 1.5,
      entryDate: '2025-01-01',
      notes: 'Test notes',
    };

    const result = timeEntryFormSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('validates with optional taskId', () => {
    const validData = {
      ...validCascadingData,
      serviceId: '550e8400-e29b-41d4-a716-446655440003',
      taskId: '550e8400-e29b-41d4-a716-446655440004',
      durationHours: 2,
      entryDate: '2025-01-01',
    };

    const result = timeEntryFormSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('rejects missing serviceId with English message', () => {
    const invalidData = {
      ...validCascadingData,
      serviceId: '',
      durationHours: 1,
      entryDate: '2025-01-01',
    };

    const result = timeEntryFormSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Please select a Service');
    }
  });

  it('rejects invalid duration hours', () => {
    const invalidData = {
      ...validCascadingData,
      serviceId: '550e8400-e29b-41d4-a716-446655440003',
      durationHours: 0.1, // Invalid increment
      entryDate: '2025-01-01',
    };

    const result = timeEntryFormSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('rejects empty entryDate with English message', () => {
    const invalidData = {
      ...validCascadingData,
      serviceId: '550e8400-e29b-41d4-a716-446655440003',
      durationHours: 1,
      entryDate: '',
    };

    const result = timeEntryFormSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Please select a date');
    }
  });

  it('rejects notes over 500 characters with English message', () => {
    const invalidData = {
      ...validCascadingData,
      serviceId: '550e8400-e29b-41d4-a716-446655440003',
      durationHours: 1,
      entryDate: '2025-01-01',
      notes: 'x'.repeat(501),
    };

    const result = timeEntryFormSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Notes cannot exceed 500 characters');
    }
  });
});

describe('validateTimeEntry helper (Story 4.8)', () => {
  it('returns success for valid data', () => {
    const validData = {
      clientId: '550e8400-e29b-41d4-a716-446655440000',
      projectId: '550e8400-e29b-41d4-a716-446655440001',
      jobId: '550e8400-e29b-41d4-a716-446655440002',
      serviceId: '550e8400-e29b-41d4-a716-446655440003',
      taskId: null,
      durationHours: 1.5,
      entryDate: '2025-01-01',
    };

    const result = validateTimeEntry(validData);
    expect(result.success).toBe(true);
  });

  it('returns error for invalid data', () => {
    const invalidData = {
      clientId: '',
      projectId: '',
      jobId: '',
      serviceId: '',
      durationHours: 0,
      entryDate: '',
    };

    const result = validateTimeEntry(invalidData);
    expect(result.success).toBe(false);
  });
});
