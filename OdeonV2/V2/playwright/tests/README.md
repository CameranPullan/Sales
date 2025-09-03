# Test Organization

This directory contains tests organized into two main categories:

## Application Tests (tests/)
Tests that validate the actual functionality and quality of the Wikipedia web application:

- **`home.spec.ts`** - Enhanced Wikipedia application tests with advanced framework capabilities
  - Logo visibility and functionality
  - Featured article navigation  
  - Search functionality with author extraction
  - Cross-locale search capabilities
  - Locale-specific formatting validation

- **`home-refactored.spec.ts`** - Refactored Wikipedia application tests showcasing framework enhancements
  - Logo visibility with locale-aware assertions
  - Featured article navigation with enhanced selectors
  - Search functionality with biographical data extraction
  - Cross-locale validation
  - Locale-specific formatting and content validation

## Framework Tests (frameworkTests/)
Tests that validate the testing framework itself and its components:

### Configuration & Setup
- **`locale-config.spec.ts`** - Validates locale configuration system, selectors, translations, and test data

### Framework Implementation
- **`phase2-implementation.spec.ts`** - Tests utility functions (LocaleUtils, ContentValidator, TranslationValidator, SelectorManager)
- **`phase3-demo.spec.ts`** - Demonstrates framework components (page objects, date/time utilities, currency formatting, text processing, URL utilities)
- **`phase4-step10-refactored.spec.ts`** - Tests refactored framework components

### Advanced Framework Features
- **`enhanced-test-suite.spec.ts`** - Tests cross-locale validation, edge cases, formatting validation, and content availability
- **`reporting-and-execution.spec.ts`** - Tests locale-aware reporting, performance comparison, parallel execution, and failure analysis
- **`reporting-execution-step12.spec.ts`** - Tests performance benchmarking and execution optimization

### Debug & Development
- **`debug-search.spec.ts`** - Debug test for search selector validation
- **`debug-search-ambiguous.spec.ts`** - Debug test for ambiguous search scenarios
- **`debug-search-results.spec.ts`** - Debug test for search result handling
- **`debug-spanish-structure.spec.ts`** - Debug test for Spanish Wikipedia structure
- **`step7-enhanced-page-objects.spec.ts`** - Framework development test file

### Timezone & Internationalization
- **`timezone-investigation.spec.ts`** - Investigates current timezone support capabilities
- **`enhanced-timezone-demo.spec.ts`** - Demonstrates advanced timezone features and multi-timezone testing

## Running Tests

### Application Tests Only
```bash
# Run all application tests
npx playwright test tests/home*.spec.ts

# Run specific application test
npx playwright test tests/home.spec.ts
```

### Framework Tests Only
```bash
# Run all framework validation tests
npx playwright test tests/frameworkTests/

# Run specific framework test category
npx playwright test tests/frameworkTests/phase*.spec.ts
npx playwright test tests/frameworkTests/locale-config.spec.ts
```

### All Tests
```bash
# Run everything
npx playwright test
```

## Test Categories Explained

**Application Tests** focus on:
- ✅ User functionality works correctly
- ✅ Content is accessible and displays properly
- ✅ Search and navigation work as expected
- ✅ Locale-specific behaviors are correct
- ✅ Performance meets requirements

**Framework Tests** focus on:
- 🔧 Configuration system works correctly
- 🔧 Utility functions behave as expected
- 🔧 Cross-locale functionality is reliable
- 🔧 Reporting and metrics collection works
- 🔧 Framework components integrate properly
- 🔧 Debug capabilities function correctly

This separation ensures that:
1. **Application quality** can be verified independently
2. **Framework reliability** can be validated separately  
3. **CI/CD pipelines** can run different test suites for different purposes
4. **Development teams** can focus on relevant test failures
5. **Test maintenance** is easier with clear separation of concerns
