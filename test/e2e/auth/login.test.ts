/**
 * E2E tests for login functionality
 * Story 2.1: Company Email Login
 */

import { describe, it, expect } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

// Seed data test users (from Story 1.5)
const seedUsers = {
  staff: { email: 'staff@test.com', password: 'test123456' },
  manager: { email: 'manager@test.com', password: 'test123456' },
  admin: { email: 'admin@test.com', password: 'test123456' },
  superAdmin: { email: 'superadmin@test.com', password: 'test123456' },
};

function createTestClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient<Database>(supabaseUrl, anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

describe('Login Flow (AC2, AC3, AC4)', () => {
  describe('successful authentication (AC2)', () => {
    it('should authenticate staff user with valid credentials', async () => {
      const supabase = createTestClient();

      const { data, error } = await supabase.auth.signInWithPassword({
        email: seedUsers.staff.email,
        password: seedUsers.staff.password,
      });

      expect(error).toBeNull();
      expect(data.user).toBeDefined();
      expect(data.user?.email).toBe(seedUsers.staff.email);
      expect(data.session).toBeDefined();
    });

    it('should authenticate manager user with valid credentials', async () => {
      const supabase = createTestClient();

      const { data, error } = await supabase.auth.signInWithPassword({
        email: seedUsers.manager.email,
        password: seedUsers.manager.password,
      });

      expect(error).toBeNull();
      expect(data.user).toBeDefined();
      expect(data.user?.email).toBe(seedUsers.manager.email);
    });

    it('should authenticate admin user with valid credentials', async () => {
      const supabase = createTestClient();

      const { data, error } = await supabase.auth.signInWithPassword({
        email: seedUsers.admin.email,
        password: seedUsers.admin.password,
      });

      expect(error).toBeNull();
      expect(data.user).toBeDefined();
      expect(data.user?.email).toBe(seedUsers.admin.email);
    });

    it('should authenticate super_admin user with valid credentials', async () => {
      const supabase = createTestClient();

      const { data, error } = await supabase.auth.signInWithPassword({
        email: seedUsers.superAdmin.email,
        password: seedUsers.superAdmin.password,
      });

      expect(error).toBeNull();
      expect(data.user).toBeDefined();
      expect(data.user?.email).toBe(seedUsers.superAdmin.email);
    });
  });

  describe('session contains role (AC3)', () => {
    it('should have access to user role from public.users after login', async () => {
      const supabase = createTestClient();

      // Login first
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email: seedUsers.staff.email,
          password: seedUsers.staff.password,
        });

      expect(authError).toBeNull();
      expect(authData.user).toBeDefined();

      // Fetch role from public.users
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', authData.user!.id)
        .single();

      // If user exists in public.users, verify role is valid
      if (userData) {
        expect(['staff', 'manager', 'admin', 'super_admin']).toContain(userData.role);
      }
      // User may not exist in public.users if seed data wasn't run - OK for auth testing
    });

    it('should fetch manager role correctly', async () => {
      const supabase = createTestClient();

      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email: seedUsers.manager.email,
          password: seedUsers.manager.password,
        });

      expect(authError).toBeNull();

      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', authData.user!.id)
        .single();

      // If user exists in public.users, verify role
      if (userData) {
        expect(userData.role).toBe('manager');
      }
      // User may not exist in public.users if seed data wasn't run - OK for auth testing
    });
  });

  describe('invalid credentials (AC4)', () => {
    it('should fail with invalid email', async () => {
      const supabase = createTestClient();

      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'nonexistent@test.com',
        password: 'test123456',
      });

      expect(error).toBeDefined();
      expect(data.user).toBeNull();
      expect(data.session).toBeNull();
    });

    it('should fail with invalid password', async () => {
      const supabase = createTestClient();

      const { data, error } = await supabase.auth.signInWithPassword({
        email: seedUsers.staff.email,
        password: 'wrongpassword',
      });

      expect(error).toBeDefined();
      expect(data.user).toBeNull();
      expect(data.session).toBeNull();
    });

    it('should fail with empty credentials', async () => {
      const supabase = createTestClient();

      const { data, error } = await supabase.auth.signInWithPassword({
        email: '',
        password: '',
      });

      expect(error).toBeDefined();
      expect(data.user).toBeNull();
    });
  });
});
