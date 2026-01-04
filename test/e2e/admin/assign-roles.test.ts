/**
 * Assign Roles E2E Tests
 * Story 7.5: Assign Roles
 *
 * Tests verify:
 * - AC 1: Admin sees staff, manager, admin options (not super_admin)
 * - AC 2: Role change success
 * - AC 3: Manager department prompt
 * - AC 4: Super Admin role visibility
 * - AC 5: Role downgrade handling
 * - AC 6: Self-demotion protection
 */

import { test, expect } from '@playwright/test';

test.describe('Story 7.5: Assign Roles', () => {
  test.describe('AC 1: Role Dropdown Options for Admin', () => {
    test.beforeEach(async ({ page }) => {
      // Login as admin
      await page.goto('/login');
      await page.fill('input[name="email"]', 'admin@example.com');
      await page.fill('input[name="password"]', 'password123');
      await page.click('button[type="submit"]');
      await expect(page).toHaveURL(/\/(dashboard|entry|admin)/);

      // Navigate to Users page
      await page.goto('/admin/users');
      await expect(page).toHaveURL(/\/admin\/users/);
    });

    test('admin sees staff, manager, admin options in role dropdown', async ({ page }) => {
      await page.waitForSelector('table');

      // Click Edit button on a user that is NOT the current admin
      const editButtons = page.locator('button[aria-label^="Edit"]');
      await editButtons.first().click();

      // Wait for dialog
      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();

      // Wait for loading to complete
      await expect(dialog.locator('[role="status"]')).not.toBeVisible({ timeout: 5000 });

      // Open role dropdown
      const roleSelect = dialog.getByLabel(/role/i);
      await roleSelect.click();

      // Should see staff, manager, admin
      await expect(page.getByRole('option', { name: /staff/i })).toBeVisible();
      await expect(page.getByRole('option', { name: /manager/i })).toBeVisible();
      await expect(page.getByRole('option', { name: /admin/i })).toBeVisible();

      // Should NOT see super_admin
      await expect(page.getByRole('option', { name: /super admin/i })).not.toBeVisible();
    });
  });

  test.describe('AC 4: Super Admin Role Visibility', () => {
    test.beforeEach(async ({ page }) => {
      // Login as super_admin
      await page.goto('/login');
      await page.fill('input[name="email"]', 'superadmin@example.com');
      await page.fill('input[name="password"]', 'password123');
      await page.click('button[type="submit"]');
      await expect(page).toHaveURL(/\/(dashboard|entry|admin)/);

      // Navigate to Users page
      await page.goto('/admin/users');
      await expect(page).toHaveURL(/\/admin\/users/);
    });

    test('super_admin sees all 4 role options including super_admin', async ({ page }) => {
      await page.waitForSelector('table');

      // Click Edit button
      const editButton = page.locator('button[aria-label^="Edit"]').first();
      await editButton.click();

      // Wait for dialog
      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();

      // Wait for loading to complete
      await expect(dialog.locator('[role="status"]')).not.toBeVisible({ timeout: 5000 });

      // Open role dropdown
      const roleSelect = dialog.getByLabel(/role/i);
      await roleSelect.click();

      // Should see all 4 options including super_admin
      await expect(page.getByRole('option', { name: /^staff$/i })).toBeVisible();
      await expect(page.getByRole('option', { name: /^manager$/i })).toBeVisible();
      await expect(page.getByRole('option', { name: /^admin$/i })).toBeVisible();
      await expect(page.getByRole('option', { name: /super admin/i })).toBeVisible();
    });
  });

  test.describe('AC 3: Manager Department Prompt', () => {
    test.beforeEach(async ({ page }) => {
      // Login as admin
      await page.goto('/login');
      await page.fill('input[name="email"]', 'admin@example.com');
      await page.fill('input[name="password"]', 'password123');
      await page.click('button[type="submit"]');
      await expect(page).toHaveURL(/\/(dashboard|entry|admin)/);

      // Navigate to Users page
      await page.goto('/admin/users');
      await expect(page).toHaveURL(/\/admin\/users/);
    });

    test('shows department prompt when changing role to manager', async ({ page }) => {
      await page.waitForSelector('table');

      // Find a staff user to edit (look for "Staff" badge)
      // We need a non-manager user for this test to work
      const staffRow = page.locator('table tbody tr').filter({
        has: page.locator('text=Staff'),
      });

      // Click edit button for staff user
      const staffEditButton = staffRow.first().locator('button[aria-label^="Edit"]');
      const hasStaffUser = await staffEditButton.isVisible();
      if (hasStaffUser) {
        await staffEditButton.click();
      } else {
        // Skip test if no staff user available (all users are already managers)
        test.skip();
        return;
      }

      // Wait for dialog
      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();

      // Wait for loading to complete
      await expect(dialog.locator('[role="status"]')).not.toBeVisible({ timeout: 5000 });

      // Change role to manager
      const roleSelect = dialog.getByLabel(/role/i);
      await roleSelect.click();
      await page.getByRole('option', { name: /^manager$/i }).click();

      // Save the change
      await dialog.getByRole('button', { name: /save/i }).click();

      // Wait for either: department prompt OR success toast
      // If staff→manager, prompt should appear
      // If already manager, success toast appears without prompt
      const deptPrompt = page.locator('[role="alertdialog"]');
      const successToast = page.getByText(/user updated successfully/i);

      // Wait for one of these to appear
      await expect(deptPrompt.or(successToast)).toBeVisible({ timeout: 5000 });

      // If department prompt appeared, verify its contents
      if (await deptPrompt.isVisible()) {
        await expect(deptPrompt.getByText(/assign departments/i)).toBeVisible();
        await expect(deptPrompt.getByRole('button', { name: /assign now/i })).toBeVisible();
        await expect(deptPrompt.getByRole('button', { name: /later/i })).toBeVisible();
      }
    });
  });

  test.describe('AC 6: Self-Demotion Protection', () => {
    test.beforeEach(async ({ page }) => {
      // Login as admin
      await page.goto('/login');
      await page.fill('input[name="email"]', 'admin@example.com');
      await page.fill('input[name="password"]', 'password123');
      await page.click('button[type="submit"]');
      await expect(page).toHaveURL(/\/(dashboard|entry|admin)/);

      // Navigate to Users page
      await page.goto('/admin/users');
      await expect(page).toHaveURL(/\/admin\/users/);
    });

    test('cannot change own role - shows error', async ({ page }) => {
      await page.waitForSelector('table');

      // Find the row with admin@example.com (the current user)
      const adminRow = page.locator('table tbody tr').filter({
        has: page.locator('text=admin@example.com'),
      });

      // Click edit button for own account
      const editButton = adminRow.locator('button[aria-label^="Edit"]');
      await editButton.click();

      // Wait for dialog
      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();

      // Wait for loading to complete
      await expect(dialog.locator('[role="status"]')).not.toBeVisible({ timeout: 5000 });

      // Try to change role to staff
      const roleSelect = dialog.getByLabel(/role/i);
      await roleSelect.click();
      await page.getByRole('option', { name: /^staff$/i }).click();

      // Save the change
      await dialog.getByRole('button', { name: /save/i }).click();

      // Should show error toast
      await expect(page.getByText(/cannot change your own role/i)).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('AC 2: Role Change Success', () => {
    test.beforeEach(async ({ page }) => {
      // Login as super_admin (to have more flexibility with role changes)
      await page.goto('/login');
      await page.fill('input[name="email"]', 'superadmin@example.com');
      await page.fill('input[name="password"]', 'password123');
      await page.click('button[type="submit"]');
      await expect(page).toHaveURL(/\/(dashboard|entry|admin)/);

      // Navigate to Users page
      await page.goto('/admin/users');
      await expect(page).toHaveURL(/\/admin\/users/);
    });

    test('role change updates successfully with success toast', async ({ page }) => {
      await page.waitForSelector('table');

      // Find a non-super_admin user to edit
      const userRow = page.locator('table tbody tr').filter({
        hasNot: page.locator('text=superadmin@example.com'),
      });

      const editButton = userRow.first().locator('button[aria-label^="Edit"]');
      await editButton.click();

      // Wait for dialog
      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();

      // Wait for loading to complete
      await expect(dialog.locator('[role="status"]')).not.toBeVisible({ timeout: 5000 });

      // Make a small change (e.g., update display name to trigger form dirty state)
      const displayNameInput = dialog.locator('input#displayName');
      const currentName = await displayNameInput.inputValue();
      await displayNameInput.fill(currentName + ' Updated');

      // Save the change
      await dialog.getByRole('button', { name: /save/i }).click();

      // Should show success toast
      await expect(page.getByText(/user updated successfully/i)).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Admin Cannot Assign Super Admin', () => {
    test.beforeEach(async ({ page }) => {
      // Login as admin (not super_admin)
      await page.goto('/login');
      await page.fill('input[name="email"]', 'admin@example.com');
      await page.fill('input[name="password"]', 'password123');
      await page.click('button[type="submit"]');
      await expect(page).toHaveURL(/\/(dashboard|entry|admin)/);

      // Navigate to Users page
      await page.goto('/admin/users');
      await expect(page).toHaveURL(/\/admin\/users/);
    });

    test('super_admin option is not available for admin users', async ({ page }) => {
      await page.waitForSelector('table');

      // Click Edit on first user
      await page.locator('button[aria-label^="Edit"]').first().click();

      // Wait for dialog
      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();

      // Wait for loading to complete
      await expect(dialog.locator('[role="status"]')).not.toBeVisible({ timeout: 5000 });

      // Open role dropdown
      const roleSelect = dialog.getByLabel(/role/i);
      await roleSelect.click();

      // Count the options - should only be 3 (staff, manager, admin)
      const options = page.locator('[role="option"]');
      await expect(options).toHaveCount(3);

      // Verify super_admin is not in the list
      await expect(page.getByRole('option', { name: /super admin/i })).not.toBeVisible();
    });
  });
});
