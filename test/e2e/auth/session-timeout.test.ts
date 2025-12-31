/**
 * E2E tests for session timeout handling
 * Story 2.4: Session Timeout Handling
 */

import { describe, it, expect } from 'vitest';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

// Seed data test users (from Story 1.5)
const seedUsers = {
  staff: { email: 'staff@test.com', password: 'test123456' },
};

function createTestClient(): SupabaseClient<Database> {
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

describe('Session Timeout Handling (Story 2.4)', () => {
  describe('AC1: Session Configuration', () => {
    it('should have valid session with access_token and refresh_token', async () => {
      const supabase = createTestClient();

      const { data, error } = await supabase.auth.signInWithPassword({
        email: seedUsers.staff.email,
        password: seedUsers.staff.password,
      });

      expect(error).toBeNull();
      expect(data.session).toBeDefined();
      expect(data.session?.access_token).toBeDefined();
      expect(data.session?.refresh_token).toBeDefined();
      expect(data.session?.expires_at).toBeDefined();
      expect(data.session?.expires_in).toBeGreaterThan(0);
    });

    it('should have expires_at in the future (session not immediately expired)', async () => {
      const supabase = createTestClient();

      const { data, error } = await supabase.auth.signInWithPassword({
        email: seedUsers.staff.email,
        password: seedUsers.staff.password,
      });

      expect(error).toBeNull();
      expect(data.session).toBeDefined();

      // expires_at is in seconds since epoch
      const expiresAt = data.session!.expires_at!;
      const nowSeconds = Math.floor(Date.now() / 1000);

      // Session should expire in the future
      expect(expiresAt).toBeGreaterThan(nowSeconds);
    });
  });

  describe('AC3: Session Refresh', () => {
    it('should be able to refresh session with valid refresh_token', async () => {
      const supabase = createTestClient();

      // Login first
      const { data: loginData, error: loginError } =
        await supabase.auth.signInWithPassword({
          email: seedUsers.staff.email,
          password: seedUsers.staff.password,
        });

      expect(loginError).toBeNull();
      expect(loginData.session?.refresh_token).toBeDefined();

      // Wait a moment then refresh
      await new Promise((resolve) => setTimeout(resolve, 100));

      const { data: refreshData, error: refreshError } =
        await supabase.auth.refreshSession();

      expect(refreshError).toBeNull();
      expect(refreshData.session).toBeDefined();
      expect(refreshData.session?.access_token).toBeDefined();
    });
  });

  describe('AC3: Middleware Session Refresh', () => {
    it('should have session cookies set correctly on login', async () => {
      const supabase = createTestClient();

      const { data, error } = await supabase.auth.signInWithPassword({
        email: seedUsers.staff.email,
        password: seedUsers.staff.password,
      });

      expect(error).toBeNull();
      expect(data.session).toBeDefined();

      // Verify session contains tokens for cookie storage
      expect(data.session?.access_token).toBeTruthy();
      expect(data.session?.refresh_token).toBeTruthy();
    });

    it('should extend session on activity (refresh token works)', async () => {
      const supabase = createTestClient();

      // Login
      const { data: loginData } = await supabase.auth.signInWithPassword({
        email: seedUsers.staff.email,
        password: seedUsers.staff.password,
      });

      const originalExpiresAt = loginData.session?.expires_at;

      // Wait and refresh (simulates middleware refresh)
      await new Promise((resolve) => setTimeout(resolve, 100));

      const { data: refreshData, error: refreshError } =
        await supabase.auth.refreshSession();

      expect(refreshError).toBeNull();
      expect(refreshData.session?.expires_at).toBeDefined();

      // New session should have same or later expiry
      // (exact behavior depends on Supabase config)
      expect(refreshData.session?.expires_at).toBeGreaterThanOrEqual(
        originalExpiresAt!
      );
    });
  });

  describe('AC2: Expired Session Redirect', () => {
    it('should deny access to protected data without valid session', async () => {
      const supabase = createTestClient();

      // Without logging in, try to access protected data
      const { data, error } = await supabase
        .from('time_entries')
        .select('id')
        .limit(1);

      // RLS should deny access - returns empty array or error
      if (error) {
        expect(error).toBeDefined();
      } else {
        expect(data).toEqual([]);
      }
    });

    it('should lose access after session is signed out', async () => {
      const supabase = createTestClient();

      // Login
      const { data: authData } = await supabase.auth.signInWithPassword({
        email: seedUsers.staff.email,
        password: seedUsers.staff.password,
      });

      expect(authData.session).toBeDefined();

      // Sign out to simulate session expiry
      await supabase.auth.signOut();

      // Verify session is gone
      const { data: sessionData } = await supabase.auth.getSession();
      expect(sessionData.session).toBeNull();

      // Try to access protected data - should fail
      const { data: entriesData } = await supabase
        .from('time_entries')
        .select('id')
        .limit(1);

      // Should get empty array (RLS denies access)
      expect(entriesData).toEqual([]);
    });
  });

  describe('AC5: Auth State Changes', () => {
    it('should emit SIGNED_IN event on login', async () => {
      const supabase = createTestClient();

      let signInEventReceived = false;

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((event) => {
        if (event === 'SIGNED_IN') {
          signInEventReceived = true;
        }
      });

      await supabase.auth.signInWithPassword({
        email: seedUsers.staff.email,
        password: seedUsers.staff.password,
      });

      // Give event time to fire
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(signInEventReceived).toBe(true);

      subscription.unsubscribe();
    });

    it('should emit SIGNED_OUT event on logout', async () => {
      const supabase = createTestClient();

      let signOutEventReceived = false;

      // Login first
      await supabase.auth.signInWithPassword({
        email: seedUsers.staff.email,
        password: seedUsers.staff.password,
      });

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((event) => {
        if (event === 'SIGNED_OUT') {
          signOutEventReceived = true;
        }
      });

      // Logout
      await supabase.auth.signOut();

      // Give event time to fire
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(signOutEventReceived).toBe(true);

      subscription.unsubscribe();
    });
  });
});
