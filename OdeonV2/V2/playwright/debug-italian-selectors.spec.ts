import { test } from './fixtures/test';

test('Debug Italian Wikipedia selectors', async ({ page }) => {
  await page.goto('https://it.wikipedia.org/');
  
  console.log('🔍 Debugging Italian Wikipedia selectors...');
  
  // Check all elements with "vetrina" in their ID
  const vetrinaElements = await page.locator('[id*="vetrina"]').all();
  console.log(`Found ${vetrinaElements.length} elements with "vetrina" in ID`);
  
  for (let i = 0; i < vetrinaElements.length; i++) {
    const element = vetrinaElements[i];
    const id = await element.getAttribute('id');
    const isVisible = await element.isVisible();
    console.log(`  - ID: ${id}, Visible: ${isVisible}`);
  }
  
  // Check all elements with "In_evidenza" in their ID
  const evidenzaElements = await page.locator('[id*="In_evidenza"]').all();
  console.log(`Found ${evidenzaElements.length} elements with "In_evidenza" in ID`);
  
  for (let i = 0; i < evidenzaElements.length; i++) {
    const element = evidenzaElements[i];
    const id = await element.getAttribute('id');
    const isVisible = await element.isVisible();
    console.log(`  - ID: ${id}, Visible: ${isVisible}`);
  }
  
  // Check the main page structure
  const mainPageElements = await page.locator('[id^="mp-"]').all();
  console.log(`Found ${mainPageElements.length} main page elements`);
  
  for (let i = 0; i < Math.min(mainPageElements.length, 10); i++) {
    const element = mainPageElements[i];
    const id = await element.getAttribute('id');
    const isVisible = await element.isVisible();
    console.log(`  - ID: ${id}, Visible: ${isVisible}`);
  }
  
  // Check for featured content in Italian
  const featuredSelectors = [
    '#mp-tfa',
    '[id*="vetrina"]',
    '[id*="In_evidenza"]',
    '[id*="evidenza"]',
    '[id*="featured"]',
    '[class*="featured"]',
    '[class*="vetrina"]'
  ];
  
  console.log('Testing featured content selectors:');
  for (const selector of featuredSelectors) {
    try {
      const element = page.locator(selector).first();
      const isVisible = await element.isVisible();
      console.log(`  - ${selector}: ${isVisible}`);
    } catch (e) {
      console.log(`  - ${selector}: ERROR`);
    }
  }
});
