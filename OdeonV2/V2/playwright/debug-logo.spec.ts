import { test, expect } from '@playwright/test';

test('debug logo selector', async ({ page }) => {
  await page.goto('https://en.wikipedia.org');
  
  // Try to find the logo with different selectors
  const selectors = [
    '.mw-wiki-logo',
    'a.mw-logo',
    '.mw-logo',
    '[class*="logo"]',
    '[href="/wiki/Main_Page"]',
    'a[title*="Wikipedia"]'
  ];
  
  for (const selector of selectors) {
    try {
      const element = await page.waitForSelector(selector, { timeout: 1000 });
      if (element) {
        console.log(`✅ Found element with selector: ${selector}`);
        const tagName = await element.evaluate(el => el.tagName);
        const className = await element.evaluate(el => el.className);
        const href = await element.evaluate(el => el.getAttribute('href'));
        console.log(`   Tag: ${tagName}, Class: ${className}, Href: ${href}`);
      }
    } catch (e) {
      console.log(`❌ Selector not found: ${selector}`);
    }
  }
  
  // Also check what's actually in the page
  const allElements = await page.$$eval('[class*="logo"], [class*="Logo"], a[href="/wiki/Main_Page"]', 
    elements => elements.map(el => ({
      tagName: el.tagName,
      className: el.className,
      href: el.getAttribute('href'),
      id: el.id
    }))
  );
  console.log('All logo-related elements:', allElements);
});
