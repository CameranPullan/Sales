import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';

test.describe('Wikipedia Home Page', () => {
  test('should display the logo', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
  expect(await homePage.isLogoVisible()).toBe(true);
  });
});
