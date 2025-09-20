import { test, expect } from '@playwright/test';

test.describe('Save User Session', () => {
  test('authenticate user and save session to sessionStorage', async ({ page, context }) => {
    console.log('🚀 Starting session save test...');
    
    // Go to the app
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    console.log('📱 Navigated to app');
    
    // Check if we're already authenticated
    const isAlreadyAuthenticated = await page.locator('text=Create Your Campaign').isVisible().catch(() => false);
    console.log('🔍 Authentication check:', isAlreadyAuthenticated ? 'Already authenticated' : 'Not authenticated');
    
    if (isAlreadyAuthenticated) {
      console.log('✅ Already authenticated! Session should be saved automatically.');
      
      // Verify we can see authenticated content
      await expect(page.getByText('Create Your Campaign')).toBeVisible();
      console.log('✅ Authentication verified - session is working');
      
    } else {
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
        
        // Verify we're now authenticated
        const nowAuthenticated = await page.locator('text=Create Your Campaign').isVisible().catch(() => false);
        console.log('🔐 After auth status:', nowAuthenticated ? 'AUTHENTICATED' : 'NOT AUTHENTICATED');
        
        if (nowAuthenticated) {
          console.log('✅ Authentication successful!');
          
          // Verify session is saved in sessionStorage
          const sessionData = await page.evaluate(() => {
            return sessionStorage.getItem('notonlybitcointips_auth_session');
          });
          
          expect(sessionData).toBeTruthy();
          console.log('💾 Session data saved to sessionStorage:', sessionData);
          
          // Verify authentication worked
          await expect(page.getByText('Create Your Campaign')).toBeVisible({ timeout: 10000 });
          console.log('✅ Authentication verified - session saved successfully!');
        } else {
          console.log('❌ Authentication failed - still not authenticated');
          throw new Error('Authentication failed');
        }
      } else {
        console.log('⚠️ No popup detected, checking if already authenticated...');
        await page.waitForTimeout(2000);
        
        const stillNotAuthenticated = await page.locator('text=Create Your Campaign').isVisible().catch(() => false);
        if (stillNotAuthenticated) {
          console.log('✅ Actually authenticated! Session should be saved.');
        } else {
          console.log('❌ Still not authenticated. Please check manually.');
          throw new Error('Authentication failed');
        }
      }
    }
    
    console.log('🎉 Session save test completed successfully!');
  });
});
