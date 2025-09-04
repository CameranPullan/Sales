import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { SearchResultsPage } from '../pages/SearchResultsPage';

test.describe('Debug Search Issues', () => {
  test('simple search test to debug context closure', async ({ page }) => {
    test.setTimeout(30000);
    
    console.log('Starting debug search test');
    
    try {
      // Go to Wikipedia homepage
      await page.goto('https://en.wikipedia.org');
      await page.waitForLoadState('networkidle', { timeout: 10000 });
      
      console.log('Loaded Wikipedia homepage');
      
      // Simple search without complex logic
      const searchInput = page.locator('#searchInput, [name="search"], input[placeholder*="Search"]').first();
      await searchInput.click();
      await searchInput.fill('café');
      
      console.log('Filled search term');
      
      // Wait a moment for suggestions
      await page.waitForTimeout(1000);
      
      // Check for suggestions and close them
      const suggestions = page.locator('[role="listbox"], .suggestions-dropdown');
      if (await suggestions.isVisible().catch(() => false)) {
        console.log('Suggestions visible, pressing Escape');
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
      }
      
      // Press Enter to search
      await searchInput.press('Enter');
      await page.waitForTimeout(3000);
      
      console.log('Completed search, current URL:', page.url());
      
      // Basic validation
      const title = await page.title();
      expect(title.length).toBeGreaterThan(0);
      
      console.log('Test completed successfully');
      
    } catch (error) {
      console.error('Test failed with error:', error.message);
      throw error;
    }
  });
  
  test('test with HomePage class', async ({ page }) => {
    test.setTimeout(30000);
    
    console.log('Starting HomePage class test');
    
    try {
      const homePage = new HomePage(page, 'en');
      await homePage.goto();
      await page.waitForLoadState('networkidle', { timeout: 10000 });
      
      console.log('Loaded with HomePage class');
      
      const searchResultsPage = new SearchResultsPage(page, 'en');
      await searchResultsPage.performSearch('test');
      
      console.log('Search completed with SearchResultsPage class');
      
      const title = await page.title();
      expect(title.length).toBeGreaterThan(0);
      
      console.log('Test completed successfully');
      
    } catch (error) {
      console.error('Test failed with error:', error.message);
      throw error;
    }
  });
});
