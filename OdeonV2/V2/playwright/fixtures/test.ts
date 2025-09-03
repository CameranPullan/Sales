import { test as baseTest } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { SupportedLocale } from '../config/locales/types';
import { TestDataProvider, PersonTestData, LocationTestData, ConceptTestData } from './testData/TestDataProvider';
import { DateTimeUtils } from '../utils/DateTimeUtils';
import { CurrencyUtils } from '../utils/CurrencyUtils';
import { TextUtils } from '../utils/TextUtils';
import { UrlUtils } from '../utils/UrlUtils';

declare const process: any;

/**
 * Extended test fixtures with locale support and test data providers
 */
type TestFixtures = {
  locale: SupportedLocale;
  homePage: HomePage;
  testData: {
    randomPerson: PersonTestData;
    randomLocation: LocationTestData;
    randomConcept: ConceptTestData;
    allPersons: PersonTestData[];
    allLocations: LocationTestData[];
    allConcepts: ConceptTestData[];
  };
  utils: {
    dateTime: typeof DateTimeUtils;
    currency: typeof CurrencyUtils;
    text: typeof TextUtils;
    url: typeof UrlUtils;
  };
  localeContext: {
    isRTL: boolean;
    currencySymbol: string;
    dateFormat: string;
    baseUrl: string;
  };
};

/**
 * Enhanced test with locale-aware fixtures
 */
export const test = baseTest.extend<TestFixtures>({
  // Locale fixture - determines the test locale
  locale: async ({}, use, testInfo) => {
    // Get locale from project name or environment
    const projectName = testInfo.project.name;
    const envLocale = process?.env?.LOCALE;
    const locale = (projectName as SupportedLocale) || envLocale || 'en';
    
    console.log(`🌍 Test fixture initialized with locale: ${locale}`);
    await use(locale as SupportedLocale);
  },

  // HomePage fixture with locale injection
  homePage: async ({ page, locale }, use) => {
    const homePage = new HomePage(page, locale);
    await use(homePage);
  },

  // Test data fixture - provides locale-specific test data
  testData: async ({ locale }, use) => {
    const allData = TestDataProvider.getTestData(locale);
    
    const testData = {
      randomPerson: TestDataProvider.getRandomPerson(locale),
      randomLocation: TestDataProvider.getRandomLocation(locale),
      randomConcept: TestDataProvider.getRandomConcept(locale),
      allPersons: allData.persons,
      allLocations: allData.locations,
      allConcepts: allData.concepts
    };

    console.log(`📊 Test data loaded for ${locale}:`, {
      persons: testData.allPersons.length,
      locations: testData.allLocations.length,
      concepts: testData.allConcepts.length,
      selectedPerson: testData.randomPerson.name,
      selectedLocation: testData.randomLocation.name,
      selectedConcept: testData.randomConcept.name
    });

    await use(testData);
  },

  // Utils fixture - provides utility functions
  utils: async ({}, use) => {
    const utils = {
      dateTime: DateTimeUtils,
      currency: CurrencyUtils,
      text: TextUtils,
      url: UrlUtils
    };

    await use(utils);
  },

  // Locale context fixture - provides locale-specific information
  localeContext: async ({ locale }, use) => {
    const context = {
      isRTL: ['ar', 'he', 'fa'].includes(locale), // RTL languages
      currencySymbol: CurrencyUtils.getCurrencySymbol(locale),
      dateFormat: locale === 'es' ? 'dd/MM/yyyy' : 'MM/dd/yyyy',
      baseUrl: UrlUtils.buildUrl(locale)
    };

    console.log(`🌐 Locale context for ${locale}:`, context);
    await use(context);
  }
});

/**
 * Parameterized test helper for running tests across multiple locales
 */
export function testWithAllLocales(
  name: string,
  testFn: (fixtures: TestFixtures & { page: any }) => Promise<void>
) {
  const locales: SupportedLocale[] = ['en', 'es'];
  
  locales.forEach(locale => {
    test(`${name} [${locale}]`, async ({ page, locale: fixtureLocale, ...fixtures }) => {
      // Override locale for this specific test
      const testFixtures = {
        ...fixtures,
        page,
        locale,
        homePage: new HomePage(page, locale),
        testData: {
          randomPerson: TestDataProvider.getRandomPerson(locale),
          randomLocation: TestDataProvider.getRandomLocation(locale),
          randomConcept: TestDataProvider.getRandomConcept(locale),
          allPersons: TestDataProvider.getTestData(locale).persons,
          allLocations: TestDataProvider.getTestData(locale).locations,
          allConcepts: TestDataProvider.getTestData(locale).concepts
        },
        localeContext: {
          isRTL: ['ar', 'he', 'fa'].includes(locale),
          currencySymbol: CurrencyUtils.getCurrencySymbol(locale),
          dateFormat: locale === 'es' ? 'dd/MM/yyyy' : 'MM/dd/yyyy',
          baseUrl: UrlUtils.buildUrl(locale)
        }
      } as TestFixtures & { page: any };

      await testFn(testFixtures);
    });
  });
}

/**
 * Data-driven test helper
 */
export function testWithData<T>(
  name: string,
  dataProvider: (locale: SupportedLocale) => T[],
  testFn: (fixtures: TestFixtures & { page: any }, data: T) => Promise<void>
) {
  test(name, async ({ page, locale, ...fixtures }) => {
    const testData = dataProvider(locale);
    
    for (const data of testData) {
      console.log(`🧪 Running test with data:`, data);
      
      const testFixtures = {
        ...fixtures,
        page,
        locale
      } as TestFixtures & { page: any };

      await testFn(testFixtures, data);
    }
  });
}

/**
 * Performance test helper with locale support
 */
export function performanceTest(
  name: string,
  testFn: (fixtures: TestFixtures & { page: any }) => Promise<void>,
  thresholds?: {
    maxDuration?: number;
    maxMemory?: number;
  }
) {
  test(`Performance: ${name}`, async ({ page, locale, ...fixtures }) => {
    const startTime = Date.now();
    const startMemory = process?.memoryUsage?.()?.heapUsed || 0;

    const testFixtures = {
      ...fixtures,
      page,
      locale
    } as TestFixtures & { page: any };

    await testFn(testFixtures);

    const endTime = Date.now();
    const endMemory = process?.memoryUsage?.()?.heapUsed || 0;
    
    const duration = endTime - startTime;
    const memoryUsed = endMemory - startMemory;

    console.log(`⏱️ Performance metrics for ${locale}:`, {
      duration: `${duration}ms`,
      memory: `${Math.round(memoryUsed / 1024 / 1024)}MB`,
      locale
    });

    if (thresholds?.maxDuration && duration > thresholds.maxDuration) {
      throw new Error(`Test exceeded maximum duration: ${duration}ms > ${thresholds.maxDuration}ms`);
    }

    if (thresholds?.maxMemory && memoryUsed > thresholds.maxMemory) {
      throw new Error(`Test exceeded maximum memory usage: ${memoryUsed} > ${thresholds.maxMemory}`);
    }
  });
}

export { expect } from '@playwright/test';
