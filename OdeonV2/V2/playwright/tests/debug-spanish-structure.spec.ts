import { test, expect } from '../fixtures/test';

test('Debug Spanish Wikipedia Structure', async ({ page }) => {
  console.log('🔍 Inspecting Spanish Wikipedia structure');
  
  await page.goto('https://es.wikipedia.org');
  await page.waitForLoadState('networkidle');
  
  // Look for featured article section variations
  const possibleFeaturedSelectors = [
    '#mp-tfa',
    '#mp-da',
    '#mp-destacado',
    '#mp-articulo',
    '.mp-topbanner',
    'h2:has-text("destacado")',
    'h2:has-text("Destacado")',
    'h2:has-text("artículo")',
    'h2:has-text("Artículo")',
    '[id*="destacado"]',
    '[id*="articulo"]',
    '[class*="destacado"]',
    '[class*="articulo"]'
  ];
  
  console.log('🔍 Checking possible featured article selectors:');
  for (const selector of possibleFeaturedSelectors) {
    const exists = await page.locator(selector).count() > 0;
    if (exists) {
      const text = await page.locator(selector).first().textContent();
      console.log(`✅ Found: ${selector} - Text: "${text?.substring(0, 50)}..."`);
    } else {
      console.log(`❌ Not found: ${selector}`);
    }
  }
  
  // Look for news and other sections
  const possibleNewsSections = [
    '#mp-itn',
    '#mp-actualidad',
    '#mp-noticias',
    '#mp-novedades',
    'h2:has-text("actualidad")',
    'h2:has-text("Actualidad")',
    'h2:has-text("noticias")',
    'h2:has-text("Noticias")'
  ];
  
  console.log('🔍 Checking possible news selectors:');
  for (const selector of possibleNewsSections) {
    const exists = await page.locator(selector).count() > 0;
    if (exists) {
      console.log(`✅ Found news section: ${selector}`);
    }
  }
  
  // Look for "on this day" sections
  const possibleOnThisDaySections = [
    '#mp-otd',
    '#mp-efemerides',
    '#mp-hoy',
    '#mp-fecha',
    'h2:has-text("efemérides")',
    'h2:has-text("Efemérides")',
    'h2:has-text("tal día")',
    'h2:has-text("Tal día")'
  ];
  
  console.log('🔍 Checking possible "on this day" selectors:');
  for (const selector of possibleOnThisDaySections) {
    const exists = await page.locator(selector).count() > 0;
    if (exists) {
      console.log(`✅ Found "on this day" section: ${selector}`);
    }
  }
  
  // Get all h2 elements to understand the page structure
  const h2Elements = await page.locator('h2').all();
  console.log(`🔍 Found ${h2Elements.length} h2 elements:`);
  for (let i = 0; i < Math.min(h2Elements.length, 10); i++) {
    const text = await h2Elements[i].textContent();
    const id = await h2Elements[i].getAttribute('id');
    console.log(`  H2 ${i + 1}: "${text}" (id: ${id})`);
  }
  
  // Get all elements with mp- IDs
  const mpElements = await page.locator('[id*="mp-"]').all();
  console.log(`🔍 Found ${mpElements.length} elements with mp- IDs:`);
  for (let i = 0; i < Math.min(mpElements.length, 15); i++) {
    const id = await mpElements[i].getAttribute('id');
    const tagName = await mpElements[i].evaluate(el => el.tagName);
    console.log(`  MP Element ${i + 1}: ${tagName}#${id}`);
  }
});
