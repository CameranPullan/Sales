import { SupportedLocale } from '../config/locales/types';

export class TextUtils {
  private static readonly ACCENT_MAP: Record<string, string> = {
    'á': 'a', 'à': 'a', 'ä': 'a', 'â': 'a', 'ā': 'a', 'ã': 'a', 'å': 'a',
    'é': 'e', 'è': 'e', 'ë': 'e', 'ê': 'e', 'ē': 'e',
    'í': 'i', 'ì': 'i', 'ï': 'i', 'î': 'i', 'ī': 'i',
    'ó': 'o', 'ò': 'o', 'ö': 'o', 'ô': 'o', 'ō': 'o', 'õ': 'o',
    'ú': 'u', 'ù': 'u', 'ü': 'u', 'û': 'u', 'ū': 'u',
    'ñ': 'n', 'ç': 'c', 'ß': 'ss'
  };

  /**
   * Remove accents from text for comparison
   */
  static removeAccents(text: string): string {
    return text
      .toLowerCase()
      .split('')
      .map(char => this.ACCENT_MAP[char] || char)
      .join('');
  }

  /**
   * Compare text ignoring case and accents
   */
  static compareIgnoreAccents(text1: string, text2: string): boolean {
    const normalized1 = this.removeAccents(text1.trim());
    const normalized2 = this.removeAccents(text2.trim());
    return normalized1 === normalized2;
  }

  /**
   * Fuzzy text comparison with similarity score
   */
  static calculateSimilarity(text1: string, text2: string): number {
    const normalized1 = this.removeAccents(text1);
    const normalized2 = this.removeAccents(text2);
    
    const longer = normalized1.length > normalized2.length ? normalized1 : normalized2;
    const shorter = normalized1.length > normalized2.length ? normalized2 : normalized1;
    
    if (longer.length === 0) {
      return 1.0;
    }
    
    const editDistance = this.calculateLevenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  /**
   * Calculate Levenshtein distance between two strings
   */
  private static calculateLevenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1,     // insertion
            matrix[i - 1][j] + 1      // deletion
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  /**
   * Normalize whitespace and trim
   */
  static normalizeWhitespace(text: string): string {
    return text.replace(/\s+/g, ' ').trim();
  }

  /**
   * Extract meaningful words (remove common stop words)
   */
  static extractKeywords(text: string, locale: SupportedLocale): string[] {
    const stopWords: Record<SupportedLocale, Set<string>> = {
      en: new Set([
        'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
        'of', 'with', 'by', 'is', 'was', 'are', 'were', 'be', 'been', 'being',
        'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
        'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those'
      ]),
      es: new Set([
        'el', 'la', 'los', 'las', 'un', 'una', 'y', 'o', 'pero', 'en', 'por',
        'para', 'de', 'del', 'con', 'es', 'era', 'son', 'fueron', 'ser', 'sido',
        'siendo', 'tener', 'tiene', 'tuvo', 'hacer', 'hace', 'hizo', 'este',
        'esta', 'estos', 'estas', 'que', 'cual', 'donde', 'cuando', 'como'
      ]),
      it: new Set([
        'il', 'la', 'lo', 'gli', 'le', 'un', 'una', 'e', 'o', 'ma', 'in', 'su',
        'per', 'di', 'del', 'con', 'è', 'era', 'sono', 'erano', 'essere', 'stato',
        'stata', 'avere', 'ha', 'aveva', 'fare', 'fa', 'fece', 'questo', 'questa',
        'questi', 'queste', 'che', 'quale', 'dove', 'quando', 'come', 'molto',
        'più', 'anche', 'ancora', 'solo', 'già', 'sempre', 'ogni', 'tutto'
      ])
    };

    const words = this.normalizeWhitespace(text)
      .toLowerCase()
      .split(/\W+/)
      .filter(word => word.length > 2)
      .filter(word => !stopWords[locale].has(word));
    
    return [...new Set(words)]; // Remove duplicates
  }

  /**
   * Truncate text with ellipsis
   */
  static truncate(text: string, maxLength: number, suffix: string = '...'): string {
    if (text.length <= maxLength) {
      return text;
    }
    
    return text.substring(0, maxLength - suffix.length) + suffix;
  }

  /**
   * Title case conversion with locale awareness
   */
  static toTitleCase(text: string, locale: SupportedLocale): string {
    const lowerCaseWords: Record<SupportedLocale, Set<string>> = {
      en: new Set(['a', 'an', 'the', 'and', 'or', 'but', 'for', 'nor', 'on', 'at', 'to', 'from', 'by', 'of', 'in']),
      es: new Set(['y', 'o', 'pero', 'de', 'del', 'en', 'por', 'para', 'con', 'sin', 'sobre', 'bajo']),
      it: new Set(['e', 'o', 'ma', 'di', 'del', 'in', 'per', 'con', 'su', 'da', 'al', 'nel', 'dal', 'sul'])
    };

    return text
      .toLowerCase()
      .split(' ')
      .map((word, index) => {
        // Always capitalize first and last word
        if (index === 0 || !lowerCaseWords[locale].has(word)) {
          return word.charAt(0).toUpperCase() + word.slice(1);
        }
        return word;
      })
      .join(' ');
  }

  /**
   * Validate text encoding
   */
  static isValidEncoding(text: string): boolean {
    try {
      // Check for common encoding issues
      const encoded = encodeURIComponent(text);
      const decoded = decodeURIComponent(encoded);
      return decoded === text;
    } catch (error) {
      return false;
    }
  }

  /**
   * Clean text for search operations
   */
  static cleanForSearch(text: string): string {
    return this.removeAccents(this.normalizeWhitespace(text))
      .toLowerCase()
      .replace(/[^\w\s]/g, ''); // Remove punctuation
  }

  /**
   * Extract URLs from text
   */
  static extractUrls(text: string): string[] {
    const urlRegex = /https?:\/\/[^\s]+/g;
    return text.match(urlRegex) || [];
  }

  /**
   * Extract email addresses from text
   */
  static extractEmails(text: string): string[] {
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    return text.match(emailRegex) || [];
  }

  /**
   * Highlight search terms in text
   */
  static highlightSearchTerms(text: string, searchTerms: string[], highlightTag: string = 'mark'): string {
    let highlightedText = text;
    
    searchTerms.forEach(term => {
      const regex = new RegExp(`(${this.escapeRegex(term)})`, 'gi');
      highlightedText = highlightedText.replace(regex, `<${highlightTag}>$1</${highlightTag}>`);
    });
    
    return highlightedText;
  }

  /**
   * Escape special regex characters
   */
  private static escapeRegex(text: string): string {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Convert text to slug format
   */
  static toSlug(text: string): string {
    return this.removeAccents(text)
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters except hyphens
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim()
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
  }
}
