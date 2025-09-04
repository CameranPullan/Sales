# Framework Tests

This directory contains tests that validate the testing framework itself, ensuring all framework components work correctly and reliably.

## Framework Test Categories

### 🔧 Core Configuration Tests
- **`locale-config.spec.ts`** - Validates the locale configuration system
  - Tests locale loading and configuration access
  - Validates selector resolution
  - Tests translation access
  - Validates test data access
  - Tests assertion message access

### 🛠️ Utility Function Tests  
- **`phase2-implementation.spec.ts`** - Tests core utility functions
  - LocaleUtils (date/currency formatting, text normalization)
  - ContentValidator (content validation logic)
  - TranslationValidator (translation completeness)
  - SelectorManager (selector resolution and validation)

### 🎨 Framework Component Tests
- **`phase3-demo.spec.ts`** - Demonstrates and tests framework features
  - Enhanced page objects with caching
  - Date/time utilities
  - Currency and number formatting
  - Text processing utilities
  - URL and navigation utilities
  - Test data providers

### 🚀 Advanced Framework Features
- **`enhanced-test-suite.spec.ts`** - Tests advanced framework capabilities
  - Cross-locale validation framework
  - Locale-specific edge case handling
  - Currency and formatting validation
  - Content availability verification
  - Special character and unicode handling

- **`reporting-and-execution.spec.ts`** - Tests reporting and execution framework
  - Locale-aware test reporting
  - Performance comparison across locales
  - Parallel execution optimization
  - Failure analysis by locale
  - Performance optimization recommendations

- **`reporting-execution-step12.spec.ts`** - Tests performance benchmarking
  - Performance metric collection
  - Benchmark comparison
  - Optimization recommendations

### 🔄 Refactored Components
- **`phase4-step10-refactored.spec.ts`** - Tests refactored framework components
  - Validates improvements and enhancements
  - Tests backward compatibility

### 🐛 Debug & Development Tests
- **`debug-search.spec.ts`** - Debug search selector functionality
- **`debug-search-ambiguous.spec.ts`** - Debug ambiguous search scenarios  
- **`debug-search-results.spec.ts`** - Debug search result handling
- **`debug-spanish-structure.spec.ts`** - Debug Spanish Wikipedia structure
- **`step7-enhanced-page-objects.spec.ts`** - Development test file

## What Framework Tests Validate

### ✅ Configuration System
- Locale configurations load correctly
- Selectors resolve properly for each locale
- Translations are accessible and complete
- Test data is valid and accessible

### ✅ Utility Functions
- Date/currency formatting works for all locales
- Text processing handles special characters
- Content validation logic is sound
- Selector management is reliable

### ✅ Cross-Locale Support
- Framework handles multiple locales consistently
- Edge cases are handled gracefully
- Performance is acceptable across locales
- Fallback mechanisms work correctly

### ✅ Reporting & Metrics
- Test results are captured accurately
- Performance metrics are collected
- Reporting works across locales
- Failure analysis provides useful information

### ✅ Framework Reliability
- Components integrate properly
- Caching mechanisms work correctly
- Parallel execution is stable
- Error handling is robust

## Running Framework Tests

```bash
# Run all framework tests
npx playwright test tests/frameworkTests/

# Run specific test categories
npx playwright test tests/frameworkTests/phase*.spec.ts
npx playwright test tests/frameworkTests/locale-config.spec.ts
npx playwright test tests/frameworkTests/enhanced-test-suite.spec.ts

# Run debug tests only
npx playwright test tests/frameworkTests/debug*.spec.ts

# Run with specific locale
npx playwright test tests/frameworkTests/ --project=en
npx playwright test tests/frameworkTests/ --project=es
```

## Framework Test Success Criteria

For the framework to be considered reliable, these tests should:

1. **Pass consistently** across all supported locales
2. **Execute efficiently** without performance degradation  
3. **Provide clear feedback** when framework issues occur
4. **Validate all framework features** comprehensively
5. **Detect configuration issues** proactively

## Maintenance Notes

- Framework tests should be updated when new framework features are added
- Debug tests can be temporary and removed when issues are resolved
- Performance benchmarks should be adjusted as requirements change
- Configuration tests should cover all supported locales
