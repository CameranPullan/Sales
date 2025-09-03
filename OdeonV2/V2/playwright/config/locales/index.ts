import { LocaleConfig, SupportedLocale } from './types';
import enConfig from './en.json';
import esConfig from './es.json';

export class LocaleManager {
  private static instance: LocaleManager;
  private localeConfigs: Map<SupportedLocale, LocaleConfig>;
  private currentLocale: SupportedLocale;

  private constructor() {
    this.localeConfigs = new Map();
    this.loadLocaleConfigs();
    this.currentLocale = this.detectLocale();
  }

  public static getInstance(): LocaleManager {
    if (!LocaleManager.instance) {
      LocaleManager.instance = new LocaleManager();
    }
    return LocaleManager.instance;
  }

  private loadLocaleConfigs(): void {
    this.localeConfigs.set('en', enConfig as LocaleConfig);
    this.localeConfigs.set('es', esConfig as LocaleConfig);
  }

  private detectLocale(): SupportedLocale {
    // Check environment variable first
    const envLocale = process.env.LOCALE as SupportedLocale;
    if (envLocale && this.isValidLocale(envLocale)) {
      return envLocale;
    }

    // Check Playwright project name
    const projectName = process.env.PLAYWRIGHT_PROJECT_NAME;
    if (projectName && this.isValidLocale(projectName as SupportedLocale)) {
      return projectName as SupportedLocale;
    }

    // Default to English
    return 'en';
  }

  private isValidLocale(locale: string): locale is SupportedLocale {
    return this.localeConfigs.has(locale as SupportedLocale);
  }

  public getCurrentLocale(): SupportedLocale {
    return this.currentLocale;
  }

  public setCurrentLocale(locale: SupportedLocale): void {
    if (!this.isValidLocale(locale)) {
      throw new Error(`Unsupported locale: ${locale}`);
    }
    this.currentLocale = locale;
  }

  public getLocaleConfig(locale?: SupportedLocale): LocaleConfig {
    const targetLocale = locale || this.currentLocale;
    const config = this.localeConfigs.get(targetLocale);
    
    if (!config) {
      throw new Error(`Locale configuration not found for: ${targetLocale}`);
    }
    
    return config;
  }

  public getSupportedLocales(): SupportedLocale[] {
    return Array.from(this.localeConfigs.keys());
  }

  public getBaseUrl(locale?: SupportedLocale): string {
    return this.getLocaleConfig(locale).baseUrl;
  }

  public getTranslation(key: string, locale?: SupportedLocale): string {
    const config = this.getLocaleConfig(locale);
    const keys = key.split('.');
    
    let value: any = config.translations;
    for (const k of keys) {
      value = value?.[k];
    }
    
    if (typeof value !== 'string') {
      console.warn(`Translation not found for key: ${key} in locale: ${locale || this.currentLocale}`);
      return key; // Return the key if translation not found
    }
    
    return value;
  }

  public getSelector(selectorPath: string, locale?: SupportedLocale): string {
    const config = this.getLocaleConfig(locale);
    const keys = selectorPath.split('.');
    
    let value: any = config.selectors;
    for (const key of keys) {
      value = value?.[key];
    }
    
    if (typeof value !== 'string') {
      throw new Error(`Selector not found for path: ${selectorPath} in locale: ${locale || this.currentLocale}`);
    }
    
    return value;
  }

  public getFormattingRule(rule: keyof LocaleConfig['formatting'], locale?: SupportedLocale): string {
    return this.getLocaleConfig(locale).formatting[rule];
  }

  public getTestData(dataPath: string, locale?: SupportedLocale): any {
    const config = this.getLocaleConfig(locale);
    const keys = dataPath.split('.');
    
    let value: any = config.translations.testData;
    for (const key of keys) {
      value = value?.[key];
    }
    
    if (value === undefined) {
      console.warn(`Test data not found for path: ${dataPath} in locale: ${locale || this.currentLocale}`);
      return null;
    }
    
    return value;
  }

  public getAssertion(assertionPath: string, locale?: SupportedLocale): string {
    return this.getTranslation(`assertions.${assertionPath}`, locale);
  }
}

// Export singleton instance
export const localeManager = LocaleManager.getInstance();
