import { localeManager } from '../config/locales';
import { SupportedLocale } from '../config/locales/types';

/**
 * Translation utility for test files
 * Provides access to locale-specific translations without requiring page objects
 */
export class TranslationUtils {
  /**
   * Get translation for a given key and locale
   */
  static getTranslation(key: string, locale: SupportedLocale): string {
    return localeManager.getTranslation(key, locale);
  }

  /**
   * Get parameterized translation
   */
  static getParameterizedTranslation(
    key: string, 
    locale: SupportedLocale, 
    params: Record<string, string>
  ): string {
    let translation = this.getTranslation(key, locale);
    
    if (params && translation) {
      Object.entries(params).forEach(([paramKey, value]) => {
        translation = translation.replace(new RegExp(`{{${paramKey}}}`, 'g'), value);
      });
    }
    
    return translation;
  }

  /**
   * Get test-specific translations
   */
  static getTestName(testKey: string, locale: SupportedLocale): string {
    return this.getTranslation(`testNames.${testKey}`, locale);
  }

  static getTestDescription(testKey: string, locale: SupportedLocale): string {
    return this.getTranslation(`testDescriptions.${testKey}`, locale);
  }

  static getTestAction(actionKey: string, locale: SupportedLocale): string {
    return this.getTranslation(`testActions.${actionKey}`, locale);
  }

  /**
   * Get assertion messages
   */
  static getAssertionMessage(assertionKey: string, locale: SupportedLocale): string {
    return this.getTranslation(`assertions.${assertionKey}`, locale);
  }

  /**
   * Get error messages
   */
  static getErrorMessage(errorKey: string, locale: SupportedLocale): string {
    return this.getTranslation(`errors.${errorKey}`, locale);
  }

  /**
   * Get selector paths
   */
  static getSelector(selectorPath: string, locale: SupportedLocale): string {
    return localeManager.getSelector(selectorPath, locale);
  }

  /**
   * Format test result message
   */
  static formatTestResult(
    testKey: string, 
    locale: SupportedLocale, 
    success: boolean,
    details?: string
  ): string {
    const testName = this.getTestName(testKey, locale);
    const status = success ? '✅' : '❌';
    const statusText = success ? 'PASSED' : 'FAILED';
    
    return `${status} [${locale.toUpperCase()}] ${testName} - ${statusText}${details ? `: ${details}` : ''}`;
  }

  /**
   * Generate locale-aware test step message
   */
  static formatTestStep(
    actionKey: string,
    locale: SupportedLocale,
    target?: string,
    stepNumber?: number
  ): string {
    const action = this.getTestAction(actionKey, locale);
    const step = stepNumber ? `Step ${stepNumber}: ` : '';
    const targetText = target ? ` - ${target}` : '';
    
    return `${step}${action}${targetText}`;
  }
}
