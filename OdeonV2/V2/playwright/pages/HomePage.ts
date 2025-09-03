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
}
