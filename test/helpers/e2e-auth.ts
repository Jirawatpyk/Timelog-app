/**
 * E2E Authentication Helpers for Playwright Tests
 *
 * Provides role-based login utilities for E2E testing.
 * Use these helpers instead of raw login code to:
 * - Ensure consistent login flow across all E2E tests
 * - Centralize credential management
 * - Make tests more readable
 *
 * @example
 * import { loginAsManager, loginAsStaff, loginAsAdmin } from '@test/helpers/e2e-auth';
 *
 * test.beforeEach(async ({ page }) => {
 *   await loginAsManager(page);
 * });
 *
 * test('manager can view team dashboard', async ({ page }) => {
 *   await page.goto('/team');
 *   await expect(page.getByText('Team Dashboard')).toBeVisible();
 * });
 */

import { Page, expect } from '@playwright/test';

/**
 * Test credentials for E2E testing
 * These should match users seeded in the test database
 */
export const TEST_CREDENTIALS = {
  staff: {
    email: 'staff@example.com',
    password: 'password123',
  },
  manager: {
    email: 'manager@example.com',
    password: 'password123',
  },
  admin: {
    email: 'admin@example.com',
    password: 'password123',
  },
  superAdmin: {
    email: 'superadmin@example.com',
    password: 'password123',
  },
} as const;

export type TestRole = keyof typeof TEST_CREDENTIALS;

/**
 * Login as a specific role
 * Navigates to login page, fills credentials, and waits for successful login
 *
 * @param page - Playwright Page object
 * @param role - The role to login as
 * @param options - Optional configuration
 * @param options.waitForRedirect - Wait for redirect after login (default: true)
 * @param options.expectedUrl - Expected URL after login (default: /dashboard)
 */
export async function loginAs(
  page: Page,
  role: TestRole,
  options: { waitForRedirect?: boolean; expectedUrl?: string | RegExp } = {}
): Promise<void> {
  const { waitForRedirect = true, expectedUrl = /\/(dashboard|entry|team|admin)/ } = options;

  const credentials = TEST_CREDENTIALS[role];

  // Navigate to login page
  await page.goto('/login');

  // Fill in credentials
  await page.fill('input[name="email"]', credentials.email);
  await page.fill('input[name="password"]', credentials.password);

  // Submit form
  await page.click('button[type="submit"]');

  // Wait for successful login
  if (waitForRedirect) {
    await expect(page).toHaveURL(expectedUrl);
  }
}

/**
 * Login as staff user
 * Staff has basic access to personal entry and dashboard only
 */
export async function loginAsStaff(page: Page): Promise<void> {
  await loginAs(page, 'staff');
}

/**
 * Login as manager user
 * Manager has access to:
 * - Personal entry and dashboard
 * - Team dashboard (for managed departments)
 */
export async function loginAsManager(page: Page): Promise<void> {
  await loginAs(page, 'manager');
}

/**
 * Login as admin user
 * Admin has access to:
 * - Personal entry and dashboard
 * - Team dashboard (all departments)
 * - Admin panel (user management, master data)
 */
export async function loginAsAdmin(page: Page): Promise<void> {
  await loginAs(page, 'admin');
}

/**
 * Login as super admin user
 * Super admin has full access to everything
 */
export async function loginAsSuperAdmin(page: Page): Promise<void> {
  await loginAs(page, 'superAdmin');
}

/**
 * Logout the current user
 * Useful for switching between users in a single test
 */
export async function logout(page: Page): Promise<void> {
  // Click logout button (usually in header or sidebar)
  const logoutButton = page.getByRole('button', { name: /logout|sign out|log out/i });

  if (await logoutButton.isVisible()) {
    await logoutButton.click();
    await expect(page).toHaveURL('/login');
  } else {
    // Fallback: navigate to login (clears session)
    await page.goto('/login');
  }
}

/**
 * Check if user is logged in by verifying protected content is visible
 */
export async function isLoggedIn(page: Page): Promise<boolean> {
  // Check for elements that only appear when logged in
  const bottomNav = page.locator('nav[aria-label="Main navigation"]');
  const sidebar = page.locator('aside');

  return (await bottomNav.isVisible()) || (await sidebar.isVisible());
}

/**
 * Navigate to a protected route after ensuring user is logged in as specific role
 * Combines login and navigation for cleaner test setup
 *
 * @example
 * await navigateAsManager(page, '/team');
 * await expect(page.getByText('Team Dashboard')).toBeVisible();
 */
export async function navigateAsStaff(page: Page, path: string): Promise<void> {
  await loginAsStaff(page);
  await page.goto(path);
}

export async function navigateAsManager(page: Page, path: string): Promise<void> {
  await loginAsManager(page);
  await page.goto(path);
}

export async function navigateAsAdmin(page: Page, path: string): Promise<void> {
  await loginAsAdmin(page);
  await page.goto(path);
}

export async function navigateAsSuperAdmin(page: Page, path: string): Promise<void> {
  await loginAsSuperAdmin(page);
  await page.goto(path);
}
