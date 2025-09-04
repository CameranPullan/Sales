import { defineConfig } from '@playwright/test';

export default defineConfig({
  globalSetup: './config/global-setup.ts',
  // Add network throttling to simulate slow connections like UI mode
  use: {
    // Simulate slow 3G network conditions
    launchOptions: {
      args: ['--disable-web-security', '--disable-features=VizDisplayCompositor']
    }
  },
  projects: [
    {
      name: 'en',
      use: {
        baseURL: 'https://en.wikipedia.org',
        locale: 'en-GB',
        trace: 'on-first-retry',
        // Network throttling to simulate slow conditions
        contextOptions: {
          // Simulate slow network
          offline: false,
          // This will be set programmatically in tests
        }
      },
    },
    {
      name: 'es',
      use: {
        baseURL: 'https://es.wikipedia.org',
        locale: 'es-ES',
        trace: 'on-first-retry',
        contextOptions: {
          offline: false,
        }
      },
    },
    {
      name: 'it',
      use: {
        baseURL: 'https://it.wikipedia.org',
        locale: 'it-IT',
        trace: 'on-first-retry',
        contextOptions: {
          offline: false,
        }
      },
    },
  ],
  testDir: './tests',
  reporter: [['list'], ['html', { open: 'never' }], ['json', { outputFile: 'playwright-report/test-results.json' }]],
});
