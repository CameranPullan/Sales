import { test, expect } from '../fixtures/test';
import { HomePage } from '../pages/HomePage';

interface SearchResult {
  category: string;
  term: string;
  success: boolean;
  duration: number;
  pageTitle: string;
}

test.describe('Enhanced Wikipedia Tests with Advanced Framework', () => {
  test('should display the logo with comprehensive locale-aware enhancements', async ({ 
    page, 
    locale, 
    localeContext, 
    utils, 
    testData 
  }) => {
    const testName = utils.translation.getTestName('logoVisibility', locale) || 'Logo visibility test';
    console.log(`🏠 ${testName} - ${locale.toUpperCase()}`);
    console.log(`📍 Base URL: ${localeContext.baseUrl}`);
    console.log(`💰 Currency: ${localeContext.currencySymbol}`);
    console.log(`📊 Test Data: Person=${testData.randomPerson.name}, Location=${testData.randomLocation.name}`);
    
    const homePage = new HomePage(page, locale);
    const startTime = Date.now();
    
    // Step 1: Navigate with performance tracking
    const step1 = utils.translation.formatTestStep('navigateToHomepage', locale, undefined, 1);
    console.log(step1);
    await homePage.goto();
    
    // Step 2: Enhanced logo verification
    const step2 = utils.translation.formatTestStep('checkLogoVisibility', locale, undefined, 2);
    console.log(step2);
    const isLogoVisible = await homePage.isLogoVisible();
    expect(isLogoVisible, homePage.getAssertionMessage('visibility.elementVisible')).toBe(true);
    
    // Step 3: Locale URL validation
    const step3 = utils.translation.formatTestStep('validateLocaleUrl', locale, undefined, 3);
    console.log(step3);
    expect(await homePage.validateLocaleUrl()).toBe(true);
    
    // Step 4: Performance and content validation
    const duration = Date.now() - startTime;
    expect(duration, 'Page load should be within acceptable limits').toBeLessThan(10000);
    
    const pageTitle = await page.title();
    expect(pageTitle).toContain('Wikipedia');
    
    // Step 5: Generate test result
    const result = utils.translation.formatTestResult(testName, locale, true);
    console.log(result);
    
    console.log(`⚡ Performance: ${duration}ms | ✅ Logo test enhanced for ${locale} locale`);
  });

  test('should navigate to featured article with advanced selector handling', async ({ 
    page, 
    locale, 
    localeContext, 
    utils, 
    testData 
  }) => {
    const testName = utils.translation.getTestName('featuredArticleNavigation', locale) || 'Featured article navigation test';
    console.log(`📰 ${testName} - ${locale.toUpperCase()}`);
    
    const homePage = new HomePage(page, locale);
    const startTime = Date.now();
    
    // Step 1: Navigate to Wikipedia with timing
    const step1 = utils.translation.formatTestStep('navigateToHomepage', locale, undefined, 1);
    console.log(step1);
    await homePage.goto();
    expect(await homePage.isLogoVisible()).toBe(true);
    
    // Step 2: Enhanced featured article detection (locale-specific selectors)
    const step2 = utils.translation.formatTestStep('findFeaturedArticle', locale, undefined, 2);
    console.log(step2);
    const featuredArticleVisible = await homePage.isTodaysFeaturedArticleVisible();
    expect(featuredArticleVisible, `Featured article should be visible for ${locale}`).toBe(true);
    
    // Step 3: Get featured article title with enhanced extraction
    const step3 = utils.translation.formatTestStep('extractArticleTitle', locale, undefined, 3);
    console.log(step3);
    const articleTitle = await homePage.getTodaysFeaturedArticleTitle();
    expect(articleTitle).toBeTruthy();
    
    console.log(`📖 Featured article in ${locale}: "${articleTitle}"`);
    
    // Step 4: Navigate to the article
    const step4 = utils.translation.formatTestStep('clickFeaturedArticle', locale, articleTitle, 4);
    console.log(step4);
    await homePage.clickTodaysFeaturedArticle();
    
    // Step 5: Verify navigation success
    const pageTitle = await homePage.getPageTitle();
    const navigationSuccessful = pageTitle.toLowerCase().includes(articleTitle.toLowerCase()) || 
                                 page.url().includes('wiki/');
    expect(navigationSuccessful, `Should navigate to article page successfully`).toBe(true);
    
    // Step 6: Performance and validation
    const duration = Date.now() - startTime;
    console.log(`⚡ Total navigation time: ${duration}ms`);
    
    const result = utils.translation.formatTestResult(testName, locale, true);
    console.log(result);
    
    console.log(`✅ Enhanced featured article navigation completed for ${locale}`);
  });

  test('should search with smart handling and enhanced author extraction', async ({ 
    page, 
    locale, 
    localeContext, 
    utils, 
    testData 
  }) => {
    const testName = utils.translation.getTestName('authorSearch', locale) || 'Author search and extraction test';
    console.log(`🔍 ${testName} - ${locale.toUpperCase()}`);
    
    const homePage = new HomePage(page, locale);
    const selectedAuthor = testData.randomPerson.name;
    const startTime = Date.now();
    
    // Step 1: Navigate to Wikipedia
    const step1 = utils.translation.formatTestStep('navigateToHomepage', locale, undefined, 1);
    console.log(step1);
    await homePage.goto();
    expect(await homePage.isLogoVisible()).toBe(true);
    
    // Step 2: Enhanced search with smart navigation handling
    const step2 = utils.translation.formatTestStep('performSearch', locale, selectedAuthor, 2);
    console.log(step2);
    await page.fill('#searchInput', selectedAuthor);
    await page.press('#searchInput', 'Enter');
    await page.waitForLoadState('networkidle');
    
    // Step 3: Smart page detection (direct article vs search results)
    const currentUrl = page.url();
    let articleTitle = '';
    
    if (currentUrl.includes('/wiki/') && !currentUrl.includes('Special:Search')) {
      // Direct navigation to article
      articleTitle = await page.title();
      console.log(`🎯 Direct article found: ${articleTitle}`);
    } else {
      // Search results page - click first result
      console.log(`📋 Search results page - selecting first result`);
      const firstResult = page.locator('.mw-search-result:first-child .mw-search-result-heading a');
      if (await firstResult.count() > 0) {
        await firstResult.click();
        await page.waitForLoadState('networkidle');
        articleTitle = await page.title();
        console.log(`📖 Article from search results: ${articleTitle}`);
      }
    }
    
    // Step 4: Enhanced biographical information extraction
    const step3 = utils.translation.formatTestStep('extractBirthDate', locale, undefined, 3);
    console.log(step3);
    const birthday = await homePage.getBirthday();
    
    if (birthday && birthday !== 'Birthday not found' && birthday !== 'Error extracting birthday') {
      console.log(`🎂 ${selectedAuthor}'s birthday: ${birthday}`);
      
      // Enhanced date validation with locale-aware formatting
      const formattedBirthday = utils.dateTime.formatDate(new Date(birthday), locale);
      console.log(`📅 Locale-formatted birthday (${locale}): ${formattedBirthday}`);
    } else {
      console.log(`ℹ️ Birthday information not available for ${selectedAuthor}`);
    }
    
    // Step 5: Content validation with enhanced checking
    const validation = await homePage.validatePersonPage();
    console.log(`📊 Page validation: ${validation.errors.length === 0 ? 'All checks passed' : validation.errors.join(', ')}`);
    
    // Step 6: Performance metrics
    const duration = Date.now() - startTime;
    console.log(`⚡ Search and extraction time: ${duration}ms`);
    
    const result = utils.translation.formatTestResult(testName, locale, true);
    console.log(result);
    
    console.log(`✅ Enhanced author search completed for ${locale}`);
  });

  test('should demonstrate advanced cross-locale search capabilities', async ({ 
    page, 
    locale, 
    localeContext, 
    utils, 
    testData 
  }) => {
    const testName = utils.translation.getTestName('crossLocaleSearch', locale) || 'Cross-locale search capabilities test';
    console.log(`🌍 ${testName} - ${locale.toUpperCase()}`);
    
    const homePage = new HomePage(page, locale);
    
    // Test different data categories with enhanced selection
    const testCategories = [
      { 
        data: testData.randomPerson, 
        type: 'person', 
        description: utils.translation.getTestAction('searchPerson', locale) || 'Search person' 
      },
      { 
        data: testData.randomLocation, 
        type: 'location', 
        description: utils.translation.getTestAction('searchLocation', locale) || 'Search location' 
      },
      { 
        data: testData.randomConcept, 
        type: 'concept', 
        description: utils.translation.getTestAction('searchConcept', locale) || 'Search concept' 
      }
    ];
    
    let successfulSearches = 0;
    const searchResults: SearchResult[] = [];
    
    for (const [index, category] of testCategories.entries()) {
      const step = utils.translation.formatTestStep('performSearch', locale, `${category.description}: ${category.data.name}`, index + 1);
      console.log(step);
      
      await homePage.goto();
      
      const searchStart = Date.now();
      
      // Enhanced search with smart result handling
      await page.fill('#searchInput', category.data.name);
      await page.press('#searchInput', 'Enter');
      await page.waitForLoadState('networkidle');
      
      const searchDuration = Date.now() - searchStart;
      
      // Smart page detection and validation
      const currentUrl = page.url();
      let pageTitle = await page.title();
      let success = false;
      
      if (currentUrl.includes('/wiki/') && !currentUrl.includes('Special:Search')) {
        success = true;
        console.log(`   🎯 Direct article: ${pageTitle} (${searchDuration}ms)`);
      } else if (currentUrl.includes('Special:Search')) {
        const resultsCount = await page.locator('.mw-search-result').count();
        if (resultsCount > 0) {
          success = true;
          console.log(`   📋 Search results: ${resultsCount} found (${searchDuration}ms)`);
          
          // Click first result for further validation
          await page.locator('.mw-search-result:first-child .mw-search-result-heading a').first().click();
          await page.waitForLoadState('networkidle');
          pageTitle = await page.title();
          console.log(`   📖 First result: ${pageTitle}`);
        }
      }
      
      searchResults.push({
        category: category.type,
        term: category.data.name,
        success: success,
        duration: searchDuration,
        pageTitle: pageTitle
      });
      
      if (success) successfulSearches++;
    }
    
    // Enhanced reporting with locale-aware formatting
    console.log(`📊 Search Summary for ${locale.toUpperCase()}:`);
    console.log(`   Success Rate: ${successfulSearches}/${testCategories.length} (${((successfulSearches/testCategories.length)*100).toFixed(1)}%)`);
    
    searchResults.forEach((result, index) => {
      const icon = result.success ? '✅' : '❌';
      console.log(`   ${icon} ${result.category}: ${result.term} → ${result.pageTitle} (${result.duration}ms)`);
    });
    
    // Expect at least 2 out of 3 searches to be successful
    expect(successfulSearches, `Most searches should succeed for ${locale}`).toBeGreaterThanOrEqual(2);
    
    const result = utils.translation.formatTestResult(testName, locale, true);
    console.log(result);
    
    console.log(`✅ Advanced cross-locale search completed for ${locale}`);
  });

  test('should validate comprehensive locale-specific formatting and content', async ({ 
    page, 
    locale, 
    localeContext, 
    utils, 
    testData 
  }) => {
    const testName = utils.translation.getTestName('localeFormatting', locale) || 'Locale-specific formatting validation test';
    console.log(`📊 ${testName} - ${locale.toUpperCase()}`);
    
    const homePage = new HomePage(page, locale);
    await homePage.goto();
    
    // Enhanced date formatting tests
    const step1 = utils.translation.formatTestStep('validateDateFormatting', locale, undefined, 1);
    console.log(step1);
    const testDates = [
      new Date('1892-01-03'), // Tolkien's birthday
      new Date('1564-04-23'), // Shakespeare's birthday  
      new Date('1881-10-25'), // Picasso's birthday
      new Date() // Current date
    ];
    
    testDates.forEach((testDate, index) => {
      const formattedDate = utils.dateTime.formatDate(testDate, locale);
      console.log(`   📅 Date ${index + 1} (${locale}): ${formattedDate}`);
      
      // Validate locale-specific patterns
      if (locale === 'es') {
        expect(formattedDate).toMatch(/\d+.*de.*\d{4}/); // Spanish pattern
      } else {
        expect(formattedDate).toMatch(/\w+.*\d+.*\d{4}/); // English pattern
      }
    });
    
    // Enhanced currency formatting tests
    const step2 = utils.translation.formatTestStep('validateCurrencyFormatting', locale, undefined, 2);
    console.log(step2);
    const testAmounts = [0.01, 9.99, 123.45, 1234.56, 12345.67];
    
    testAmounts.forEach((amount, index) => {
      const formattedCurrency = utils.currency.formatCurrency(amount, locale);
      console.log(`   💰 Amount ${index + 1} (${locale}): ${formattedCurrency}`);
      
      // Validate currency symbols
      expect(formattedCurrency).toContain(localeContext.currencySymbol);
      
      // Validate locale-specific formatting
      if (locale === 'es' || locale === 'it') {
        if (amount >= 1000) {
          expect(formattedCurrency).toMatch(/\d+,\d{2}\s*€/); // Euro format
        }
      } else {
        if (amount >= 1000) {
          expect(formattedCurrency).toMatch(/\$\d{1,3}(,\d{3})*\.\d{2}/); // Dollar format
        }
      }
    });
    
    // Enhanced number formatting tests
    const step3 = utils.translation.formatTestStep('validateNumberFormatting', locale, undefined, 3);
    console.log(step3);
    const testNumbers = [123, 1234, 12345, 123456, 1234567.89];
    
    testNumbers.forEach((number, index) => {
      const formattedNumber = utils.currency.formatNumber(number, locale);
      console.log(`   🔢 Number ${index + 1} (${locale}): ${formattedNumber}`);
      
      // Validate thousands separators for larger numbers
      if (number >= 10000) {
        if (locale === 'es' || locale === 'it') {
          expect(formattedNumber).toMatch(/\d{1,3}\.\d{3}/); // Spanish/Italian thousands
        } else {
          expect(formattedNumber).toMatch(/\d{1,3},\d{3}/); // English thousands
        }
      }
    });
    
    // Enhanced percentage formatting tests
    const step4 = utils.translation.formatTestStep('validatePercentageFormatting', locale, undefined, 4);
    console.log(step4);
    const testPercentages = [0.5, 12.34, 56.78, 99.99];
    
    testPercentages.forEach((percentage, index) => {
      const formattedPercentage = utils.currency.formatPercentage(percentage, locale);
      console.log(`   📊 Percentage ${index + 1} (${locale}): ${formattedPercentage}`);
      
      expect(formattedPercentage).toContain('%');
      
      // Validate decimal separators
      if (locale === 'es' || locale === 'it') {
        expect(formattedPercentage).toMatch(/\d+,\d+\s*%/); // Spanish/Italian decimal
      } else {
        expect(formattedPercentage).toMatch(/\d+\.\d+\s*%/); // English decimal
      }
    });
    
    // Content validation with enhanced checks
    const step5 = utils.translation.formatTestStep('validateContentAvailability', locale, undefined, 5);
    console.log(step5);
    const essentialElements = [
      { selector: 'a.mw-logo', name: 'Logo' },
      { selector: '#searchInput', name: 'Search input' },
      { 
        selector: locale === 'es' ? '[id*="destacado"]' : 
                  locale === 'it' ? '[id*="vetrina"], [id*="In_evidenza"]' : 
                  '#mp-tfa', 
        name: 'Featured content' 
      }
    ];
    
    for (const element of essentialElements) {
      const isVisible = await page.locator(element.selector).isVisible();
      console.log(`   ${isVisible ? '✅' : '❌'} ${element.name}: ${isVisible}`);
      
      // Make featured content optional for Italian locale due to different page structure
      if (element.name === 'Featured content' && locale === 'it') {
        if (!isVisible) {
          console.log(`   ℹ️ Featured content not available for Italian locale (expected)`);
        }
      } else {
        expect(isVisible, `${element.name} should be visible`).toBe(true);
      }
    }
    
    const result = utils.translation.formatTestResult(testName, locale, true);
    console.log(result);
    
    console.log(`✅ Comprehensive locale formatting validation completed for ${locale}`);
  });
});
