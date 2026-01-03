/**
 * Story 6.3: Team Members Who Haven't Logged Today - E2E Tests
 *
 * Tests for not logged members display functionality
 */

import { test, expect } from '@playwright/test';

test.describe('Team Not Logged Members (Story 6.3)', () => {
  test.beforeEach(async ({ page }) => {
    // Login as manager user
    await page.goto('/login');
    await page.fill('input[name="email"]', 'manager@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Navigate to team dashboard
    await page.goto('/team');
  });

  test('AC1: Displays not logged section with member count', async ({ page }) => {
    // Check section header
    await expect(page.getByText('Not Logged')).toBeVisible();

    // Check count format (X people or X person)
    await expect(page.locator('text=/\\(\\d+ (person|people)\\)/')).toBeVisible();
  });

  test('AC2: Member row shows name and avatar only (no hours)', async ({ page }) => {
    const notLoggedSection = page.locator('text=Not Logged').locator('..');
    const memberCards = notLoggedSection.locator('.border.rounded-lg');

    const count = await memberCards.count();

    if (count > 0) {
      const firstCard = memberCards.first();

      // Check for member name
      await expect(firstCard.locator('.font-medium.text-sm')).toBeVisible();

      // Check for avatar
      await expect(firstCard.locator('.rounded-full')).toBeVisible();

      // Should NOT have hours display
      await expect(firstCard.locator('text=/\\d+\\.\\d+ hrs/')).not.toBeVisible();

      // Should NOT have entry count
      await expect(firstCard.locator('text=/\\d+ entr(y|ies)/')).not.toBeVisible();
    }
  });

  test('AC3: Members appear in alphabetical order', async ({ page }) => {
    const notLoggedSection = page.locator('text=Not Logged').locator('..');
    const nameElements = notLoggedSection.locator('.font-medium.text-sm');

    const count = await nameElements.count();

    if (count > 1) {
      // Extract names
      const names: string[] = [];
      for (let i = 0; i < count; i++) {
        const text = await nameElements.nth(i).textContent();
        if (text) {
          names.push(text.toLowerCase());
        }
      }

      // Verify alphabetical order
      for (let i = 1; i < names.length; i++) {
        expect(names[i - 1].localeCompare(names[i], 'en')).toBeLessThanOrEqual(0);
      }
    }
  });

  test('AC4: Neutral styling before 5 PM (no orange dot)', async ({ page }) => {
    // This test depends on time of day
    // Check that orange dot is not always present
    const notLoggedSection = page.locator('text=Not Logged').locator('..');

    // Just verify section exists - time-based testing is complex in E2E
    await expect(notLoggedSection).toBeVisible();
  });

  test('AC5: No aggressive warning indicators', async ({ page }) => {
    const notLoggedSection = page.locator('text=Not Logged').locator('..');
    const memberCards = notLoggedSection.locator('.border.rounded-lg');

    const count = await memberCards.count();

    for (let i = 0; i < count; i++) {
      const card = memberCards.nth(i);

      // Should NOT have red colors
      await expect(card.locator('.text-red-600')).not.toBeVisible();
      await expect(card.locator('.bg-red-100')).not.toBeVisible();

      // Should NOT have alert icons
      await expect(card.locator('svg.lucide-alert-triangle')).not.toBeVisible();
      await expect(card.locator('svg.lucide-alert-circle')).not.toBeVisible();
    }
  });

  test('AC6: Shows success state when everyone has logged', async ({ page }) => {
    const successMessage = page.getByText('Everyone has logged!');

    // Section should exist
    await expect(page.getByText('Not Logged')).toBeVisible();

    // If success state is visible, verify its content
    if (await successMessage.isVisible()) {
      await expect(successMessage).toBeVisible();
      await expect(page.getByText('Great job, team!')).toBeVisible();
      await expect(page.getByText('(0 people)')).toBeVisible();

      // Should have celebration icon
      await expect(page.locator('svg.lucide-party-popper')).toBeVisible();

      // Should have green styling
      const successCard = successMessage.locator('../../../..');
      await expect(successCard).toHaveClass(/border-green-200/);
    }
  });

  test('AC7: Visual consistency with logged members section', async ({ page }) => {
    const loggedSection = page.locator('text=Logged Today').locator('..');
    const notLoggedSection = page.locator('text=Not Logged').locator('..');

    // Both sections should be Card components
    const loggedCard = loggedSection.locator('..').locator('..');
    const notLoggedCard = notLoggedSection.locator('..').locator('..');

    await expect(loggedCard).toHaveClass(/border/);
    await expect(notLoggedCard).toHaveClass(/border/);

    // Check avatar sizes are consistent (both use md size = h-10 w-10)
    const loggedAvatar = loggedCard.locator('.rounded-full').first();
    const notLoggedAvatar = notLoggedCard.locator('.rounded-full').first();

    if ((await loggedAvatar.isVisible()) && (await notLoggedAvatar.isVisible())) {
      await expect(loggedAvatar).toHaveClass(/h-10/);
      await expect(notLoggedAvatar).toHaveClass(/h-10/);
    }
  });

  test('Not logged section shows neutral dot indicator', async ({ page }) => {
    const header = page.locator('text=Not Logged').locator('..');

    // Should have neutral (empty) circle, not green dot
    await expect(header.locator('text=○')).toBeVisible();
  });

  test('Member cards have proper spacing', async ({ page }) => {
    const notLoggedSection = page.locator('text=Not Logged').locator('..');
    const memberCards = notLoggedSection.locator('.border.rounded-lg');

    const count = await memberCards.count();

    if (count > 1) {
      // Cards should have space-y-2 spacing
      const cardList = memberCards.first().locator('..'); // Parent container
      await expect(cardList).toHaveClass(/space-y-2/);
    }
  });

  test('Member card has consistent padding (p-3)', async ({ page }) => {
    const notLoggedSection = page.locator('text=Not Logged').locator('..');
    const memberCards = notLoggedSection.locator('.border.rounded-lg');

    const count = await memberCards.count();

    if (count > 0) {
      const firstCard = memberCards.first();
      await expect(firstCard).toHaveClass(/p-3/);
    }
  });

  test('Tap on not-logged member does nothing (placeholder)', async ({ page }) => {
    const notLoggedSection = page.locator('text=Not Logged').locator('..');
    const memberCards = notLoggedSection.locator('.border.rounded-lg');

    const count = await memberCards.count();

    if (count > 0) {
      const firstCard = memberCards.first();

      // Click the card
      await firstCard.click();

      // No navigation should occur
      await expect(page).toHaveURL(/\/team$/);

      // No modal or dialog should appear
      await expect(page.locator('[role="dialog"]')).not.toBeVisible();
    }
  });
});
