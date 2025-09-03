import { Page, Locator } from '@playwright/test';
import { localeManager } from '../config/locales';
import { SupportedLocale } from '../config/locales/types';

export class SelectorManager {
  private page: Page;
  private locale: SupportedLocale;

  constructor(page: Page, locale?: SupportedLocale) {
    this.page = page;
    this.locale = locale || localeManager.getCurrentLocale();
  }

  /**
   * Get element with fallback selector logic
   */
  async getElementWithFallback(primaryPath: string, fallbackPaths: string[] = []): Promise<Locator> {
    const primarySelector = localeManager.getSelector(primaryPath, this.locale);
    let element = this.page.locator(primarySelector);

    // Check if primary selector exists
    if (await element.count() > 0) {
      return element;
    }

    // Try fallback selectors
    for (const fallbackPath of fallbackPaths) {
      try {
        const fallbackSelector = localeManager.getSelector(fallbackPath, this.locale);
        element = this.page.locator(fallbackSelector);
        
        if (await element.count() > 0) {
          console.warn(`Using fallback selector: ${fallbackPath} instead of ${primaryPath}`);
          return element;
        }
      } catch (error) {
        console.warn(`Fallback selector ${fallbackPath} not found in locale config`);
      }
    }

    // If no fallbacks work, return the original selector
    console.warn(`No working selectors found for ${primaryPath}, returning primary selector`);
    return this.page.locator(primarySelector);
  }

  /**
   * Wait for any of the provided selectors to appear
   */
  async waitForAnySelector(selectorPaths: string[], timeout: number = 30000): Promise<string> {
    const selectors = selectorPaths.map(path => {
      try {
        return { path, selector: localeManager.getSelector(path, this.locale) };
      } catch (error) {
        console.warn(`Selector path ${path} not found in locale config`);
        return null;
      }
    }).filter((item): item is { path: string; selector: string } => item !== null);

    if (selectors.length === 0) {
      throw new Error(`No valid selectors found for paths: ${selectorPaths.join(', ')}`);
    }

    // Wait for any selector to appear
    const promises = selectors.map(async ({ path, selector }) => {
      try {
        await this.page.waitForSelector(selector, { timeout, state: 'visible' });
        return path;
      } catch (error) {
        throw new Error(`Selector ${path} (${selector}) not found within timeout`);
      }
    });

    try {
      return await Promise.any(promises);
    } catch (error) {
      throw new Error(`None of the selectors appeared within timeout: ${selectorPaths.join(', ')}`);
    }
  }

  /**
   * Check if selector exists on page
   */
  async selectorExists(selectorPath: string): Promise<boolean> {
    try {
      const selector = localeManager.getSelector(selectorPath, this.locale);
      const count = await this.page.locator(selector).count();
      return count > 0;
    } catch (error) {
      console.warn(`Error checking selector existence: ${selectorPath}`, error);
      return false;
    }
  }

  /**
   * Get the best selector for featured content based on locale and page layout
   */
  async getFeaturedContentSelector(): Promise<string> {
    const possiblePaths = [
      'homePage.featuredArticle',
      'homePage.featuredImage',
      'homePage.newsSection'
    ];

    for (const path of possiblePaths) {
      if (await this.selectorExists(path)) {
        return localeManager.getSelector(path, this.locale);
      }
    }

    throw new Error(`No featured content selectors found for locale: ${this.locale}`);
  }

  /**
   * Dynamic selector generation for infobox fields
   */
  getInfoboxSelector(field: string): string {
    const baseSelector = localeManager.getSelector('articlePage.infobox.container', this.locale);
    
    // Common field translations per locale
    const fieldTranslations = {
      en: {
        born: ['Born', 'Birth', 'Date of birth'],
        died: ['Died', 'Death', 'Date of death'],
        nationality: ['Nationality', 'Citizenship'],
        occupation: ['Occupation', 'Profession', 'Known for']
      },
      es: {
        born: ['Nacimiento', 'Nació', 'Fecha de nacimiento'],
        died: ['Fallecimiento', 'Murió', 'Fecha de muerte'],
        nationality: ['Nacionalidad', 'Ciudadanía'],
        occupation: ['Ocupación', 'Profesión', 'Conocido por']
      }
    };

    const translations = fieldTranslations[this.locale] || fieldTranslations.en;
    const fieldTerms = translations[field] || [field];

    // Create a selector that looks for any of the possible field terms
    const fieldSelectors = fieldTerms.map(term => 
      `tr:has-text("${term}") td, th:has-text("${term}") + td`
    ).join(', ');

    return `${baseSelector} ${fieldSelectors}`;
  }
}
