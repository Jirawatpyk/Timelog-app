import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { updateSession } from './proxy';

// Mock environment variables
vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co');
vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-anon-key');

// Mock hasEnvVars
vi.mock('../utils', () => ({
  hasEnvVars: true,
}));

// Mock Supabase client
const mockGetClaims = vi.fn();
const mockFrom = vi.fn();
const mockSelect = vi.fn();
const mockEq = vi.fn();
const mockSingle = vi.fn();
const mockSignOut = vi.fn();

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => ({
    auth: {
      getClaims: mockGetClaims,
      signOut: mockSignOut,
    },
    from: mockFrom,
  })),
}));

// Helper to create mock request
function createMockRequest(pathname: string, cookies: Record<string, string> = {}): NextRequest {
  const url = new URL(`http://localhost:3000${pathname}`);
  const request = new NextRequest(url, {
    headers: new Headers(),
  });

  // Mock cookies
  const cookieEntries = Object.entries(cookies).map(([name, value]) => ({ name, value }));
  vi.spyOn(request.cookies, 'getAll').mockReturnValue(cookieEntries);
  vi.spyOn(request.cookies, 'set').mockImplementation(() => request.cookies);

  return request;
}

describe('proxy.ts updateSession', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default: user is authenticated
    mockGetClaims.mockResolvedValue({
      data: { claims: { sub: 'user-123' } },
    });

    // Default: user profile
    mockFrom.mockReturnValue({ select: mockSelect });
    mockSelect.mockReturnValue({ eq: mockEq });
    mockEq.mockReturnValue({ single: mockSingle });
    mockSingle.mockResolvedValue({
      data: { role: 'staff', is_active: true, has_completed_onboarding: true },
      error: null,
    });
  });

  describe('Story 8.7: Onboarding Redirect', () => {
    it('redirects new user to /welcome when has_completed_onboarding is false', async () => {
      mockSingle.mockResolvedValue({
        data: { role: 'staff', is_active: true, has_completed_onboarding: false },
        error: null,
      });

      const request = createMockRequest('/entry');
      const response = await updateSession(request);

      expect(response.status).toBe(307); // Redirect
      expect(response.headers.get('location')).toBe('http://localhost:3000/welcome');
    });

    it('does not redirect when already on /welcome page', async () => {
      mockSingle.mockResolvedValue({
        data: { role: 'staff', is_active: true, has_completed_onboarding: false },
        error: null,
      });

      const request = createMockRequest('/welcome');
      const response = await updateSession(request);

      // Should not redirect (no location header or 200 status)
      expect(response.headers.get('location')).toBeNull();
    });

    it('allows access when has_completed_onboarding is true', async () => {
      mockSingle.mockResolvedValue({
        data: { role: 'staff', is_active: true, has_completed_onboarding: true },
        error: null,
      });

      const request = createMockRequest('/entry');
      const response = await updateSession(request);

      // Should not redirect to /welcome
      const location = response.headers.get('location');
      expect(location).not.toBe('http://localhost:3000/welcome');
    });

    it('redirects new user from /dashboard to /welcome', async () => {
      mockSingle.mockResolvedValue({
        data: { role: 'staff', is_active: true, has_completed_onboarding: false },
        error: null,
      });

      const request = createMockRequest('/dashboard');
      const response = await updateSession(request);

      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toBe('http://localhost:3000/welcome');
    });

    it('redirects new manager from /team to /welcome', async () => {
      mockSingle.mockResolvedValue({
        data: { role: 'manager', is_active: true, has_completed_onboarding: false },
        error: null,
      });

      const request = createMockRequest('/team');
      const response = await updateSession(request);

      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toBe('http://localhost:3000/welcome');
    });
  });

  describe('Deactivated User', () => {
    it('redirects deactivated user to /login with error', async () => {
      mockSingle.mockResolvedValue({
        data: { role: 'staff', is_active: false, has_completed_onboarding: true },
        error: null,
      });
      mockSignOut.mockResolvedValue({});

      const request = createMockRequest('/entry');
      const response = await updateSession(request);

      expect(mockSignOut).toHaveBeenCalled();
      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toContain('/login');
      expect(response.headers.get('location')).toContain('error=account_deactivated');
    });
  });

  describe('Public Routes', () => {
    it('allows unauthenticated access to /login', async () => {
      mockGetClaims.mockResolvedValue({ data: { claims: null } });

      const request = createMockRequest('/login');
      const response = await updateSession(request);

      expect(response.headers.get('location')).toBeNull();
    });

    it('redirects authenticated user from /login to /entry', async () => {
      const request = createMockRequest('/login');
      const response = await updateSession(request);

      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toBe('http://localhost:3000/entry');
    });
  });
});
