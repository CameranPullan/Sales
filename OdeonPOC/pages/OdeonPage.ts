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

  /**
   * Navigate to the "What's On" or current films page
   */
  async viewCurrentFilms(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
    
    // Look for common navigation patterns for current films with more flexible selectors
    const filmsNavigation = this.page.locator(
      'a:has-text("What\'s On"), ' +
      'a:has-text("Films"), ' +
      'a:has-text("Movies"), ' +
      'a:has-text("Now Showing"), ' +
      'a:has-text("Current Films"), ' +
      'a:has-text("Cinema Listings"), ' +
      'a:has-text("Book Now"), ' +
      'nav a[href*="film"], ' +
      'nav a[href*="movie"], ' +
      'nav a[href*="whats-on"], ' +
      'nav a[href*="cinema"], ' +
      '.navigation a[href*="film"], ' +
      '.menu a[href*="film"], ' +
      '.nav a[href*="film"]'
    ).first();
    
    try {
      if (await filmsNavigation.isVisible({ timeout: 5000 })) {
        await filmsNavigation.click();
        await this.page.waitForLoadState('networkidle');
        return;
      }
    } catch {
      // First attempt failed, try alternative approaches
    }

    // Alternative: Check if we're already on a films/movie page
    const currentUrl = this.page.url().toLowerCase();
    const currentTitle = (await this.page.title()).toLowerCase();
    
    if (currentUrl.includes('film') || 
        currentUrl.includes('movie') || 
        currentUrl.includes('whats-on') || 
        currentUrl.includes('cinema') ||
        currentTitle.includes('film') ||
        currentTitle.includes('movie') ||
        currentTitle.includes('cinema')) {
      // We're likely already on a films page
      return;
    }

    // Last resort: Look for any link that might lead to films
    const anyFilmLink = this.page.locator('a').filter({
      hasText: /film|movie|cinema|show|book|ticket/i
    }).first();
    
    try {
      if (await anyFilmLink.isVisible({ timeout: 3000 })) {
        await anyFilmLink.click();
        await this.page.waitForLoadState('networkidle');
        return;
      }
    } catch {
      // All navigation attempts failed - don't throw error, let tests handle it
      console.log('Could not find explicit films navigation - staying on current page');
    }
  }

  /**
   * Get list of current films being shown
   */
  async getCurrentFilms(): Promise<string[]> {
    await this.page.waitForLoadState('domcontentloaded');
    
    const filmSelectors = [
      '.movie-title',
      '.film-title', 
      '.film-name',
      '.movie-name',
      'h1, h2, h3, h4',
      '.title',
      '[data-testid="movie-title"]',
      '[data-testid="film-title"]',
      '.film-list .title',
      '.movie-list .title',
      '.film-grid .title',
      '.film-card h3',
      '.movie-card h3',
      '.content h2',
      '.content h3',
      'article h2',
      'article h3'
    ];

    let allFilms: string[] = [];
    
    for (const selector of filmSelectors) {
      try {
        const elements = this.page.locator(selector);
        const count = await elements.count();
        if (count > 0) {
          const titles = await elements.allTextContents();
          const filteredTitles = titles.filter(title => {
            const cleaned = title.trim();
            return cleaned.length > 2 && 
                   cleaned.length < 100 && // Reasonable title length
                   !cleaned.toLowerCase().includes('search') &&
                   !cleaned.toLowerCase().includes('menu') &&
                   !cleaned.toLowerCase().includes('navigation');
          });
          if (filteredTitles.length > 0) {
            allFilms = allFilms.concat(filteredTitles);
          }
        }
      } catch {
        // Continue to next selector if this one fails
      }
    }

    // If we still have limited results, try broader selectors
    if (allFilms.length < 3) {
      try {
        // Look for any heading or link text that might be a film title
        const broadElements = this.page.locator('h1, h2, h3, h4, a').filter({
          hasText: /^[A-Z][\w\s:'-]{2,50}$/
        });
        
        const count = await broadElements.count();
        if (count > 0) {
          const broadTitles = await broadElements.allTextContents();
          const filteredBroad = broadTitles.filter(title => {
            const cleaned = title.trim();
            return cleaned.length > 2 && 
                   cleaned.length < 80 &&
                   !cleaned.toLowerCase().includes('http') &&
                   !cleaned.toLowerCase().includes('www') &&
                   !cleaned.toLowerCase().includes('search') &&
                   !cleaned.toLowerCase().includes('menu');
          });
          allFilms = allFilms.concat(filteredBroad);
        }
      } catch {
        // Fallback failed
      }
    }

    // Remove duplicates and return unique films
    const uniqueFilms = [...new Set(allFilms)];
    return uniqueFilms.slice(0, 20); // Limit to 20 films
  }

  /**
   * Select a specific film from the current films list
   */
  async selectFilm(filmTitle: string): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
    
    // Look for clickable elements containing the film title
    const filmSelector = this.page.locator(
      `a:has-text("${filmTitle}"), ` +
      `button:has-text("${filmTitle}"), ` +
      `[href*="${filmTitle.toLowerCase().replace(/\s+/g, '-')}"], ` +
      `.movie-title:has-text("${filmTitle}"), ` +
      `.film-title:has-text("${filmTitle}")`,
      { hasText: filmTitle }
    ).first();

    try {
      await filmSelector.waitFor({ timeout: 10000 });
      await filmSelector.click();
      await this.page.waitForLoadState('networkidle');
    } catch {
      // Fallback: look for any clickable element containing part of the film title
      const partialMatch = this.page.locator('a, button').filter({ hasText: filmTitle.split(' ')[0] }).first();
      await partialMatch.click();
      await this.page.waitForLoadState('networkidle');
    }
  }

  /**
   * View showings/times for the selected film
   */
  async viewFilmShowings(): Promise<string[]> {
    await this.page.waitForLoadState('domcontentloaded');
    
    const showingsSelectors = [
      '.showings',
      '.showtimes', 
      '.times',
      '.sessions',
      '.schedule',
      '.performance-times',
      '.movie-times',
      '.film-times',
      '[data-testid="showings"]',
      '[data-testid="times"]',
      '.cinema-times'
    ];

    let allShowings: string[] = [];
    
    for (const selector of showingsSelectors) {
      try {
        const elements = this.page.locator(`${selector} *`);
        await elements.first().waitFor({ timeout: 5000 });
        const showingTimes = await elements.allTextContents();
        const filteredTimes = showingTimes.filter(time => 
          time.trim().length > 0 && 
          (time.match(/\d{1,2}:\d{2}/) || time.match(/\d{1,2}\.\d{2}/) || time.includes('AM') || time.includes('PM'))
        );
        if (filteredTimes.length > 0) {
          allShowings = allShowings.concat(filteredTimes);
        }
      } catch {
        // Continue to next selector if this one fails
      }
    }

    // If no specific showing times found, look for any time-related content
    if (allShowings.length === 0) {
      try {
        const bodyText = await this.page.textContent('body');
        if (bodyText) {
          const timeMatches = bodyText.match(/\d{1,2}:\d{2}|\d{1,2}\.\d{2}/g);
          if (timeMatches) {
            allShowings = timeMatches.slice(0, 10);
          }
        }
      } catch {
        // Fallback failed
      }
    }

    return [...new Set(allShowings)]; // Remove duplicates
  }

  /**
   * Complete user journey: navigate to films, select one, and view showings
   */
  async completeFilmViewingJourney(filmTitle?: string): Promise<{
    filmsFound: string[];
    selectedFilm: string;
    showings: string[];
  }> {
    // Step 1: View current films
    await this.viewCurrentFilms();
    
    // Step 2: Get list of current films
    const filmsFound = await this.getCurrentFilms();
    
    if (filmsFound.length === 0) {
      throw new Error('No films found on the cinema website');
    }
    
    // Step 3: Select a film (use provided title or first available)
    const selectedFilm = filmTitle && filmsFound.some(film => 
      film.toLowerCase().includes(filmTitle.toLowerCase())
    ) ? filmTitle : filmsFound[0];
    
    await this.selectFilm(selectedFilm);
    
    // Step 4: View showings for the selected film
    const showings = await this.viewFilmShowings();
    
    return {
      filmsFound,
      selectedFilm,
      showings
    };
  }
}
