import { describe, it, expect } from 'vitest';
import { loginSchema, type LoginInput } from './auth.schema';

describe('loginSchema', () => {
  describe('valid inputs', () => {
    it('should accept valid email and password', () => {
      const input: LoginInput = {
        email: 'user@company.com',
        password: 'password123',
      };

      const result = loginSchema.safeParse(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('user@company.com');
        expect(result.data.password).toBe('password123');
      }
    });

    it('should accept email with subdomain', () => {
      const input: LoginInput = {
        email: 'user@mail.company.com',
        password: 'test',
      };

      const result = loginSchema.safeParse(input);

      expect(result.success).toBe(true);
    });
  });

  describe('email validation (AC6)', () => {
    it('should reject empty email', () => {
      const input = {
        email: '',
        password: 'password123',
      };

      const result = loginSchema.safeParse(input);

      expect(result.success).toBe(false);
      if (!result.success) {
        const emailError = result.error.issues.find(e => e.path[0] === 'email');
        expect(emailError?.message).toBe('Email is required');
      }
    });

    it('should reject invalid email format - missing @', () => {
      const input = {
        email: 'usercompany.com',
        password: 'password123',
      };

      const result = loginSchema.safeParse(input);

      expect(result.success).toBe(false);
      if (!result.success) {
        const emailError = result.error.issues.find(e => e.path[0] === 'email');
        expect(emailError?.message).toBe('Please enter a valid email');
      }
    });

    it('should reject invalid email format - missing domain', () => {
      const input = {
        email: 'user@',
        password: 'password123',
      };

      const result = loginSchema.safeParse(input);

      expect(result.success).toBe(false);
      if (!result.success) {
        const emailError = result.error.issues.find(e => e.path[0] === 'email');
        expect(emailError?.message).toBe('Please enter a valid email');
      }
    });

    it('should reject invalid email format - spaces', () => {
      const input = {
        email: 'user @company.com',
        password: 'password123',
      };

      const result = loginSchema.safeParse(input);

      expect(result.success).toBe(false);
    });
  });

  describe('password validation (AC7)', () => {
    it('should reject empty password', () => {
      const input = {
        email: 'user@company.com',
        password: '',
      };

      const result = loginSchema.safeParse(input);

      expect(result.success).toBe(false);
      if (!result.success) {
        const passwordError = result.error.issues.find(e => e.path[0] === 'password');
        expect(passwordError?.message).toBe('Password is required');
      }
    });

    it('should accept any non-empty password', () => {
      const input: LoginInput = {
        email: 'user@company.com',
        password: 'a',
      };

      const result = loginSchema.safeParse(input);

      expect(result.success).toBe(true);
    });
  });

  describe('multiple validation errors', () => {
    it('should report errors for both fields when both are invalid', () => {
      const input = {
        email: '',
        password: '',
      };

      const result = loginSchema.safeParse(input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThanOrEqual(2);

        const emailError = result.error.issues.find(e => e.path[0] === 'email');
        const passwordError = result.error.issues.find(e => e.path[0] === 'password');

        expect(emailError).toBeDefined();
        expect(passwordError).toBeDefined();
      }
    });
  });
});
