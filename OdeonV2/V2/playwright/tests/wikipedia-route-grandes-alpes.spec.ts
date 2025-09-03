import { test, expect } from '../fixtures/test';
import { HomePage } from '../pages/HomePage';
import { Locator } from '@playwright/test';

interface RouteInfo {
  name: string;
  length?: string;
  distance?: string;
  description?: string;
}

test.describe('Wikipedia Route des Grandes Alpes Search Test', () => {
  test('should navigate to Wikipedia, search for route des grandes alpes, and determine its length', async ({ 
    page, 
    locale, 
    localeContext, 
    utils 
  }) => {
    const testName = utils.translation.getTestName('routeGrandesAlpesSearch', locale) || 'Route des Grandes Alpes length test';
    console.log(`🗻 ${testName} - ${locale.toUpperCase()}`);
    console.log(`📍 Base URL: ${localeContext.baseUrl}`);
    
    const homePage = new HomePage(page, locale);
    const startTime = Date.now();
    
    // Step 1: Navigate to Wikipedia homepage
    const step1 = utils.translation.formatTestStep('navigateToHomepage', locale, undefined, 1);
    console.log(step1);
    await homePage.goto();
    
    // Step 2: Perform search for "route des grandes alpes"
    const step2 = utils.translation.formatTestStep('searchForRoute', locale, undefined, 2);
    console.log(step2);
    
    // Find the search input - try multiple selectors
    const searchSelectors = [
      '#searchInput',
      'input[name="search"]',
      'input[type="search"]',
      '#searchText',
      '.searchbox input',
      'input[placeholder*="Search"]',
      'input[placeholder*="search"]',
      'input[placeholder*="Buscar"]', // Spanish
      '.vector-search-box input'
    ];
    
    let searchInputElement: Locator | null = null;
    for (const selector of searchSelectors) {
      try {
        const element = page.locator(selector);
        if (await element.count() > 0) {
          searchInputElement = element;
          console.log(`✅ Found search input with selector: ${selector}`);
          break;
        }
      } catch (e) {
        // Continue to next selector
      }
    }
    
    if (!searchInputElement) {
      throw new Error('Could not find search input field');
    }
    
    // Type "route des grandes alpes" in the search box
    await searchInputElement.fill('route des grandes alpes');
    console.log('🎯 Entered "route des grandes alpes" in search box');
    
    // Submit the search
    await searchInputElement.press('Enter');
    
    // Wait for search results or article page to load
    await page.waitForLoadState('networkidle');
    
    // Step 3: Extract route length information
    const step3 = utils.translation.formatTestStep('extractRouteLength', locale, undefined, 3);
    console.log(step3);
    
    const pageTitle = await page.title();
    console.log(`📄 Current page title: ${pageTitle}`);
    
    // Check if we're on a disambiguation page or search results
    const isDisambiguation = await page.locator('text="puede referirse"').count() > 0 ||
                              await page.locator('text="may refer to"').count() > 0 ||
                              await page.locator('.mw-disambig').count() > 0;
    
    const isSearchResults = pageTitle.toLowerCase().includes('resultados') || 
                           pageTitle.toLowerCase().includes('search results');
    
    if (isDisambiguation || isSearchResults) {
      console.log('🔀 On disambiguation or search results page, looking for route link...');
      
      // Look for route-related links
      const routeLinks = await page.locator('a').evaluateAll(links => 
        links.filter(link => {
          const text = link.textContent?.toLowerCase() || '';
          const href = link.getAttribute('href') || '';
          return (text.includes('route') || text.includes('ruta') || text.includes('grandes alpes')) &&
                 href.includes('/wiki/') &&
                 !href.includes('File:') &&
                 !href.includes('Category:');
        }).map(link => ({
          text: link.textContent,
          href: link.getAttribute('href')
        }))
      );
      
      if (routeLinks.length > 0) {
        console.log(`🎯 Found route link: ${routeLinks[0].text}`);
        await page.click(`a[href="${routeLinks[0].href}"]`);
        await page.waitForLoadState('networkidle');
      } else {
        console.log('⚠️ No specific route link found, proceeding with current page');
      }
    }
    
    // Now extract route length information
    const routeInfo: RouteInfo[] = [];
    
    // First, let's get all the text content to analyze
    const bodyText = await page.textContent('body') || '';
    
    // Look for infobox information
    const infobox = page.locator('.infobox, .vcard, .infobox-route');
    
    try {
      const infoboxExists = await infobox.count() > 0;
      if (infoboxExists) {
        console.log('📊 Found infobox, extracting route information...');
        
        // Get all infobox content
        const infoboxText = await infobox.textContent() || '';
        
        // Look for length-related rows in the infobox
        const lengthRows = await infobox.locator('tr').evaluateAll(rows => 
          rows.filter(row => {
            const rowText = row.textContent?.toLowerCase() || '';
            return rowText.includes('longitud') || rowText.includes('length') || 
                   rowText.includes('distancia') || rowText.includes('distance') ||
                   rowText.includes('km') || rowText.includes('kilómetros');
          }).map(row => {
            const header = row.querySelector('th')?.textContent?.trim() || '';
            const value = row.querySelector('td')?.textContent?.trim() || '';
            return { header, value, fullText: row.textContent?.trim() || '' };
          })
        );
        
        for (const row of lengthRows) {
          if (row.value && row.value !== '–' && row.value !== '' && row.value.length > 1) {
            routeInfo.push({
              name: 'Route des Grandes Alpes',
              length: row.value,
              description: row.header
            });
          }
        }
      }
    } catch (error) {
      console.log('⚠️ Could not extract from infobox:', error.message);
    }
    
    // Try to find length information in the text using patterns
    try {
      console.log('📏 Looking for length patterns in text...');
      
      // Look for common length patterns in multiple languages
      const lengthPatterns = [
        // Spanish patterns
        /(\d+(?:,\d+)?)\s*(?:kilómetros|km|kilometros)/gi,
        /longitud[:\s]+(\d+(?:,\d+)?)\s*(?:kilómetros|km)/gi,
        /distancia[:\s]+(\d+(?:,\d+)?)\s*(?:kilómetros|km)/gi,
        /tiene una longitud de\s*(\d+(?:,\d+)?)\s*(?:kilómetros|km)/gi,
        /mide\s*(\d+(?:,\d+)?)\s*(?:kilómetros|km)/gi,
        
        // English patterns
        /(\d+(?:,\d+)?)\s*(?:kilometers|km|kilometres)/gi,
        /length[:\s]+(\d+(?:,\d+)?)\s*(?:kilometers|km|kilometres)/gi,
        /distance[:\s]+(\d+(?:,\d+)?)\s*(?:kilometers|km|kilometres)/gi,
        /is\s*(\d+(?:,\d+)?)\s*(?:kilometers|km|kilometres)\s*long/gi,
        
        // French patterns
        /(\d+(?:,\d+)?)\s*(?:kilomètres|km)/gi,
        /longueur[:\s]+(\d+(?:,\d+)?)\s*(?:kilomètres|km)/gi,
        /longue de\s*(\d+(?:,\d+)?)\s*(?:kilomètres|km)/gi
      ];
      
      for (const pattern of lengthPatterns) {
        const matches = [...bodyText.matchAll(pattern)];
        for (const match of matches) {
          const lengthValue = match[1];
          if (lengthValue && parseFloat(lengthValue.replace(',', '.')) > 0) {
            // Get some context around the match
            const matchIndex = bodyText.indexOf(match[0]);
            const contextStart = Math.max(0, matchIndex - 50);
            const contextEnd = Math.min(bodyText.length, matchIndex + match[0].length + 50);
            const context = bodyText.substring(contextStart, contextEnd).trim();
            
            routeInfo.push({
              name: 'Route des Grandes Alpes',
              length: `${lengthValue} km`,
              description: `Found via pattern: ${context}`
            });
          }
        }
      }
    } catch (error) {
      console.log('⚠️ Could not extract via patterns:', error.message);
    }
    
    // Clean up and deduplicate results, prioritizing main route length
    const uniqueRouteInfo: RouteInfo[] = [];
    const lengthValues = new Set<string>();
    
    // First, look for the main route length (typically the largest reasonable value)
    let mainRouteLength: RouteInfo | null = null;
    
    for (const info of routeInfo) {
      if (info.length && info.description) {
        // Normalize length value
        const normalizedLength = info.length
          .replace(/[^\d,\.]/g, '') // Remove non-numeric characters except comma and dot
          .replace(',', '.'); // Normalize decimal separator
        
        const numericValue = parseFloat(normalizedLength);
        if (!isNaN(numericValue) && numericValue > 0 && numericValue < 10000) { // Reasonable range for a route
          
          // Check if this looks like the main route description
          const description = info.description.toLowerCase();
          if (description.includes('ruta turística') || 
              description.includes('tourist route') ||
              description.includes('ruta de los grandes alpes') ||
              description.includes('route des grandes alpes') ||
              (numericValue > 500 && numericValue < 1000)) { // Likely main route length
            
            if (!mainRouteLength || numericValue > parseFloat(mainRouteLength.length?.replace(/[^\d,\.]/g, '').replace(',', '.') || '0')) {
              mainRouteLength = {
                name: info.name,
                length: `${Math.round(numericValue)} km`,
                description: 'Main route length'
              };
            }
          }
        }
      }
    }
    
    // Add the main route length first
    if (mainRouteLength && mainRouteLength.length) {
      uniqueRouteInfo.push(mainRouteLength);
      lengthValues.add(Math.round(parseFloat(mainRouteLength.length.replace(/[^\d,\.]/g, '').replace(',', '.'))).toString());
    }
    
    // Then add other significant segments (but limit to avoid clutter)
    for (const info of routeInfo) {
      if (info.length && uniqueRouteInfo.length < 5) { // Limit to 5 total entries
        const normalizedLength = info.length
          .replace(/[^\d,\.]/g, '')
          .replace(',', '.');
        
        const numericValue = parseFloat(normalizedLength);
        if (!isNaN(numericValue) && numericValue > 50 && numericValue < 100) { // Major segments only
          const lengthKey = Math.round(numericValue).toString();
          if (!lengthValues.has(lengthKey)) {
            lengthValues.add(lengthKey);
            uniqueRouteInfo.push({
              name: info.name,
              length: `${Math.round(numericValue)} km`,
              description: 'Route segment'
            });
          }
        }
      }
    }
    
    // Step 4: Display results and validate
    console.log('\n🗻 ROUTE DES GRANDES ALPES LENGTH INFORMATION:');
    console.log('=============================================');
    
    if (uniqueRouteInfo.length === 0) {
      console.log('❌ No length information found for Route des Grandes Alpes');
      
      // Try to find any numeric values that might be length
      const anyNumbers = bodyText.match(/\d+(?:,\d+)?\s*km/gi) || [];
    } else {
      uniqueRouteInfo.forEach((route, index) => {
        console.log(`${index + 1}. ${route.name}: ${route.length}${route.description ? ` (${route.description})` : ''}`);
      });
    }
    
    // Performance tracking
    const duration = Date.now() - startTime;
    console.log(`\n⏱️ Test completed in ${duration}ms`);
    
    // Assertions
    expect(pageTitle.toLowerCase()).toMatch(/grandes alpes|route|ruta/);
    expect(uniqueRouteInfo.length, 'Should find at least one length measurement for Route des Grandes Alpes').toBeGreaterThan(0);
    expect(duration, 'Search should complete within reasonable time').toBeLessThan(30000);
    
    // Log final URL for verification
    const finalUrl = page.url();
    console.log(`🌐 Final URL: ${finalUrl}`);
  });
});
