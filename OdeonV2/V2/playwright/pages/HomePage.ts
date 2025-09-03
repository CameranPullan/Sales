import { Page } from '@playwright/test';

export class HomePage {
  readonly page: Page;

  // Wikipedia logo selector - the specific logo element
  private readonly logoSelector = 'a.mw-logo';

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/');
  }

  async isLogoVisible(): Promise<boolean> {
    return this.page.locator(this.logoSelector).isVisible();
  }

  async clickTodaysFeaturedArticle(): Promise<void> {
    // Look for "Today's featured article" section and click on the article link
    const featuredArticleSection = this.page.locator('#mp-tfa');
    const featuredArticleLink = featuredArticleSection.locator('p > b > a').first();
    await featuredArticleLink.click();
  }

  async getTodaysFeaturedArticleTitle(): Promise<string> {
    const featuredArticleSection = this.page.locator('#mp-tfa');
    const featuredArticleLink = featuredArticleSection.locator('p > b > a').first();
    return await featuredArticleLink.textContent() || '';
  }

  async isTodaysFeaturedArticleVisible(): Promise<boolean> {
    return this.page.locator('#mp-tfa').isVisible();
  }

  async searchFor(searchTerm: string): Promise<void> {
    // Use the main search input (not the sticky header one)
    const searchBox = this.page.locator('#searchInput');
    await searchBox.fill(searchTerm);
    await searchBox.press('Enter');
    await this.page.waitForLoadState('networkidle');
  }

  async getBirthday(): Promise<string> {
    // Look for birthday information in the infobox
    try {
      // First try to get the birth date from the structured data
      const birthdayElement = this.page.locator('.bday').first();
      if (await birthdayElement.isVisible()) {
        const birthdayText = await birthdayElement.textContent();
        if (birthdayText) {
          return birthdayText.trim();
        }
      }

      // Alternative: look for "Born" row in infobox
      const bornRow = this.page.locator('tr:has-text("Born")').first();
      if (await bornRow.isVisible()) {
        const bornText = await bornRow.textContent();
        if (bornText) {
          // Extract just the date part using regex
          const dateMatch = bornText.match(/(\d{1,2}\s+\w+\s+\d{4})/);
          if (dateMatch) {
            return dateMatch[1];
          }
        }
      }

      return 'Birthday not found';
    } catch (error) {
      return 'Error extracting birthday';
    }
  }
}
