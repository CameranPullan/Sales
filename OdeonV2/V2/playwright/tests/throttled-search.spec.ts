import { test as customTest, expect } from '../fixtures/test';
import { HomePage } from '../pages/HomePage';
import { SearchResultsPage } from '../pages/SearchResultsPage';

customTest.describe('Throttled Search Test', () => {
  customTest('test special character searches with network throttling', async ({ throttledPage, locale }) => {
    customTest.setTimeout(60000);
    
    console.log('Starting throttled search test');
    
    const homePage = new HomePage(throttledPage, locale);
    const searchResultsPage = new SearchResultsPage(throttledPage, locale);
    
    const testTerms = ['café', 'résumé', 'naïve'];
    
    for (const [index, searchTerm] of testTerms.entries()) {
      console.log(`Testing search term: ${searchTerm} (${index + 1}/${testTerms.length})`);
      
      // Navigate to fresh homepage
      await homePage.goto();
      await throttledPage.waitForLoadState('networkidle', { timeout: 15000 });
      
      // Perform search
      await searchResultsPage.performSearch(searchTerm);
      
      // Validate result
      const currentUrl = throttledPage.url();
      expect(currentUrl).toContain('wikipedia.org');
      expect(currentUrl).not.toBe('https://en.wikipedia.org/wiki/Main_Page');
      
      const title = await throttledPage.title();
      expect(title.length).toBeGreaterThan(0);
      
      console.log(`✓ Successfully tested "${searchTerm}" under throttled conditions`);
    }
    
    console.log('All throttled searches completed successfully');
  });
});
