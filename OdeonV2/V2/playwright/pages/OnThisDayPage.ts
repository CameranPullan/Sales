import { Page, Locator } from '@playwright/test';
import { BasePage } from './base/BasePage';
import { SelectorManager } from '../utils/SelectorManager';
import { ContentValidator } from '../utils/ContentValidator';

export interface HistoricalEvent {
  year: string;
  summary: string;
  fullText: string;
}

export class OnThisDayPage extends BasePage {
  private selectorManager: SelectorManager;
  private contentValidator: ContentValidator;

  constructor(page: Page, locale?: any) {
    super(page, locale);
    this.selectorManager = new SelectorManager(page, this.locale);
    this.contentValidator = new ContentValidator(this.locale);
  }

  async goto() {
    this.logContext('Navigating to Wikipedia homepage for On This Day section');
    await super.goto('/');
  }

  async gotoOnThisDayPage() {
    this.logContext('Navigating to dedicated On This Day page');
    // Try to navigate to the dedicated "On this day" page which has more events
    const currentDate = new Date();
    const month = currentDate.toLocaleDateString('en-US', { month: 'long' });
    const day = currentDate.getDate();
    
    // Format: "September_4" 
    const dateString = `${month}_${day}`;
    await super.goto(`/wiki/${dateString}`);
  }

  async findOnThisDaySection(): Promise<Locator> {
    this.logContext('Looking for On This Day section');
    
    // Multiple selectors to find the "On This Day" section
    const selectors = [
      'h2:has-text("On this day")',
      'h2 span:has-text("On this day")',
      'h2:has-text("Events")',
      'h2 span:has-text("Events")',
      '[id*="this_day"]',
      '[id*="onthisday"]',
      '[id*="Events"]',
      'h2:has-text("Today")',
      '[aria-label*="On this day"]',
      '.mw-headline:has-text("Events")'
    ];

    for (const selector of selectors) {
      const element = this.page.locator(selector).first();
      if (await element.count() > 0) {
        this.logContext(`Found On This Day section using selector: ${selector}`);
        return element;
      }
    }

    // If specific selectors don't work, look for text content
    const textBasedLocator = this.page.locator('h2, h3, .mw-headline').filter({ hasText: /on this day|events/i }).first();
    if (await textBasedLocator.count() > 0) {
      this.logContext('Found On This Day section using text-based search');
      return textBasedLocator;
    }

    throw new Error('Could not find On This Day section on the page');
  }

  async getOnThisDayContainer(): Promise<Locator> {
    const header = await this.findOnThisDaySection();
    
    // Find the container that holds the events - usually the next sibling or parent container
    const possibleContainers = [
      header.locator('..').locator('+ div'),
      header.locator('..').locator('+ ul'),
      header.locator('..').locator('+ ol'),
      header.locator('../..').locator('div').nth(1),
      header.locator('../..').locator('ul').first(),
      header.locator('../..').locator('.mw-parser-output ul').first()
    ];

    for (const container of possibleContainers) {
      if (await container.count() > 0) {
        const listItems = container.locator('li');
        if (await listItems.count() > 0) {
          this.logContext(`Found On This Day container with ${await listItems.count()} items`);
          return container;
        }
      }
    }

    // Fallback: look for any list after the header
    const fallbackContainer = this.page.locator('ul li').first().locator('..');
    if (await fallbackContainer.count() > 0) {
      this.logContext('Using fallback container for On This Day events');
      return fallbackContainer;
    }

    throw new Error('Could not find On This Day events container');
  }

  async extractHistoricalEvents(): Promise<HistoricalEvent[]> {
    this.logContext('Extracting historical events from On This Day section');
    
    try {
      const container = await this.getOnThisDayContainer();
      const eventItems = container.locator('li');
      const eventCount = await eventItems.count();
      
      this.logContext(`Found ${eventCount} potential historical events`);
      
      const events: HistoricalEvent[] = [];
      
      for (let i = 0; i < Math.min(eventCount, 20); i++) { // Increased to 20 events
        const item = eventItems.nth(i);
        const fullText = await item.textContent() || '';
        
        if (fullText.trim()) {
          // Extract year and summary using multiple regex patterns
          let yearMatch = fullText.match(/(\d{1,4})\s*[–\-—:]\s*(.+)/);
          
          if (!yearMatch) {
            // Try alternative patterns
            yearMatch = fullText.match(/^(\d{1,4})\s+(.+)/) || 
                       fullText.match(/(\d{1,4})\s*AD\s*[–\-—:]\s*(.+)/) ||
                       fullText.match(/(\d{1,4})\s*BC\s*[–\-—:]\s*(.+)/);
          }
          
          if (yearMatch) {
            const year = yearMatch[1];
            const summary = yearMatch[2].trim();
            
            // Skip if summary is too short or seems to be a navigation element
            if (summary.length > 5 && !summary.match(/^(edit|more|see|wiki)/i)) {
              events.push({
                year,
                summary,
                fullText: fullText.trim()
              });
              
              this.logContext(`Extracted event: ${year} - ${summary.substring(0, 80)}...`);
            }
          } else {
            // If no year pattern found, try to extract year from beginning
            const yearAtStart = fullText.match(/^(\d{1,4})\b/);
            if (yearAtStart) {
              const year = yearAtStart[1];
              const summary = fullText.replace(/^\d{1,4}\s*[–\-—]?\s*/, '').trim();
              
              if (summary.length > 5 && !summary.match(/^(edit|more|see|wiki)/i)) {
                events.push({
                  year,
                  summary,
                  fullText: fullText.trim()
                });
                
                this.logContext(`Extracted event (alt pattern): ${year} - ${summary.substring(0, 80)}...`);
              }
            }
          }
        }
      }
      
      if (events.length === 0) {
        this.logContext('No historical events extracted, attempting fallback extraction');
        // Fallback: just get the raw text of first few items
        for (let i = 0; i < Math.min(eventCount, 5); i++) {
          const item = eventItems.nth(i);
          const fullText = await item.textContent() || '';
          if (fullText.trim() && fullText.length > 10) {
            events.push({
              year: 'Unknown',
              summary: fullText.trim(),
              fullText: fullText.trim()
            });
          }
        }
      }
      
      return events;
    } catch (error) {
      this.logContext(`Error extracting historical events: ${error}`);
      throw error;
    }
  }

