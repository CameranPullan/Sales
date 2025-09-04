# Localization Framework Guide

## Table of Contents
- [Executive Summary](#executive-summary)
- [Technical Architecture](#technical-architecture)
- [JSON Configuration Structure](#json-configuration-structure)
- [Framework Integration](#framework-integration)
- [Implementation Examples](#implementation-examples)
- [Configuration Management](#configuration-management)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

---

## Executive Summary

### For Non-Technical Stakeholders

The test framework includes a sophisticated localization system that allows the same tests to run across different languages and regions (English, Spanish, Italian) while automatically adapting to each locale's specific requirements. Think of it like having a multilingual assistant that knows exactly how to interact with Wikipedia in each language, using the right buttons, understanding the right content, and speaking the local language.

**Key Benefits:**
- **Single Codebase**: Write tests once, run everywhere
- **Authentic Testing**: Uses real locale-specific content and interactions  
- **Quality Assurance**: Ensures features work correctly for international users
- **Cost Effective**: Automated testing across multiple locales without manual effort

### For Technical Teams

The localization framework is built on a configuration-driven architecture where JSON files define locale-specific behavior, content, and UI interactions. The system uses dependency injection to provide locale context throughout the test execution pipeline.

**Core Principles:**
- Configuration over code
- Singleton pattern for consistency
- Graceful fallback mechanisms
- Type-safe interfaces

---

## Technical Architecture

### System Overview

```
┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│   Playwright        │    │   LocaleManager     │    │   JSON Config       │
│   Test Execution    │◄───│   (Singleton)       │◄───│   Files             │
└─────────────────────┘    └─────────────────────┘    └─────────────────────┘
           │                          │                          │
           ▼                          ▼                          ▼
┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│   Test Fixtures     │    │   Page Objects      │    │   Utility Classes   │
│   (Locale Context)  │    │   (Locale-Aware)    │    │   (Translation)     │
└─────────────────────┘    └─────────────────────┘    └─────────────────────┘
```

### Core Components

1. **LocaleManager**: Central singleton managing all locale operations
2. **JSON Configuration Files**: Define locale-specific behavior and content
3. **Test Fixtures**: Automatic locale injection into test context
4. **Page Objects**: Locale-aware element interaction
5. **Utility Classes**: Translation, formatting, and selector management

---

## JSON Configuration Structure

### File Locations
```
config/locales/
├── index.ts          # LocaleManager implementation
├── types.ts          # TypeScript interfaces
├── en.json           # English configuration
├── es.json           # Spanish configuration
└── it.json           # Italian configuration
```

### Configuration Schema

```json
{
  "baseUrl": "https://en.wikipedia.org",
  "language": "en",
  "region": "US",
  "selectors": {
    "common": {
      "logo": "a.mw-logo",
      "searchInput": "#searchInput",
      "searchButton": "#searchButton"
    },
    "homePage": {
      "featuredArticle": "#mp-tfa",
      "featuredArticleLink": "#mp-tfa p > b > a"
    },
    "articlePage": {
      "title": "h1.firstHeading",
      "content": "#mw-content-text",
      "infobox": {
        "container": ".infobox",
        "birthDate": ".bday",
        "nationality": "tr:has-text('Nationality') td"
      }
    }
  },
  "translations": {
    "common": {
      "search": "Search",
      "loading": "Loading",
      "error": "Error"
    },
    "testData": {
      "searchTerms": {
        "people": {
          "authors": ["William Shakespeare", "Jane Austen"],
          "scientists": ["Albert Einstein", "Marie Curie"]
        },
        "places": {
          "countries": ["United Kingdom", "United States"],
          "cities": ["London", "New York"]
        }
      }
    },
    "assertions": {
      "visibility": {
        "elementVisible": "Element should be visible",
        "pageLoaded": "Page should load successfully"
      }
    }
  },
  "formatting": {
    "dateFormat": "DD MMMM YYYY",
    "currencySymbol": "$",
    "currencyFormat": "$#,##0.00",
    "locale": "en-US"
  }
}
```

### Locale-Specific Differences

**English vs Spanish Configuration Examples:**

| Aspect | English (en.json) | Spanish (es.json) |
|--------|------------------|-------------------|
| Base URL | `https://en.wikipedia.org` | `https://es.wikipedia.org` |
| Featured Article | `#mp-tfa` | `[id*="destacado"]` |
| Birth Field | `tr:has-text('Born') td` | `tr:has-text('Nacimiento') td` |
| Test Authors | `["Shakespeare", "Austen"]` | `["García Márquez", "Cervantes"]` |
| Date Format | `DD MMMM YYYY` | `DD/MM/YYYY` |

---

## Framework Integration

### 1. LocaleManager - Central Configuration Hub

```typescript
// File: config/locales/index.ts

export class LocaleManager {
  private static instance: LocaleManager;
  private localeConfigs: Map<SupportedLocale, LocaleConfig>;
  private currentLocale: SupportedLocale;

  // Singleton pattern ensures consistency
  public static getInstance(): LocaleManager {
    if (!LocaleManager.instance) {
      LocaleManager.instance = new LocaleManager();
    }
    return LocaleManager.instance;
  }

  // Dynamic locale detection
  private detectLocale(): SupportedLocale {
    // 1. Check environment variable
    const envLocale = process.env.LOCALE as SupportedLocale;
    if (envLocale && this.isValidLocale(envLocale)) {
      return envLocale;
    }

    // 2. Check Playwright project name
    const projectName = process.env.PLAYWRIGHT_PROJECT_NAME;
    if (projectName && this.isValidLocale(projectName as SupportedLocale)) {
      return projectName as SupportedLocale;
    }

    // 3. Default to English
    return 'en';
  }

  // Core API methods
  public getSelector(selectorPath: string, locale?: SupportedLocale): string
  public getTranslation(key: string, locale?: SupportedLocale): string
  public getTestData(dataPath: string, locale?: SupportedLocale): any
  public getBaseUrl(locale?: SupportedLocale): string
}
```

### 2. Test Fixtures - Automatic Locale Injection

```typescript
// File: fixtures/test.ts

type TestFixtures = {
  locale: SupportedLocale;
  homePage: HomePage;
  testData: LocaleTestData;
  utils: UtilityCollection;
  localeContext: LocaleContext;
};

export const test = baseTest.extend<TestFixtures>({
  // Locale detection from Playwright project configuration
  locale: async ({}, use, testInfo) => {
    const projectName = testInfo.project.name;
    const locale = (projectName as SupportedLocale) || 'en';
    await use(locale);
  },

  // Page objects receive locale context automatically
  homePage: async ({ page, locale }, use) => {
    const homePage = new HomePage(page, locale);
    await use(homePage);
  },

  // Test data provided based on current locale
  testData: async ({ locale }, use) => {
    const testData = {
      randomPerson: TestDataProvider.getRandomPerson(locale),
      randomLocation: TestDataProvider.getRandomLocation(locale),
      allPersons: TestDataProvider.getTestData(locale).persons
    };
    await use(testData);
  }
});
```

### 3. Page Objects - Locale-Aware Behavior

```typescript
// File: pages/HomePage.ts

export class HomePage extends BasePage {
  private selectorManager: SelectorManager;

  constructor(page: Page, locale?: SupportedLocale) {
    super(page, locale);
    this.selectorManager = new SelectorManager(page, this.locale);
  }

  async clickFeaturedArticle(): Promise<void> {
    // Automatically uses locale-specific selector
    const featuredSelector = await this.selectorManager.getFeaturedContentSelector();
    
    // English: "#mp-tfa"
    // Spanish: "[id*=\"destacado\"]" 
    // Italian: "[id*=\"vetrina\"]"
    
    const featuredElement = this.page.locator(featuredSelector);
    await featuredElement.click();
  }

  async search(term: string): Promise<void> {
    // Uses common.searchInput selector from JSON config
    await this.fillInput('common.searchInput', term);
    await this.clickElement('common.searchButton');
  }
}
```

### 4. Utility Classes - Locale-Driven Operations

```typescript
// File: utils/SelectorManager.ts

export class SelectorManager {
  constructor(private page: Page, private locale: SupportedLocale) {}

  async selectorExists(selectorPath: string): Promise<boolean> {
    try {
      // Resolves 'homePage.featuredArticle' to locale-specific CSS selector
      const selector = localeManager.getSelector(selectorPath, this.locale);
      const count = await this.page.locator(selector).count();
      return count > 0;
    } catch (error) {
      return false;
    }
  }

  async getElementWithFallback(primaryPath: string, fallbackPaths: string[]): Promise<Locator> {
    // Try primary selector first
    if (await this.selectorExists(primaryPath)) {
      return this.page.locator(localeManager.getSelector(primaryPath, this.locale));
    }

    // Try fallback selectors
    for (const fallbackPath of fallbackPaths) {
      if (await this.selectorExists(fallbackPath)) {
        return this.page.locator(localeManager.getSelector(fallbackPath, this.locale));
      }
    }

    throw new Error(`No selectors found for paths: ${[primaryPath, ...fallbackPaths].join(', ')}`);
  }
}
```

---

## Implementation Examples

### Example 1: Cross-Locale Search Test

**Test Code (Same for all locales):**
```typescript
test('should search for famous author', async ({ page, locale, testData }) => {
  const homePage = new HomePage(page, locale);
  await homePage.goto();
  
  // Automatically gets locale-appropriate author
  const author = testData.randomPerson.name;
  await homePage.search(author);
  
  // Validates results using locale-specific expectations
  const title = await page.locator('h1.firstHeading').textContent();
  expect(title).toContain(author);
});
```

**Runtime Behavior by Locale:**

| Locale | Base URL | Search Term | Expected Behavior |
|--------|----------|-------------|-------------------|
| English | en.wikipedia.org | "William Shakespeare" | Navigates to Shakespeare's page |
| Spanish | es.wikipedia.org | "Gabriel García Márquez" | Navigates to García Márquez's page |
| Italian | it.wikipedia.org | "Leonardo da Vinci" | Navigates to da Vinci's page |

### Example 2: Locale-Specific Element Interaction

```typescript
test('should validate featured content', async ({ page, locale }) => {
  const homePage = new HomePage(page, locale);
  await homePage.goto();
  
  // Uses different selectors per locale automatically
  const isVisible = await homePage.isFeaturedArticleVisible();
  expect(isVisible).toBe(true);
  
  // Clicks using locale-appropriate selector
  await homePage.clickFeaturedArticle();
  
  // Validates navigation succeeded
  await expect(page).toHaveURL(/\/wiki\//);
});
```

**Selector Resolution:**
- **English**: Uses `#mp-tfa` selector for "Today's Featured Article"
- **Spanish**: Uses `[id*="destacado"]` selector for "Artículo destacado"
- **Italian**: Uses `[id*="vetrina"]` selector for "Articolo in vetrina"

### Example 3: Data-Driven Testing with Locale Context

```typescript
test('should handle special characters correctly', async ({ page, locale }) => {
  const homePage = new HomePage(page, locale);
  await homePage.goto();
  
  // Gets locale-specific special character test cases
  const specialChars = localeManager.getTestData('searchTerms.specialCharacters', locale);
  
  for (const searchTerm of specialChars) {
    await homePage.search(searchTerm);
    
    // Validate search completed without errors
    const hasResults = await page.locator('.mw-search-results').count() > 0;
    expect(hasResults).toBe(true);
  }
});
```

**Test Data by Locale:**
- **English**: `['café', 'résumé', 'naïve']`
- **Spanish**: `['José', 'María', 'España']`
- **Italian**: `['Giuseppe', 'Maria', 'Italia']`

---

## Configuration Management

### Adding a New Locale

**Step 1: Create JSON Configuration**
```bash
# Create new locale file
touch config/locales/fr.json
```

**Step 2: Define Configuration Structure**
```json
{
  "baseUrl": "https://fr.wikipedia.org",
  "language": "fr",
  "region": "FR",
  "selectors": {
    "homePage": {
      "featuredArticle": "#Contenu_de_qualité"
    }
  },
  "translations": {
    "testData": {
      "searchTerms": {
        "people": {
          "authors": ["Victor Hugo", "Marcel Proust"]
        }
      }
    }
  },
  "formatting": {
    "dateFormat": "DD/MM/YYYY",
    "currencySymbol": "€",
    "locale": "fr-FR"
  }
}
```

**Step 3: Update TypeScript Types**
```typescript
// File: config/locales/types.ts
export type SupportedLocale = 'en' | 'es' | 'it' | 'fr';
```

**Step 4: Update LocaleManager**
```typescript
// File: config/locales/index.ts
import frConfig from './fr.json';

private loadLocaleConfigs(): void {
  this.localeConfigs.set('en', enConfig as LocaleConfig);
  this.localeConfigs.set('es', esConfig as LocaleConfig);
  this.localeConfigs.set('it', itConfig as LocaleConfig);
  this.localeConfigs.set('fr', frConfig as LocaleConfig); // Add French
}
```

**Step 5: Add Playwright Project**
```typescript
// File: playwright.config.ts
export default defineConfig({
  projects: [
    // ... existing projects
    {
      name: 'fr',
      use: {
        baseURL: 'https://fr.wikipedia.org',
        locale: 'fr-FR'
      }
    }
  ]
});
```

### Modifying Existing Locale Behavior

**Updating Selectors:**
```json
// In locale JSON file
{
  "selectors": {
    "homePage": {
      "featuredArticle": "#new-selector-pattern"
    }
  }
}
```

**Adding New Test Data:**
```json
{
  "translations": {
    "testData": {
      "newCategory": {
        "items": ["item1", "item2", "item3"]
      }
    }
  }
}
```

**Usage in Tests:**
```typescript
const newTestData = localeManager.getTestData('newCategory.items', locale);
```

---

## Best Practices

### 1. Selector Management

**✅ Good Practice:**
```typescript
// Use semantic paths instead of direct selectors
const logoSelector = localeManager.getSelector('common.logo', locale);
```

**❌ Avoid:**
```typescript
// Hardcoded selectors bypass locale system
const logoSelector = 'a.mw-logo';
```

### 2. Test Data Organization

**✅ Structured Approach:**
```json
{
  "translations": {
    "testData": {
      "searchTerms": {
        "category": {
          "subcategory": ["item1", "item2"]
        }
      }
    }
  }
}
```

**❌ Flat Structure:**
```json
{
  "translations": {
    "testData": {
      "authors": ["item1", "item2"],
      "scientists": ["item1", "item2"]
    }
  }
}
```

### 3. Error Handling

**✅ Graceful Degradation:**
```typescript
try {
  const selector = localeManager.getSelector('complex.path', locale);
  return await this.page.locator(selector);
} catch (error) {
  // Fall back to common selector
  return await this.page.locator(localeManager.getSelector('common.fallback', locale));
}
```

### 4. Validation

**Use TranslationValidator for consistency:**
```typescript
// Validate all locales have consistent structure
const validationResult = TranslationValidator.validateAll();
if (!validationResult.isValid) {
  console.warn('Locale configuration issues detected:', validationResult.errors);
}
```

---

## Troubleshooting

### Common Issues

**1. Selector Not Found Error**
```
Error: Selector not found for path: homePage.featuredArticle in locale: es
```

**Solution:**
- Check if the selector path exists in the locale JSON file
- Verify the JSON structure matches the expected hierarchy
- Use TranslationValidator to identify missing selectors

**2. Locale Detection Issues**
```
Error: Unsupported locale: undefined
```

**Solution:**
- Verify Playwright project names match supported locales
- Check environment variable LOCALE is set correctly
- Ensure LocaleManager.detectLocale() logic is working

**3. Test Data Access Issues**
```
Error: Cannot read property 'authors' of undefined
```

**Solution:**
- Verify the test data path exists in translations.testData
- Check for typos in the data access path
- Use getTestData() with proper error handling

### Debugging Tools

**1. Locale Configuration Inspector**
```typescript
// Add to test setup for debugging
console.log('Current locale:', localeManager.getCurrentLocale());
console.log('Available locales:', localeManager.getSupportedLocales());
console.log('Base URL:', localeManager.getBaseUrl());
```

**2. Selector Resolution Debugging**
```typescript
// Test selector resolution
const selectorManager = new SelectorManager(page, locale);
const exists = await selectorManager.selectorExists('homePage.featuredArticle');
console.log(`Selector exists for ${locale}:`, exists);
```

**3. Translation Structure Validation**
```typescript
// Validate configuration consistency
const result = TranslationValidator.validateTranslationStructure();
console.log('Validation result:', result);
```

---

## Architecture Decisions

### Why JSON Configuration?

**Benefits:**
- **Separation of Concerns**: Configuration separate from code
- **Non-Developer Editable**: Content teams can modify without code changes
- **Version Control Friendly**: Easy to track configuration changes
- **Runtime Flexibility**: Can switch locales without recompilation

### Why Singleton Pattern for LocaleManager?

**Benefits:**
- **Consistency**: Single source of truth for locale state
- **Performance**: Avoids repeated configuration loading
- **Memory Efficiency**: Single instance shared across all components
- **State Management**: Centralized locale switching

### Why Dependency Injection in Fixtures?

**Benefits:**
- **Testability**: Easy to mock locale context for testing
- **Flexibility**: Can override locale for specific tests
- **Maintainability**: Clear dependencies and composition
- **Scalability**: Easy to extend with new locale-aware fixtures

---

This localization framework transforms a single test codebase into a multi-locale testing powerhouse, automatically adapting behavior, content, and expectations based on simple JSON configuration files. The result is robust, maintainable, and comprehensive international testing coverage.
