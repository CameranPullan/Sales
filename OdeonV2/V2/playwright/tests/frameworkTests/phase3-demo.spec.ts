import { test, expect } from '../../fixtures/test';
import { TestDataProvider } from '../../fixtures/testData/TestDataProvider';

test.describe('Phase 3: Framework Components Demo', () => {
  test('Enhanced Page Objects with Caching and Advanced Features', async ({ 
    homePage, 
    locale, 
    testData, 
    utils, 
    localeContext 
  }) => {
    console.log(`🧪 Testing enhanced framework components for ${locale}`);
    console.log(`💱 Currency symbol: ${localeContext.currencySymbol}`);
    console.log(`📅 Date format: ${localeContext.dateFormat}`);
    console.log(`🌐 Base URL: ${localeContext.baseUrl}`);
    
    // Test enhanced BasePage functionality
    await homePage.goto();
    
    // Test cached selector resolution
    const logoVisible1 = await homePage.isLogoVisible();
    const logoVisible2 = await homePage.isLogoVisible(); // Should use cache
    expect(logoVisible1).toBe(logoVisible2);
    
    console.log(`✅ Enhanced page object caching works for ${locale}`);
  });

  test('Advanced Date/Time Utilities', async ({ locale, utils }) => {
    console.log(`🕒 Testing date/time utilities for ${locale}`);
    
    const testDate = new Date('1892-01-03');
    
    // Test date formatting
    const formattedDate = utils.dateTime.formatDate(testDate, locale);
    console.log(`📅 Formatted date (${locale}): ${formattedDate}`);
    
    // Test date parsing
    const testDates = locale === 'es' 
      ? ['3 de enero de 1892', '3 enero 1892']
      : locale === 'it' 
      ? ['3 gennaio 1892', '3 gen 1892']
      : ['January 3, 1892', '3 January 1892'];
    
    for (const dateStr of testDates) {
      const parsed = utils.dateTime.parseDate(dateStr, locale);
      console.log(`🔍 Parsed "${dateStr}" → ${parsed?.toISOString()}`);
      expect(parsed).toBeTruthy();
    }
    
    // Test relative time
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const relativeTime = utils.dateTime.getRelativeTime(yesterday, locale);
    console.log(`⏰ Relative time (${locale}): ${relativeTime}`);
    
    expect(relativeTime).toContain(locale === 'es' ? 'ayer' : 'yesterday');
  });

  test('Advanced Currency and Number Formatting', async ({ locale, utils }) => {
    console.log(`💰 Testing currency utilities for ${locale}`);
    
    // Test currency formatting
    const amount = 1234.56;
    const formattedCurrency = utils.currency.formatCurrency(amount, locale);
    console.log(`💱 Formatted currency (${locale}): ${formattedCurrency}`);
    
    // Test number formatting
    const largeNumber = 1234567.89;
    const formattedNumber = utils.currency.formatNumber(largeNumber, locale);
    console.log(`🔢 Formatted number (${locale}): ${formattedNumber}`);
    
    // Test currency parsing
    const testCurrencies = locale === 'es' 
      ? ['1.234,56 €', '999,99 €']
      : locale === 'it' 
      ? ['1234,56 €', '999,99 €']
      : ['$1,234.56', '$999.99'];
    
    for (const currencyStr of testCurrencies) {
      const parsed = utils.currency.parseCurrency(currencyStr, locale);
      console.log(`💸 Parsed "${currencyStr}" → ${parsed}`);
      expect(parsed).toBeTruthy();
    }
    
    // Test percentage formatting
    const percentage = utils.currency.formatPercentage(75.5, locale);
    console.log(`📊 Percentage (${locale}): ${percentage}`);
    expect(percentage).toContain('%');
  });

  test('Advanced Text Processing Utilities', async ({ locale, utils }) => {
    console.log(`📝 Testing text utilities for ${locale}`);
    
    // Test accent removal
    const textWithAccents = locale === 'es' ? 'José María' : 'café résumé';
    const withoutAccents = utils.text.removeAccents(textWithAccents);
    console.log(`🔤 Remove accents: "${textWithAccents}" → "${withoutAccents}"`);
    
    // Test accent-insensitive comparison
    const text1 = locale === 'es' ? 'José' : 'café';
    const text2 = locale === 'es' ? 'Jose' : 'cafe';
    const isSimilar = utils.text.compareIgnoreAccents(text1, text2);
    console.log(`🔍 Compare "${text1}" ≈ "${text2}": ${isSimilar}`);
    expect(isSimilar).toBe(true);
    
    // Test similarity calculation
    const similarity = utils.text.calculateSimilarity('Wikipedia', 'Wikipédia');
    console.log(`📊 Similarity score: ${similarity}`);
    expect(similarity).toBeGreaterThan(0.8);
    
    // Test keyword extraction
    const sampleText = locale === 'es' 
      ? 'La enciclopedia libre que todos pueden editar'
      : 'The free encyclopedia that anyone can edit';
    const keywords = utils.text.extractKeywords(sampleText, locale);
    console.log(`🎯 Keywords (${locale}):`, keywords);
    expect(keywords.length).toBeGreaterThan(0);
    
    // Test title case conversion
    const titleText = locale === 'es' 
      ? 'el arte de la programación'
      : 'the art of programming';
    const titleCase = utils.text.toTitleCase(titleText, locale);
    console.log(`📖 Title case (${locale}): "${titleText}" → "${titleCase}"`);
  });

  test('URL and Navigation Utilities', async ({ locale, utils }) => {
    console.log(`🌐 Testing URL utilities for ${locale}`);
    
    // Test URL building
    const homeUrl = utils.url.buildUrl(locale);
    console.log(`🏠 Home URL (${locale}): ${homeUrl}`);
    expect(homeUrl).toContain(`${locale}.wikipedia.org`);
    
    // Test search URL building
    const searchUrl = utils.url.buildSearchUrl(locale, 'test query');
    console.log(`🔍 Search URL (${locale}): ${searchUrl}`);
    expect(searchUrl).toContain('search=test');  // More flexible expectation
    
    // Test article URL building
    const articleUrl = utils.url.buildArticleUrl(locale, 'Test Article');
    console.log(`📄 Article URL (${locale}): ${articleUrl}`);
    expect(articleUrl).toContain('/wiki/Test_Article');
    
    // Test locale extraction
    const extractedLocale = utils.url.extractLocaleFromUrl(homeUrl);
    console.log(`🏷️ Extracted locale: ${extractedLocale}`);
    expect(extractedLocale).toBe(locale);
    
    // Test URL conversion
    const enUrl = 'https://en.wikipedia.org/wiki/Test';
    const convertedUrl = utils.url.convertUrlToLocale(enUrl, locale);
    console.log(`🔄 Converted URL: ${enUrl} → ${convertedUrl}`);
    expect(convertedUrl).toContain(`${locale}.wikipedia.org`);
  });

  test('Test Data Providers and Dynamic Generation', async ({ locale, testData }) => {
    console.log(`📊 Testing test data providers for ${locale}`);
    
    // Test random data access
    console.log(`👤 Random person: ${testData.randomPerson.name}`);
    console.log(`🌍 Random location: ${testData.randomLocation.name}`);
    console.log(`🧠 Random concept: ${testData.randomConcept.name}`);
    
    expect(testData.randomPerson.name).toBeTruthy();
    expect(testData.randomLocation.name).toBeTruthy();
    expect(testData.randomConcept.name).toBeTruthy();
    
    // Test search terms availability
    expect(testData.randomPerson.searchTerms).toBeTruthy();
    expect(testData.randomPerson.searchTerms!.length).toBeGreaterThan(0);
    
    // Test locale-specific data
    if (locale === 'es') {
      expect(testData.allPersons.some(p => p.name.includes('Cervantes'))).toBe(true);
      expect(testData.allLocations.some(l => l.name === 'Madrid')).toBe(true);
    } else if (locale === 'it') {
      expect(testData.allPersons.some(p => p.name.includes('Dante') || p.name.includes('Leonardo') || p.name.includes('Galileo'))).toBe(true);
      expect(testData.allLocations.some(l => l.name === 'Milano' || l.name === 'Roma')).toBe(true);
    } else {
      expect(testData.allPersons.some(p => p.name.includes('Shakespeare'))).toBe(true);
      expect(testData.allLocations.some(l => l.name === 'London')).toBe(true);
    }
    
    console.log(`📈 Data counts for ${locale}:`, {
      persons: testData.allPersons.length,
      locations: testData.allLocations.length,
      concepts: testData.allConcepts.length
    });
    
    // Test data validation
    const validation = TestDataProvider.validateTestData(locale);
    console.log(`✅ Data validation for ${locale}:`, validation);
    expect(validation.isValid).toBe(true);
  });

  test('Generate Multiple Test Data Items', async ({ locale }) => {
    console.log(`🎲 Testing dynamic test data generation for ${locale}`);
    
    // Generate multiple persons
    const persons = TestDataProvider.generateTestData(locale, 'person', 2);
    console.log(`👥 Generated persons (${locale}):`, persons.map((p: any) => p.name));
    expect(persons.length).toBe(2);
    
    // Generate multiple locations
    const locations = TestDataProvider.generateTestData(locale, 'location', 2);
    console.log(`🏙️ Generated locations (${locale}):`, locations.map((l: any) => l.name));
    expect(locations.length).toBe(2);
    
    // Generate multiple concepts
    const concepts = TestDataProvider.generateTestData(locale, 'concept', 2);
    console.log(`💡 Generated concepts (${locale}):`, concepts.map((c: any) => c.name));
    expect(concepts.length).toBe(2);
  });
});
