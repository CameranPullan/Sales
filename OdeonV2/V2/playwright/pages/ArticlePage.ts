import { Page } from '@playwright/test';
import { BasePage } from './base/BasePage';
import { SupportedLocale } from '../config/locales/types';

export class ArticlePage extends BasePage {
  // Selectors for article content
  private readonly selectors = {
    articleTitle: 'h1.firstHeading',
    infobox: '.infobox',
    birthDateRow: '.infobox tr:has-text("Born"), .infobox tr:has-text("Nasc"), .infobox tr:has-text("Nato")',
    infoboxValueCell: 'td:last-child',
    articleContent: '#mw-content-text',
    references: '.references',
    categories: '#mw-normal-catlinks',
    editButton: '#ca-edit',
    printButton: '#cactions .icon-print'
  };

  constructor(page: Page, locale?: SupportedLocale) {
    super(page, locale);
  }

  async getArticleTitle(): Promise<string> {
    return await this.page.textContent(this.selectors.articleTitle) || '';
  }

  async getInfoboxValue(fieldName: string): Promise<string | null> {
    const infoboxSelector = this.getLocalizedInfoboxSelector(fieldName);
    try {
      const element = this.page.locator(infoboxSelector).first();
      if (await element.isVisible()) {
        return await element.textContent();
      }
    } catch (error) {
      // Field not found or not visible
    }
    return null;
  }

  async getBirthDate(): Promise<string | null> {
    const birthDateSelectors = [
      '.infobox tr:has-text("Born") td:last-child',
      '.infobox tr:has-text("Nasc") td:last-child', // Spanish
      '.infobox tr:has-text("Nato") td:last-child'  // Italian
    ];

    for (const selector of birthDateSelectors) {
      try {
        const element = this.page.locator(selector).first();
        if (await element.isVisible()) {
          const text = await element.textContent();
          if (text && text.trim()) {
            return text.trim();
          }
        }
      } catch (error) {
        // Continue to next selector
      }
    }
    return null;
  }

  async isArticleContentVisible(): Promise<boolean> {
    return await this.page.locator(this.selectors.articleContent).isVisible();
  }

  async hasInfobox(): Promise<boolean> {
    return await this.page.locator(this.selectors.infobox).isVisible();
  }

  async getArticleCategories(): Promise<string[]> {
    try {
      const categoriesElement = this.page.locator(this.selectors.categories);
      if (await categoriesElement.isVisible()) {
        const links = await categoriesElement.locator('a').allTextContents();
        return links.filter(link => link.trim() !== '');
      }
    } catch (error) {
      // Categories not found
    }
    return [];
  }

  private getLocalizedInfoboxSelector(fieldName: string): string {
    const fieldMappings: Record<string, Record<string, string>> = {
      'born': {
        'en': 'Born',
        'es': 'Nacimiento',
        'it': 'Nato'
      },
      'nationality': {
        'en': 'Nationality',
        'es': 'Nacionalidad', 
        'it': 'Nazionalità'
      },
      'occupation': {
        'en': 'Occupation',
        'es': 'Ocupación',
        'it': 'Occupazione'
      }
    };

    const localizedField = fieldMappings[fieldName]?.[this.locale] || fieldName;
    return `.infobox tr:has-text("${localizedField}") td:last-child`;
  }

  async waitForArticleLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
    await this.page.locator(this.selectors.articleTitle).waitFor({ state: 'visible' });
  }
}
