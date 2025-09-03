import { SupportedLocale } from '../config/locales/types';

export class DateTimeUtils {
  private static readonly LOCALE_DATE_FORMATS: Record<SupportedLocale, Intl.DateTimeFormatOptions> = {
    en: {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    },
    es: {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    },
    it: {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    }
  };

  private static readonly MONTH_NAMES: Record<SupportedLocale, string[]> = {
    en: [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ],
    es: [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ],
    it: [
      'gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno',
      'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'
    ]
  };

  /**
   * Format date according to locale
   */
  static formatDate(date: Date, locale: SupportedLocale): string {
    const options = this.LOCALE_DATE_FORMATS[locale];
    const localeString = locale === 'es' ? 'es-ES' : locale === 'it' ? 'it-IT' : 'en-US';
    return date.toLocaleDateString(localeString, options);
  }

  /**
   * Parse date string with locale-specific patterns
   */
  static parseDate(dateString: string, locale: SupportedLocale): Date | null {
    try {
      // Remove common prefixes and suffixes
      let cleanedDate = dateString.trim();
      
      // Handle parenthetical dates like "(1775-12-16)"
      const parenthesesMatch = cleanedDate.match(/\((\d{4}-\d{2}-\d{2})\)/);
      if (parenthesesMatch) {
        return new Date(parenthesesMatch[1]);
      }

      // Handle ISO date format
      const isoMatch = cleanedDate.match(/(\d{4}-\d{2}-\d{2})/);
      if (isoMatch) {
        return new Date(isoMatch[1]);
      }

      // Handle locale-specific formats
      if (locale === 'es') {
        return this.parseSpanishDate(cleanedDate);
      } else if (locale === 'it') {
        return this.parseItalianDate(cleanedDate);
      } else {
        return this.parseEnglishDate(cleanedDate);
      }
    } catch (error) {
      console.warn(`Failed to parse date: ${dateString}`, error);
      return null;
    }
  }

  /**
   * Parse Spanish date formats
   */
  private static parseSpanishDate(dateString: string): Date | null {
    const monthNames = this.MONTH_NAMES.es;
    
    // Pattern: "3 de enero de 1892" or "3 enero 1892"
    const patterns = [
      /(\d{1,2})\s+de\s+(\w+)\s+de\s+(\d{4})/i,  // 3 de enero de 1892
      /(\d{1,2})\s+(\w+)\s+(\d{4})/i             // 3 enero 1892
    ];
    
    for (const pattern of patterns) {
      const match = dateString.match(pattern);
      if (match) {
        const day = parseInt(match[1]);
        const monthName = match[2].toLowerCase();
        const year = parseInt(match[3]);
        
        const monthIndex = monthNames.findIndex(m => m.toLowerCase() === monthName);
        if (monthIndex !== -1) {
          return new Date(year, monthIndex, day);
        }
      }
    }
    
    return null;
  }

  /**
   * Parse Italian date formats
   */
  private static parseItalianDate(dateString: string): Date | null {
    const monthNames = this.MONTH_NAMES.it;
    
    // Pattern: "3 gennaio 1892" or similar
    const patterns = [
      /(\d{1,2})\s+(\w+)\s+(\d{4})/i,           // 3 gennaio 1892
      /(\d{1,2})\s+di\s+(\w+)\s+(\d{4})/i      // 3 di gennaio 1892
    ];
    
    for (const pattern of patterns) {
      const match = dateString.match(pattern);
      if (match) {
        const day = parseInt(match[1]);
        const monthName = match[2].toLowerCase();
        const year = parseInt(match[3]);
        
        const monthIndex = monthNames.findIndex(m => m.toLowerCase() === monthName);
        if (monthIndex !== -1) {
          return new Date(year, monthIndex, day);
        }
      }
    }
    
    return null;
  }

  /**
   * Parse English date formats
   */
  private static parseEnglishDate(dateString: string): Date | null {
    const monthNames = this.MONTH_NAMES.en;
    
    // Pattern: "January 3, 1892" or "3 January 1892"
    const patterns = [
      /(\w+)\s+(\d{1,2}),?\s+(\d{4})/i,  // January 3, 1892
      /(\d{1,2})\s+(\w+)\s+(\d{4})/i     // 3 January 1892
    ];
    
    for (const pattern of patterns) {
      const match = dateString.match(pattern);
      if (match) {
        let day: number, monthName: string, year: number;
        
        if (pattern.source.startsWith('(\\w+)')) {
          // Month first format
          monthName = match[1];
          day = parseInt(match[2]);
          year = parseInt(match[3]);
        } else {
          // Day first format
          day = parseInt(match[1]);
          monthName = match[2];
          year = parseInt(match[3]);
        }
        
        const monthIndex = monthNames.findIndex(m => 
          m.toLowerCase() === monthName.toLowerCase()
        );
        
        if (monthIndex !== -1) {
          return new Date(year, monthIndex, day);
        }
      }
    }
    
    return null;
  }

  /**
   * Get relative time string (e.g., "2 days ago")
   */
  static getRelativeTime(date: Date, locale: SupportedLocale): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (locale === 'es') {
      if (diffDays === 0) return 'hoy';
      if (diffDays === 1) return 'ayer';
      if (diffDays < 7) return `hace ${diffDays} días`;
      if (diffDays < 30) return `hace ${Math.floor(diffDays / 7)} semanas`;
      return `hace ${Math.floor(diffDays / 30)} meses`;
    } else {
      if (diffDays === 0) return 'today';
      if (diffDays === 1) return 'yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
      return `${Math.floor(diffDays / 30)} months ago`;
    }
  }

  /**
   * Validate date range for locale
   */
  static isValidDateRange(startDate: Date, endDate: Date): boolean {
    return startDate <= endDate;
  }

  /**
   * Get timezone for locale
   */
  static getTimezone(locale: SupportedLocale): string {
    const timezones: Record<SupportedLocale, string> = {
      en: 'America/New_York',
      es: 'Europe/Madrid',
      it: 'Europe/Rome'
    };
    
    return timezones[locale];
  }

  /**
   * Format time with locale-specific patterns
   */
  static formatTime(date: Date, locale: SupportedLocale): string {
    const timeFormat: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      hour12: locale === 'en'
    };
    
    return date.toLocaleTimeString(locale === 'es' ? 'es-ES' : 'en-US', timeFormat);
  }
}
