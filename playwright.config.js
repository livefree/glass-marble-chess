import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 120000,
  use: {
    screenshot: 'only-on-failure',
    video: 'off',
  },
});
