import { localeManager } from '../config/locales';
import { SupportedLocale } from '../config/locales/types';
import { LocaleUtils } from './LocaleUtils';

export class ContentValidator {
  private locale: SupportedLocale;

  constructor(locale?: SupportedLocale) {
    this.locale = locale || localeManager.getCurrentLocale();
  }

  /**
   * Validate that text matches expected locale-specific pattern
   */
  validateTextPattern(text: string, patternKey: string): boolean {
    try {
      const pattern = localeManager.getTestData(`expectedContent.${patternKey}`, this.locale);
      
      if (typeof pattern === 'string') {
        const regex = new RegExp(pattern, 'i');
        return regex.test(text);
      }
      
      return false;
    } catch (error) {
      console.warn(`Pattern ${patternKey} not found for locale ${this.locale}`);
      return false;
    }
  }

  /**
   * Validate person page content
   */
  validatePersonPage(pageContent: {
    title?: string;
    birthDate?: string;
    nationality?: string;
    occupation?: string;
  }): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Validate birth date format
    if (pageContent.birthDate) {
      if (!this.validateTextPattern(pageContent.birthDate, 'personPage.birthDatePattern')) {
        errors.push(`Birth date format invalid: ${pageContent.birthDate}`);
      }
    }
    
    // Validate nationality format
    if (pageContent.nationality) {
      if (!this.validateTextPattern(pageContent.nationality, 'personPage.nationalityPattern')) {
        errors.push(`Nationality format invalid: ${pageContent.nationality}`);
      }
    }
    
    // Check for required fields
    const requiredFields = ['title'];
    for (const field of requiredFields) {
      if (!pageContent[field as keyof typeof pageContent]) {
        errors.push(`Required field missing: ${field}`);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate location page content
   */
  validateLocationPage(pageContent: {
    title?: string;
    coordinates?: string;
    population?: string;
    area?: string;
    country?: string;
  }): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Validate population format
    if (pageContent.population) {
      if (!this.validateTextPattern(pageContent.population, 'locationPage.populationPattern')) {
        errors.push(`Population format invalid: ${pageContent.population}`);
      }
    }
    
    // Validate area format
    if (pageContent.area) {
      if (!this.validateTextPattern(pageContent.area, 'locationPage.areaPattern')) {
        errors.push(`Area format invalid: ${pageContent.area}`);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Compare two texts with locale-aware normalization
   */
  compareTexts(actual: string, expected: string, options: {
    exactMatch?: boolean;
    ignoreCase?: boolean;
    ignoreAccents?: boolean;
  } = {}): boolean {
    const {
      exactMatch = false,
      ignoreCase = true,
      ignoreAccents = true
    } = options;

    let processedActual = actual;
    let processedExpected = expected;

    if (ignoreAccents) {
      processedActual = LocaleUtils.normalizeText(processedActual, this.locale);
      processedExpected = LocaleUtils.normalizeText(processedExpected, this.locale);
    } else if (ignoreCase) {
      processedActual = processedActual.toLowerCase();
      processedExpected = processedExpected.toLowerCase();
    }

    if (exactMatch) {
      return processedActual === processedExpected;
    } else {
      return processedActual.includes(processedExpected) || 
             processedExpected.includes(processedActual);
    }
  }

  /**
   * Extract and validate dates from text
   */
  extractAndValidateDate(text: string): { date: Date | null; isValid: boolean; originalText: string } {
    const date = LocaleUtils.parseLocalizedDate(text, this.locale);
    
    return {
      date,
      isValid: date !== null,
      originalText: text
    };
  }

  /**
   * Validate that content exists and is not empty
   */
  validateContentPresence(content: string | null | undefined, fieldName: string): boolean {
    if (!content || content.trim().length === 0) {
      console.warn(`${fieldName} is empty or missing`);
      return false;
    }
    
    // Check for common "not found" indicators
    const notFoundIndicators = {
      en: ['not found', 'no information', 'unknown', 'n/a', 'not available'],
      es: ['no encontrado', 'sin información', 'desconocido', 'n/d', 'no disponible']
    };
    
    const indicators = notFoundIndicators[this.locale] || notFoundIndicators.en;
    const normalizedContent = content.toLowerCase();
    
    for (const indicator of indicators) {
      if (normalizedContent.includes(indicator)) {
        console.warn(`${fieldName} contains "not found" indicator: ${indicator}`);
        return false;
      }
    }
    
    return true;
  }

  /**
   * Validate search results
   */
  validateSearchResults(results: {
    query: string;
    resultCount: number;
    firstResultTitle?: string;
    hasResults: boolean;
  }): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Basic validation
    if (!results.hasResults && results.resultCount > 0) {
      errors.push('Inconsistent result state: hasResults is false but resultCount > 0');
    }
    
    if (results.hasResults && results.resultCount === 0) {
      errors.push('Inconsistent result state: hasResults is true but resultCount is 0');
    }
    
    // Check if first result is relevant to query
    if (results.firstResultTitle && results.query) {
      const isRelevant = this.compareTexts(
        results.firstResultTitle, 
        results.query, 
        { exactMatch: false, ignoreCase: true, ignoreAccents: true }
      );
      
      if (!isRelevant) {
        console.warn(`First result "${results.firstResultTitle}" may not be relevant to query "${results.query}"`);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get expected sample data for testing
   */
  getExpectedSampleData(sampleKey: string): any {
    try {
      return localeManager.getTestData(`sampleResults.${sampleKey}`, this.locale);
    } catch (error) {
      console.warn(`Sample data ${sampleKey} not found for locale ${this.locale}`);
      return null;
    }
  }
}
