import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173';

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  expect: { timeout: 5_000 },
  use: {
    baseURL,
    headless: true,
    trace: 'on-first-retry',
    // storageState will be supplied later for authenticated tests
  },
  webServer: {
    command: 'npm run dev -- --port=5173',
    url: baseURL,
    reuseExistingServer: true,
    timeout: 120_000,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  reporter: [['list'], ['html', { open: 'never' }]],
}); 