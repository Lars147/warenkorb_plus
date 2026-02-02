// @ts-check
const { defineConfig } = require('@playwright/test');
const path = require('path');

/**
 * Playwright configuration for testing Warenkorb+ Chrome extension
 * @see https://playwright.dev/docs/test-configuration
 */
module.exports = defineConfig({
  testDir: './tests',

  // Run test files in parallel
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry on failure
  retries: 1,

  workers: 4,

  // Reporter to use
  reporter: 'html',

  // Shared settings for all the projects below
  use: {
    // Base URL for navigation
    baseURL: 'https://www.knuspr.de',

    // Collect trace when retrying the failed test
    trace: 'on-first-retry',

    // Screenshot on failure
    screenshot: 'only-on-failure',
  },

  // Configure projects for major browsers
  projects: [
    {
      name: 'chromium-extension',
      use: {
        // Chrome extension testing requires headed mode with a persistent context
        // We'll handle this in the test fixtures
      },
    },
  ],

  // Timeout for each test
  timeout: 60000,

  // Timeout for expect assertions
  expect: {
    timeout: 10000,
  },
});
