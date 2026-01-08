// @ts-check
const playwright = require('@playwright/test');
const base = playwright.test;
const chromium = playwright.chromium;
const path = require('path');

/**
 * Helper to get extension ID from service workers
 */
async function getExtensionId(context, timeout = 10000) {
  const serviceWorkers = context.serviceWorkers();
  if (serviceWorkers.length > 0) {
    return serviceWorkers[0].url().split('/')[2];
  }

  // Wait for service worker with timeout
  const sw = await Promise.race([
    context.waitForEvent('serviceworker'),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout waiting for service worker')), timeout)
    ),
  ]);

  return sw.url().split('/')[2];
}

/**
 * Custom test fixture that launches Chrome with the Warenkorb+ extension loaded
 */
const test = base.extend({
  /**
   * Create a browser context with the extension loaded
   */
  context: async ({}, use) => {
    const extensionPath = path.resolve(__dirname, '..', 'extension');

    // Launch Chrome with the extension
    const context = await chromium.launchPersistentContext('', {
      headless: false, // Extensions require headed mode
      args: [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`,
        '--no-sandbox',
      ],
    });

    // Give the extension time to initialize
    await new Promise((r) => setTimeout(r, 1000));

    await use(context);
    await context.close();
  },

  /**
   * Get the extension's popup page
   */
  extensionPopup: async ({ context }, use) => {
    const extensionId = await getExtensionId(context);

    // Create a page for the popup
    const popupPage = await context.newPage();
    await popupPage.goto(`chrome-extension://${extensionId}/popup.html`);
    await popupPage.waitForLoadState('domcontentloaded');

    await use(popupPage);
  },

  /**
   * Get the extension ID
   */
  extensionId: async ({ context }, use) => {
    const extensionId = await getExtensionId(context);
    await use(extensionId);
  },
});

const expect = playwright.expect;

module.exports = { test, expect };
