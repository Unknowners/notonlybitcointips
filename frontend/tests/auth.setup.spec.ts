import { test } from '@playwright/test';
import fs from 'fs';

// Optional one-time script: run this spec headed and complete II login manually.
// Example: npx playwright test tests/auth.setup.spec.ts --project=chromium --headed

const STORAGE = 'storageState.json';

test('save storage state after manual II login (optional)', async ({ page, context, baseURL }) => {
  test.setTimeout(180_000);

  if (fs.existsSync(STORAGE)) {
    test.skip(true, 'storageState.json already exists');
  }

  await page.goto(baseURL || '/');

  // Prepare to catch potential popup
  const popupPromise = context.waitForEvent('page', { timeout: 5_000 }).catch(() => null);

  await page.getByRole('button', { name: 'Sign in with Internet Identity' }).click();

  const popup = await popupPromise;
  if (popup) {
    // Give time to complete login manually in popup, then it should close
    await popup.waitForEvent('close', { timeout: 150_000 }).catch(() => {});
  }

  // Wait until dashboard appears (indicator of successful auth)
  await page.getByRole('heading', { name: 'Create Your Campaign' }).waitFor({ timeout: 150_000 });

  await context.storageState({ path: STORAGE });
}); 