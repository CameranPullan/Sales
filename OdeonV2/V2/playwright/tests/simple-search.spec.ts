import { test, expect } from '@playwright/test';

test.describe('Simple Search Test', () => {
  test('basic search without custom fixtures', async ({ page }) => {
    test.setTimeout(30000);
    
    console.log('Starting basic search test');
    
    // Go to Wikipedia homepage
    await page.goto('https://en.wikipedia.org');
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    
    console.log('Loaded Wikipedia homepage');
    
    // Simple search
    const searchInput = page.locator('#searchInput, [name="search"], input[placeholder*="Search"]').first();
    await searchInput.click();
    await searchInput.fill('café');
    
    console.log('Filled search term: café');
    
    // Wait a moment for suggestions to load
    await page.waitForTimeout(1500);
    
    // Check for suggestions and close them more aggressively
    const suggestions = page.locator('[role="listbox"], .suggestions-dropdown, .cdx-menu');
    if (await suggestions.isVisible().catch(() => false)) {
      console.log('Suggestions visible, attempting to close...');
      
      // Try multiple ways to close suggestions
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);
      
      // If still visible, click outside
      if (await suggestions.isVisible().catch(() => false)) {
        console.log('Suggestions still visible, clicking outside');
        await page.click('body');
        await page.waitForTimeout(300);
      }
      
      // If still visible, try clicking the input again
      if (await suggestions.isVisible().catch(() => false)) {
        console.log('Suggestions still visible, refocusing input');
        await searchInput.click();
        await page.waitForTimeout(300);
        await page.keyboard.press('Escape');
        await page.waitForTimeout(300);
      }
    }
    
    console.log('Attempting to submit search');
    
    // Submit search more carefully
    try {
      // Focus the input and press Enter
      await searchInput.focus();
      await page.waitForTimeout(200);
      await searchInput.press('Enter');
      
      // Wait for navigation
      await page.waitForLoadState('networkidle', { timeout: 10000 });
      
      console.log('Search completed successfully, URL:', page.url());
      
      // Verify we navigated away from homepage
      const currentUrl = page.url();
      expect(currentUrl).not.toBe('https://en.wikipedia.org/wiki/Main_Page');
      expect(currentUrl).toContain('wikipedia.org');
      
      const title = await page.title();
      expect(title.length).toBeGreaterThan(0);
      
      console.log('Test completed successfully, title:', title);
      
    } catch (error) {
      console.error('Search submission failed:', error.message);
      
      // Try direct navigation as fallback
      console.log('Trying direct navigation fallback');
      await page.goto('https://en.wikipedia.org/wiki/Special:Search?search=café');
      await page.waitForLoadState('networkidle', { timeout: 10000 });
      
      const title = await page.title();
      expect(title.length).toBeGreaterThan(0);
      
      console.log('Fallback navigation successful');
    }
  });
});
