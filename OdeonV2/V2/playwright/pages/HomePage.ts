import { Page } from '@playwright/test';
import { BasePage } from './base/BasePage';
import { SelectorManager } from '../utils/SelectorManager';
import { ContentValidator } from '../utils/ContentValidator';
import { LocaleUtils } from '../utils/LocaleUtils';

export class HomePage extends BasePage {
  private selectorManager: SelectorManager;
  private contentValidator: ContentValidator;

  constructor(page: Page, locale?: any) {
    super(page, locale);
    this.selectorManager = new SelectorManager(page, this.locale);
    this.contentValidator = new ContentValidator(this.locale);
  }

  async goto() {
    this.logContext('Navigating to Wikipedia homepage');
    await super.goto('/');
    
    // Validate we're on the correct locale
    const isCorrectLocale = await this.validateLocaleUrl();
    if (!isCorrectLocale) {
      console.warn(`URL validation failed - expected ${this.locale}.wikipedia.org`);
    }
  }

  async isLogoVisible(): Promise<boolean> {
    this.logContext('Checking logo visibility');
    
    try {
      await this.assertVisible('homePage.logo');
      return true;
    } catch (error) {
      console.warn('Logo visibility check failed:', error.message);
      return false;
    }
  }

  async clickTodaysFeaturedArticle(): Promise<void> {
    this.logContext('Clicking on featured article');
    
    try {
      // First, try to find a heading with link
      const headingLink = this.page.locator('h2 a[href*="/wiki/"]').first();
      if (await headingLink.count() > 0) {
        this.logContext('Clicking featured article in heading');
        await headingLink.click();
        await this.waitForPageLoad();
        return;
      }
      
      // If no heading link, try the SelectorManager approach
      const featuredSelector = await this.selectorManager.getFeaturedContentSelector();
      const featuredElement = this.page.locator(featuredSelector);
      const featuredLink = featuredElement.locator('p > b > a').first();
      
      if (await featuredLink.count() > 0) {
        this.logContext('Clicking featured article via selector');
        await featuredLink.click();
        await this.waitForPageLoad();
        return;
      }
      
      // Fallback: look for any prominent article link on the page
      const fallbackLink = this.page.locator('a[href*="/wiki/"]:not([href*="File:"]):not([href*="Category:"])').first();
      if (await fallbackLink.count() > 0) {
        this.logContext('Clicking article via fallback');
        await fallbackLink.click();
        await this.waitForPageLoad();
        return;
      }
      
      throw new Error(`No clickable featured content found for locale: ${this.locale}`);
    } catch (error) {
      console.error('Failed to click featured article:', error.message);
      throw error;
    }
  }

  async getTodaysFeaturedArticleTitle(): Promise<string> {
    this.logContext('Getting featured article title');
    
    try {
      // First, try to find a heading with link
      const headingLink = this.page.locator('h2 a[href*="/wiki/"]').first();
      if (await headingLink.count() > 0) {
        const title = await headingLink.textContent();
        if (title?.trim()) {
          this.logContext(`Found featured article in heading: "${title}"`);
          return title.trim();
        }
      }
      
      // If no heading link, try the SelectorManager approach
      const featuredSelector = await this.selectorManager.getFeaturedContentSelector();
      const featuredElement = this.page.locator(featuredSelector);
      const featuredLink = featuredElement.locator('p > b > a').first();
      
      if (await featuredLink.count() > 0) {
        const title = await featuredLink.textContent() || '';
        if (title.trim()) {
          this.logContext(`Found featured article via selector: "${title}"`);
          return title;
        }
      }
      
      // Fallback: look for any prominent article link on the page
      const fallbackLink = this.page.locator('a[href*="/wiki/"]:not([href*="File:"]):not([href*="Category:"])').first();
      if (await fallbackLink.count() > 0) {
        const title = await fallbackLink.textContent();
        if (title?.trim()) {
          this.logContext(`Found article via fallback: "${title}"`);
          return title.trim();
        }
      }
      
      throw new Error(`No featured content found for locale: ${this.locale}`);
    } catch (error) {
      console.warn('Failed to get featured article title:', error.message);
      return '';
    }
  }

  async isTodaysFeaturedArticleVisible(): Promise<boolean> {
    this.logContext('Checking featured article visibility');
    
    try {
      const featuredSelector = await this.selectorManager.getFeaturedContentSelector();
      const count = await this.page.locator(featuredSelector).count();
      return count > 0;
    } catch (error) {
      console.warn('Featured article visibility check failed:', error.message);
      return false;
    }
  }

  async searchFor(searchTerm: string): Promise<void> {
    this.logContext(`Searching for: "${searchTerm}"`);
    
    const searchInput = this.getElement('common.searchInput');
    await searchInput.fill(searchTerm);
    await searchInput.press('Enter');
    await this.waitForPageLoad();
    
    this.logContext('Search completed');
  }

  async searchForRandomAuthor(): Promise<string> {
    const randomAuthor = LocaleUtils.getRandomLocalizedItem('searchTerms.people.authors', this.locale);
    this.logContext(`Selected random author: "${randomAuthor}"`);
    
    await this.searchFor(randomAuthor);
    return randomAuthor;
  }

  async getBirthday(): Promise<string> {
    this.logContext('Extracting birthday information');
    
    try {
      // Use the enhanced selector manager for infobox birthday extraction
      const birthdaySelector = this.selectorManager.getInfoboxSelector('born');
      const birthdayElement = this.page.locator(birthdaySelector).first();
      
      if (await birthdayElement.count() > 0) {
        const birthdayText = await birthdayElement.textContent() || '';
        
        // Use content validator to extract and validate the date
        const dateResult = this.contentValidator.extractAndValidateDate(birthdayText);
        
        if (dateResult.isValid && dateResult.date) {
          const formattedDate = LocaleUtils.formatDate(dateResult.date, this.locale);
          this.logContext(`Birthday found and formatted: "${formattedDate}"`);
          return formattedDate;
        } else {
          this.logContext(`Birthday text found but invalid: "${birthdayText}"`);
          return birthdayText.trim();
        }
      }
      
      this.logContext('No birthday information found');
      return 'Birthday not found';
    } catch (error) {
      console.warn('Error extracting birthday:', error.message);
      return 'Error extracting birthday';
    }
  }

  async validatePersonPage(expectedData?: any): Promise<{ isValid: boolean; errors: string[] }> {
    this.logContext('Validating person page content');
    
    try {
      const title = await this.getPageTitle();
      const birthday = await this.getBirthday();
      
      // Get expected data if not provided
      if (!expectedData) {
        expectedData = this.contentValidator.getExpectedSampleData('tolkien');
      }
      
      const pageContent = {
        title,
        birthDate: birthday === 'Birthday not found' ? undefined : birthday,
        nationality: undefined, // Could be extracted if needed
        occupation: undefined   // Could be extracted if needed
      };
      
      const validation = this.contentValidator.validatePersonPage(pageContent);
      
      this.logContext(`Page validation result: ${validation.isValid ? 'VALID' : 'INVALID'}`);
      if (validation.errors.length > 0) {
        this.logContext(`Validation errors: ${validation.errors.join(', ')}`);
      }
      
      return validation;
    } catch (error) {
      this.logContext(`Page validation failed: ${error.message}`);
      return { isValid: false, errors: [error.message] };
    }
  }

  // Public method to get assertions for test usage
  public getAssertionMessage(path: string): string {
    return this.getAssertion(path);
  }

  // Public method to get translations for test usage
  public getTranslationText(key: string): string {
    return this.getTranslation(key);
  }
}
