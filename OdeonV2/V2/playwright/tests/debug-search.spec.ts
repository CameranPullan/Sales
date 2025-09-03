import { test, expect } from '@playwright/test';

test('debug search selectors', async ({ page }) => {
  await page.goto('https://en.wikipedia.org');
  
  // Try to find the search input with different selectors
  const searchSelectors = [
    '#searchInput',
    'input[name="search"]',
    'input[type="search"]',
    '#searchText',
    '.searchbox input',
    'input[placeholder*="Search"]',
    'input[placeholder*="search"]',
    '.vector-search-box input',
    'input[autocomplete="off"]'
  ];
  
  console.log('🔍 Testing search input selectors:');
  
  for (const selector of searchSelectors) {
    try {
      const element = await page.waitForSelector(selector, { timeout: 1000 });
      if (element) {
        console.log(`✅ Found search input: ${selector}`);
        const placeholder = await element.getAttribute('placeholder');
        const name = await element.getAttribute('name');
        const id = await element.getAttribute('id');
        console.log(`   Placeholder: ${placeholder}, Name: ${name}, ID: ${id}`);
      }
    } catch (e) {
      console.log(`❌ Search input not found: ${selector}`);
    }
  }
  
  // Also check all input elements to see what's available
  const allInputs = await page.$$eval('input', 
    elements => elements.map(el => ({
      type: el.type,
      name: el.name,
      id: el.id,
      className: el.className,
      placeholder: el.placeholder
    }))
  );
  console.log('All input elements:', allInputs);
});
