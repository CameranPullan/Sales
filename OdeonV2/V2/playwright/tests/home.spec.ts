import { test, expect } from '../fixtures/test';
import { HomePage } from '../pages/HomePage';
import { LocaleUtils } from '../utils/LocaleUtils';

test.describe('Enhanced Wikipedia Tests', () => {
  test('should display the logo with locale-aware assertions', async ({ page, locale, localeContext }) => {
    const homePage = new HomePage(page, locale);
    
    console.log(`🏠 Testing homepage for ${locale} locale`);
    console.log(`📍 Base URL: ${localeContext.baseUrl}`);
    
    await homePage.goto();
    
    // Use the enhanced assertion method
    const isLogoVisible = await homePage.isLogoVisible();
    expect(isLogoVisible, homePage.getAssertionMessage('visibility.elementVisible')).toBe(true);
    
    // Validate we're on the correct locale URL
    expect(await homePage.validateLocaleUrl()).toBe(true);
    
    console.log(`✅ Logo test passed for ${locale} locale`);
  });

  test('should navigate to featured article with enhanced selectors', async ({ page, locale, localeContext }) => {
    const homePage = new HomePage(page, locale);
    
    console.log(`📰 Testing featured article navigation for ${locale} locale`);
    
    // Step 1: Navigate to Wikipedia
    await homePage.goto();
    expect(await homePage.isLogoVisible()).toBe(true);
    
    // Step 2: Check if featured article section exists (different per locale)
    expect(await homePage.isTodaysFeaturedArticleVisible()).toBe(true);
    
    // Step 3: Get the featured article title and click on it
    const articleTitle = await homePage.getTodaysFeaturedArticleTitle();
    expect(articleTitle).toBeTruthy();
    
    console.log(`📖 ${homePage.getTranslationText('homePage.featuredContent.article')}: ${articleTitle}`);
    
    await homePage.clickTodaysFeaturedArticle();
    
    // Verify we navigated to the article page
    const pageTitle = await homePage.getPageTitle();
    expect(pageTitle).toContain(articleTitle);
    
    console.log(`✅ Featured article navigation test passed for ${locale} locale`);
  });

  test('should search for locale-appropriate author and extract birthday', async ({ page, locale, localeContext }) => {
    const homePage = new HomePage(page, locale);
    
    console.log(`🔍 Testing search functionality for ${locale} locale`);
    
    // Step 1: Navigate to Wikipedia
    await homePage.goto();
    expect(await homePage.isLogoVisible()).toBe(true);
    
    // Step 2: Search for a locale-appropriate author
    const searchedAuthor = await homePage.searchForRandomAuthor();
    
    // Verify we're on the author's page
    const pageTitle = await homePage.getPageTitle();
    const isRelevantPage = LocaleUtils.compareLocalizedText(pageTitle, searchedAuthor, locale);
    expect(isRelevantPage, `Page title "${pageTitle}" should be relevant to "${searchedAuthor}"`).toBe(true);
    
    // Step 3: Extract birthday using enhanced methods
    const birthday = await homePage.getBirthday();
    console.log(`🎂 ${searchedAuthor}'s birthday: ${birthday}`);
    
    // Validate the birthday format if found
    if (birthday !== 'Birthday not found' && birthday !== 'Error extracting birthday') {
      expect(birthday).toBeTruthy();
      expect(birthday.length).toBeGreaterThan(0);
    }
    
    // Step 4: Validate the person page content
    const validation = await homePage.validatePersonPage();
    if (validation.errors.length > 0) {
      console.warn(`⚠️ Page validation warnings: ${validation.errors.join(', ')}`);
    }
    
    console.log(`✅ Search and birthday extraction test passed for ${locale} locale`);
  });

  test('should demonstrate cross-locale search capabilities', async ({ page, locale, localeContext }) => {
    const homePage = new HomePage(page, locale);
    
    console.log(`🌍 Testing cross-locale search capabilities for ${locale} locale`);
    
    await homePage.goto();
    
    // Test different categories of search terms
    const categories = [
      { category: 'people', subcategory: 'scientists', description: 'scientist' },
      { category: 'places', subcategory: 'countries', description: 'country' },
      { category: 'concepts', subcategory: 'science', description: 'scientific concept' }
    ];
    
    for (const { category, subcategory, description } of categories) {
      console.log(`🔬 Testing ${description} search...`);
      
      // Get a locale-appropriate search term
      const searchTerm = LocaleUtils.getLocalizedSearchTerm(category, subcategory, locale);
      console.log(`   Search term: ${searchTerm}`);
      
      // Perform search
      await homePage.searchFor(searchTerm);
      
      // Validate we got to a relevant page
      const pageTitle = await homePage.getPageTitle();
      const isRelevant = LocaleUtils.compareLocalizedText(pageTitle, searchTerm, locale);
      
      if (isRelevant) {
        console.log(`   ✅ Successfully found page: ${pageTitle}`);
      } else {
        console.log(`   ⚠️ Page might not be directly relevant: ${pageTitle}`);
      }
      
      // Navigate back to homepage for next search
      await homePage.goto();
    }
    
    console.log(`✅ Cross-locale search capabilities test completed for ${locale} locale`);
  });

  test('should validate locale-specific formatting and content', async ({ page, locale, localeContext }) => {
    const homePage = new HomePage(page, locale);
    
    console.log(`📊 Testing locale-specific formatting for ${locale} locale`);
    
    await homePage.goto();
    
    // Test date formatting
    const testDate = new Date('1892-01-03');
    const formattedDate = LocaleUtils.formatDate(testDate, locale);
    console.log(`📅 Date formatting (${locale}): ${formattedDate}`);
    
    // Test currency formatting
    const amount = 1234.56;
    const formattedCurrency = LocaleUtils.formatCurrency(amount, locale);
    console.log(`💰 Currency formatting (${locale}): ${formattedCurrency}`);
    
    // Test number formatting
    const number = 1234567.89;
    const formattedNumber = LocaleUtils.formatNumber(number, locale);
    console.log(`🔢 Number formatting (${locale}): ${formattedNumber}`);
    
    // Verify formatting follows locale conventions
    if (locale === 'es') {
      expect(formattedDate).toContain('de');
      expect(formattedCurrency).toContain('€');
      expect(formattedNumber).toContain(','); // Spanish decimal separator
    } else {
      expect(formattedCurrency).toContain('$');
      expect(formattedNumber).toContain('.'); // English decimal separator
    }
    
    console.log(`✅ Locale-specific formatting test passed for ${locale} locale`);
  });
});
