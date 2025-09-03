import { defineConfig } from '@playwright/test';

export default defineConfig({
  use: {
    baseURL: 'https://en.wikipedia.org',
    locale: 'en-GB',
    trace: 'on-first-retry',
  },
  testDir: './tests',
  reporter: [['list'], ['html', { open: 'never' }]],
});
