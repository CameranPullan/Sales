# Default Instructions

- Always use GB as the default locale
- Use UK english for documentations
- Use US english for code and syntax

# Playwright specific instructions

- Use the page object model to define and abstract user actions
- Selectors should be in the page objects, not the tests themselves
- Use C:\Users\CameranPullan\src\Audacia.Olympus.TestAutomation\playwright as a reference to inform architecture and coding standards
- Abstract region specific behaviours from tests. Assertions should be driven by regional config and injected into tests
- Do not use regex for element matches
- If tests fail do not serve up the html report after running tests, I will run the command myself if I need the report.
- Never use a wait with an explicit duration, always use implicit waits where possible

# Project specific instructions
- DO NOT modify any files in Audacia.Olympus.TestAutomation
- [x] Verify that the copilot-instructions.md file in the .github directory is created.
- [x] Clarify Project Requirements
- [x] Scaffold the Project
 - [x] Customize the Project
- [ ] Install Required Extensions
- [ ] Compile the Project
- [ ] Create and Run Task
- [ ] Launch the Project
- [ ] Ensure Documentation is Complete
- [ ] Ensure you tidy up once a successful test is written
- delete any intermediate files that are no longer in use
- delete any debugging files/tests used
- remove console logs from tests and pages

**Progress:**
- Playwright project scaffolded with TypeScript, example tests, and config.
- copilot-instructions.md created.
- Regionalization support added: tests now accept region parameters for selectors, language, and translations via `regions.ts` and run region-specific assertions in `example.spec.ts`.
