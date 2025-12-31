/**
 * Tests for Master Data Schemas
 * Story 3.1: Service Type Management (AC: 3)
 * Story 3.2: Client Management (AC: 3)
 */

import { describe, it, expect } from 'vitest';
import { serviceSchema, clientSchema, uuidSchema, type ServiceInput, type ClientInput } from './master-data.schema';

describe('serviceSchema', () => {
  describe('valid inputs', () => {
    it('accepts valid service name', () => {
      const input: ServiceInput = { name: 'Dubbing' };
      const result = serviceSchema.safeParse(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('Dubbing');
      }
    });

    it('accepts service name with spaces', () => {
      const input: ServiceInput = { name: 'Voice Over' };
      const result = serviceSchema.safeParse(input);

      expect(result.success).toBe(true);
    });

    it('accepts 100 character name (max length)', () => {
      const longName = 'A'.repeat(100);
      const input: ServiceInput = { name: longName };
      const result = serviceSchema.safeParse(input);

      expect(result.success).toBe(true);
    });

    it('trims whitespace from name', () => {
      const input: ServiceInput = { name: '  Subtitling  ' };
      const result = serviceSchema.safeParse(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('Subtitling');
      }
    });
  });

  describe('invalid inputs', () => {
    it('rejects empty string', () => {
      const input = { name: '' };
      const result = serviceSchema.safeParse(input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Service name is required');
      }
    });

    it('rejects whitespace-only string', () => {
      const input = { name: '   ' };
      const result = serviceSchema.safeParse(input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Service name is required');
      }
    });

    it('rejects name exceeding 100 characters', () => {
      const longName = 'A'.repeat(101);
      const input = { name: longName };
      const result = serviceSchema.safeParse(input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Service name must be 100 characters or less');
      }
    });

    it('rejects missing name field', () => {
      const input = {};
      const result = serviceSchema.safeParse(input);

      expect(result.success).toBe(false);
    });

    it('rejects non-string name', () => {
      const input = { name: 123 };
      const result = serviceSchema.safeParse(input);

      expect(result.success).toBe(false);
    });
  });
});

describe('uuidSchema', () => {
  it('accepts valid UUID v4', () => {
    const result = uuidSchema.safeParse('550e8400-e29b-41d4-a716-446655440000');
    expect(result.success).toBe(true);
  });

  it('accepts valid UUID v1', () => {
    const result = uuidSchema.safeParse('6ba7b810-9dad-11d1-80b4-00c04fd430c8');
    expect(result.success).toBe(true);
  });

  it('rejects empty string', () => {
    const result = uuidSchema.safeParse('');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe('Invalid ID format');
    }
  });

  it('rejects invalid UUID format', () => {
    const result = uuidSchema.safeParse('not-a-uuid');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe('Invalid ID format');
    }
  });

  it('rejects numeric string', () => {
    const result = uuidSchema.safeParse('12345');
    expect(result.success).toBe(false);
  });
});

/**
 * Client Schema Tests
 * Story 3.2: Client Management (AC: 3)
 */
describe('clientSchema', () => {
  describe('valid inputs', () => {
    it('accepts valid client name', () => {
      const input: ClientInput = { name: 'Netflix' };
      const result = clientSchema.safeParse(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('Netflix');
      }
    });

    it('accepts client name with spaces', () => {
      const input: ClientInput = { name: 'Disney Plus' };
      const result = clientSchema.safeParse(input);

      expect(result.success).toBe(true);
    });

    it('accepts 100 character name (max length)', () => {
      const longName = 'A'.repeat(100);
      const input: ClientInput = { name: longName };
      const result = clientSchema.safeParse(input);

      expect(result.success).toBe(true);
    });

    it('trims whitespace from name', () => {
      const input: ClientInput = { name: '  HBO Max  ' };
      const result = clientSchema.safeParse(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('HBO Max');
      }
    });
  });

  describe('invalid inputs', () => {
    it('rejects empty string', () => {
      const input = { name: '' };
      const result = clientSchema.safeParse(input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Client name is required');
      }
    });

    it('rejects whitespace-only string', () => {
      const input = { name: '   ' };
      const result = clientSchema.safeParse(input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Client name is required');
      }
    });

    it('rejects name exceeding 100 characters', () => {
      const longName = 'A'.repeat(101);
      const input = { name: longName };
      const result = clientSchema.safeParse(input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Client name must be 100 characters or less');
      }
    });

    it('rejects missing name field', () => {
      const input = {};
      const result = clientSchema.safeParse(input);

      expect(result.success).toBe(false);
    });

    it('rejects non-string name', () => {
      const input = { name: 123 };
      const result = clientSchema.safeParse(input);

      expect(result.success).toBe(false);
    });
  });
});
