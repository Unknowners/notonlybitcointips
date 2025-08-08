import { test, expect } from '@playwright/test';

test.describe('Smoke', () => {
  test('loads home and shows title', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Not Only Bitcoin Tips' })).toBeVisible();
  });
}); 