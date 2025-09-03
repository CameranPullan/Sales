import { test, expect } from '@playwright/test';

test('debug search results with ambiguous term', async ({ page }) => {
  await page.goto('https://en.wikipedia.org');
  
  // Use a search term that will show multiple results
  await page.fill('#searchInput', 'physics quantum');
  await page.press('#searchInput', 'Enter');
  
  // Wait for navigation or results
  await page.waitForLoadState('networkidle');
  
  console.log('🔍 Current URL after search:', page.url());
  
  // Try to find search results with different selectors
  const resultSelectors = [
    '.mw-search-results',
    '.mw-search-result', 
    '.mw-search-result-heading',
    '.mw-search-result-heading a',
    '.mw-search-result:first-child .mw-search-result-heading a',
    'li.mw-search-result',
    '.mw-search-result .mw-search-result-heading a'
  ];
  
  console.log('🔍 Testing search result selectors:');
  
  for (const selector of resultSelectors) {
    try {
      const elements = await page.$$(selector);
      if (elements.length > 0) {
        console.log(`✅ Found ${elements.length} elements with: ${selector}`);
        if (selector.includes('a')) {
          // Try to get the first few link texts
          for (let i = 0; i < Math.min(3, elements.length); i++) {
            const link = elements[i];
            const text = await link.textContent();
            const href = await link.getAttribute('href');
            console.log(`   Link ${i+1}: "${text}" -> ${href}`);
          }
        }
      } else {
        console.log(`❌ No elements found: ${selector}`);
      }
    } catch (e) {
      console.log(`❌ Error with selector: ${selector} - ${e.message}`);
    }
  }
  
  // Check page title
  const pageTitle = await page.title();
  console.log(`📄 Page title: ${pageTitle}`);
});
