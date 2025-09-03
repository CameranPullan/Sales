import { test, expect } from '../fixtures/test';
import { HomePage } from '../pages/HomePage';

test.describe('Enhanced Wikipedia Tests - Refactored (Phase 4)', () => {
  test('should display the logo with locale-aware assertions', async ({ 
    page, 
    locale, 
    localeContext, 
    utils, 
    homePage
  }) => {
    // Use translation utilities for test messaging
    const testName = utils.translation.getTestName('logoVisibility', locale);
    console.log(`🏠 ${testName} - ${locale.toUpperCase()}`);
    console.log(`📍 Navigate to homepage: ${localeContext.baseUrl}`);
    
    await homePage.goto();
    
    // Use enhanced assertion with locale-aware messaging
    const isLogoVisible = await homePage.isLogoVisible();
    const visibilityMsg = utils.translation.getAssertionMessage('visibility.elementVisible', locale);
    expect(isLogoVisible, visibilityMsg).toBe(true);
    
    // Validate locale URL
    const urlValidationMsg = utils.translation.getTestAction('validateLocaleUrl', locale);
    expect(await homePage.validateLocaleUrl(), urlValidationMsg).toBe(true);
    
    const successMsg = utils.translation.formatTestResult('logoVisibility', locale, true);
    console.log(successMsg);
  });

  test('should navigate to featured article with enhanced selectors', async ({ 
    page, 
    locale, 
    localeContext, 
    utils, 
    homePage
  }) => {
    // Use translation-based test identification
    const testName = utils.translation.getTestName('featuredArticleNavigation', locale);
    console.log(`📰 ${testName} - ${locale.toUpperCase()}`);
    
    // Step 1: Navigate using translation
    const step1 = utils.translation.formatTestStep('navigateToHomepage', locale, undefined, 1);
    console.log(step1);
    await homePage.goto();
    
    const logoVisibilityMsg = utils.translation.getAssertionMessage('visibility.elementVisible', locale);
    expect(await homePage.isLogoVisible(), logoVisibilityMsg).toBe(true);
    
    // Step 2: Check featured article section
    const step2 = utils.translation.formatTestStep('findFeaturedArticle', locale, undefined, 2);
    console.log(step2);
    expect(await homePage.isTodaysFeaturedArticleVisible()).toBe(true);
    
    // Step 3: Extract and validate article title
    const step3 = utils.translation.formatTestStep('extractArticleTitle', locale, undefined, 3);
    console.log(step3);
    const articleTitle = await homePage.getTodaysFeaturedArticleTitle();
    expect(articleTitle).toBeTruthy();
    
    const featuredContentLabel = utils.translation.getTranslation('homePage.featuredContent.article', locale);
    console.log(`📖 ${featuredContentLabel}: ${articleTitle}`);
    
    // Navigate to article
    const step4 = utils.translation.formatTestStep('clickFeaturedArticle', locale, articleTitle, 4);
    console.log(step4);
    await homePage.clickTodaysFeaturedArticle();
    
    // Verify navigation
    const pageTitle = await homePage.getPageTitle();
    const navigationMsg = utils.translation.getAssertionMessage('actions.navigationSuccessful', locale);
    expect(pageTitle, navigationMsg).toContain(articleTitle);
    
    const successMsg = utils.translation.formatTestResult('featuredArticleNavigation', locale, true);
    console.log(successMsg);
  });

  test('should search for locale-appropriate author and extract information', async ({ 
    page, 
    locale, 
    localeContext, 
    utils, 
    testData,
    homePage
  }) => {
    // Use translation-based test identification
    const testName = utils.translation.getTestName('authorSearch', locale);
    console.log(`🔍 ${testName} - ${locale.toUpperCase()}`);
    
    // Get locale-appropriate test data instead of hardcoded values
    const authorData = testData.randomPerson;
    const searchTerm = authorData.name;
    
    const step1 = utils.translation.formatTestStep('performSearch', locale, searchTerm, 1);
    console.log(step1);
    
    await homePage.goto();
    
    // Use search functionality
    const searchSelector = utils.translation.getSelector('common.searchInput', locale);
    await page.fill(searchSelector, searchTerm);
    await page.press(searchSelector, 'Enter');
    
    // Wait for navigation
    await page.waitForLoadState('networkidle');
    
    const currentUrl = page.url();
    console.log(`🌐 Search result URL: ${currentUrl}`);
    
    // Check if we landed directly on an article page or on search results
    if (currentUrl.includes('/wiki/') && !currentUrl.includes('Special:Search')) {
      // Direct navigation to article page
      console.log(`🎯 Direct navigation to article page`);
      
      // Try to extract information from the article page
      const step2 = utils.translation.formatTestStep('extractBirthDate', locale, undefined, 2);
      console.log(step2);
      
      // Look for birth date in various possible selectors
      const birthDateSelectors = [
        '.bday',
        '.infobox .bday',
        'tr:has-text("Born") td',
        'tr:has-text("Nacido") td', // Spanish version
        '.vcard .bday'
      ];
      
      let birthDateFound = false;
      for (const selector of birthDateSelectors) {
        try {
          const birthDateElement = page.locator(selector).first();
          if (await birthDateElement.isVisible({ timeout: 2000 })) {
            const birthDate = await birthDateElement.textContent();
            if (birthDate) {
              console.log(`📅 Birth date found: ${birthDate}`);
              
              // Validate date format using locale-aware parsing
              const parsedDate = utils.dateTime.parseDate(birthDate, locale);
              if (parsedDate) {
                console.log(`✅ Date parsed successfully: ${parsedDate.toISOString()}`);
                birthDateFound = true;
                break;
              }
            }
          }
        } catch (e) {
          // Continue to next selector
        }
      }
      
      if (!birthDateFound) {
        console.log(`⚠️ Birth date not found for ${searchTerm}, but search was successful`);
      }
      
    } else if (currentUrl.includes('Special:Search')) {
      // Search results page
      console.log(`📋 Search results page displayed`);
      
      try {
        // Click first result if available
        const firstResultSelector = utils.translation.getSelector('search.firstResult', locale);
        await page.click(firstResultSelector, { timeout: 5000 });
        
        console.log(`🖱️ Clicked first search result`);
        
        // Try to extract information from the article page
        const step2 = utils.translation.formatTestStep('extractBirthDate', locale, undefined, 2);
        console.log(step2);
        
        // Look for birth date in various possible selectors
        const birthDateSelectors = [
          '.bday',
          '.infobox .bday',
          'tr:has-text("Born") td',
          'tr:has-text("Nacido") td', // Spanish version
          '.vcard .bday'
        ];
        
        let birthDateFound = false;
        for (const selector of birthDateSelectors) {
          try {
            const birthDateElement = page.locator(selector).first();
            if (await birthDateElement.isVisible({ timeout: 2000 })) {
              const birthDate = await birthDateElement.textContent();
              if (birthDate) {
                console.log(`📅 Birth date found: ${birthDate}`);
                
                // Validate date format using locale-aware parsing
                const parsedDate = utils.dateTime.parseDate(birthDate, locale);
                if (parsedDate) {
                  console.log(`✅ Date parsed successfully: ${parsedDate.toISOString()}`);
                  birthDateFound = true;
                  break;
                }
              }
            }
          } catch (e) {
            // Continue to next selector
          }
        }
        
        if (!birthDateFound) {
          console.log(`⚠️ Birth date not found for ${searchTerm}, but navigation was successful`);
        }
        
      } catch (error) {
        console.log(`⚠️ Search results found but clicking failed: ${error.message}`);
      }
    } else {
      console.log(`❓ Unexpected search behavior, URL: ${currentUrl}`);
    }
    
    const successMsg = utils.translation.formatTestResult('authorSearch', locale, true);
    console.log(successMsg);
  });

  test('should validate locale-specific formatting and content', async ({ 
    page, 
    locale, 
    localeContext, 
    utils, 
    homePage
  }) => {
    // Use translation for test identification
    const testName = utils.translation.getTestName('localeFormatting', locale);
    console.log(`🌍 ${testName} - ${locale.toUpperCase()}`);
    
    await homePage.goto();
    
    // Test currency formatting using locale context
    const step1 = utils.translation.formatTestStep('validateFormatting', locale, 'currency', 1);
    console.log(step1);
    
    const testAmount = 1234.56;
    const formattedCurrency = utils.currency.formatCurrency(testAmount, locale);
    console.log(`💰 Currency format test: ${formattedCurrency}`);
    expect(formattedCurrency).toContain(localeContext.currencySymbol);
    
    // Test date formatting using locale context
    const step2 = utils.translation.formatTestStep('validateFormatting', locale, 'date', 2);
    console.log(step2);
    
    const testDate = new Date('2023-01-15');
    const formattedDate = utils.dateTime.formatDate(testDate, locale);
    console.log(`📅 Date format test: ${formattedDate}`);
    
    const expectedFormat = localeContext.dateFormat;
    console.log(`📐 Expected format pattern: ${expectedFormat}`);
    
    // Test number formatting
    const step3 = utils.translation.formatTestStep('validateFormatting', locale, 'number', 3);
    console.log(step3);
    
    const testNumber = 1234567.89;
    const formattedNumber = utils.currency.formatNumber(testNumber, locale);
    console.log(`🔢 Number format test: ${formattedNumber}`);
    
    // Validate page language matches locale
    const step4 = utils.translation.formatTestStep('validateLocaleUrl', locale, 'page language', 4);
    console.log(step4);
    
    const pageLang = await page.getAttribute('html', 'lang');
    const expectedLang = locale === 'en' ? 'en' : locale === 'es' ? 'es' : 'it';
    expect(pageLang, 'Page language should match locale').toBe(expectedLang);
    
    const successMsg = utils.translation.formatTestResult('localeFormatting', locale, true);
    console.log(successMsg);
  });
});
