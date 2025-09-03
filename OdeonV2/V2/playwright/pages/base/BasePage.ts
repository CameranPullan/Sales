import { Page, expect, Locator } from '@playwright/test';
import { localeManager } from '../../config/locales';
import { SupportedLocale, LocaleConfig } from '../../config/locales/types';

export abstract class BasePage {
  readonly page: Page;
  readonly locale: SupportedLocale;
  readonly localeConfig: LocaleConfig;

  constructor(page: Page, locale?: SupportedLocale) {
    this.page = page;
    this.locale = locale || localeManager.getCurrentLocale();
    this.localeConfig = localeManager.getLocaleConfig(this.locale);
  }

  /**
   * Smart selector resolution using dot notation
   */
  protected getSelector(path: string): string {
    return localeManager.getSelector(path, this.locale);
  }

  /**
   * Get localized translation text
   */
  protected getTranslation(key: string): string {
    return localeManager.getTranslation(key, this.locale);
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
   * Locale-aware element locator
   */
  protected getElement(selectorPath: string): Locator {
    const selector = this.getSelector(selectorPath);
    return this.page.locator(selector);
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
    const logoSelector = this.getSelector('common.logo');
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
    console.log(`[${this.locale.toUpperCase()}] ${message}`);
  }
}
