import { defineConfig, devices } from '@playwright/test';
// Check do we need use directly dotenv or run tests with flag
// import dotenv from 'dotenv';
// dotenv.config();

export default defineConfig({
  testDir: 'tests/e2e',
  globalSetup: './playwright/global-setup', // require.resolve('./playwright/global-setup'),
  timeout: 30 * 1000,
  expect: {
    timeout: 5000,
  },
  use: {
    baseURL: 'http://localhost:3000',
    storageState: 'auth.json',
    trace: 'on-first-retry', // add to CI - 'retain-on-failure'
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],
  webServer: {
    command: 'npm run start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
