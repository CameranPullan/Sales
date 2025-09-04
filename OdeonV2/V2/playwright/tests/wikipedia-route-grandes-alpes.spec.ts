import { test, expect } from '../fixtures/test';
import { HomePage } from '../pages/HomePage';
import { SearchResultsPage } from '../pages/SearchResultsPage';
import { RouteInformationPage } from '../pages/RouteInformationPage';
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
    const homePage = new HomePage(page, locale);
    const searchResultsPage = new SearchResultsPage(page, locale);
    const startTime = Date.now();
    
    // Step 1: Navigate to Wikipedia homepage
    const step1 = utils.translation.formatTestStep('navigateToHomepage', locale, undefined, 1);

    await homePage.goto();
    
    // Step 2: Perform search for "route des grandes alpes"
    const step2 = utils.translation.formatTestStep('searchForRoute', locale, undefined, 2);

    // Use page object method for search
    await searchResultsPage.performSearch('route des grandes alpes');
    
    // Wait for search results or article page to load
    await page.waitForLoadState('networkidle');
    
    // Step 3: Extract route length information using page object
    const step3 = utils.translation.formatTestStep('extractRouteLength', locale, undefined, 3);

    const pageTitle = await page.title();
    
    // Create route information page object
    const routeInfoPage = new RouteInformationPage(page, locale);
    
    // Check if we need to navigate to the correct page
    const isDisambiguation = await page.locator('text="puede referirse"').count() > 0 ||
                              await page.locator('text="may refer to"').count() > 0 ||
                              await page.locator('.mw-disambig').count() > 0;
    
    const isSearchResults = pageTitle.toLowerCase().includes('resultados') || 
                           pageTitle.toLowerCase().includes('search results');
    
    if (isDisambiguation || isSearchResults) {
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
        await page.click(`a[href="${routeLinks[0].href}"]`);
        await page.waitForLoadState('networkidle');
      }
    }
    
    // Extract route information using page object methods
    const routeInfo: RouteInfo[] = [];
    
    const routeName = await routeInfoPage.getRouteName();
    const routeLength = await routeInfoPage.getRouteLength();
    
    if (routeLength) {
      routeInfo.push({
        name: routeName || 'Route des Grandes Alpes',
        length: routeLength,
        description: 'Length information'
      });
    }
    
    // Get additional route data for validation
    const routeData = await routeInfoPage.validateRouteData();
    
    // Get body text for additional validation if needed
    const bodyText = await page.textContent('body') || '';
    
    // Try to find length information in the text using patterns
    try {
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
      // Could not extract via patterns
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
    
    if (uniqueRouteInfo.length === 0) {
      // Try to find any numeric values that might be length
      const anyNumbers = bodyText.match(/\d+(?:,\d+)?\s*km/gi) || [];
    }
    
    // Performance tracking
    const duration = Date.now() - startTime;
    
    // Assertions
    expect(pageTitle.toLowerCase()).toMatch(/grandes alpes|route|ruta/);
    expect(uniqueRouteInfo.length, 'Should find at least one length measurement for Route des Grandes Alpes').toBeGreaterThan(0);
    expect(duration, 'Search should complete within reasonable time').toBeLessThan(30000);
    
    // Log final URL for verification
    const finalUrl = page.url();
  });
});
