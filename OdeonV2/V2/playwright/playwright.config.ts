import { defineConfig } from '@playwright/test';

export default defineConfig({
  projects: [
    {
      name: 'en',
      use: {
        baseURL: 'https://en.wikipedia.org',
        locale: 'en-GB',
        trace: 'on-first-retry',
      },
    },
    {
      name: 'es',
      use: {
        baseURL: 'https://es.wikipedia.org',
        locale: 'es-ES',
        trace: 'on-first-retry',
      },
    },
  ],
  testDir: './tests',
  reporter: [['list'], ['html', { open: 'never' }]],
});
