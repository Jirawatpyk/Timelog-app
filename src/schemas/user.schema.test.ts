/**
 * User Schema Tests
 * Story 7.2: Create New User
 *
 * Tests for user form validation schemas
 */

import { describe, expect, it } from 'vitest';
import {
  createUserSchema,
  editUserSchema,
  type CreateUserInput,
  type EditUserInput,
} from './user.schema';

describe('createUserSchema', () => {
  // Valid input for baseline
  const validInput: CreateUserInput = {
    email: 'test@example.com',
    displayName: 'Test User',
    role: 'staff',
    departmentId: '550e8400-e29b-41d4-a716-446655440000',
  };

  describe('email validation', () => {
    it('accepts valid email format', () => {
      const result = createUserSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('rejects invalid email format', () => {
      const result = createUserSchema.safeParse({
        ...validInput,
        email: 'invalid-email',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Invalid email format');
      }
    });

    it('rejects empty email', () => {
      const result = createUserSchema.safeParse({
        ...validInput,
        email: '',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('displayName validation', () => {
    it('accepts valid display name', () => {
      const result = createUserSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('rejects display name with less than 2 characters', () => {
      const result = createUserSchema.safeParse({
        ...validInput,
        displayName: 'A',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe(
          'Display name must be at least 2 characters'
        );
      }
    });

    it('rejects empty display name', () => {
      const result = createUserSchema.safeParse({
        ...validInput,
        displayName: '',
      });
      expect(result.success).toBe(false);
    });

    it('trims whitespace from display name', () => {
      const result = createUserSchema.safeParse({
        ...validInput,
        displayName: '  Test User  ',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.displayName).toBe('Test User');
      }
    });
  });

  describe('role validation', () => {
    it('accepts staff role', () => {
      const result = createUserSchema.safeParse({
        ...validInput,
        role: 'staff',
      });
      expect(result.success).toBe(true);
    });

    it('accepts manager role', () => {
      const result = createUserSchema.safeParse({
        ...validInput,
        role: 'manager',
      });
      expect(result.success).toBe(true);
    });

    it('accepts admin role', () => {
      const result = createUserSchema.safeParse({
        ...validInput,
        role: 'admin',
      });
      expect(result.success).toBe(true);
    });

    it('accepts super_admin role', () => {
      const result = createUserSchema.safeParse({
        ...validInput,
        role: 'super_admin',
      });
      expect(result.success).toBe(true);
    });

    it('rejects invalid role', () => {
      const result = createUserSchema.safeParse({
        ...validInput,
        role: 'invalid_role',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('departmentId validation', () => {
    it('accepts valid UUID', () => {
      const result = createUserSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('rejects invalid UUID format', () => {
      const result = createUserSchema.safeParse({
        ...validInput,
        departmentId: 'not-a-uuid',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Please select a department');
      }
    });

    it('rejects empty departmentId', () => {
      const result = createUserSchema.safeParse({
        ...validInput,
        departmentId: '',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('complete validation', () => {
    it('returns all fields when valid', () => {
      const result = createUserSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validInput);
      }
    });

    it('rejects missing required fields', () => {
      const result = createUserSchema.safeParse({});
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors.length).toBeGreaterThan(0);
      }
    });
  });
});

/**
 * Story 7.3: Edit User Information
 * Tests for edit user form validation schema
 */
describe('editUserSchema', () => {
  // Valid input for baseline
  const validInput: EditUserInput = {
    email: 'test@example.com',
    displayName: 'Test User',
    role: 'staff',
    departmentId: '550e8400-e29b-41d4-a716-446655440000',
  };

  describe('email validation', () => {
    it('accepts valid email format', () => {
      const result = editUserSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('rejects invalid email format', () => {
      const result = editUserSchema.safeParse({
        ...validInput,
        email: 'invalid-email',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Invalid email format');
      }
    });

    it('rejects empty email', () => {
      const result = editUserSchema.safeParse({
        ...validInput,
        email: '',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('displayName validation', () => {
    it('accepts valid display name', () => {
      const result = editUserSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('rejects display name with less than 2 characters', () => {
      const result = editUserSchema.safeParse({
        ...validInput,
        displayName: 'A',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe(
          'Display name must be at least 2 characters'
        );
      }
    });

    it('rejects empty display name', () => {
      const result = editUserSchema.safeParse({
        ...validInput,
        displayName: '',
      });
      expect(result.success).toBe(false);
    });

    it('trims whitespace from display name', () => {
      const result = editUserSchema.safeParse({
        ...validInput,
        displayName: '  Test User  ',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.displayName).toBe('Test User');
      }
    });
  });

  describe('role validation', () => {
    it('accepts staff role', () => {
      const result = editUserSchema.safeParse({
        ...validInput,
        role: 'staff',
      });
      expect(result.success).toBe(true);
    });

    it('accepts manager role', () => {
      const result = editUserSchema.safeParse({
        ...validInput,
        role: 'manager',
      });
      expect(result.success).toBe(true);
    });

    it('accepts admin role', () => {
      const result = editUserSchema.safeParse({
        ...validInput,
        role: 'admin',
      });
      expect(result.success).toBe(true);
    });

    it('accepts super_admin role', () => {
      const result = editUserSchema.safeParse({
        ...validInput,
        role: 'super_admin',
      });
      expect(result.success).toBe(true);
    });

    it('rejects invalid role', () => {
      const result = editUserSchema.safeParse({
        ...validInput,
        role: 'invalid_role',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('departmentId validation', () => {
    it('accepts valid UUID', () => {
      const result = editUserSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('rejects invalid UUID format', () => {
      const result = editUserSchema.safeParse({
        ...validInput,
        departmentId: 'not-a-uuid',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Please select a department');
      }
    });

    it('rejects empty departmentId', () => {
      const result = editUserSchema.safeParse({
        ...validInput,
        departmentId: '',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('complete validation', () => {
    it('returns all fields when valid', () => {
      const result = editUserSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validInput);
      }
    });

    it('rejects missing required fields', () => {
      const result = editUserSchema.safeParse({});
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors.length).toBeGreaterThan(0);
      }
    });
  });
});
