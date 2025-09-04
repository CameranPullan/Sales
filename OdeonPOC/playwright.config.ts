import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'null',
  use: {
    baseURL: 'https://en.wikipedia.org',
    trace: 'on-first-retry',
  },

  projects: [
    // Wikipedia projects
    {
      name: 'gb',
      use: { 
        ...devices['Desktop Chrome'],
        baseURL: 'https://en.wikipedia.org'
      },
      testDir: './tests',
      testIgnore: '**/Odeon/**',
    },
    {
      name: 'spain',
      use: { 
        ...devices['Desktop Chrome'],
        baseURL: 'https://es.wikipedia.org'
      },
      testDir: './tests',
      testIgnore: '**/Odeon/**',
    },
    {
      name: 'france',
      use: { 
        ...devices['Desktop Chrome'],
        baseURL: 'https://fr.wikipedia.org'
      },
      testDir: './tests',
      testIgnore: '**/Odeon/**',
    },
    // Odeon projects
    {
      name: 'odeon-gb',
      use: { 
        ...devices['Desktop Chrome'],
        baseURL: 'https://www.odeon.co.uk'
      },
      testDir: './tests/Odeon',
    },
    {
      name: 'odeon-spain',
      use: { 
        ...devices['Desktop Chrome'],
        baseURL: 'https://www.cinesa.es'
      },
      testDir: './tests/Odeon',
    },
    {
      name: 'odeon-italy',
      use: { 
        ...devices['Desktop Chrome'],
        baseURL: 'https://ucicinemas.it'
      },
      testDir: './tests/Odeon',
    },
  ],

  webServer: undefined,
});
