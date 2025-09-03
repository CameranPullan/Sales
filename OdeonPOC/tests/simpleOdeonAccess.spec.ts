import { test, expect } from '@playwright/test';

test.describe('Simple Odeon Website Access Test', () => {
  test('should be able to access Odeon UK website', async ({ page }) => {
    try {
      await page.goto('https://www.odeon.co.uk');
      await page.waitForLoadState('domcontentloaded');
      
      const title = await page.title();
      console.log('Page title:', title);
      
      const url = page.url();
      console.log('Current URL:', url);
      
      expect(title.length).toBeGreaterThan(0);
      
    } catch (error) {
      console.error('Error accessing Odeon website:', error);
      throw error;
    }
  });
});
