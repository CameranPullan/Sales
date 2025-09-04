/**
 * Test Refactoring Utility for Phase 4: Test Implementation
 * Provides helpers for locale-agnostic test development and UI mode robustness
 */

import { Page } from '@playwright/test';

export class TestRefactoringUtils {
  /**
   * Perform robust search with retry logic for UI mode
   */
  static async performRobustSearch(
    page: Page, 
    searchTerm: string, 
    maxAttempts: number = 3,
    timeoutMs: number = 10000
  ): Promise<boolean> {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        // Clear and fill search input
        const searchInput = page.locator('#searchInput, input[name="search"], [placeholder*="Search"]').first();
        await searchInput.waitFor({ state: 'visible', timeout: 5000 });
        await searchInput.fill('');
        await searchInput.fill(searchTerm);
        await page.waitForTimeout(500);
        
        // Try multiple submission strategies
        try {
          await Promise.race([
            page.waitForLoadState('networkidle', { timeout: timeoutMs }),
            searchInput.press('Enter')
          ]);
        } catch {
          // Fallback to search button click
          const searchButton = page.locator('button[type="submit"], input[type="submit"]').first();
          if (await searchButton.isVisible({ timeout: 1000 })) {
            await searchButton.click();
          } else {
            await page.keyboard.press('Enter');
          }
          await page.waitForLoadState('networkidle', { timeout: timeoutMs });
        }
        
        return true;
      } catch (error) {
        console.log(`Search attempt ${attempt} failed: ${error.message}`);
        if (attempt < maxAttempts) {
          await page.waitForTimeout(2000);
          // Try to go back to a clean state
          await page.reload({ waitUntil: 'networkidle', timeout: timeoutMs });
        }
      }
    }
    return false;
  }

  /**
   * Wait for page to be fully ready with multiple checks
   */
  static async waitForPageReady(page: Page, timeoutMs: number = 15000): Promise<void> {
    await Promise.all([
      page.waitForLoadState('networkidle', { timeout: timeoutMs }),
      page.waitForFunction(() => document.readyState === 'complete', { timeout: timeoutMs })
    ]);
  }

  /**
   * Replace hardcoded test names with translation-based names
   */
  static generateTestName(translationKey: string, locale: string, params?: Record<string, string>): string {
    // This would integrate with the locale manager to get translated test names
    const baseKey = `testNames.${translationKey}`;
    return `[${locale.toUpperCase()}] ${baseKey}${params ? ` (${JSON.stringify(params)})` : ''}`;
  }

  /**
   * Create locale-aware test descriptions
   */
  static generateTestDescription(
    action: string, 
    target: string, 
    locale: string, 
    expectedOutcome?: string
  ): string {
    return `Should ${action} ${target} for ${locale} locale${expectedOutcome ? ` and ${expectedOutcome}` : ''}`;
  }

  /**
   * Convert hardcoded assertions to translation-based assertions
   */
  static createLocaleAssertion(
    translationKey: string, 
    expectedTranslation: string, 
    locale: string
  ): { key: string; expected: string; locale: string } {
    return {
      key: translationKey,
      expected: expectedTranslation,
      locale
    };
  }

  /**
   * Generate parameterized test data for multiple locales
   */
  static generateMultiLocaleTestData(testData: any[], locales: string[]): any[] {
    return locales.flatMap(locale => 
      testData.map(data => ({ ...data, locale }))
    );
  }

  /**
   * Create cross-locale validation test cases
   */
  static generateCrossLocaleValidation(
    testCase: string,
    sourceLocale: string,
    targetLocales: string[]
  ): Array<{ testCase: string; sourceLocale: string; targetLocale: string }> {
    return targetLocales.map(targetLocale => ({
      testCase,
      sourceLocale,
      targetLocale
    }));
  }
}
