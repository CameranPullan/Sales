import { Page, Locator } from '@playwright/test';
import { RegionConfig } from '../config/regionConfig';

export class WikipediaPage {
  readonly page: Page;
  readonly searchInput: Locator;
  readonly pageHeading: Locator;
  readonly config: RegionConfig;

  constructor(page: Page, config: RegionConfig) {
    this.page = page;
    this.config = config;
    
    this.searchInput = page.locator('#searchInput');
    this.pageHeading = page.locator('h1.firstHeading, h1#firstHeading');
  }

  async goto() {
    await this.page.goto(this.config.baseUrl);
  }

  async search(query: string) {
    await this.searchInput.fill(query);
    await this.searchInput.press('Enter');
  }

  async getPageTitle(): Promise<string> {
    return await this.pageHeading.textContent() || '';
  }

  async getTop10Movies(): Promise<string[]> {
    // Look for tables containing movie rankings
    let movieTable;
    
    try {
      movieTable = this.page.locator('table.wikitable').first();
      await movieTable.waitFor({ state: 'visible', timeout: 5000 });
    } catch {
      try {
        movieTable = this.page.locator('table').first();
        await movieTable.waitFor({ state: 'visible', timeout: 5000 });
      } catch {
        movieTable = this.page.locator('table.sortable').first();
        await movieTable.waitFor({ state: 'visible', timeout: 5000 });
      }
    }
    
    if (!movieTable) {
      throw new Error('No suitable table found on the page');
    }
    
    const movieRows = movieTable.locator('tbody tr, tr');
    const movies: string[] = [];
    const count = await movieRows.count();
    
    // Start from index 1 to skip header, get up to 10 movies
    for (let i = 1; i < Math.min(count, 11); i++) {
      const row = movieRows.nth(i);
      let movieTitle = '';
      
      // Try multiple strategies to find movie title
      try {
        // Strategy 1: Look for italic text (common for movie titles)
        const italicText = await row.locator('i a, i').first().textContent({ timeout: 1000 });
        if (italicText?.trim()) {
          movieTitle = italicText.trim();
        }
      } catch {}
      
      if (!movieTitle) {
        try {
          // Strategy 2: Look for links in any column
          const links = row.locator('td a');
          const linkCount = await links.count();
          for (let j = 0; j < linkCount; j++) {
            const linkText = await links.nth(j).textContent({ timeout: 1000 });
            if (linkText?.trim() && !linkText.includes('$') && linkText.length > 2) {
              movieTitle = linkText.trim();
              break;
            }
          }
        } catch {}
      }
      
      if (!movieTitle) {
        try {
          // Strategy 3: Get text from second column
          const cellText = await row.locator('td').nth(1).textContent({ timeout: 1000 });
          if (cellText?.trim()) {
            movieTitle = cellText.trim();
          }
        } catch {}
      }
      
      if (!movieTitle) {
        try {
          // Strategy 4: Get text from first column that contains text (not numbers)
          const cells = row.locator('td');
          const cellCount = await cells.count();
          for (let k = 0; k < cellCount; k++) {
            const cellText = await cells.nth(k).textContent({ timeout: 1000 });
            if (cellText?.trim() && !/^\d+$/.test(cellText.trim()) && !cellText.includes('$')) {
              movieTitle = cellText.trim();
              break;
            }
          }
        } catch {}
      }
      
      // Clean up the movie title
      if (movieTitle) {
        movieTitle = movieTitle.replace(/^\d+\.?\s*/, ''); // Remove leading numbers
        movieTitle = movieTitle.replace(/\s*\([^)]*\)$/, ''); // Remove trailing parentheses
        movieTitle = movieTitle.split('\n')[0]; // Take first line only
        
        if (movieTitle.length > 2 && !movieTitle.includes('$') && !movieTitle.includes('€')) {
          movies.push(movieTitle);
        }
      }
      
      // Stop if we have 10 movies
      if (movies.length >= 10) break;
    }
    
    return movies;
  }
}
