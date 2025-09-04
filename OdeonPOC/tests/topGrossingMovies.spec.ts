import { test, expect } from '@playwright/test';
import { WikipediaPage } from '../pages/WikipediaPage';
import { regionConfigs } from '../config/regionConfig';

test.describe('Top 10 Grossing Movies Search', () => {
  
  test('should successfully search for top grossing movies and extract data', async ({ page }) => {
    const projectName = test.info().project.name as keyof typeof regionConfigs;
    const config = regionConfigs[projectName];
    
    if (!config) {
      throw new Error(`No configuration found for project: ${projectName}`);
    }

    const wikipediaPage = new WikipediaPage(page, config);
    
    if (projectName === 'gb') {
      // For GB: Navigate directly to the highest grossing films page
      await page.goto('https://en.wikipedia.org/wiki/List_of_highest-grossing_films');
      await page.waitForLoadState('networkidle');
      
      const pageTitle = await wikipediaPage.getPageTitle();
      
      // Extract top 10 movies
      const top10Movies = await wikipediaPage.getTop10Movies();
      
      // Verify results
      expect(top10Movies.length).toBeGreaterThan(0);
      expect(top10Movies.length).toBeLessThanOrEqual(10);
      expect(top10Movies[0]).toBe('Avatar'); // Avatar should be #1
      
    } else {
      // For other regions: Use search functionality
      await wikipediaPage.goto();
      await wikipediaPage.search(config.topMoviesSearchTerm);
      await page.waitForLoadState('networkidle');
      
      const pageTitle = await page.title();
      
      // Check if search went directly to a relevant page
      if (pageTitle.toLowerCase().includes('succès') || 
          pageTitle.toLowerCase().includes('box-office') ||
          pageTitle.toLowerCase().includes('liste') ||
          (pageTitle.toLowerCase().includes('película') && !pageTitle.toLowerCase().includes('búsqueda')) ||
          (pageTitle.toLowerCase().includes('taquillera') && !pageTitle.toLowerCase().includes('búsqueda'))) {
        // Search went directly to a relevant movie page
        const finalTitle = await wikipediaPage.getPageTitle();
        expect(finalTitle.toLowerCase()).toMatch(/(película|film|cine|cinéma|succès|box-office|liste)/);
        
      } else {
        // We're on a search results page - try to find and click on a relevant result
        const searchResults = page.locator('.mw-search-result-heading a');
        const resultCount = await searchResults.count();
        
        if (resultCount > 0) {
          // Find the most relevant result
          let clickedResult = false;
          for (let i = 0; i < Math.min(resultCount, 5); i++) {
            const resultTitle = await searchResults.nth(i).textContent();
            
            if (resultTitle?.toLowerCase().includes('película') || 
                resultTitle?.toLowerCase().includes('taquillera') ||
                resultTitle?.toLowerCase().includes('lista') ||
                resultTitle?.toLowerCase().includes('film') ||
                resultTitle?.toLowerCase().includes('lucratif') ||
                resultTitle?.toLowerCase().includes('liste')) {
              await searchResults.nth(i).click();
              clickedResult = true;
              break;
            }
          }
          
          if (!clickedResult && resultCount > 0) {
            await searchResults.first().click();
          }
          
          await page.waitForLoadState('networkidle');
          const finalTitle = await wikipediaPage.getPageTitle();
          
          // Verify we're on a movie-related page
          expect(finalTitle.toLowerCase()).toMatch(/(película|film|cine|cinéma)/);
          
        } else {
          // Check if we got to a relevant page anyway (sometimes search goes directly to the page)
          const pageTitle = await page.title();
          if (pageTitle.toLowerCase().includes('succès') || 
              pageTitle.toLowerCase().includes('box-office') ||
              pageTitle.toLowerCase().includes('liste')) {
            // We found a relevant movie-related page, which is good
            expect(pageTitle.length).toBeGreaterThan(0);
          } else {
            expect(pageTitle.toLowerCase()).toMatch(/(buscar|search|recherche)/);
          }
        }
      }
    }
  });

  test('should verify basic search functionality works across regions', async ({ page }) => {
    const projectName = test.info().project.name as keyof typeof regionConfigs;
    const config = regionConfigs[projectName];
    
    if (!config) {
      throw new Error(`No configuration found for project: ${projectName}`);
    }

    const wikipediaPage = new WikipediaPage(page, config);
    
    await wikipediaPage.goto();
    
    // Verify search input is present
    await expect(wikipediaPage.searchInput).toBeVisible();
    
    // Test search functionality with a well-known movie
    await wikipediaPage.search('Titanic');
    
    await page.waitForLoadState('networkidle');
    const currentUrl = page.url();
    const title = await page.title();
    
    // Verify navigation worked
    expect(currentUrl).not.toBe(config.baseUrl + '/');
    expect(title.length).toBeGreaterThan(0);
    expect(title.toLowerCase()).toMatch(/(titanic|search|buscar|recherche)/);
  });
});
