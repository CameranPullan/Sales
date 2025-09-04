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
    await this.page.fill(this.selectors.searchInput, searchTerm);
    
    // Use robust search submission
    try {
      await Promise.all([
        this.page.waitForLoadState('networkidle'),
        this.page.locator(this.selectors.searchInput).press('Enter')
      ]);
    } catch (error) {
      // Fallback approach
      await this.page.keyboard.press('Enter');
      await this.page.waitForLoadState('networkidle');
    }
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
