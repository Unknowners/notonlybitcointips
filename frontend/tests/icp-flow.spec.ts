import { test, expect } from '@playwright/test';

// These tests assume local dev server (vite) serving frontend.

test.describe('ICP basic UI', () => {
  test('dashboard renders unauthenticated parts', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('button', { name: 'Sign in with Internet Identity' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Not Only Bitcoin Tips' })).toBeVisible();
    await expect(page.getByText('Sign in with Internet Identity to create donation campaigns')).toBeVisible();
  });

  test('shows alpha warning', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Alpha Version Notice')).toBeVisible();
    await expect(page.getByText('This is an alpha version')).toBeVisible();
  });

  test('displays version information', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Version 0.8.17')).toBeVisible();
  });

  test('has Internet Identity information', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('What is Internet Identity?')).toBeVisible();
    await expect(page.getByText('Internet Identity is an authentication system')).toBeVisible();
  });

  test('create campaign form validation (client-side)', async ({ page }) => {
    await page.goto('/');
    // This test will be expanded when we have authenticated state
    // For now, just verify the page loads
    await expect(page.getByRole('heading', { name: 'Not Only Bitcoin Tips' })).toBeVisible();
  });
});
