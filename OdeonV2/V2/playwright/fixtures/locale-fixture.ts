import { test as base, TestInfo } from '@playwright/test';
import { localeManager } from '../config/locales';
import { LocaleConfig, SupportedLocale } from '../config/locales/types';

type LocaleFixtures = {
  locale: SupportedLocale;
  localeConfig: LocaleConfig;
};

export const test = base.extend<LocaleFixtures>({
  locale: async ({ }, use, testInfo: TestInfo) => {
    // Extract locale from project name
    const projectName = testInfo.project.name as SupportedLocale;
    
    // Set the current locale in the manager
    if (['en', 'es'].includes(projectName)) {
      localeManager.setCurrentLocale(projectName);
    }
    
    const currentLocale = localeManager.getCurrentLocale();
    console.log(`🌍 Test running with locale: ${currentLocale}`);
    
    await use(currentLocale);
  },

  localeConfig: async ({ locale }, use) => {
    const config = localeManager.getLocaleConfig(locale);
    await use(config);
  },
});

export { expect } from '@playwright/test';
