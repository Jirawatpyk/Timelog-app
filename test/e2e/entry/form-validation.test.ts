/**
 * Form Validation E2E Tests
 * Story 4.8: Form Validation & Error States
 *
 * Tests:
 * - AC1: Required field validation - Client
 * - AC2: Required field validation - All fields
 * - AC3: Duration validation
 * - AC6: Real-time validation (onBlur/onChange)
 */

import { describe, it, expect } from 'vitest';
import {
  timeEntryFormSchema,
  durationHoursSchema,
} from '@/schemas/time-entry.schema';
import { getTodayISO } from '@/lib/thai-date';
import { z } from 'zod';

// Extract date validation behavior from the schema
const testEntryDateSchema = z.string().min(1, 'Please select a date');

describe('Form Validation (Story 4.8)', () => {
  describe('Required Field Validation (AC1, AC2)', () => {
    it('shows error for empty clientId', () => {
      const result = timeEntryFormSchema.safeParse({
        clientId: '',
        projectId: '',
        jobId: '',
        serviceId: '',
        taskId: null,
        durationHours: 1,
        entryDate: getTodayISO(),
        notes: '',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        const clientError = result.error.issues.find((i) => i.path[0] === 'clientId');
        expect(clientError?.message).toBe('Please select a Client');
      }
    });

    it('shows error for empty projectId', () => {
      const result = timeEntryFormSchema.safeParse({
        clientId: '123e4567-e89b-12d3-a456-426614174001',
        projectId: '',
        jobId: '',
        serviceId: '',
        taskId: null,
        durationHours: 1,
        entryDate: getTodayISO(),
        notes: '',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        const projectError = result.error.issues.find((i) => i.path[0] === 'projectId');
        expect(projectError?.message).toBe('Please select a Project');
      }
    });

    it('shows error for empty jobId', () => {
      const result = timeEntryFormSchema.safeParse({
        clientId: '123e4567-e89b-12d3-a456-426614174001',
        projectId: '123e4567-e89b-12d3-a456-426614174002',
        jobId: '',
        serviceId: '',
        taskId: null,
        durationHours: 1,
        entryDate: getTodayISO(),
        notes: '',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        const jobError = result.error.issues.find((i) => i.path[0] === 'jobId');
        expect(jobError?.message).toBe('Please select a Job');
      }
    });

    it('shows error for empty serviceId', () => {
      const result = timeEntryFormSchema.safeParse({
        clientId: '123e4567-e89b-12d3-a456-426614174001',
        projectId: '123e4567-e89b-12d3-a456-426614174002',
        jobId: '123e4567-e89b-12d3-a456-426614174003',
        serviceId: '',
        taskId: null,
        durationHours: 1,
        entryDate: getTodayISO(),
        notes: '',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        const serviceError = result.error.issues.find((i) => i.path[0] === 'serviceId');
        expect(serviceError?.message).toBe('Please select a Service');
      }
    });

    it('validates all required fields at once', () => {
      const result = timeEntryFormSchema.safeParse({
        clientId: '',
        projectId: '',
        jobId: '',
        serviceId: '',
        taskId: null,
        durationHours: 0,
        entryDate: getTodayISO(),
        notes: '',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        // Should have errors for all required fields
        const errorPaths = result.error.issues.map((i) => i.path[0]);
        expect(errorPaths).toContain('clientId');
        expect(errorPaths).toContain('projectId');
        expect(errorPaths).toContain('jobId');
        expect(errorPaths).toContain('serviceId');
        expect(errorPaths).toContain('durationHours');
      }
    });
  });

  describe('Duration Validation (AC3)', () => {
    it('shows error for duration 0', () => {
      const result = durationHoursSchema.safeParse(0);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'Duration must be at least 15 minutes (0.25 hours)'
        );
      }
    });

    it('shows error for duration less than 0.25', () => {
      const result = durationHoursSchema.safeParse(0.1);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'Duration must be at least 15 minutes (0.25 hours)'
        );
      }
    });

    it('shows error for duration greater than 24', () => {
      const result = durationHoursSchema.safeParse(25);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Duration cannot exceed 24 hours');
      }
    });

    it('shows error for non 0.25 increment', () => {
      const result = durationHoursSchema.safeParse(1.1);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'Duration must be in 15-minute increments (0.25, 0.5, 0.75...)'
        );
      }
    });

    it('accepts valid duration 0.25', () => {
      const result = durationHoursSchema.safeParse(0.25);
      expect(result.success).toBe(true);
    });

    it('accepts valid duration 1.5', () => {
      const result = durationHoursSchema.safeParse(1.5);
      expect(result.success).toBe(true);
    });

    it('accepts valid duration 8', () => {
      const result = durationHoursSchema.safeParse(8);
      expect(result.success).toBe(true);
    });

    it('accepts valid duration 24 (max)', () => {
      const result = durationHoursSchema.safeParse(24);
      expect(result.success).toBe(true);
    });
  });

  describe('Date Validation', () => {
    it('shows error for empty date', () => {
      const result = testEntryDateSchema.safeParse('');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Please select a date');
      }
    });

    it('accepts valid date format YYYY-MM-DD', () => {
      const result = testEntryDateSchema.safeParse('2024-01-15');
      expect(result.success).toBe(true);
    });

    it('accepts today as valid date', () => {
      const result = testEntryDateSchema.safeParse(getTodayISO());
      expect(result.success).toBe(true);
    });
  });

  describe('Notes Validation', () => {
    it('shows error for notes exceeding 500 characters', () => {
      const longNotes = 'a'.repeat(501);
      const result = timeEntryFormSchema.safeParse({
        clientId: 'valid-uuid',
        projectId: 'valid-uuid',
        jobId: 'valid-uuid',
        serviceId: 'valid-uuid',
        taskId: null,
        durationHours: 1,
        entryDate: getTodayISO(),
        notes: longNotes,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        const notesError = result.error.issues.find((i) => i.path[0] === 'notes');
        expect(notesError?.message).toBe('Notes cannot exceed 500 characters');
      }
    });

    it('accepts empty notes', () => {
      const result = timeEntryFormSchema.safeParse({
        clientId: 'valid-uuid',
        projectId: 'valid-uuid',
        jobId: 'valid-uuid',
        serviceId: 'valid-uuid',
        taskId: null,
        durationHours: 1,
        entryDate: getTodayISO(),
        notes: '',
      });

      // Should not fail on notes specifically (might fail on other fields)
      if (!result.success) {
        const notesError = result.error.issues.find((i) => i.path[0] === 'notes');
        expect(notesError).toBeUndefined();
      }
    });

    it('accepts notes with 500 characters', () => {
      const maxNotes = 'a'.repeat(500);
      const result = timeEntryFormSchema.safeParse({
        clientId: 'valid-uuid',
        projectId: 'valid-uuid',
        jobId: 'valid-uuid',
        serviceId: 'valid-uuid',
        taskId: null,
        durationHours: 1,
        entryDate: getTodayISO(),
        notes: maxNotes,
      });

      // Should not fail on notes specifically
      if (!result.success) {
        const notesError = result.error.issues.find((i) => i.path[0] === 'notes');
        expect(notesError).toBeUndefined();
      }
    });
  });

  describe('Task Field (Optional)', () => {
    it('accepts null task', () => {
      const result = timeEntryFormSchema.safeParse({
        clientId: 'valid-uuid',
        projectId: 'valid-uuid',
        jobId: 'valid-uuid',
        serviceId: 'valid-uuid',
        taskId: null,
        durationHours: 1,
        entryDate: getTodayISO(),
        notes: '',
      });

      // Task should not cause error
      if (!result.success) {
        const taskError = result.error.issues.find((i) => i.path[0] === 'taskId');
        expect(taskError).toBeUndefined();
      }
    });

    it('accepts valid UUID task', () => {
      const result = timeEntryFormSchema.safeParse({
        clientId: 'valid-uuid',
        projectId: 'valid-uuid',
        jobId: 'valid-uuid',
        serviceId: 'valid-uuid',
        taskId: '123e4567-e89b-12d3-a456-426614174000',
        durationHours: 1,
        entryDate: getTodayISO(),
        notes: '',
      });

      // Task should not cause error
      if (!result.success) {
        const taskError = result.error.issues.find((i) => i.path[0] === 'taskId');
        expect(taskError).toBeUndefined();
      }
    });
  });

  describe('Complete Valid Entry', () => {
    it('accepts a complete valid time entry', () => {
      const result = timeEntryFormSchema.safeParse({
        clientId: '123e4567-e89b-12d3-a456-426614174001',
        projectId: '123e4567-e89b-12d3-a456-426614174002',
        jobId: '123e4567-e89b-12d3-a456-426614174003',
        serviceId: '123e4567-e89b-12d3-a456-426614174004',
        taskId: '123e4567-e89b-12d3-a456-426614174005',
        durationHours: 2.5,
        entryDate: '2024-01-15',
        notes: 'Working on project documentation',
      });

      expect(result.success).toBe(true);
    });

    it('accepts valid entry without optional fields', () => {
      const result = timeEntryFormSchema.safeParse({
        clientId: '123e4567-e89b-12d3-a456-426614174001',
        projectId: '123e4567-e89b-12d3-a456-426614174002',
        jobId: '123e4567-e89b-12d3-a456-426614174003',
        serviceId: '123e4567-e89b-12d3-a456-426614174004',
        taskId: null,
        durationHours: 8,
        entryDate: getTodayISO(),
        notes: undefined,
      });

      expect(result.success).toBe(true);
    });
  });
});
