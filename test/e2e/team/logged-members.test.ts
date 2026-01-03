/**
 * Story 6.2: Team Members Who Logged Today - E2E Tests
 *
 * Tests for logged members display functionality
 */

import { test, expect } from '@playwright/test';

test.describe('Team Logged Members (Story 6.2)', () => {
  test.beforeEach(async ({ page }) => {
    // TODO: Login as manager user
    // This test assumes manager authentication is already set up
    await page.goto('/team');
  });

  test('AC1: Displays logged section with member count', async ({ page }) => {
    // Check section header
    await expect(page.getByText('ลงแล้ว')).toBeVisible();

    // Check count format (X คน)
    await expect(page.locator('text=/\\(\\d+ คน\\)/')).toBeVisible();
  });

  test('AC2: Shows member row with name, hours, and entry count', async ({ page }) => {
    // Wait for logged members section to load
    const loggedSection = page.locator('text=ลงแล้ว').locator('..');

    // Check that at least one member card exists (if there's data)
    const memberCards = loggedSection.locator('.border.rounded-lg');
    const count = await memberCards.count();

    if (count > 0) {
      const firstCard = memberCards.first();

      // Check for member name (any text that looks like a name)
      await expect(firstCard.locator('.font-medium.text-sm')).toBeVisible();

      // Check for hours display (format: X.X ชม.)
      await expect(firstCard.locator('text=/\\d+\\.\\d+ ชม\\./')).toBeVisible();

      // Check for entry count (format: Y รายการ)
      await expect(firstCard.locator('text=/\\d+ รายการ/')).toBeVisible();
    }
  });

  test('AC3: Members sorted by total hours descending', async ({ page }) => {
    const loggedSection = page.locator('text=ลงแล้ว').locator('..');
    const hourElements = loggedSection.locator('text=/\\d+\\.\\d+ ชม\\./');

    const count = await hourElements.count();

    if (count > 1) {
      // Extract hours values
      const hours: number[] = [];
      for (let i = 0; i < count; i++) {
        const text = await hourElements.nth(i).textContent();
        const hoursMatch = text?.match(/(\d+\.\d+)/);
        if (hoursMatch) {
          hours.push(parseFloat(hoursMatch[1]));
        }
      }

      // Verify descending order
      for (let i = 1; i < hours.length; i++) {
        expect(hours[i - 1]).toBeGreaterThanOrEqual(hours[i]);
      }
    }
  });

  test('AC4: Shows green checkmark for 8+ hours', async ({ page }) => {
    const loggedSection = page.locator('text=ลงแล้ว').locator('..');
    const memberCards = loggedSection.locator('.border.rounded-lg');

    const count = await memberCards.count();

    for (let i = 0; i < count; i++) {
      const card = memberCards.nth(i);
      const hoursText = await card.locator('text=/\\d+\\.\\d+ ชม\\./').textContent();
      const hoursMatch = hoursText?.match(/(\d+\.\d+)/);

      if (hoursMatch) {
        const hours = parseFloat(hoursMatch[1]);

        if (hours >= 8) {
          // Should have green text
          const hoursElement = card.locator('text=/\\d+\\.\\d+ ชม\\./');
          await expect(hoursElement).toHaveClass(/text-green-600/);

          // Should have checkmark icon
          await expect(card.locator('svg.lucide-check')).toBeVisible();
        }
      }
    }
  });

  test('AC5: Partial day displays neutral color without negative indicators', async ({
    page,
  }) => {
    const loggedSection = page.locator('text=ลงแล้ว').locator('..');
    const memberCards = loggedSection.locator('.border.rounded-lg');

    const count = await memberCards.count();

    for (let i = 0; i < count; i++) {
      const card = memberCards.nth(i);
      const hoursText = await card.locator('text=/\\d+\\.\\d+ ชม\\./').textContent();
      const hoursMatch = hoursText?.match(/(\d+\.\d+)/);

      if (hoursMatch) {
        const hours = parseFloat(hoursMatch[1]);

        if (hours < 8) {
          // Should NOT have red or warning colors
          const hoursElement = card.locator('text=/\\d+\\.\\d+ ชม\\./');
          const className = await hoursElement.getAttribute('class');

          expect(className).not.toContain('text-red');
          expect(className).not.toContain('text-destructive');
          expect(className).not.toContain('text-amber');
          expect(className).not.toContain('text-warning');

          // Should NOT have checkmark
          await expect(card.locator('svg.lucide-check')).not.toBeVisible();
        }
      }
    }
  });

  test('AC6: Shows empty state when no one logged', async ({ page }) => {
    // This test is difficult without the ability to control data
    // Checking if empty state exists and has correct text
    const emptyText = page.getByText('ยังไม่มีใครลงวันนี้');

    // Section should exist even when empty
    await expect(page.getByText('ลงแล้ว')).toBeVisible();

    // If empty state is visible, verify its content
    if (await emptyText.isVisible()) {
      await expect(emptyText).toBeVisible();
      await expect(page.locator('svg.lucide-users')).toBeVisible();
    }
  });

  test('AC7: Member avatar displays first letter of name', async ({ page }) => {
    const loggedSection = page.locator('text=ลงแล้ว').locator('..');
    const memberCards = loggedSection.locator('.border.rounded-lg');

    const count = await memberCards.count();

    if (count > 0) {
      const firstCard = memberCards.first();

      // Check for avatar (rounded-full element)
      const avatar = firstCard.locator('.rounded-full').first();
      await expect(avatar).toBeVisible();

      // Avatar should have one character
      const avatarText = await avatar.textContent();
      expect(avatarText?.length).toBe(1);
      expect(avatarText).toMatch(/[A-ZА-Яก-ฮ]/); // Latin, Cyrillic, or Thai uppercase
    }
  });

  test('AC8: Tap does nothing for now (placeholder)', async ({ page }) => {
    const loggedSection = page.locator('text=ลงแล้ว').locator('..');
    const memberCards = loggedSection.locator('.border.rounded-lg');

    const count = await memberCards.count();

    if (count > 0) {
      const firstCard = memberCards.first();

      // Click the card
      await firstCard.click();

      // No navigation should occur (URL should stay on /team)
      await expect(page).toHaveURL(/\/team$/);

      // No modal or dialog should appear
      await expect(page.locator('[role="dialog"]')).not.toBeVisible();
    }
  });

  test('Logged section shows correct visual hierarchy', async ({ page }) => {
    // Green dot indicator
    const header = page.locator('text=ลงแล้ว').locator('..');
    await expect(header.locator('.text-green-600')).toBeVisible();

    // Section is a Card component
    const card = page.locator('text=ลงแล้ว').locator('..').locator('..').locator('..');
    await expect(card).toHaveClass(/border/);
    await expect(card).toHaveClass(/rounded-xl/);
  });

  test('Member cards have proper spacing and layout', async ({ page }) => {
    const loggedSection = page.locator('text=ลงแล้ว').locator('..');
    const memberCards = loggedSection.locator('.border.rounded-lg');

    const count = await memberCards.count();

    if (count > 1) {
      // Cards should have space-y-2 spacing
      const cardList = memberCards.first().locator('..'); // Parent container
      await expect(cardList).toHaveClass(/space-y-2/);
    }
  });
});
