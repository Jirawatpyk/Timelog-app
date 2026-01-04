import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createAdminClient } from './admin';

// Mock @supabase/supabase-js
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: {
      admin: {
        inviteUserByEmail: vi.fn(),
        deleteUser: vi.fn(),
        getUserById: vi.fn(),
      },
    },
  })),
}));

describe('createAdminClient', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset environment before each test
    process.env = { ...originalEnv };
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.clearAllMocks();
  });

  it('creates a Supabase client with service role key', () => {
    const client = createAdminClient();
    expect(client).toBeDefined();
    expect(client.auth).toBeDefined();
    expect(client.auth.admin).toBeDefined();
  });

  it('throws error when SUPABASE_SERVICE_ROLE_KEY is not set', () => {
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;

    expect(() => createAdminClient()).toThrow('SUPABASE_SERVICE_ROLE_KEY is not set');
  });

  it('throws error when NEXT_PUBLIC_SUPABASE_URL is not set', () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;

    expect(() => createAdminClient()).toThrow('NEXT_PUBLIC_SUPABASE_URL is not set');
  });
});
