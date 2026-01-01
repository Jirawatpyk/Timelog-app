import { describe, it, expect } from 'vitest';
import { cascadingSelectorsSchema, timeEntrySchema } from './time-entry.schema';

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

  it('rejects empty clientId', () => {
    const invalidData = {
      clientId: '',
      projectId: '550e8400-e29b-41d4-a716-446655440001',
      jobId: '550e8400-e29b-41d4-a716-446655440002',
    };

    const result = cascadingSelectorsSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Please select a client');
    }
  });

  it('rejects empty projectId', () => {
    const invalidData = {
      clientId: '550e8400-e29b-41d4-a716-446655440000',
      projectId: '',
      jobId: '550e8400-e29b-41d4-a716-446655440002',
    };

    const result = cascadingSelectorsSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Please select a project');
    }
  });

  it('rejects empty jobId', () => {
    const invalidData = {
      clientId: '550e8400-e29b-41d4-a716-446655440000',
      projectId: '550e8400-e29b-41d4-a716-446655440001',
      jobId: '',
    };

    const result = cascadingSelectorsSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Please select a job');
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

  it('rejects duration less than 1 minute', () => {
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

  it('rejects duration over 1440 minutes (24 hours)', () => {
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

  it('rejects notes over 500 characters', () => {
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

  it('rejects empty entryDate', () => {
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
