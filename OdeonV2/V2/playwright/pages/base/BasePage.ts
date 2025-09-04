import { Page, expect, Locator } from '@playwright/test';
import { localeManager } from '../../config/locales';
import { SupportedLocale, LocaleConfig } from '../../config/locales/types';

export abstract class BasePage {
  readonly page: Page;
  readonly locale: SupportedLocale;
  readonly localeConfig: LocaleConfig;
  private translationCache: Map<string, string> = new Map();
  private selectorCache: Map<string, string> = new Map();

  constructor(page: Page, locale?: SupportedLocale) {
    this.page = page;
    this.locale = locale || localeManager.getCurrentLocale();
    this.localeConfig = localeManager.getLocaleConfig(this.locale);
    
    this.validateLocaleConfiguration();
  }

  /**
   * Validates locale configuration on initialization
   */
  private validateLocaleConfiguration(): void {
    if (!this.localeConfig) {
      throw new Error(`Invalid locale configuration for: ${this.locale}`);
    }
    
    if (!this.localeConfig.baseUrl) {
      throw new Error(`Missing baseUrl for locale: ${this.locale}`);
    }
  }

  /**
   * Enhanced selector resolution with caching
   */
  protected getSelector(path: string): string {
    const cacheKey = `${this.locale}:${path}`;
    
    if (this.selectorCache.has(cacheKey)) {
      return this.selectorCache.get(cacheKey)!;
    }
    
    const selector = localeManager.getSelector(path, this.locale);
    this.selectorCache.set(cacheKey, selector);
    return selector;
  }

  /**
   * Enhanced translation resolution with caching and parameterization
   */
  protected getTranslation(key: string, params?: Record<string, string>): string {
    const cacheKey = `${this.locale}:${key}:${JSON.stringify(params || {})}`;
    
    if (this.translationCache.has(cacheKey)) {
      return this.translationCache.get(cacheKey)!;
    }
    
    let translation = localeManager.getTranslation(key, this.locale);
    
    // Handle parameterized translations
    if (params && translation) {
      Object.entries(params).forEach(([key, value]) => {
        translation = translation.replace(new RegExp(`{{${key}}}`, 'g'), value);
      });
    }
    
    this.translationCache.set(cacheKey, translation);
    return translation;
  }

  /**
   * Get test data for current locale
   */
  protected getTestData(path: string): any {
    return localeManager.getTestData(path, this.locale);
  }

  /**
   * Get assertion message for current locale
   */
  protected getAssertion(path: string): string {
    return localeManager.getAssertion(path, this.locale);
  }

  /**
   * Advanced locale-aware element locator with multiple strategies
   */
  protected getElement(selectorPath: string): Locator {
    const selector = this.getSelector(selectorPath);
    return this.page.locator(selector);
  }

  /**
   * Get element with fallback selectors for cross-locale compatibility
   */
  protected getElementWithFallbacks(selectorPaths: string[]): Locator {
    const selectors = selectorPaths.map(path => this.getSelector(path));
    const combinedSelector = selectors.join(', ');
    return this.page.locator(combinedSelector);
  }

  /**
   * RTL/LTR aware element positioning
   */
  protected async isRightToLeft(): Promise<boolean> {
    const direction = await this.page.evaluate(() => {
      return window.getComputedStyle(document.documentElement).direction;
    });
    return direction === 'rtl';
  }

  /**
   * Locale-aware waiting strategy
   */
  protected async waitForLocaleSpecificElement(selectorPath: string, timeout?: number): Promise<void> {
    const selector = this.getSelector(selectorPath);
    await this.page.waitForSelector(selector, { 
      timeout: timeout || 30000,
      state: 'visible'
    });
  }

  /**
   * Locale-aware text assertion
   */
  protected async assertText(selectorPath: string, translationKey: string): Promise<void> {
    const element = this.getElement(selectorPath);
    const expectedText = this.getTranslation(translationKey);
    
    await expect(element, this.getAssertion('content.textPresent')).toHaveText(expectedText);
  }

  /**
   * Locale-aware partial text assertion
   */
  protected async assertContainsText(selectorPath: string, translationKey: string): Promise<void> {
    const element = this.getElement(selectorPath);
    const expectedText = this.getTranslation(translationKey);
    
    await expect(element, this.getAssertion('content.textPresent')).toContainText(expectedText);
  }

  /**
   * Locale-aware visibility assertion
   */
  protected async assertVisible(selectorPath: string): Promise<void> {
    const element = this.getElement(selectorPath);
    await expect(element, this.getAssertion('visibility.elementVisible')).toBeVisible();
  }

  /**
   * Locale-aware hidden assertion
   */
  protected async assertHidden(selectorPath: string): Promise<void> {
    const element = this.getElement(selectorPath);
    await expect(element, this.getAssertion('visibility.elementHidden')).toBeHidden();
  }

  /**
   * Navigate to the base URL for current locale
   */
  async goto(path: string = '/'): Promise<void> {
    const url = `${this.localeConfig.baseUrl}${path}`;
    await this.page.goto(url);
    await this.waitForPageLoad();
  }

  /**
   * Wait for page to be fully loaded
   */
  protected async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
    
    // Ensure the logo is visible as an indicator of successful load
    const logoSelector = this.getSelector('homePage.logo');
    await this.page.waitForSelector(logoSelector, { state: 'visible' });
  }

  /**
   * Get the current page title
   */
  async getPageTitle(): Promise<string> {
    return await this.page.title();
  }

  /**
   * Get the current page URL
   */
  getCurrentUrl(): string {
    return this.page.url();
  }

  /**
   * Check if current URL matches expected locale
   */
  async validateLocaleUrl(): Promise<boolean> {
    const currentUrl = this.getCurrentUrl();
    return currentUrl.includes(`${this.locale}.wikipedia.org`);
  }

  /**
   * Log current test context
   */
  protected logContext(message: string): void {
    // Context logging disabled
  }
}
