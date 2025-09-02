import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'https://en.wikipedia.org',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'gb',
      use: { 
        ...devices['Desktop Chrome'],
        baseURL: 'https://en.wikipedia.org'
      },
    },
    {
      name: 'spain',
      use: { 
        ...devices['Desktop Chrome'],
        baseURL: 'https://es.wikipedia.org'
      },
    },
  ],

  webServer: undefined,
});
