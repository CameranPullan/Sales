# Odeon Playwright Tests

This project contains Playwright end-to-end tests for the Odeon UK website.

## Getting Started

1. Install dependencies:
   ```powershell
   npm install
   ```
2. Run tests:
   ```powershell
   npm test
   ```

## Project Structure

- `pages/` - Page objects for the site
- `tests/` - Test specifications
- `playwright.config.ts` - Playwright configuration

## Notes
- All documentation uses UK English.
- All tests use GB as the default locale.
- Selectors are defined in page objects, not in tests.
- No console logs in tests or page objects.
- Debug files should be placed in the `/debug` folder.
