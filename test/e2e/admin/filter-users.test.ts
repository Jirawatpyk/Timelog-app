/**
 * Filter Users E2E Tests (Playwright)
 * Story 7.7: Filter Users
 *
 * Tests verify user filtering functionality:
 * - AC 1: Filter options display (Department, Role, Status)
 * - AC 2: Filter by department
 * - AC 3: Filter by role
 * - AC 4: Filter by status (Active, Inactive, Pending)
 * - AC 5: Search by name or email (debounced)
 * - AC 6: Combined filters (AND logic)
 * - AC 7: Empty state
 */

import { test, expect } from '@playwright/test';

test.describe('Story 7.7: Filter Users', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Navigate to users page
    await page.goto('/admin/users');
    await expect(page.getByRole('heading', { name: 'Users' })).toBeVisible();
  });

  test.describe('AC 1: Filter Options Display', () => {
    test('clicking filter button opens filter sheet', async ({ page }) => {
      // Click filter button
      await page.getByRole('button', { name: /open filters/i }).click();

      // Filter sheet should be visible with options
      await expect(page.getByRole('heading', { name: /filter users/i })).toBeVisible();
      await expect(page.getByLabel(/department/i)).toBeVisible();
      await expect(page.getByLabel(/role/i)).toBeVisible();
      await expect(page.getByLabel(/status/i)).toBeVisible();
    });

    test('filter sheet has Apply and Clear buttons', async ({ page }) => {
      await page.getByRole('button', { name: /open filters/i }).click();

      await expect(page.getByRole('button', { name: /apply/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /clear/i })).toBeVisible();
    });
  });

  test.describe('AC 2: Filter by Department', () => {
    test('selecting department updates URL with dept param', async ({ page }) => {
      // Open filter sheet
      await page.getByRole('button', { name: /open filters/i }).click();

      // Select a department
      await page.getByLabel(/department/i).click();
      // Wait for options and select first non-All option
      const deptOptions = page.locator('[role="option"]').filter({ hasNotText: 'All' });
      const optionCount = await deptOptions.count();

      if (optionCount > 0) {
        const deptName = await deptOptions.first().textContent();
        await deptOptions.first().click();
        await page.getByRole('button', { name: /apply/i }).click();

        // URL should have dept param
        await expect(page).toHaveURL(/dept=/);

        // Filter chip should show department
        if (deptName) {
          await expect(page.getByText(`Department: ${deptName.trim()}`)).toBeVisible();
        }
      }
    });
  });

  test.describe('AC 3: Filter by Role', () => {
    test('selecting role updates URL with role param', async ({ page }) => {
      // Open filter sheet
      await page.getByRole('button', { name: /open filters/i }).click();

      // Select role
      await page.getByLabel(/role/i).click();
      await page.getByRole('option', { name: 'Manager' }).click();
      await page.getByRole('button', { name: /apply/i }).click();

      // URL should have role param
      await expect(page).toHaveURL(/role=manager/);

      // Filter chip should show role
      await expect(page.getByText('Role: Manager')).toBeVisible();
    });

    test('can combine department and role filters', async ({ page }) => {
      // Open filter sheet
      await page.getByRole('button', { name: /open filters/i }).click();

      // Select role first
      await page.getByLabel(/role/i).click();
      await page.getByRole('option', { name: 'Staff' }).click();

      // Also select a department
      const deptOptions = page.locator('[role="option"]').filter({ hasNotText: 'All' });
      await page.getByLabel(/department/i).click();
      if (await deptOptions.count() > 0) {
        await deptOptions.first().click();
      }

      await page.getByRole('button', { name: /apply/i }).click();

      // URL should have role param
      await expect(page).toHaveURL(/role=staff/);
    });
  });

  test.describe('AC 4: Filter by Status', () => {
    test('selecting Active status filters to active users', async ({ page }) => {
      // Open filter sheet
      await page.getByRole('button', { name: /open filters/i }).click();

      // Select status
      await page.getByLabel(/status/i).click();
      await page.getByRole('option', { name: 'Active' }).click();
      await page.getByRole('button', { name: /apply/i }).click();

      // URL should have status param
      await expect(page).toHaveURL(/status=active/);

      // Filter chip should show status
      await expect(page.getByText('Status: Active')).toBeVisible();
    });

    test('selecting Inactive status filters to inactive users', async ({ page }) => {
      await page.getByRole('button', { name: /open filters/i }).click();
      await page.getByLabel(/status/i).click();
      await page.getByRole('option', { name: 'Inactive' }).click();
      await page.getByRole('button', { name: /apply/i }).click();

      await expect(page).toHaveURL(/status=inactive/);
      await expect(page.getByText('Status: Inactive')).toBeVisible();
    });

    test('selecting Pending status filters to pending users', async ({ page }) => {
      await page.getByRole('button', { name: /open filters/i }).click();
      await page.getByLabel(/status/i).click();
      await page.getByRole('option', { name: 'Pending' }).click();
      await page.getByRole('button', { name: /apply/i }).click();

      await expect(page).toHaveURL(/status=pending/);
      await expect(page.getByText('Status: Pending')).toBeVisible();
    });
  });

  test.describe('AC 5: Search by Name or Email', () => {
    test('search input is visible', async ({ page }) => {
      await expect(page.getByPlaceholder(/search by name or email/i)).toBeVisible();
    });

    test('typing in search updates URL with q param (debounced)', async ({ page }) => {
      const searchInput = page.getByPlaceholder(/search by name or email/i);
      await searchInput.fill('admin');

      // Wait for debounce (300ms + buffer)
      await page.waitForTimeout(500);

      // URL should have q param
      await expect(page).toHaveURL(/q=admin/);

      // Filter chip should show search
      await expect(page.getByText(/search: "admin"/i)).toBeVisible();
    });

    test('clear button removes search filter', async ({ page }) => {
      // First, add a search
      const searchInput = page.getByPlaceholder(/search by name or email/i);
      await searchInput.fill('test');
      await page.waitForTimeout(500);

      // Click clear button
      await page.getByRole('button', { name: /clear search/i }).click();

      // URL should not have q param
      await expect(page).not.toHaveURL(/q=/);
    });
  });

  test.describe('AC 6: Combined Filters', () => {
    test('multiple filters show multiple chips', async ({ page }) => {
      // Apply role and status filters
      await page.getByRole('button', { name: /open filters/i }).click();
      await page.getByLabel(/role/i).click();
      await page.getByRole('option', { name: 'Staff' }).click();
      await page.getByLabel(/status/i).click();
      await page.getByRole('option', { name: 'Active' }).click();
      await page.getByRole('button', { name: /apply/i }).click();

      // Both chips should be visible
      await expect(page.getByText('Role: Staff')).toBeVisible();
      await expect(page.getByText('Status: Active')).toBeVisible();

      // Clear All button should be visible
      await expect(page.getByRole('button', { name: /clear all/i })).toBeVisible();
    });

    test('Clear All button removes all filters', async ({ page }) => {
      // Apply multiple filters via URL
      await page.goto('/admin/users?role=admin&status=active');

      // Both chips should be visible
      await expect(page.getByText('Role: Admin')).toBeVisible();
      await expect(page.getByText('Status: Active')).toBeVisible();

      // Click Clear All
      await page.getByRole('button', { name: /clear all/i }).click();

      // URL should be clean
      await expect(page).toHaveURL('/admin/users');
      await expect(page).not.toHaveURL(/role=/);
      await expect(page).not.toHaveURL(/status=/);
    });

    test('clicking X on individual chip removes only that filter', async ({ page }) => {
      // Apply multiple filters via URL
      await page.goto('/admin/users?role=manager&status=active');

      // Remove role filter
      await page.getByRole('button', { name: /remove role/i }).click();

      // Role should be removed, status should remain
      await expect(page).not.toHaveURL(/role=/);
      await expect(page).toHaveURL(/status=active/);
      await expect(page.getByText('Status: Active')).toBeVisible();
    });
  });

  test.describe('AC 7: Empty State', () => {
    test('shows empty state when no users match filters', async ({ page }) => {
      // Apply impossible filter combination via URL search
      await page.goto('/admin/users?q=xyznonexistentuser12345');

      await page.waitForTimeout(500);

      // Should see empty state
      await expect(page.getByText(/no users found matching your criteria/i)).toBeVisible();
      await expect(page.getByRole('button', { name: /clear filters/i })).toBeVisible();
    });

    test('Clear Filters button in empty state works', async ({ page }) => {
      await page.goto('/admin/users?q=xyznonexistentuser12345');

      await page.waitForTimeout(500);

      // Click Clear Filters
      await page.getByRole('button', { name: /clear filters/i }).click();

      // Should navigate to clean URL
      await expect(page).toHaveURL('/admin/users');
    });
  });

  test.describe('URL State Persistence', () => {
    test('page refresh preserves filters', async ({ page }) => {
      await page.goto('/admin/users?role=admin&status=active');

      // Refresh page
      await page.reload();

      // URL should still have params
      await expect(page).toHaveURL(/role=admin/);
      await expect(page).toHaveURL(/status=active/);

      // Filter chips should be visible
      await expect(page.getByText('Role: Admin')).toBeVisible();
      await expect(page.getByText('Status: Active')).toBeVisible();
    });

    test('pagination resets when filter changes', async ({ page }) => {
      // Start on page 2 with a role filter
      await page.goto('/admin/users?page=2&role=staff');

      // Change the status filter
      await page.getByRole('button', { name: /open filters/i }).click();
      await page.getByLabel(/status/i).click();
      await page.getByRole('option', { name: 'Active' }).click();
      await page.getByRole('button', { name: /apply/i }).click();

      // Page param should be removed (reset to page 1)
      await expect(page).not.toHaveURL(/page=/);
      await expect(page).toHaveURL(/status=active/);
    });

    test('pagination preserves filters when navigating pages', async ({ page }) => {
      // Apply a role filter first
      await page.goto('/admin/users?role=staff');

      // Check if pagination exists (depends on data)
      const nextButton = page.getByRole('link', { name: /next/i });
      const nextButtonVisible = await nextButton.isVisible().catch(() => false);

      if (nextButtonVisible) {
        // Click next page
        await nextButton.click();

        // URL should have both page and role params
        await expect(page).toHaveURL(/page=2/);
        await expect(page).toHaveURL(/role=staff/);

        // Filter chip should still be visible
        await expect(page.getByText('Role: Staff')).toBeVisible();
      }
    });
  });
});
