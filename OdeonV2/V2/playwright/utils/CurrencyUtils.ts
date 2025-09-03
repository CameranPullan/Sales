import { SupportedLocale } from '../config/locales/types';

export class CurrencyUtils {
  private static readonly CURRENCY_CONFIGS: Record<SupportedLocale, {
    currency: string;
    symbol: string;
    position: 'before' | 'after';
    decimalSeparator: string;
    thousandsSeparator: string;
  }> = {
    en: {
      currency: 'USD',
      symbol: '$',
      position: 'before',
      decimalSeparator: '.',
      thousandsSeparator: ','
    },
    es: {
      currency: 'EUR',
      symbol: '€',
      position: 'after',
      decimalSeparator: ',',
      thousandsSeparator: '.'
    },
    it: {
      currency: 'EUR',
      symbol: '€',
      position: 'before',
      decimalSeparator: ',',
      thousandsSeparator: '.'
    }
  };

  /**
   * Format currency according to locale
   */
  static formatCurrency(amount: number, locale: SupportedLocale): string {
    const config = this.CURRENCY_CONFIGS[locale];
    
    const localeMapping = {
      'en': 'en-US',
      'es': 'es-ES',
      'it': 'it-IT'
    };
    
    const formatter = new Intl.NumberFormat(
      localeMapping[locale],
      {
        style: 'currency',
        currency: config.currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }
    );
    
    return formatter.format(amount);
  }

  /**
   * Format number with locale-specific separators
   */
  static formatNumber(number: number, locale: SupportedLocale): string {
    const localeMapping = {
      'en': 'en-US',
      'es': 'es-ES',
      'it': 'it-IT'
    };
    
    const formatter = new Intl.NumberFormat(
      localeMapping[locale]
    );
    
    return formatter.format(number);
  }

  /**
   * Parse currency string to number
   */
  static parseCurrency(currencyString: string, locale: SupportedLocale): number | null {
    try {
      const config = this.CURRENCY_CONFIGS[locale];
      
      // Remove currency symbol and whitespace
      let cleanString = currencyString
        .replace(config.symbol, '')
        .trim();
      
      // Handle different decimal and thousands separators
      if (locale === 'es' || locale === 'it') {
        // Spanish and Italian: 1.234,56 → 1234.56
        cleanString = cleanString
          .replace(/\./g, '') // Remove thousands separator
          .replace(/,/g, '.'); // Convert decimal separator
      } else {
        // English: 1,234.56 → 1234.56
        cleanString = cleanString
          .replace(/,/g, ''); // Remove thousands separator
      }
      
      return parseFloat(cleanString);
    } catch (error) {
      console.warn(`Failed to parse currency: ${currencyString}`, error);
      return null;
    }
  }

  /**
   * Validate currency format
   */
  static isValidCurrency(currencyString: string, locale: SupportedLocale): boolean {
    const config = this.CURRENCY_CONFIGS[locale];
    
    if (locale === 'es') {
      // Spanish format: 1.234,56 € or 1234,56 €
      const pattern = /^\d{1,3}(?:\.\d{3})*(?:,\d{2})?\s*€$/;
      return pattern.test(currencyString.trim());
    } else {
      // English format: $1,234.56 or $1234.56
      const pattern = /^\$\d{1,3}(?:,\d{3})*(?:\.\d{2})?$/;
      return pattern.test(currencyString.trim());
    }
  }

  /**
   * Convert between currencies (mock implementation)
   */
  static convertCurrency(
    amount: number,
    fromLocale: SupportedLocale,
    toLocale: SupportedLocale,
    exchangeRate?: number
  ): number {
    if (fromLocale === toLocale) {
      return amount;
    }
    
    // Mock exchange rate USD to EUR
    const defaultRate = fromLocale === 'en' ? 0.85 : 1.18;
    const rate = exchangeRate || defaultRate;
    
    return amount * rate;
  }

  /**
   * Get currency symbol for locale
   */
  static getCurrencySymbol(locale: SupportedLocale): string {
    return this.CURRENCY_CONFIGS[locale].symbol;
  }

  /**
   * Get currency code for locale
   */
  static getCurrencyCode(locale: SupportedLocale): string {
    return this.CURRENCY_CONFIGS[locale].currency;
  }

  /**
   * Format percentage with locale-specific formatting
   */
  static formatPercentage(value: number, locale: SupportedLocale): string {
    const localeMapping = {
      'en': 'en-US',
      'es': 'es-ES',
      'it': 'it-IT'
    };
    
    const formatter = new Intl.NumberFormat(
      localeMapping[locale],
      {
        style: 'percent',
        minimumFractionDigits: 1,
        maximumFractionDigits: 2
      }
    );
    
    return formatter.format(value / 100);
  }

  /**
   * Validate number format for locale
   */
  static isValidNumber(numberString: string, locale: SupportedLocale): boolean {
    try {
      const config = this.CURRENCY_CONFIGS[locale];
      
      if (locale === 'es') {
        // Spanish: 1.234.567,89
        const pattern = /^\d{1,3}(?:\.\d{3})*(?:,\d+)?$/;
        return pattern.test(numberString.trim());
      } else {
        // English: 1,234,567.89
        const pattern = /^\d{1,3}(?:,\d{3})*(?:\.\d+)?$/;
        return pattern.test(numberString.trim());
      }
    } catch (error) {
      return false;
    }
  }

  /**
   * Parse locale-specific number string
   */
  static parseNumber(numberString: string, locale: SupportedLocale): number | null {
    try {
      let cleanString = numberString.trim();
      
      if (locale === 'es') {
        // Spanish: 1.234.567,89 → 1234567.89
        cleanString = cleanString
          .replace(/\./g, '') // Remove thousands separator
          .replace(/,/g, '.'); // Convert decimal separator
      } else {
        // English: 1,234,567.89 → 1234567.89
        cleanString = cleanString
          .replace(/,/g, ''); // Remove thousands separator
      }
      
      return parseFloat(cleanString);
    } catch (error) {
      console.warn(`Failed to parse number: ${numberString}`, error);
      return null;
    }
  }
}
