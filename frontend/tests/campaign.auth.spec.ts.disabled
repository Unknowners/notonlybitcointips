import { test, expect } from '@playwright/test';
import fs from 'fs';

const STORAGE = 'storageState.json';

// Requires storageState.json (run auth.setup.ts once)

test.skip(!fs.existsSync(STORAGE), 'Requires storageState.json, run auth.setup.ts first');

test.describe('Authenticated campaign flow (ICP only)', () => {
  test.use({ storageState: STORAGE });

  test('create campaign form visible and ICP checkbox enabled', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Create Your Campaign' })).toBeVisible();
    await expect(page.getByText('Currencies for Donations')).toBeVisible();
    await expect(page.getByLabel('ICP')).toBeVisible();
  });
}); 