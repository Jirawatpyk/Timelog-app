/**
 * Admin Navigation E2E Tests
 * Story 7.1a: Admin Navigation Layout
 *
 * Tests verify:
 * - AC 1: Desktop Admin Sidebar displays correctly
 * - AC 2: App Navigation is hidden in Admin section
 * - AC 4: Navigation between admin pages works
 * - AC 8: Admin landing page redirects to /admin/master-data
 */

import { test, expect } from '@playwright/test';

test.describe('Story 7.1a: Admin Navigation Layout', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/(dashboard|entry|admin)/);
  });

  test.describe('AC 1: Desktop Admin Sidebar', () => {
    test('should display Admin sidebar with correct items', async ({ page }) => {
      await page.goto('/admin/master-data');

      // Verify Admin header in sidebar
      const sidebar = page.locator('aside');
      await expect(sidebar.getByText('Admin')).toBeVisible();

      // Verify navigation items
      await expect(sidebar.getByRole('link', { name: /master data/i })).toBeVisible();
      await expect(sidebar.getByRole('link', { name: /users/i })).toBeVisible();

      // Verify Back to App link
      await expect(sidebar.getByRole('link', { name: /back to app/i })).toBeVisible();
    });

    test('should highlight Master Data when on /admin/master-data', async ({ page }) => {
      await page.goto('/admin/master-data');

      const masterDataLink = page.locator('aside').getByRole('link', { name: /master data/i });
      await expect(masterDataLink).toHaveClass(/bg-primary/);
    });

    test('should highlight Users when on /admin/users', async ({ page }) => {
      await page.goto('/admin/users');

      const usersLink = page.locator('aside').getByRole('link', { name: /users/i });
      await expect(usersLink).toHaveClass(/bg-primary/);
    });
  });

  test.describe('AC 2: Hide App Navigation in Admin', () => {
    test('should not show App entry/dashboard links in admin section', async ({ page }) => {
      await page.goto('/admin/master-data');

      // App sidebar navigation items should NOT be visible in admin
      // The admin sidebar should show, not the app sidebar
      const adminSidebar = page.locator('aside');
      await expect(adminSidebar.getByText('Admin')).toBeVisible();

      // Entry and Dashboard links from app nav should not be in admin sidebar
      await expect(adminSidebar.getByRole('link', { name: /^entry$/i })).not.toBeVisible();
    });
  });

  test.describe('AC 4: Navigation Functionality', () => {
    test('should navigate between Master Data and Users', async ({ page }) => {
      await page.goto('/admin/master-data');

      // Click Users link
      await page.locator('aside').getByRole('link', { name: /users/i }).click();

      // Should navigate to /admin/users
      await expect(page).toHaveURL(/\/admin\/users/);

      // Verify Users is now highlighted
      const usersLink = page.locator('aside').getByRole('link', { name: /users/i });
      await expect(usersLink).toHaveClass(/bg-primary/);
    });

    test('should navigate back to dashboard when clicking Back to App', async ({ page }) => {
      await page.goto('/admin/master-data');

      // Click Back to App
      await page.locator('aside').getByRole('link', { name: /back to app/i }).click();

      // Should navigate to /dashboard
      await expect(page).toHaveURL(/\/dashboard/);
    });
  });

  test.describe('AC 8: Admin Landing Page', () => {
    test('should redirect /admin to /admin/master-data', async ({ page }) => {
      // Navigate to /admin directly
      await page.goto('/admin');

      // Should redirect to /admin/master-data
      await expect(page).toHaveURL(/\/admin\/master-data/);

      // Master Data should be highlighted
      const masterDataLink = page.locator('aside').getByRole('link', { name: /master data/i });
      await expect(masterDataLink).toHaveClass(/bg-primary/);
    });
  });
});
