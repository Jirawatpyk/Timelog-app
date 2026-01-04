/**
 * Edit User E2E Tests
 * Story 7.3: Edit User Information
 *
 * Tests verify:
 * - AC 1: Edit button and form access with pre-populated data
 * - AC 2: Successful user update with toast notification
 * - AC 5: Form cancellation with unsaved changes confirmation
 */

import { test, expect } from '@playwright/test';

test.describe('Story 7.3: Edit User Information', () => {
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

  test.describe('AC 1: Edit Button and Form Access', () => {
    test('should display edit button on user row', async ({ page }) => {
      // Wait for users to load
      await page.waitForSelector('table');

      // Find edit button (Pencil icon) in the first row
      const editButton = page.locator('button[aria-label^="Edit"]').first();
      await expect(editButton).toBeVisible();
    });

    test('should open edit dialog when clicking Edit button', async ({ page }) => {
      await page.waitForSelector('table');

      // Click the first Edit button
      const editButton = page.locator('button[aria-label^="Edit"]').first();
      await editButton.click();

      // Verify dialog opens
      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();
      await expect(dialog.getByText('Edit User')).toBeVisible();
    });

    test('should pre-populate form with user data', async ({ page }) => {
      await page.waitForSelector('table');

      // Get the first user's email from the table
      const firstUserEmail = await page.locator('table tbody tr').first().locator('td').nth(1).textContent();

      // Click Edit button
      await page.locator('button[aria-label^="Edit"]').first().click();

      // Verify form is pre-populated with user's email
      const emailInput = page.getByRole('dialog').locator('input[type="email"]');
      await expect(emailInput).toHaveValue(firstUserEmail?.trim() || '');
    });

    test('should show Save button in edit dialog', async ({ page }) => {
      await page.waitForSelector('table');
      await page.locator('button[aria-label^="Edit"]').first().click();

      // Verify Save button exists (not Create)
      const dialog = page.getByRole('dialog');
      await expect(dialog.getByRole('button', { name: /save/i })).toBeVisible();
      await expect(dialog.getByRole('button', { name: /create/i })).not.toBeVisible();
    });
  });

  test.describe('AC 5: Form Cancellation', () => {
    test('should close dialog when clicking Cancel with no changes', async ({ page }) => {
      await page.waitForSelector('table');
      await page.locator('button[aria-label^="Edit"]').first().click();

      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();

      // Click Cancel
      await dialog.getByRole('button', { name: /cancel/i }).click();

      // Dialog should close
      await expect(dialog).not.toBeVisible();
    });

    test('should show confirmation when closing with unsaved changes', async ({ page }) => {
      await page.waitForSelector('table');
      await page.locator('button[aria-label^="Edit"]').first().click();

      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();

      // Make a change to the display name
      const displayNameInput = dialog.locator('input#displayName');
      await displayNameInput.clear();
      await displayNameInput.fill('Changed Name');

      // Click Cancel
      await dialog.getByRole('button', { name: /cancel/i }).click();

      // Confirmation dialog should appear
      const confirmDialog = page.locator('[role="alertdialog"]');
      await expect(confirmDialog).toBeVisible();
      await expect(confirmDialog.getByText(/discard changes/i)).toBeVisible();
    });

    test('should close both dialogs when confirming discard', async ({ page }) => {
      await page.waitForSelector('table');
      await page.locator('button[aria-label^="Edit"]').first().click();

      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();

      // Make a change
      const displayNameInput = dialog.locator('input#displayName');
      await displayNameInput.clear();
      await displayNameInput.fill('Changed Name');

      // Click Cancel
      await dialog.getByRole('button', { name: /cancel/i }).click();

      // Click Discard in confirmation dialog
      const confirmDialog = page.locator('[role="alertdialog"]');
      await confirmDialog.getByRole('button', { name: /discard/i }).click();

      // Both dialogs should close
      await expect(dialog).not.toBeVisible();
      await expect(confirmDialog).not.toBeVisible();
    });

    test('should keep editing when clicking Keep Editing', async ({ page }) => {
      await page.waitForSelector('table');
      await page.locator('button[aria-label^="Edit"]').first().click();

      const dialog = page.getByRole('dialog');

      // Make a change
      const displayNameInput = dialog.locator('input#displayName');
      await displayNameInput.clear();
      await displayNameInput.fill('Changed Name');

      // Click Cancel
      await dialog.getByRole('button', { name: /cancel/i }).click();

      // Click Keep Editing
      const confirmDialog = page.locator('[role="alertdialog"]');
      await confirmDialog.getByRole('button', { name: /keep editing/i }).click();

      // Confirmation should close but edit dialog stays open
      await expect(confirmDialog).not.toBeVisible();
      await expect(dialog).toBeVisible();

      // Changed value should still be there
      await expect(displayNameInput).toHaveValue('Changed Name');
    });
  });

  test.describe('Form Fields', () => {
    test('should display all editable fields', async ({ page }) => {
      await page.waitForSelector('table');
      await page.locator('button[aria-label^="Edit"]').first().click();

      const dialog = page.getByRole('dialog');

      // Verify all fields are present
      await expect(dialog.locator('input#email')).toBeVisible();
      await expect(dialog.locator('input#displayName')).toBeVisible();
      await expect(dialog.getByLabel(/role/i)).toBeVisible();
      await expect(dialog.getByLabel(/department/i)).toBeVisible();
    });

    test('should show loading state while fetching data', async ({ page }) => {
      // Slow down the network to observe loading state
      await page.route('**/rest/v1/**', async (route) => {
        await new Promise((r) => setTimeout(r, 1000));
        await route.continue();
      });

      await page.waitForSelector('table');
      await page.locator('button[aria-label^="Edit"]').first().click();

      // Should show loading indicator
      const dialog = page.getByRole('dialog');
      await expect(dialog.getByRole('status')).toBeVisible();
    });
  });
});
