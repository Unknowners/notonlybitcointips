import { test, expect } from '@playwright/test';

test.describe('Session Flow - Save and Use', () => {
  test('authenticate user, save session, and verify it works', async ({ page, context }) => {
    console.log('🚀 Starting complete session flow test...');
    
    // === PART 1: AUTHENTICATION AND SESSION SAVING ===
    console.log('📝 Part 1: Authentication and session saving...');
    
    // Go to the app
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    console.log('📱 Navigated to app');
    
    // Check if we're already authenticated
    const isAlreadyAuthenticated = await page.locator('text=Create Your Campaign').isVisible().catch(() => false);
    console.log('🔍 Authentication check:', isAlreadyAuthenticated ? 'Already authenticated' : 'Not authenticated');
    
    if (!isAlreadyAuthenticated) {
      console.log('🔐 Not authenticated, starting login process...');
      
      // Click sign in button
      await page.getByRole('button', { name: 'Sign in with Internet Identity' }).click();
      console.log('🔑 Clicked sign in button');
      
      // Wait for Internet Identity popup
      const popupPromise = context.waitForEvent('page', { timeout: 10000 });
      const popup = await popupPromise;
      
      if (popup) {
        console.log('🌐 Internet Identity popup opened. Please complete login...');
        console.log('⏳ Waiting for you to complete authentication...');
        
        // Wait for popup to close (indicating successful login)
        await popup.waitForEvent('close', { timeout: 120000 });
        console.log('✅ Authentication completed!');
        
        // Wait for the main page to update after authentication
        await page.waitForTimeout(5000);
      }
    } else {
      console.log('✅ Already authenticated!');
    }
    
    // Verify we're authenticated
    await expect(page.getByText('Create Your Campaign')).toBeVisible({ timeout: 10000 });
    console.log('✅ Authentication verified - Create Campaign form is visible');
    
    // Verify session is saved in sessionStorage
    const sessionData = await page.evaluate(() => {
      return sessionStorage.getItem('notonlybitcointips_auth_session');
    });
    
    expect(sessionData).toBeTruthy();
    console.log('💾 Session data saved to sessionStorage:', sessionData);
    
    // Parse and verify session data
    const session = JSON.parse(sessionData!);
    expect(session.isAuthenticated).toBe(true);
    expect(session.principal).toBeTruthy();
    console.log('✅ Session data is valid:', session);
    
    // === PART 2: SESSION VERIFICATION ===
    console.log('📝 Part 2: Session verification...');
    
    // Refresh the page to test session loading
    await page.reload();
    await page.waitForLoadState('networkidle');
    console.log('🔄 Page refreshed, testing session loading...');
    
    // Wait a bit for the app to process the session
    await page.waitForTimeout(3000);
    
    // Check if we're still authenticated after page refresh
    const stillAuthenticated = await page.locator('text=Create Your Campaign').isVisible().catch(() => false);
    console.log('🔐 After refresh authentication status:', stillAuthenticated ? 'AUTHENTICATED' : 'NOT AUTHENTICATED');
    
    if (stillAuthenticated) {
      console.log('✅ Successfully authenticated using saved session after refresh!');
      
      // Verify we can see the dashboard
      await expect(page.getByText('Create Your Campaign')).toBeVisible();
      await expect(page.getByText('Your Campaigns')).toBeVisible();
      console.log('✅ Dashboard is visible - session is working correctly!');
      
      // Verify we can see user campaigns section (check for any button with "Create" text)
      const createButton = page.locator('button:has-text("Create")').first();
      await expect(createButton).toBeVisible();
      console.log('✅ Campaign management UI is visible!');
      
    } else {
      console.log('❌ Not authenticated after refresh despite having saved session');
      throw new Error('Session not working after page refresh');
    }
    
    console.log('🎉 Complete session flow test completed successfully!');
    console.log('✅ Session saving works');
    console.log('✅ Session loading works');
    console.log('✅ User can access dashboard with saved session');
  });
});
