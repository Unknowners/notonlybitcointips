import { test, expect } from '@playwright/test';

test.describe('Use Saved Session', () => {
  test('load saved session and verify user is authenticated', async ({ page, context }) => {
    console.log('🚀 Starting session use test...');
    
    // Go to the app
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    console.log('📱 Navigated to app');
    
    // Check if we have a saved session in sessionStorage
    const sessionData = await page.evaluate(() => {
      return sessionStorage.getItem('notonlybitcointips_auth_session');
    });
    
    if (!sessionData) {
      console.log('❌ No saved session found in sessionStorage');
      console.log('💡 Please run save-session test first to create a session');
      throw new Error('No saved session found. Run save-session test first.');
    }
    
    console.log('✅ Found saved session data:', sessionData);
    
    // Parse session data to verify it's valid
    let session;
    try {
      session = JSON.parse(sessionData);
      expect(session.isAuthenticated).toBe(true);
      expect(session.principal).toBeTruthy();
      console.log('✅ Session data is valid:', session);
    } catch (error) {
      console.log('❌ Invalid session data format');
      throw new Error('Invalid session data format');
    }
    
    // Wait a bit for the app to process the session
    await page.waitForTimeout(2000);
    
    // Check if we're authenticated by looking for authenticated UI
    const isAuthenticated = await page.locator('text=Create Your Campaign').isVisible().catch(() => false);
    console.log('🔐 Authentication status:', isAuthenticated ? 'AUTHENTICATED' : 'NOT AUTHENTICATED');
    
    if (isAuthenticated) {
      console.log('✅ Successfully authenticated using saved session!');
      
      // Verify we can see the dashboard
      await expect(page.getByText('Create Your Campaign')).toBeVisible();
      await expect(page.getByText('Your Campaigns')).toBeVisible();
      console.log('✅ Dashboard is visible - session is working correctly!');
      
      // Verify we can see user campaigns section
      await expect(page.getByRole('button', { name: 'Create New Campaign' })).toBeVisible();
      console.log('✅ Campaign management UI is visible!');
      
    } else {
      console.log('❌ Not authenticated despite having saved session');
      console.log('💡 This might indicate the session expired or is invalid');
      throw new Error('Session not working - user not authenticated');
    }
    
    console.log('🎉 Session use test completed successfully!');
  });
});
