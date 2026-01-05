/**
 * E2E Tests: First-Time User Flow (Story 8.7)
 *
 * Tests the onboarding flow for new users:
 * - AC 1: Welcome screen with "Welcome to Timelog!" and features
 * - AC 2: "Get Started" completes onboarding and redirects to /entry
 * - AC 3: Returning users skip onboarding
 * - AC 4: Feature highlights display
 * - AC 5: "Skip" option completes onboarding
 */

import { test, expect, Page } from '@playwright/test';
import { createServiceClient } from '../../helpers/supabase-test';
import { TEST_CREDENTIALS } from '../../helpers/e2e-auth';

// Use staff user for onboarding tests since they need to be a fresh user
const TEST_EMAIL = TEST_CREDENTIALS.staff.email;
const TEST_PASSWORD = TEST_CREDENTIALS.staff.password;

/**
 * Helper to reset onboarding flag for test user
 */
async function resetOnboardingFlag(userId: string, completed: boolean): Promise<void> {
  const supabase = createServiceClient();
  await supabase
    .from('users')
    .update({ has_completed_onboarding: completed })
    .eq('id', userId);
}

/**
 * Helper to get user ID by email
 */
async function getUserId(email: string): Promise<string | null> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single();
  return data?.id ?? null;
}

/**
 * Helper to login and expect welcome page redirect
 */
async function loginExpectingWelcome(page: Page): Promise<void> {
  await page.goto('/login');
  await page.fill('input[name="email"]', TEST_EMAIL);
  await page.fill('input[name="password"]', TEST_PASSWORD);
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('/welcome');
}

/**
 * Helper to login and expect entry page redirect
 */
async function loginExpectingEntry(page: Page): Promise<void> {
  await page.goto('/login');
  await page.fill('input[name="email"]', TEST_EMAIL);
  await page.fill('input[name="password"]', TEST_PASSWORD);
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/entry/);
}

test.describe('Story 8.7: First-Time User Flow', () => {
  let testUserId: string | null = null;

  test.beforeAll(async () => {
    // Get test user ID
    testUserId = await getUserId(TEST_EMAIL);
  });

  test.beforeEach(async () => {
    // Reset user to "not onboarded" state before each test
    if (testUserId) {
      await resetOnboardingFlag(testUserId, false);
    }
  });

  test.afterAll(async () => {
    // Restore user to "onboarded" state after all tests
    if (testUserId) {
      await resetOnboardingFlag(testUserId, true);
    }
  });

  test.describe('AC 1 & AC 4: Welcome Screen Display', () => {
    test('new user sees welcome screen with heading and features', async ({ page }) => {
      await loginExpectingWelcome(page);

      // AC 1: "Welcome to Timelog!" heading
      await expect(page.getByText('Welcome to Timelog!')).toBeVisible();

      // AC 1: "Get Started" button
      await expect(page.getByRole('button', { name: /get started/i })).toBeVisible();

      // AC 4: Feature 1 - Easy Time Logging with Clock icon
      await expect(page.getByText('Easy Time Logging')).toBeVisible();
      await expect(page.getByText('Record your work hours quickly and easily')).toBeVisible();

      // AC 4: Feature 2 - Daily/Weekly Summary with BarChart icon
      await expect(page.getByText('Daily/Weekly Summary')).toBeVisible();
      await expect(page.getByText('Track your logged hours at a glance')).toBeVisible();

      // AC 4: Feature 3 - Quick Entry from Recent with Zap icon
      await expect(page.getByText('Quick Entry from Recent')).toBeVisible();
      await expect(page.getByText('Tap to auto-fill from previous entries')).toBeVisible();
    });

    test('welcome screen shows 3 feature cards', async ({ page }) => {
      await loginExpectingWelcome(page);

      // Count feature cards using data-testid
      const featureCards = page.locator('[data-testid="feature-card"]');
      await expect(featureCards).toHaveCount(3);
    });
  });

  test.describe('AC 2: Complete Onboarding with Get Started', () => {
    test('"Get Started" completes onboarding and redirects to /entry', async ({ page }) => {
      await loginExpectingWelcome(page);

      // Click "Get Started"
      await page.getByRole('button', { name: /get started/i }).click();

      // Should redirect to /entry
      await expect(page).toHaveURL(/\/entry/);

      // Verify onboarding flag is set
      const userId = await getUserId(TEST_EMAIL);
      const supabase = createServiceClient();
      const { data } = await supabase
        .from('users')
        .select('has_completed_onboarding')
        .eq('id', userId!)
        .single();

      expect(data?.has_completed_onboarding).toBe(true);
    });
  });

  test.describe('AC 3: Returning User Skip', () => {
    test('returning user skips onboarding and goes to /entry', async ({ page }) => {
      // First, mark user as onboarded
      if (testUserId) {
        await resetOnboardingFlag(testUserId, true);
      }

      // Login - should go directly to /entry, not /welcome
      await loginExpectingEntry(page);

      // Verify we're on /entry, not /welcome
      expect(page.url()).toMatch(/\/entry/);
      expect(page.url()).not.toContain('/welcome');
    });

    test('onboarding flag persists across sessions', async ({ page }) => {
      await loginExpectingWelcome(page);

      // Complete onboarding
      await page.getByRole('button', { name: /get started/i }).click();
      await expect(page).toHaveURL(/\/entry/);

      // Sign out
      const menuTrigger = page.locator('[data-testid="user-menu-trigger"]');
      if (await menuTrigger.isVisible()) {
        await menuTrigger.click();
        const signOutBtn = page.getByRole('menuitem', { name: /sign out/i });
        if (await signOutBtn.isVisible()) {
          await signOutBtn.click();
        }
      } else {
        // Fallback: just navigate to login
        await page.goto('/login');
      }

      // Login again - should skip welcome
      await page.fill('input[name="email"]', TEST_EMAIL);
      await page.fill('input[name="password"]', TEST_PASSWORD);
      await page.click('button[type="submit"]');

      // Should go to /entry, not /welcome
      await expect(page).toHaveURL(/\/entry/);
    });
  });

  test.describe('AC 5: Skip Option', () => {
    test('"Skip" link completes onboarding and redirects to /entry', async ({ page }) => {
      await loginExpectingWelcome(page);

      // Click "Skip"
      await page.getByRole('button', { name: /skip/i }).click();

      // Should redirect to /entry
      await expect(page).toHaveURL(/\/entry/);

      // Verify onboarding flag is set
      const userId = await getUserId(TEST_EMAIL);
      const supabase = createServiceClient();
      const { data } = await supabase
        .from('users')
        .select('has_completed_onboarding')
        .eq('id', userId!)
        .single();

      expect(data?.has_completed_onboarding).toBe(true);
    });
  });

  test.describe('Protected Route Behavior', () => {
    test('unauthenticated user cannot access /welcome', async ({ page }) => {
      // Try to access /welcome without logging in
      await page.goto('/welcome');

      // Should redirect to login
      await expect(page).toHaveURL(/\/login/);
    });

    test('onboarded user accessing /welcome is redirected to /entry', async ({ page }) => {
      // Mark user as onboarded
      if (testUserId) {
        await resetOnboardingFlag(testUserId, true);
      }

      // Login first
      await loginExpectingEntry(page);

      // Try to access /welcome directly
      await page.goto('/welcome');

      // Should redirect to /entry
      await expect(page).toHaveURL(/\/entry/);
    });
  });
});