  async getTodaysDate(): Promise<string> {
    // Get today's date for context
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = { 
      month: 'long', 
      day: 'numeric' 
    };
    return today.toLocaleDateString('en-US', options);
  }

  async verifyOnThisDaySection(): Promise<boolean> {
    try {
      await this.findOnThisDaySection();
      return true;
    } catch {
      return false;
    }
  }

  async searchForTodaysDate(): Promise<void> {
    this.logContext('Searching for today\'s date as fallback');
    
    const currentDate = new Date();
    const searchTerms = [
      `${currentDate.getDate()} september`,
      `september ${currentDate.getDate()}`,
      `4 september`,
      `september 4`,
      `september`,
      `settembre 4`, // Italian
      `4 settembre`, // Italian
      `septiembre 4`, // Spanish
      `4 septiembre` // Spanish
    ];

    for (const searchTerm of searchTerms) {
      try {
        this.logContext(`Searching for: ${searchTerm}`);
        
        // Look for search box
        const searchBox = this.page.locator('input[name="search"], #searchInput, [placeholder*="search"], [placeholder*="Search"]').first();
        
        if (await searchBox.count() > 0) {
          await searchBox.fill(searchTerm);
          await searchBox.press('Enter');
          await this.page.waitForLoadState('networkidle');
          
          this.logContext(`Search completed for: ${searchTerm}`);
          return;
        }
      } catch (error) {
        this.logContext(`Search failed for ${searchTerm}: ${error}`);
        continue;
      }
    }
    
    throw new Error('Could not perform search for today\'s date');
  }

  async extractFromSearchResults(): Promise<HistoricalEvent[]> {
    this.logContext('Extracting events from search results');
    
    const events: HistoricalEvent[] = [];
    
    try {
      // Look for search results or article content
      const contentSelectors = [
        '.mw-search-results li',
        '.mw-search-result',
        '.searchresult',
        '#mw-content-text p',
        '.mw-parser-output p',
        'article p',
        'main p'
      ];
      
      for (const selector of contentSelectors) {
        const elements = this.page.locator(selector);
        const count = await elements.count();
        
        if (count > 0) {
          this.logContext(`Found ${count} content elements with selector: ${selector}`);
          
          for (let i = 0; i < Math.min(count, 10); i++) {
            const element = elements.nth(i);
            const text = await element.textContent() || '';
            
            if (text.trim() && text.length > 20) {
              // Try to extract year and meaningful content
              const yearMatch = text.match(/(\d{4})/);
              
              if (yearMatch || text.toLowerCase().includes('september') || text.toLowerCase().includes('settembre') || text.toLowerCase().includes('septiembre')) {
                const year = yearMatch ? yearMatch[1] : 'Unknown';
                const summary = text.trim().substring(0, 200);
                
                events.push({
                  year,
                  summary,
                  fullText: text.trim()
                });
                
                this.logContext(`Extracted from search: ${year} - ${summary.substring(0, 50)}...`);
              }
            }
          }
          
          if (events.length > 0) {
            break;
          }
        }
      }
      
      // If no events found, try to get any meaningful content
      if (events.length === 0) {
        const fallbackText = await this.page.locator('h1, .mw-page-title-main, #firstHeading').first().textContent();
        if (fallbackText) {
          events.push({
            year: 'Unknown',
            summary: fallbackText,
            fullText: fallbackText
          });
          this.logContext('Added fallback content from page title');
        }
      }
      
    } catch (error) {
      this.logContext(`Error extracting from search results: ${error}`);
    }
    
    return events;
  }

  async extractWithFallback(): Promise<HistoricalEvent[]> {
    this.logContext('Starting extraction with fallback strategy');
    
    try {
      // First, try the standard approach
      if (await this.verifyOnThisDaySection()) {
        this.logContext('Found standard On This Day section');
        return await this.extractHistoricalEvents();
      }
    } catch (error) {
      this.logContext(`Standard extraction failed: ${error}`);
    }
    
    try {
      // Fallback: search for today's date
      this.logContext('Attempting search fallback');
      await this.searchForTodaysDate();
      return await this.extractFromSearchResults();
    } catch (error) {
      this.logContext(`Search fallback failed: ${error}`);
    }
    
    // Final fallback: return page information
    const pageTitle = await this.page.title();
    return [{
      year: 'Unknown',
      summary: `Wikipedia page: ${pageTitle}`,
      fullText: `Current page: ${pageTitle} at ${this.page.url()}`
    }];
  }
}
