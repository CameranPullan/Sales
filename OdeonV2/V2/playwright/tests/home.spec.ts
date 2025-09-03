import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';

test.describe('Wikipedia Home Page', () => {
  test('should display the logo', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
  expect(await homePage.isLogoVisible()).toBe(true);
  });

  test('should navigate to today\'s featured article', async ({ page }) => {
    const homePage = new HomePage(page);
    
    // Step 1: Navigate to Wikipedia
    await homePage.goto();
    
    // Verify we're on the homepage and featured article section is visible
    expect(await homePage.isLogoVisible()).toBe(true);
    expect(await homePage.isTodaysFeaturedArticleVisible()).toBe(true);
    
    // Step 2: Get the featured article title and click on it
    const articleTitle = await homePage.getTodaysFeaturedArticleTitle();
    console.log(`Today's featured article: ${articleTitle}`);
    expect(articleTitle).toBeTruthy(); // Ensure we have a title
    
    await homePage.clickTodaysFeaturedArticle();
    
    // Verify we navigated to the article page
    await page.waitForLoadState('networkidle');
    
    // Check that we're now on an article page (should have the article title in the heading)
    const pageHeading = page.locator('h1.firstHeading');
    expect(await pageHeading.isVisible()).toBe(true);
    
    // Verify the page title contains the article title we clicked
    const pageTitle = await page.title();
    expect(pageTitle).toContain(articleTitle);
  });

  test('should search for J. R. R. Tolkien and get his birthday', async ({ page }) => {
    const homePage = new HomePage(page);
    
    // Step 1: Navigate to Wikipedia
    await homePage.goto();
    expect(await homePage.isLogoVisible()).toBe(true);
    
    // Step 2: Search for "J. R. R. Tolkien"
    await homePage.searchFor('J. R. R. Tolkien');
    
    // Verify we're on Tolkien's page
    await page.waitForLoadState('networkidle');
    const pageHeading = page.locator('h1.firstHeading');
    expect(await pageHeading.isVisible()).toBe(true);
    
    const headingText = await pageHeading.textContent();
    expect(headingText).toContain('Tolkien');
    
    // Step 3: Get his birthday
    const birthday = await homePage.getBirthday();
    console.log(`J. R. R. Tolkien's birthday: ${birthday}`);
    
    // Verify we found birthday information
    expect(birthday).toBeTruthy();
    expect(birthday).not.toBe('Birthday not found');
  });
});
