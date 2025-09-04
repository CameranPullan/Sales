# Default Instructions

- Always use GB as the default locale
- Use US english for code and syntax
- Use UK english for documentation
- Before making any code changes, list out the actions you will take so that I can review the steps before proceeding
- For any code written to debug, put these files in a /debug folder
- Always add a .gitignore for new projects
- When you attempt actions that are out of scope of the original request, please ask before proceeding.
- Never look at node_module files.

# Playwright specific instructions

- Use C:\Users\CameranPullan\src\Audacia.Olympus.TestAutomation\playwright as a reference to inform folder structure, architecture and coding standards
- Use the page object model to define and abstract user actions
- Selectors should be in the page objects, not the tests themselves
- Abstract region specific behaviours from tests. Assertions should be driven by regional config and injected into tests
- Do not use regex for element matches
- If tests fail do not serve up the html report after running tests, I will run the command myself if I need the report.
- Never use a wait with an explicit duration, always use implicit waits where possible
- When new pages in a user flow are navigated to, then actions and selectors on these pages should be split into their own files rather than in the initial page file.
- When writing new tests and verifying they work, do not run all tests.
- When fixing specific tests and test files and verifying they work, do not run all tests. You can run across all regions to verify no regression issues have been introduced.
- After writing/fixing a test, remove all debug code and console logs from the test file that do not contain a step.

# Project specific instructions

- DO NOT modify any files in Audacia.Olympus.TestAutomation
- Remove console logs from tests and pages
