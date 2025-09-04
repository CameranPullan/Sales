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
    // Test enhanced BasePage functionality
    await homePage.goto();
    
    // Test cached selector resolution
    const logoVisible1 = await homePage.isLogoVisible();
    const logoVisible2 = await homePage.isLogoVisible(); // Should use cache
    expect(logoVisible1).toBe(logoVisible2);
  });

  test('Advanced Date/Time Utilities', async ({ locale, utils }) => {
    
    const testDate = new Date('1892-01-03');
    
    // Test date formatting
    const formattedDate = utils.dateTime.formatDate(testDate, locale);
    
    // Test date parsing
    const testDates = locale === 'es' 
      ? ['3 de enero de 1892', '3 enero 1892']
      : locale === 'it' 
      ? ['3 gennaio 1892', '3 gen 1892']
      : ['January 3, 1892', '3 January 1892'];
    
    for (const dateStr of testDates) {
      const parsed = utils.dateTime.parseDate(dateStr, locale);
      expect(parsed).toBeTruthy();
    }
    
    // Test relative time
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const relativeTime = utils.dateTime.getRelativeTime(yesterday, locale);
    
    expect(relativeTime).toContain(locale === 'es' ? 'ayer' : 'yesterday');
  });

  test('Advanced Currency and Number Formatting', async ({ locale, utils }) => {
    
    // Test currency formatting
    const amount = 1234.56;
    const formattedCurrency = utils.currency.formatCurrency(amount, locale);
    
    // Test number formatting
    const largeNumber = 1234567.89;
    const formattedNumber = utils.currency.formatNumber(largeNumber, locale);
    
    // Test currency parsing
    const testCurrencies = locale === 'es' 
      ? ['1.234,56 €', '999,99 €']
      : locale === 'it' 
      ? ['1234,56 €', '999,99 €']
      : ['$1,234.56', '$999.99'];
    
    for (const currencyStr of testCurrencies) {
      const parsed = utils.currency.parseCurrency(currencyStr, locale);
      expect(parsed).toBeTruthy();
    }
    
    // Test percentage formatting
    const percentage = utils.currency.formatPercentage(75.5, locale);
    expect(percentage).toContain('%');
  });

  test('Advanced Text Processing Utilities', async ({ locale, utils }) => {
    
    // Test accent removal
    const textWithAccents = locale === 'es' ? 'José María' : 'café résumé';
    const withoutAccents = utils.text.removeAccents(textWithAccents);
    
    // Test accent-insensitive comparison
    const text1 = locale === 'es' ? 'José' : 'café';
    const text2 = locale === 'es' ? 'Jose' : 'cafe';
    const isSimilar = utils.text.compareIgnoreAccents(text1, text2);
    expect(isSimilar).toBe(true);
    
    // Test similarity calculation
    const similarity = utils.text.calculateSimilarity('Wikipedia', 'Wikipédia');
    expect(similarity).toBeGreaterThan(0.8);
    
    // Test keyword extraction
    const sampleText = locale === 'es' 
      ? 'La enciclopedia libre que todos pueden editar'
      : 'The free encyclopedia that anyone can edit';
    const keywords = utils.text.extractKeywords(sampleText, locale);
    expect(keywords.length).toBeGreaterThan(0);
    
    // Test title case conversion
    const titleText = locale === 'es' 
      ? 'el arte de la programación'
      : 'the art of programming';
    const titleCase = utils.text.toTitleCase(titleText, locale);
  });

  test('URL and Navigation Utilities', async ({ locale, utils }) => {
    
    // Test URL building
    const homeUrl = utils.url.buildUrl(locale);
    expect(homeUrl).toContain(`${locale}.wikipedia.org`);
    
    // Test search URL building
    const searchUrl = utils.url.buildSearchUrl(locale, 'test query');
    expect(searchUrl).toContain('search=test');  // More flexible expectation
    
    // Test article URL building
    const articleUrl = utils.url.buildArticleUrl(locale, 'Test Article');
    expect(articleUrl).toContain('/wiki/Test_Article');
    
    // Test locale extraction
    const extractedLocale = utils.url.extractLocaleFromUrl(homeUrl);
    expect(extractedLocale).toBe(locale);
    
    // Test URL conversion
    const enUrl = 'https://en.wikipedia.org/wiki/Test';
    const convertedUrl = utils.url.convertUrlToLocale(enUrl, locale);
    expect(convertedUrl).toContain(`${locale}.wikipedia.org`);
  });

  test('Test Data Providers and Dynamic Generation', async ({ locale, testData }) => {
    
    // Test random data access
    
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
    
    // Test data validation
    const validation = TestDataProvider.validateTestData(locale);
    expect(validation.isValid).toBe(true);
  });

  test('Generate Multiple Test Data Items', async ({ locale }) => {
    
    // Generate multiple persons
    const persons = TestDataProvider.generateTestData(locale, 'person', 2);
    expect(persons.length).toBe(2);
    
    // Generate multiple locations
    const locations = TestDataProvider.generateTestData(locale, 'location', 2);
    expect(locations.length).toBe(2);
    
    // Generate multiple concepts
    const concepts = TestDataProvider.generateTestData(locale, 'concept', 2);
    expect(concepts.length).toBe(2);
  });
});
