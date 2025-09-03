import { SupportedLocale } from '../config/locales/types';

export class UrlUtils {
  private static readonly LOCALE_DOMAINS: Record<SupportedLocale, string> = {
    en: 'en.wikipedia.org',
    es: 'es.wikipedia.org',
    it: 'it.wikipedia.org'
  };

  private static readonly LOCALE_PATHS: Record<SupportedLocale, Record<string, string>> = {
    en: {
      home: '/',
      search: '/w/index.php',
      special: '/wiki/Special:',
      random: '/wiki/Special:Random',
      help: '/wiki/Help:Contents'
    },
    es: {
      home: '/',
      search: '/w/index.php',
      special: '/wiki/Especial:',
      random: '/wiki/Especial:Aleatoria',
      help: '/wiki/Ayuda:Contenidos'
    },
    it: {
      home: '/',
      search: '/w/index.php',
      special: '/wiki/Speciale:',
      random: '/wiki/Speciale:Pagina_a_caso',
      help: '/wiki/Aiuto:Contenuti'
    }
  };

  /**
   * Build locale-aware URL
   */
  static buildUrl(locale: SupportedLocale, path: string = '/', params?: Record<string, string>): string {
    const domain = this.LOCALE_DOMAINS[locale];
    const protocol = 'https';
    
    let url = `${protocol}://${domain}${path}`;
    
    if (params && Object.keys(params).length > 0) {
      const searchParams = new URLSearchParams(params);
      url += (path.includes('?') ? '&' : '?') + searchParams.toString();
    }
    
    return url;
  }

  /**
   * Get localized path
   */
  static getLocalizedPath(locale: SupportedLocale, pathKey: string): string {
    const paths = this.LOCALE_PATHS[locale];
    return paths[pathKey] || paths.home;
  }

  /**
   * Build search URL with locale-specific parameters
   */
  static buildSearchUrl(locale: SupportedLocale, query: string, options?: {
    limit?: number;
    namespace?: string;
    sort?: string;
  }): string {
    const searchPath = this.getLocalizedPath(locale, 'search');
    const params: Record<string, string> = {
      search: query,
      title: 'Special:Search'
    };

    if (options?.limit) {
      params.limit = options.limit.toString();
    }

    if (options?.namespace) {
      params.ns0 = '1'; // Article namespace
    }

    if (options?.sort) {
      params.sort = options.sort;
    }

    return this.buildUrl(locale, searchPath, params);
  }

