import { test, expect } from '../../fixtures/test';
import { localeManager } from '../../config/locales';

test.describe('Locale Configuration Tests', () => {
  test('should load locale-specific configurations correctly', async ({ locale, localeContext }) => {
    console.log(`🧪 Testing locale configuration for: ${locale}`);
    
    // Test basic configuration properties
    expect(locale).toBeTruthy();
    expect(localeContext.baseUrl).toContain(`${locale}.wikipedia.org`);
    
    // Test selector access with new nested structure
    const logoSelector = localeManager.getSelector('common.logo', locale);
    expect(logoSelector).toBe('a.mw-logo');
    
    const searchInputSelector = localeManager.getSelector('common.searchInput', locale);
    expect(searchInputSelector).toBe('#searchInput');
    
    // Test translation access
    const logoTranslation = localeManager.getTranslation('common.logo', locale);
    expect(logoTranslation).toBeTruthy();
    
    // Test test data access
    const authors = localeManager.getTestData('searchTerms.people.authors', locale);
    expect(Array.isArray(authors)).toBe(true);
    expect(authors.length).toBeGreaterThan(0);
    
    // Test assertion access
    const visibilityAssertion = localeManager.getAssertion('visibility.elementVisible', locale);
    expect(visibilityAssertion).toBeTruthy();
    
    console.log(`✅ Locale configuration for ${locale} is valid`);
    console.log(`   Base URL: ${localeContext.baseUrl}`);
    console.log(`   Logo selector: ${logoSelector}`);
    console.log(`   Logo translation: ${logoTranslation}`);
    console.log(`   Sample authors: ${authors.slice(0, 2).join(', ')}`);
  });
  
  test('should handle different featured article selectors per locale', async ({ locale, localeContext }) => {
    const featuredArticleSelector = localeManager.getSelector('homePage.featuredArticle', locale);
    const featuredArticleTranslation = localeManager.getTranslation('homePage.featuredContent.article', locale);
    
    if (locale === 'en') {
      expect(featuredArticleSelector).toBe('#mp-tfa');
      expect(featuredArticleTranslation).toBe("Today's featured article");
    } else if (locale === 'es') {
      expect(featuredArticleSelector).toBe('#mp-destaca');
      expect(featuredArticleTranslation).toBe('Artículo destacado');
    }
    
    console.log(`🎯 Featured article selector for ${locale}: ${featuredArticleSelector}`);
    console.log(`📝 Featured article translation for ${locale}: ${featuredArticleTranslation}`);
  });
});
