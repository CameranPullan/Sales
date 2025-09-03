import { defineConfig } from '@playwright/test';

export default defineConfig({
  use: {
    baseURL: 'https://www.odeon.co.uk',
    locale: 'en-GB',
    trace: 'on-first-retry',
  },
  testDir: './tests',
  reporter: [['list'], ['html', { open: 'never' }]],
});
