// test/e2e/team/access.test.ts
import { test, expect } from '@playwright/test';

test.describe('Team Dashboard Access', () => {
  test('manager can access team dashboard', async ({ page }) => {
    // Login as manager
    await page.goto('/login');
    await page.fill('input[name="email"]', 'manager@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Navigate to team dashboard
    await page.goto('/team');

    await expect(page).toHaveURL('/team');
    await expect(page.getByText('Team Dashboard')).toBeVisible();
  });

  test('staff is redirected to dashboard', async ({ page }) => {
    // Login as staff
    await page.goto('/login');
    await page.fill('input[name="email"]', 'staff@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Try to access team dashboard
    await page.goto('/team');

    // Should be redirected
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByText('No permission')).toBeVisible();
  });

  test('admin can access team dashboard', async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Navigate to team dashboard
    await page.goto('/team');

    await expect(page).toHaveURL('/team');
    await expect(page.getByText('Team Dashboard')).toBeVisible();
  });

  test('shows today date on dashboard', async ({ page }) => {
    // Login as manager
    await page.goto('/login');
    await page.fill('input[name="email"]', 'manager@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    await page.goto('/team');

    // Should show formatted date
    const today = new Date();
    await expect(
      page.getByText(new RegExp(today.getDate().toString()))
    ).toBeVisible();
  });

  test('shows team tab in bottom nav for manager', async ({ page }) => {
    // Login as manager
    await page.goto('/login');
    await page.fill('input[name="email"]', 'manager@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    await page.goto('/dashboard');

    await expect(page.getByRole('link', { name: /team/i })).toBeVisible();
  });

  test('hides team tab for staff', async ({ page }) => {
    // Login as staff
    await page.goto('/login');
    await page.fill('input[name="email"]', 'staff@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    await page.goto('/dashboard');

    await expect(page.getByRole('link', { name: /team/i })).not.toBeVisible();
  });

  test('shows managed departments', async ({ page }) => {
    // Login as manager
    await page.goto('/login');
    await page.fill('input[name="email"]', 'manager@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    await page.goto('/team');

    // Should show department name(s) in header
    await expect(
      page.locator('text=/department|dept|team/i').first()
    ).toBeVisible();
  });

  test('shows team member count in stats card', async ({ page }) => {
    // Login as manager
    await page.goto('/login');
    await page.fill('input[name="email"]', 'manager@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    await page.goto('/team');

    // Should show team member count
    await expect(page.getByText(/team members/i)).toBeVisible();
  });
});
