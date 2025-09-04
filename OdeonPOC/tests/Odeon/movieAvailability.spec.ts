import { test, expect } from '@playwright/test';
import { OdeonPage } from '../../pages/OdeonPage';
import { odeonRegionConfigs, OdeonRegionConfig } from '../../config/regionConfig';

/**
 * Helper function to get cinema keywords for a given region
 */
function getCinemaKeywords(config: OdeonRegionConfig): string[] {
  const baseKeywords = ['cinema', 'film', 'movie', 'ticket', 'book', 'show'];
  const domainKeyword = config.baseUrl.split('//')[1].split('.')[1];
  
  return [...baseKeywords, config.brandName, domainKeyword];
}

/**
 * Helper function to verify cinema content exists on page
 */
async function verifyCinemaContent(movieResults: string[], keywords: string[]): Promise<boolean> {
  if (movieResults.length === 0) return false;
  
  return movieResults.some(result => 
    keywords.some(keyword => 
      result.toLowerCase().includes(keyword.toLowerCase())
    )
  );
}

test.describe('Odeon Cinema Movie Availability', () => {
  
  test('should verify cinema websites load and contain movie content', async ({ page }) => {
    const regions = Object.keys(odeonRegionConfigs);
    
    for (const regionKey of regions) {
      const config = odeonRegionConfigs[regionKey];
      const odeonPage = new OdeonPage(page, config);
      const keywords = getCinemaKeywords(config);

      await test.step(`Verify ${config.region} cinema website loads`, async () => {
        await odeonPage.goto();
        await page.waitForLoadState('domcontentloaded');
        
        const title = await page.title();
        expect(title.length, `${config.region} page should have a title`).toBeGreaterThan(0);
      });

      await test.step(`Check for movie-related content on ${config.region} site`, async () => {
        const movieResults = await odeonPage.getMovieSearchResults();
        const hasMovieContent = await verifyCinemaContent(movieResults, keywords);
        
        expect(hasMovieContent, `${config.region} should have movie-related content on the page`).toBe(true);
      });
    }
  });

  test('should demonstrate regional cinema website accessibility', async ({ page }) => {
    const regions = Object.keys(odeonRegionConfigs);

    for (const regionKey of regions) {
      const config = odeonRegionConfigs[regionKey];
      const odeonPage = new OdeonPage(page, config);
      const keywords = getCinemaKeywords(config);

      await test.step(`Test ${config.region} cinema site basic functionality`, async () => {
        await odeonPage.goto();
        await page.waitForLoadState('domcontentloaded');
        
        const title = await page.title();
        expect(title, `${config.region} should have a meaningful page title`).toBeTruthy();
        
        const bodyText = await page.textContent('body');
        const hasCinemaKeywords = bodyText && keywords.some(keyword => 
          bodyText.toLowerCase().includes(keyword.toLowerCase())
        );
        
        expect(hasCinemaKeywords, `${config.region} should contain cinema-related keywords`).toBe(true);
      });
    }
  });

});
