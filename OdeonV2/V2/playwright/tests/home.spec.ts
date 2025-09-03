import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';

test.describe('Odeon Home Page', () => {
  test('should display the logo', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    await expect(page.locator(homePage['logoSelector'])).toBeVisible();
  });
});
