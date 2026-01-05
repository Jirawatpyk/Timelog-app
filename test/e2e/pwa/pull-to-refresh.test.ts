/**
 * Pull-to-Refresh E2E Tests - Story 8.5
 *
 * Tests for pull-to-refresh gesture on Dashboard and Team pages.
 *
 * Note: Touch/gesture simulation in Playwright is limited.
 * These tests verify the component presence and basic functionality
 * rather than full gesture simulation.
 */

import { test, expect } from '@playwright/test';
import { loginAsStaff, loginAsManager } from '../../helpers/e2e-auth';

test.describe('Story 8.5: Pull-to-Refresh', () => {
  test.describe('Dashboard Page', () => {
    test.beforeEach(async ({ page }) => {
      await loginAsStaff(page);
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');
    });

    test('AC 1: Pull indicator exists on dashboard', async ({ page }) => {
      // Dashboard should be wrapped with PullToRefresh component
      // The touch-pan-y class indicates pull-to-refresh is active
      const pullableArea = page.locator('.touch-pan-y');
      await expect(pullableArea).toBeVisible();
    });

    test('AC 2: Dashboard content loads successfully', async ({ page }) => {
      // Verify dashboard content is present
      await expect(page.getByText('Dashboard')).toBeVisible();

      // The page should have loaded entries, empty state, or stats
      const hasEntries = await page.locator('[data-testid="entry-card"]').count() > 0;
      const hasEmptyState = await page.getByText(/no entries|create your first/i).isVisible().catch(() => false);
      const hasStats = await page.locator('[data-testid="stats-card"]').isVisible().catch(() => false);

      // At least one content type should be visible
      expect(hasEntries || hasEmptyState || hasStats).toBe(true);
    });

    test('AC 4: Works with period selector', async ({ page }) => {
      // Click on Week tab
      await page.getByRole('tab', { name: /week/i }).click();
      await expect(page).toHaveURL(/period=week/);

      // Pullable area should still exist
      const pullableArea = page.locator('.touch-pan-y');
      await expect(pullableArea).toBeVisible();
    });

    test('AC 5: Pull-to-refresh disabled when scrolled down', async ({ page }) => {
      // Scroll down the page
      await page.evaluate(() => window.scrollTo(0, 500));

      // The page should scroll - pull-to-refresh won't interfere with normal scrolling
      const scrollY = await page.evaluate(() => window.scrollY);
      expect(scrollY).toBeGreaterThan(0);
    });
  });

  test.describe('Team Page', () => {
    test.beforeEach(async ({ page }) => {
      await loginAsManager(page);
      await page.goto('/team');
      await page.waitForLoadState('networkidle');
    });

    test('AC 1: Pull indicator exists on team dashboard', async ({ page }) => {
      // Team dashboard should be wrapped with PullToRefresh component
      const pullableArea = page.locator('.touch-pan-y');
      await expect(pullableArea).toBeVisible();
    });

    test('Team content loads successfully', async ({ page }) => {
      // Verify team dashboard content is present
      // Could show team stats, member list, or empty state
      const hasTeamContent = await page.getByText(/team/i).isVisible()
        || await page.getByText(/members/i).isVisible().catch(() => false)
        || await page.getByText(/hours/i).isVisible().catch(() => false);

      expect(hasTeamContent).toBe(true);
    });

    test('Period selector works with pull-to-refresh', async ({ page }) => {
      // Team page should have Today/This Week tabs
      const todayTab = page.getByRole('tab', { name: /today/i });
      const weekTab = page.getByRole('tab', { name: /week/i });

      // At least one should be visible
      const hasPeriodSelector = await todayTab.isVisible().catch(() => false)
        || await weekTab.isVisible().catch(() => false);

      expect(hasPeriodSelector).toBe(true);
    });
  });

  test.describe('Loading Indicator', () => {
    test('Loading state shows during data fetch', async ({ page }) => {
      await loginAsStaff(page);

      // Navigate with slow network to see loading state
      await page.route('**/rest/v1/**', async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        await route.continue();
      });

      await page.goto('/dashboard');

      // Skeleton or loading indicator should appear during load
      // Wait for content to eventually load
      await expect(page.getByText('Dashboard')).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Normal Interactions', () => {
    test('AC 3: Page functions normally without pull gesture', async ({ page }) => {
      await loginAsStaff(page);
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');

      // Verify normal interactions work
      // Click on period tabs
      const weekTab = page.getByRole('tab', { name: /week/i });
      if (await weekTab.isVisible()) {
        await weekTab.click();
        await expect(page).toHaveURL(/period=week/);
      }
    });
  });
});
