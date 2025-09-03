import { test, expect } from '@playwright/test';

test('debug search results selectors', async ({ page }) => {
  await page.goto('https://en.wikipedia.org');
  
  // Fill search and submit
  await page.fill('#searchInput', 'Albert Einstein');
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
    '.searchresults',
    '.mw-search-result-data',
    'div[data-serp-pos]',
    '.searchResultSnippet',
    'li.mw-search-result'
  ];
  
  console.log('🔍 Testing search result selectors:');
  
  for (const selector of resultSelectors) {
    try {
      const elements = await page.$$(selector);
      if (elements.length > 0) {
        console.log(`✅ Found ${elements.length} elements with: ${selector}`);
        if (selector.includes('a')) {
          // Try to get the first link text
          const firstLink = elements[0];
          const text = await firstLink.textContent();
          const href = await firstLink.getAttribute('href');
          console.log(`   First link: "${text}" -> ${href}`);
        }
      } else {
        console.log(`❌ No elements found: ${selector}`);
      }
    } catch (e) {
      console.log(`❌ Error with selector: ${selector} - ${e.message}`);
    }
  }
  
  // Check if we're on a direct article page instead of search results
  const pageTitle = await page.title();
  console.log(`📄 Page title: ${pageTitle}`);
  
  if (pageTitle.includes('Albert Einstein')) {
    console.log('🎯 Redirected directly to article page - no search results needed!');
  }
});
