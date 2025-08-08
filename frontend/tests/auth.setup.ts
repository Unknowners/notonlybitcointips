import { test } from '@playwright/test';
import fs from 'fs';

// Optional one-time script: run `npx playwright test tests/auth.setup.ts --project=chromium --headed`
// then complete Internet Identity login manually in the opened browser. Storage will be saved to storageState.json.

const STORAGE = 'storageState.json';

test('save storage state after manual II login (optional)', async ({ page, context, baseURL }) => {
  if (fs.existsSync(STORAGE)) {
    test.skip(true, 'storageState.json already exists');
  }
  await page.goto(baseURL || '/');
  await page.getByRole('button', { name: 'Sign in with Internet Identity' }).click();
  // Wait generous time for manual login (close popup returns focus)
  await page.waitForTimeout(30_000);
  await context.storageState({ path: STORAGE });
}); 