/**
 * Touch Feedback E2E Tests
 * Story 8.4 - AC 2: Touch feedback timing verification
 *
 * Verifies that touch feedback appears within 50ms as required by AC 2.
 */

import { test, expect } from '@playwright/test';

test.describe('Touch Feedback Timing (Story 8.4 - AC 2)', () => {
  test('buttons have touch-feedback class with 50ms transition', async ({ page }) => {
    // Navigate to a page with buttons
    await page.goto('/login');

    // Find a button (login submit button)
    const button = page.getByRole('button', { name: /sign in/i });

    // Verify touch-feedback class exists
    const classList = await button.evaluate((el) => Array.from(el.classList));
    expect(classList).toContain('touch-feedback');

    // Verify CSS transition timing is 50ms (0.05s)
    const transitionDuration = await button.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return styles.transitionDuration;
    });

    // Should include "0.05s" for the 50ms requirement
    expect(transitionDuration).toContain('0.05s');
  });

  test('icon buttons have touch-feedback class', async ({ page }) => {
    await page.goto('/login');

    // Check if there are any icon buttons on the page
    const iconButtons = page.locator('button[aria-label]');
    const count = await iconButtons.count();

    if (count > 0) {
      const firstButton = iconButtons.first();
      const classList = await firstButton.evaluate((el) => Array.from(el.classList));
      expect(classList).toContain('touch-feedback');
    }
  });

  test('touch-feedback CSS defines correct timing in globals.css', async ({ page }) => {
    await page.goto('/');

    // Check that touch-feedback CSS rule exists with correct timing
    const hasTouchFeedback = await page.evaluate(() => {
      const sheets = Array.from(document.styleSheets);

      for (const sheet of sheets) {
        try {
          const rules = Array.from(sheet.cssRules || []);
          const touchFeedbackRule = rules.find((rule) => {
            if (rule instanceof CSSStyleRule) {
              return rule.selectorText?.includes('touch-feedback');
            }
            return false;
          });

          if (touchFeedbackRule && touchFeedbackRule instanceof CSSStyleRule) {
            const transition = touchFeedbackRule.style.transition;
            // Check for "0.05s" or "50ms" in transition property
            return transition?.includes('0.05s') || transition?.includes('50ms');
          }
        } catch {
          // Skip stylesheets that can't be accessed (CORS)
          continue;
        }
      }

      return false;
    });

    expect(hasTouchFeedback).toBe(true);
  });
});
