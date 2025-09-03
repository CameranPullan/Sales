import { test } from '../fixtures/test';

test('Debug Italian Wikipedia selectors', async ({ page }) => {
  await page.goto('https://it.wikipedia.org/');
  
  console.log('🔍 Debugging Italian Wikipedia selectors...');
  
  // Look for ANY visible content sections
  const visibleSections = await page.locator('div[id], section[id]').evaluateAll(elements => {
    return elements
      .filter(el => {
        const rect = el.getBoundingClientRect();
        return rect.height > 50 && rect.width > 100; // Reasonably sized elements
      })
      .map(el => ({
        id: el.id,
        tagName: el.tagName,
        text: el.textContent?.substring(0, 50) + '...',
        visible: true
      }))
      .slice(0, 15); // Limit to first 15
  });
  
  console.log('📋 Visible content sections:');
  visibleSections.forEach(section => {
    console.log(`  - ${section.tagName}#${section.id}: ${section.text}`);
  });
  
  // Check for main page content specifically
  const mainPageContent = await page.locator('[class*="main"], [id*="main"], [class*="content"], [id*="content"]').evaluateAll(elements => {
    return elements
      .filter(el => {
        const rect = el.getBoundingClientRect();
        return rect.height > 30;
      })
      .map(el => ({
        id: el.id || 'no-id',
        className: el.className,
        visible: true
      }))
      .slice(0, 10);
  });
  
  console.log('📋 Main page content areas:');
  mainPageContent.forEach(content => {
    console.log(`  - ID: ${content.id}, Class: ${content.className}`);
  });
});
