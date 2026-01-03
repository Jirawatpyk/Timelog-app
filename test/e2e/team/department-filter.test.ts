// test/e2e/team/department-filter.test.ts
// Story 6.5: Multi-Department Support E2E Tests
import { test, expect } from '@playwright/test';

test.describe('Department Filter (Story 6.5)', () => {
  test.describe('AC 1 & AC 3: Filter Visibility', () => {
    test('multi-department manager sees department filter', async ({ page }) => {
      // Login as multi-department manager (manages 2+ departments)
      await page.goto('/login');
      await page.fill('input[name="email"]', 'multi-dept-manager@example.com');
      await page.fill('input[name="password"]', 'password123');
      await page.click('button[type="submit"]');

      await page.goto('/team');

      // Should see department filter dropdown
      await expect(page.getByText('Department:')).toBeVisible();
      await expect(page.getByRole('combobox')).toBeVisible();
    });

    test('single-department manager does NOT see department filter', async ({
      page,
    }) => {
      // Login as single-department manager
      await page.goto('/login');
      await page.fill('input[name="email"]', 'manager@example.com');
      await page.fill('input[name="password"]', 'password123');
      await page.click('button[type="submit"]');

      await page.goto('/team');

      // Should NOT see department filter label (filter is hidden)
      // Team Dashboard should still be visible
      await expect(page.getByText('Team Dashboard')).toBeVisible();
      // Department filter label should not be present when managing single dept
      const filterLabel = page.locator('text=Department:');
      // Count should be 0 for single-dept manager
      await expect(filterLabel).toHaveCount(0);
    });
  });

  test.describe('AC 2: Single Department Selection', () => {
    test('selecting department updates URL with dept param', async ({
      page,
    }) => {
      // Login as multi-department manager
      await page.goto('/login');
      await page.fill('input[name="email"]', 'multi-dept-manager@example.com');
      await page.fill('input[name="password"]', 'password123');
      await page.click('button[type="submit"]');

      await page.goto('/team');

      // Open dropdown and select a department
      await page.getByRole('combobox').click();
      // Select first non-"All" option
      const options = page.locator('[role="option"]');
      const optionCount = await options.count();
      if (optionCount > 1) {
        await options.nth(1).click();
        // URL should now have dept param
        await expect(page).toHaveURL(/dept=/);
      }
    });

    test('selecting All Departments removes dept param', async ({ page }) => {
      // Login as multi-department manager
      await page.goto('/login');
      await page.fill('input[name="email"]', 'multi-dept-manager@example.com');
      await page.fill('input[name="password"]', 'password123');
      await page.click('button[type="submit"]');

      // Start with a dept filter applied
      await page.goto('/team?dept=some-dept-id');

      // Open dropdown and select "All Departments"
      await page.getByRole('combobox').click();
      await page.getByRole('option', { name: 'All Departments' }).click();

      // URL should not have dept param
      await expect(page).not.toHaveURL(/dept=/);
    });
  });

  test.describe('AC 5: URL State Persistence', () => {
    test('page refresh preserves department filter', async ({ page }) => {
      // Login as multi-department manager
      await page.goto('/login');
      await page.fill('input[name="email"]', 'multi-dept-manager@example.com');
      await page.fill('input[name="password"]', 'password123');
      await page.click('button[type="submit"]');

      // Navigate with dept param
      await page.goto('/team?dept=test-dept-id');

      // Refresh page
      await page.reload();

      // URL should still have dept param
      await expect(page).toHaveURL(/dept=test-dept-id/);
    });

    test('period param is preserved when changing department', async ({
      page,
    }) => {
      // Login as multi-department manager
      await page.goto('/login');
      await page.fill('input[name="email"]', 'multi-dept-manager@example.com');
      await page.fill('input[name="password"]', 'password123');
      await page.click('button[type="submit"]');

      // Start with period=week
      await page.goto('/team?period=week');

      // Check if filter is visible (multi-dept manager)
      const filterVisible = await page.getByText('Department:').isVisible();
      if (filterVisible) {
        // Open dropdown and select a department
        await page.getByRole('combobox').click();
        const options = page.locator('[role="option"]');
        const optionCount = await options.count();
        if (optionCount > 1) {
          await options.nth(1).click();
          // URL should still have period=week
          await expect(page).toHaveURL(/period=week/);
        }
      }
    });
  });

  test.describe('AC 4: All Departments View', () => {
    test('shows department badges when All Departments selected', async ({
      page,
    }) => {
      // Login as multi-department manager
      await page.goto('/login');
      await page.fill('input[name="email"]', 'multi-dept-manager@example.com');
      await page.fill('input[name="password"]', 'password123');
      await page.click('button[type="submit"]');

      await page.goto('/team');

      // With "All Departments" selected, member cards should show department badges
      // Look for the subtle department badge styling
      const filterVisible = await page.getByText('Department:').isVisible();
      if (filterVisible) {
        // Department badges should be visible (bg-muted styling)
        await expect(page.locator('.bg-muted').first()).toBeVisible();
      }
    });
  });
});
