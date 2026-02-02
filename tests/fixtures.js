// @ts-check
const playwright = require('@playwright/test');
const base = playwright.test;
const chromium = playwright.chromium;
const path = require('path');

/**
 * Fixed extension ID derived from the public key in manifest.json
 * This matches the Chrome Web Store extension ID
 * See: https://developer.chrome.com/docs/extensions/how-to/test/end-to-end-testing#set-extension-id
 */
const EXTENSION_ID = 'kjgdjddfhgoeemlfgadcmipgfdojffbd';

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
    // Create a page for the popup
    const popupPage = await context.newPage();
    await popupPage.goto(`chrome-extension://${EXTENSION_ID}/popup.html`);
    await popupPage.waitForLoadState('domcontentloaded');

    await use(popupPage);
  },

  /**
   * Get the extension ID
   */
  extensionId: async ({}, use) => {
    await use(EXTENSION_ID);
  },
});

const expect = playwright.expect;

module.exports = { test, expect };
