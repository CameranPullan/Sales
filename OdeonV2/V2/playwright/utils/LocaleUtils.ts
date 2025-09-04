import { localeManager } from '../config/locales';
import { SupportedLocale } from '../config/locales/types';

export class LocaleUtils {
  /**
   * Format date according to locale conventions
   */
  static formatDate(date: Date, locale: SupportedLocale): string {
    const localeConfig = localeManager.getLocaleConfig(locale);
    const formatter = new Intl.DateTimeFormat(localeConfig.formatting.locale, {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    
    return formatter.format(date);
  }

  /**
   * Format currency according to locale conventions
   */
  static formatCurrency(amount: number, locale: SupportedLocale): string {
    const localeConfig = localeManager.getLocaleConfig(locale);
    const formatter = new Intl.NumberFormat(localeConfig.formatting.locale, {
      style: 'currency',
      currency: locale === 'en' ? 'USD' : 'EUR'
    });
    
    return formatter.format(amount);
  }

  /**
   * Format number according to locale conventions
   */
  static formatNumber(number: number, locale: SupportedLocale): string {
    const localeConfig = localeManager.getLocaleConfig(locale);
    const formatter = new Intl.NumberFormat(localeConfig.formatting.locale);
    
    return formatter.format(number);
  }

  /**
   * Normalize text for comparison (remove accents, normalize case)
   */
  static normalizeText(text: string, locale: SupportedLocale): string {
    // Remove accents and diacritics
    const normalized = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    
    // Convert to lowercase for comparison
    return normalized.toLowerCase().trim();
  }

  /**
   * Compare localized text intelligently
   */
  static compareLocalizedText(actual: string, expected: string, locale: SupportedLocale): boolean {
    const normalizedActual = this.normalizeText(actual, locale);
    const normalizedExpected = this.normalizeText(expected, locale);
    
    return normalizedActual.includes(normalizedExpected) || 
           normalizedExpected.includes(normalizedActual);
  }

  /**
   * Parse date from localized text
   */
  static parseLocalizedDate(dateText: string, locale: SupportedLocale): Date | null {
    try {
      // Common date patterns for different locales
      const patterns = {
        en: [
          /(\d{1,2})\s+(\w+)\s+(\d{4})/,  // "3 January 1892"
          /(\w+)\s+(\d{1,2}),?\s+(\d{4})/, // "January 3, 1892"
        ],
        es: [
          /(\d{1,2})\s+de\s+(\w+)\s+de\s+(\d{4})/, // "3 de enero de 1892"
          /(\d{1,2})\s+(\w+)\s+(\d{4})/,           // "3 enero 1892"
        ]
      };

      const localePatterns = patterns[locale] || patterns.en;
      
      for (const pattern of localePatterns) {
        const match = dateText.match(pattern);
        if (match) {
          // For Spanish dates, we need to handle month names
          if (locale === 'es') {
            const monthMap = {
              'enero': 'January',
              'febrero': 'February', 
              'marzo': 'March',
              'abril': 'April',
              'mayo': 'May',
              'junio': 'June',
              'julio': 'July',
              'agosto': 'August',
              'septiembre': 'September',
              'octubre': 'October',
              'noviembre': 'November',
              'diciembre': 'December'
            };
            
            // Replace Spanish month with English for parsing
            let englishDateText = dateText;
            for (const [spanish, english] of Object.entries(monthMap)) {
              englishDateText = englishDateText.replace(new RegExp(spanish, 'i'), english);
            }
            // Remove "de" words
            englishDateText = englishDateText.replace(/\s+de\s+/g, ' ');
            
            const parsedDate = new Date(englishDateText);
            if (!isNaN(parsedDate.getTime())) {
              return parsedDate;
            }
          } else {
            // Try to parse the matched date directly
            const parsedDate = new Date(dateText);
            if (!isNaN(parsedDate.getTime())) {
              return parsedDate;
            }
          }
        }
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Validate if text matches expected locale format
   */
  static validateLocaleFormat(text: string, type: 'date' | 'currency' | 'number', locale: SupportedLocale): boolean {
    const localeConfig = localeManager.getLocaleConfig(locale);
    
    switch (type) {
      case 'date':
        return this.parseLocalizedDate(text, locale) !== null;
        
      case 'currency':
        const currencySymbol = localeConfig.formatting.currencySymbol;
        return text.includes(currencySymbol);
        
      case 'number':
        const decimalSep = localeConfig.formatting.decimalSeparator;
        const thousandsSep = localeConfig.formatting.thousandsSeparator;
        const numberPattern = new RegExp(`\\d+(\\${thousandsSep}\\d{3})*(\\${decimalSep}\\d+)?`);
        return numberPattern.test(text);
        
      default:
        return false;
    }
  }

  /**
   * Get locale-appropriate search term
   */
  static getLocalizedSearchTerm(category: string, subcategory: string, locale: SupportedLocale): string {
    const searchTerms = localeManager.getTestData(`searchTerms.${category}.${subcategory}`, locale);
    
    if (Array.isArray(searchTerms) && searchTerms.length > 0) {
      // Return first item or random item
      return searchTerms[0];
    }
    
    throw new Error(`No search terms found for ${category}.${subcategory} in locale ${locale}`);
  }

  /**
   * Get random item from locale-specific array
   */
  static getRandomLocalizedItem(dataPath: string, locale: SupportedLocale): string {
    const items = localeManager.getTestData(dataPath, locale);
    
    if (Array.isArray(items) && items.length > 0) {
      const randomIndex = Math.floor(Math.random() * items.length);
      return items[randomIndex];
    }
    
    throw new Error(`No items found for ${dataPath} in locale ${locale}`);
  }
}
