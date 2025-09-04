import { localeManager } from '../config/locales';
import { SupportedLocale, LocaleConfig } from '../config/locales/types';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export class TranslationValidator {
  /**
   * Validate that all locales have the same translation structure
   */
  static validateTranslationStructure(): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    const supportedLocales = localeManager.getSupportedLocales();
    
    if (supportedLocales.length < 2) {
      warnings.push('Only one locale found, cannot validate structure consistency');
      return { isValid: true, errors, warnings };
    }
    
    // Use first locale as reference
    const referenceLocale = supportedLocales[0];
    const referenceConfig = localeManager.getLocaleConfig(referenceLocale);
    const referenceKeys = this.extractTranslationKeys(referenceConfig.translations);
    
    // Compare other locales against reference
    for (let i = 1; i < supportedLocales.length; i++) {
      const currentLocale = supportedLocales[i];
      const currentConfig = localeManager.getLocaleConfig(currentLocale);
      const currentKeys = this.extractTranslationKeys(currentConfig.translations);
      
      // Find missing keys
      const missingKeys = referenceKeys.filter(key => !currentKeys.includes(key));
      const extraKeys = currentKeys.filter(key => !referenceKeys.includes(key));
      
      if (missingKeys.length > 0) {
        errors.push(`Locale '${currentLocale}' is missing translation keys: ${missingKeys.join(', ')}`);
      }
      
      if (extraKeys.length > 0) {
        warnings.push(`Locale '${currentLocale}' has extra translation keys: ${extraKeys.join(', ')}`);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate that all selectors exist in all locales
   */
  static validateSelectorStructure(): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    const supportedLocales = localeManager.getSupportedLocales();
    
    if (supportedLocales.length < 2) {
      warnings.push('Only one locale found, cannot validate selector consistency');
      return { isValid: true, errors, warnings };
    }
    
    // Use first locale as reference
    const referenceLocale = supportedLocales[0];
    const referenceConfig = localeManager.getLocaleConfig(referenceLocale);
    const referenceKeys = this.extractSelectorKeys(referenceConfig.selectors);
    
    // Compare other locales against reference
    for (let i = 1; i < supportedLocales.length; i++) {
      const currentLocale = supportedLocales[i];
      const currentConfig = localeManager.getLocaleConfig(currentLocale);
      const currentKeys = this.extractSelectorKeys(currentConfig.selectors);
      
      // Find missing keys
      const missingKeys = referenceKeys.filter(key => !currentKeys.includes(key));
      const extraKeys = currentKeys.filter(key => !referenceKeys.includes(key));
      
      if (missingKeys.length > 0) {
        errors.push(`Locale '${currentLocale}' is missing selector keys: ${missingKeys.join(', ')}`);
      }
      
      if (extraKeys.length > 0) {
        warnings.push(`Locale '${currentLocale}' has extra selector keys: ${extraKeys.join(', ')}`);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Find missing translations for a specific locale
   */
  static findMissingTranslations(locale: SupportedLocale): string[] {
    const missingKeys: string[] = [];
    
    try {
      const config = localeManager.getLocaleConfig(locale);
      const keys = this.extractTranslationKeys(config.translations);
      
      // Test each key to see if it returns the key itself (indicating missing translation)
      for (const key of keys) {
        const translation = localeManager.getTranslation(key, locale);
        if (translation === key) {
          missingKeys.push(key);
        }
      }
    } catch (error) {
      // Error checking translations
    }
    
    return missingKeys;
  }

  /**
   * Validate that test data arrays have reasonable content
   */
  static validateTestData(): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    const supportedLocales = localeManager.getSupportedLocales();
    
    for (const locale of supportedLocales) {
      try {
        // Check that search terms arrays are not empty
        const searchCategories = ['people.authors', 'people.scientists', 'places.countries', 'concepts.science'];
        
        for (const category of searchCategories) {
          const data = localeManager.getTestData(`searchTerms.${category}`, locale);
          
          if (!Array.isArray(data)) {
            errors.push(`Locale '${locale}': ${category} is not an array`);
          } else if (data.length === 0) {
            warnings.push(`Locale '${locale}': ${category} array is empty`);
          } else if (data.some(item => typeof item !== 'string' || item.trim().length === 0)) {
            errors.push(`Locale '${locale}': ${category} contains invalid items`);
          }
        }
        
        // Validate expected content patterns
        const patterns = ['personPage.birthDatePattern', 'locationPage.populationPattern'];
        
        for (const pattern of patterns) {
          try {
            const patternValue = localeManager.getTestData(`expectedContent.${pattern}`, locale);
            
            if (typeof patternValue !== 'string') {
              errors.push(`Locale '${locale}': ${pattern} is not a string`);
            } else {
              // Test if it's a valid regex
              try {
                new RegExp(patternValue);
              } catch (regexError) {
                errors.push(`Locale '${locale}': ${pattern} is not a valid regex pattern`);
              }
            }
          } catch (error) {
            warnings.push(`Locale '${locale}': ${pattern} not found`);
          }
        }
        
      } catch (error) {
        errors.push(`Error validating test data for locale '${locale}': ${error.message}`);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Extract all translation keys recursively
   */
  private static extractTranslationKeys(obj: any, prefix = ''): string[] {
    const keys: string[] = [];
    
    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        keys.push(...this.extractTranslationKeys(value, fullKey));
      } else {
        keys.push(fullKey);
      }
    }
    
    return keys;
  }

  /**
   * Extract all selector keys recursively
   */
  private static extractSelectorKeys(obj: any, prefix = ''): string[] {
    const keys: string[] = [];
    
    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        keys.push(...this.extractSelectorKeys(value, fullKey));
      } else {
        keys.push(fullKey);
      }
    }
    
    return keys;
  }

  /**
   * Run all validations
   */
  static validateAll(): ValidationResult {
    const allErrors: string[] = [];
    const allWarnings: string[] = [];
    
    // Run all validation checks
    const checks = [
      this.validateTranslationStructure(),
      this.validateSelectorStructure(),
      this.validateTestData()
    ];
    
    for (const check of checks) {
      allErrors.push(...check.errors);
      allWarnings.push(...check.warnings);
    }
    
    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings
    };
  }
}
