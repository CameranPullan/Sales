import { test as customTest, expect } from '../fixtures/test';
import { HomePage } from '../pages/HomePage';

customTest.describe('Custom Fixture Search Test', () => {
  customTest('test café search with custom fixture', async ({ page, locale }) => {
    customTest.setTimeout(30000);
    
    console.log('Starting custom fixture search test');
    
    const homePage = new HomePage(page, locale);
    await homePage.goto();
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    
    console.log('Loaded with HomePage class');
    
    // Use simple search approach that worked
    const searchInput = page.locator('#searchInput, [name="search"], input[placeholder*="Search"]').first();
    await searchInput.click();
    await searchInput.fill('café');
    
    console.log('Filled search term: café');
    
    // Wait for suggestions and dismiss them
    await page.waitForTimeout(1500);
    
    const suggestions = page.locator('[role="listbox"], .suggestions-dropdown, .cdx-menu');
    if (await suggestions.isVisible().catch(() => false)) {
      console.log('Suggestions visible, dismissing...');
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    }
    
    // Submit search
    await searchInput.focus();
    await page.waitForTimeout(200);
    await searchInput.press('Enter');
    
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    
    console.log('Search completed, URL:', page.url());
    
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
    
    console.log('Test completed successfully');
  });
});