  /**
   * Extract locale from URL
   */
  static extractLocaleFromUrl(url: string): SupportedLocale | null {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname;
      
      for (const [locale, domain] of Object.entries(this.LOCALE_DOMAINS)) {
        if (hostname === domain) {
          return locale as SupportedLocale;
        }
      }
      
      return null;
    } catch (error) {
      console.warn('Failed to extract locale from URL:', url, error);
      return null;
    }
  }

  /**
   * Validate URL belongs to expected locale
   */
  static validateLocaleUrl(url: string, expectedLocale: SupportedLocale): boolean {
    const extractedLocale = this.extractLocaleFromUrl(url);
    return extractedLocale === expectedLocale;
  }

  /**
   * Convert URL to different locale
   */
  static convertUrlToLocale(url: string, targetLocale: SupportedLocale): string {
    try {
      const urlObj = new URL(url);
      const currentLocale = this.extractLocaleFromUrl(url);
      
      if (!currentLocale) {
        throw new Error('Unable to determine current locale from URL');
      }
      
      if (currentLocale === targetLocale) {
        return url;
      }
      
      // Replace domain
      urlObj.hostname = this.LOCALE_DOMAINS[targetLocale];
      
      // Convert path if needed
      const pathname = urlObj.pathname;
      const convertedPath = this.convertPathToLocale(pathname, currentLocale, targetLocale);
      urlObj.pathname = convertedPath;
      
      return urlObj.toString();
    } catch (error) {
      console.warn('Failed to convert URL to locale:', url, targetLocale, error);
      return url;
    }
  }

  /**
   * Convert path to different locale
   */
  private static convertPathToLocale(
    path: string, 
    fromLocale: SupportedLocale, 
    toLocale: SupportedLocale
  ): string {
    const fromPaths = this.LOCALE_PATHS[fromLocale];
    const toPaths = this.LOCALE_PATHS[toLocale];
    
    // Check for special pages
    for (const [key, fromPath] of Object.entries(fromPaths)) {
      if (path.startsWith(fromPath)) {
        const toPath = toPaths[key];
        if (toPath) {
          return path.replace(fromPath, toPath);
        }
      }
    }
    
    return path;
  }

  /**
   * Parse query parameters from URL
   */
  static parseQueryParams(url: string): Record<string, string> {
    try {
      const urlObj = new URL(url);
      const params: Record<string, string> = {};
      
      urlObj.searchParams.forEach((value, key) => {
        params[key] = value;
      });
      
      return params;
    } catch (error) {
      console.warn('Failed to parse query parameters:', url, error);
      return {};
    }
  }

  /**
   * Build article URL for locale
   */
  static buildArticleUrl(locale: SupportedLocale, articleTitle: string): string {
    const encodedTitle = encodeURIComponent(articleTitle.replace(/ /g, '_'));
    return this.buildUrl(locale, `/wiki/${encodedTitle}`);
  }

  /**
   * Build category URL for locale
   */
  static buildCategoryUrl(locale: SupportedLocale, categoryName: string): string {
    const categoryPrefix = locale === 'es' ? 'Categoría:' : 'Category:';
    const encodedCategory = encodeURIComponent(`${categoryPrefix}${categoryName}`);
    return this.buildUrl(locale, `/wiki/${encodedCategory}`);
  }

  /**
   * Build user page URL for locale
   */
  static buildUserUrl(locale: SupportedLocale, username: string): string {
    const userPrefix = locale === 'es' ? 'Usuario:' : 'User:';
    const encodedUser = encodeURIComponent(`${userPrefix}${username}`);
    return this.buildUrl(locale, `/wiki/${encodedUser}`);
  }

  /**
   * Extract article title from URL
   */
  static extractArticleTitle(url: string): string | null {
    try {
      const urlObj = new URL(url);
      const pathMatch = urlObj.pathname.match(/\/wiki\/(.+)$/);
      
      if (pathMatch) {
        return decodeURIComponent(pathMatch[1]).replace(/_/g, ' ');
      }
      
      return null;
    } catch (error) {
      console.warn('Failed to extract article title from URL:', url, error);
      return null;
    }
  }

  /**
   * Check if URL is a Wikipedia article
   */
  static isWikipediaArticle(url: string): boolean {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname;
      const pathname = urlObj.pathname;
      
      // Check if it's a Wikipedia domain
      const isWikipedia = Object.values(this.LOCALE_DOMAINS).includes(hostname);
      
      // Check if it's an article path (not special pages, help, etc.)
      const isArticle = pathname.startsWith('/wiki/') && 
                       !pathname.includes(':') && 
                       !pathname.includes('Special') &&
                       !pathname.includes('Especial');
      
      return isWikipedia && isArticle;
    } catch (error) {
      return false;
    }
  }

  /**
   * Normalize URL for comparison
   */
  static normalizeUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      
      // Remove trailing slash
      if (urlObj.pathname.endsWith('/') && urlObj.pathname.length > 1) {
        urlObj.pathname = urlObj.pathname.slice(0, -1);
      }
      
      // Sort query parameters
      const sortedParams = new URLSearchParams();
      Array.from(urlObj.searchParams.keys())
        .sort()
        .forEach(key => {
          sortedParams.set(key, urlObj.searchParams.get(key)!);
        });
      
      urlObj.search = sortedParams.toString();
      
      return urlObj.toString();
    } catch (error) {
      console.warn('Failed to normalize URL:', url, error);
      return url;
    }
  }
}
