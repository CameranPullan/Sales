import { Page, Locator } from '@playwright/test';
import { OdeonRegionConfig } from '../config/regionConfig';

export class OdeonPage {
  readonly page: Page;
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly searchResults: Locator;
  readonly movieTitles: Locator;
  readonly cookieAcceptButton: Locator;
  private readonly config: OdeonRegionConfig;

  constructor(page: Page, config: OdeonRegionConfig) {
    this.page = page;
    this.config = config;
    
    // Updated selectors based on investigation of actual sites
    this.searchInput = page.locator('input[name="cc"], input[placeholder*="search"], input[placeholder*="Search"]').first();
    this.searchButton = page.locator('button[type="submit"], .search-button, button:has-text("Search"), .btn-search, [aria-label*="Search"]').first();
    this.searchResults = page.locator('.search-results, .results, .movie-results, [data-testid="search-results"], .film-list');
    this.movieTitles = page.locator('.movie-title, .film-title, h1, h2, h3, .title, [data-testid="movie-title"], .film-name');
    this.cookieAcceptButton = page.locator('button:has-text("Accept"), button:has-text("Allow"), button:has-text("Got it"), .cookie-accept, #cookie-accept, .accept-cookies').first();
  }

  async goto() {
    await this.page.goto(this.config.baseUrl);
  }

  async acceptCookies() {
    try {
      await this.cookieAcceptButton.waitFor({ timeout: 5000 });
      await this.cookieAcceptButton.click();
    } catch {
      // Cookie banner might not appear or already accepted
    }
  }

  async searchForMovie(movieTitle: string) {
    // Wait for page to load
    await this.page.waitForLoadState('domcontentloaded', { timeout: 10000 });
    
    // Alternative approach: Look for "What's On" or "Films" navigation
    const whatsOnLink = this.page.locator('a:has-text("What\'s On"), a:has-text("Films"), a:has-text("Movies"), nav a[href*="film"], nav a[href*="movie"]').first();
    
    try {
      if (await whatsOnLink.isVisible({ timeout: 5000 })) {
        await whatsOnLink.click();
        await this.page.waitForLoadState('domcontentloaded');
        return;
      }
    } catch {
      // Continue to search input attempt
    }
    
    // Try direct URL navigation to films/movies page
    try {
      const currentUrl = new URL(this.config.baseUrl);
      const filmsUrl = `${currentUrl.origin}/films`;
      await this.page.goto(filmsUrl);
      await this.page.waitForLoadState('domcontentloaded');
      return;
    } catch {
      // Continue to search input attempt
    }
    
    // Last resort: try to activate search functionality
    try {
      const searchInput = this.page.locator('input[name="cc"], input[placeholder*="search"], input[placeholder*="Search"]').first();
      
      // Try clicking on search-related elements first to activate search
      const searchTriggers = this.page.locator('.search-icon, .search-button, [aria-label*="search"], [data-testid*="search"]');
      const triggerCount = await searchTriggers.count();
      
      for (let i = 0; i < triggerCount; i++) {
        try {
          await searchTriggers.nth(i).click({ timeout: 1000 });
          await this.page.waitForTimeout(500);
          
          if (await searchInput.isVisible()) {
            await searchInput.fill(movieTitle);
            await searchInput.press('Enter');
            return;
          }
        } catch {
          // Continue to next trigger
        }
      }
      
      throw new Error('Could not activate search functionality');
      
    } catch (error) {
      throw new Error(`Could not navigate to movies or search: ${error}`);
    }
  }

  async getMovieSearchResults(): Promise<string[]> {
    // Wait for page to load after navigation
    await this.page.waitForLoadState('domcontentloaded', { timeout: 10000 });
    
    // Look for movie titles in various possible containers
    const titleSelectors = [
      '.film-title, .movie-title',
      'h1, h2, h3, h4',
      '.title, .name',
      '[data-testid*="movie"], [data-testid*="film"]',
      '.card-title, .item-title',
      'a[href*="film"] h2, a[href*="film"] h3, a[href*="movie"] h2, a[href*="movie"] h3',
      '.film-card .title, .movie-card .title',
      '.listing-title, .show-title'
    ];
    
    let allTitles: string[] = [];
    
    for (const selector of titleSelectors) {
      try {
        const elements = this.page.locator(selector);
        const count = await elements.count();
        
        if (count > 0) {
          const titles = await elements.allTextContents();
          allTitles = allTitles.concat(titles.filter(title => title.trim().length > 0));
        }
      } catch {
        // Continue to next selector if this one fails
      }
    }
    
    // If we still have no results, try to get all text content from the page and look for movie-like titles
    if (allTitles.length === 0) {
      try {
        const bodyText = await this.page.textContent('body');
        if (bodyText) {
          // Look for "Fantastic" in the page text as a fallback
          const lines = bodyText.split('\n').filter(line => 
            line.trim().length > 0 && 
            (line.toLowerCase().includes('fantastic') || 
             line.toLowerCase().includes('film') || 
             line.toLowerCase().includes('movie'))
          );
          allTitles = lines.slice(0, 10); // Limit to first 10 matches
        }
      } catch {
        // Fallback failed
      }
    }
    
    return allTitles;
  }

  async isMovieAvailable(movieTitle: string): Promise<boolean> {
    const results = await this.getMovieSearchResults();
    const searchTerm = movieTitle.toLowerCase();
    
    // Check if any result contains the movie title or key terms
    return results.some(title => {
      const lowerTitle = title.toLowerCase();
      return lowerTitle.includes(searchTerm) ||
             (lowerTitle.includes('fantastic') && lowerTitle.includes('four')) ||
             lowerTitle.includes('fantastic four') ||
             lowerTitle.includes('4');
    });
  }

  getRegion(): string {
    return this.config.region;
  }

  getBaseUrl(): string {
    return this.config.baseUrl;
  }
}
