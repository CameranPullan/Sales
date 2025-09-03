import { Page } from '@playwright/test';

export class HomePage {
  readonly page: Page;

  // Example selector
  private readonly logoSelector = 'header .logo';

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/');
  }

  async isLogoVisible(): Promise<boolean> {
    return this.page.locator(this.logoSelector).isVisible();
  }
}
