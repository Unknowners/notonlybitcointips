import { test, expect } from '@playwright/test';

// These tests assume local dev server (vite) serving frontend.

test.describe('ICP basic UI', () => {
  test('dashboard renders unauthenticated parts', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('button', { name: 'Sign in with Internet Identity' })).toBeVisible();
  });

  test('create campaign form validation (client-side)', async ({ page }) => {
    await page.goto('/');
    // Placeholder for authenticated path.
  });
}); 