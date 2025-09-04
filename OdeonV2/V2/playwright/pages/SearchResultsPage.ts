import { Page } from '@playwright/test';
import { BasePage } from './base/BasePage';
import { SupportedLocale } from '../config/locales/types';

export class SearchResultsPage extends BasePage {
  // Selectors for search results page
  private readonly selectors = {
    searchInput: '#searchInput',
    searchResults: '.mw-search-result',
    firstResult: '.mw-search-result:first-child .mw-search-result-heading a',
    resultHeading: '.mw-search-result-heading a',
    resultSnippet: '.searchresult',
    noResultsMessage: '.mw-search-nonefound',
    didYouMean: '.searchdidyoumean',
    searchStats: '.results-info',
    advancedSearch: '.mw-search-formheader',
    searchButton: '#searchButton',
    nextPage: '.mw-pager-next',
    prevPage: '.mw-pager-prev'
  };

  constructor(page: Page, locale?: SupportedLocale) {
    super(page, locale);
  }

  async performSearch(searchTerm: string): Promise<void> {
    console.log(`Performing search for: "${searchTerm}"`);
    
    // Use more robust selector for search input
    const searchInputSelector = '#searchInput, [name="search"], input[placeholder*="Search"], .cdx-text-input__input';
    
    // Wait for search input to be ready
    await this.page.waitForSelector(searchInputSelector, { state: 'visible' });
    
    // Clear and fill the search input
    const searchInput = this.page.locator(searchInputSelector).first();
    await searchInput.click();
    await searchInput.fill('');
    await searchInput.fill(searchTerm);
    
    console.log(`Filled search input with: "${searchTerm}"`);
    
    // Wait for search suggestions to load
    await this.page.waitForTimeout(1500);
    
    // Check for and dismiss search suggestions
    const suggestions = this.page.locator('[role="listbox"], .suggestions-dropdown, .cdx-menu, .suggestions-results');
    if (await suggestions.isVisible().catch(() => false)) {
      console.log('Search suggestions detected, dismissing...');
      
      // Press Escape to close suggestions
      await this.page.keyboard.press('Escape');
      await this.page.waitForTimeout(500);
      
      // Double-check suggestions are closed
      if (await suggestions.isVisible().catch(() => false)) {
        console.log('Suggestions still visible, clicking outside');
        await this.page.click('body');
        await this.page.waitForTimeout(300);
      }
    }
    
    // Submit the search with fallback approach
    console.log('Submitting search...');
    
    try {
      // Try to focus and submit via input
      await searchInput.focus();
      await this.page.waitForTimeout(200);
      await searchInput.press('Enter');
    } catch (focusError) {
      console.log('Focus failed, trying keyboard Enter');
      await this.page.keyboard.press('Enter');
    }
    
    // Wait for navigation to complete
    await this.page.waitForLoadState('networkidle', { timeout: 15000 });
    
    console.log(`Search completed for: "${searchTerm}". Current URL: ${this.page.url()}`);
  }

  async getSearchResultsCount(): Promise<number> {
    try {
      await this.page.waitForSelector(this.selectors.searchResults, { timeout: 5000 });
      return await this.page.locator(this.selectors.searchResults).count();
    } catch (error) {
      return 0;
    }
  }

  async clickFirstResult(): Promise<void> {
    const firstResult = this.page.locator(this.selectors.firstResult);
    await firstResult.waitFor({ state: 'visible' });
    await firstResult.click();
    await this.page.waitForLoadState('networkidle');
  }

  async getFirstResultTitle(): Promise<string | null> {
    try {
      const firstResult = this.page.locator(this.selectors.firstResult);
      if (await firstResult.isVisible()) {
        return await firstResult.textContent();
      }
    } catch (error) {
      // No results or error
    }
    return null;
  }

  async getAllResultTitles(): Promise<string[]> {
    try {
      await this.page.waitForSelector(this.selectors.resultHeading, { timeout: 5000 });
      return await this.page.locator(this.selectors.resultHeading).allTextContents();
    } catch (error) {
      return [];
    }
  }

  async hasResults(): Promise<boolean> {
    try {
      const resultsCount = await this.getSearchResultsCount();
      return resultsCount > 0;
    } catch (error) {
      return false;
    }
  }

  async hasNoResultsMessage(): Promise<boolean> {
    try {
      return await this.page.locator(this.selectors.noResultsMessage).isVisible();
    } catch (error) {
      return false;
    }
  }

  async getDidYouMeanSuggestion(): Promise<string | null> {
    try {
      const suggestion = this.page.locator(this.selectors.didYouMean);
      if (await suggestion.isVisible()) {
        return await suggestion.textContent();
      }
    } catch (error) {
      // No suggestion
    }
    return null;
  }

  async isSearchInputVisible(): Promise<boolean> {
    return await this.page.locator(this.selectors.searchInput).isVisible();
  }

  async getCurrentSearchTerm(): Promise<string> {
    return await this.page.locator(this.selectors.searchInput).inputValue();
  }

  async waitForSearchResults(): Promise<void> {
    // Wait for either results or no results message
    await Promise.race([
      this.page.waitForSelector(this.selectors.searchResults),
      this.page.waitForSelector(this.selectors.noResultsMessage)
    ]);
  }

  async navigateToResult(index: number): Promise<void> {
    const results = this.page.locator(this.selectors.resultHeading);
    const targetResult = results.nth(index);
    
    if (await targetResult.isVisible()) {
      await targetResult.click();
      await this.page.waitForLoadState('networkidle');
    } else {
      throw new Error(`Search result at index ${index} is not visible`);
    }
  }
}
