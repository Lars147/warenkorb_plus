// @ts-check
const { test, expect } = require('./fixtures');

/**
 * Sidebar tests require access to external grocery sites (knuspr.de, rewe.de).
 * These tests are skipped in CI/sandboxed environments without network access.
 * Run locally with: npm test -- tests/sidebar.spec.js
 */
test.describe('Sidebar on Grocery Sites', () => {
  // Skip all tests in this describe block if no network access
  test.skip(({ browserName }) => !process.env.ALLOW_EXTERNAL_NETWORK, 'Requires external network access');
  test.beforeEach(async ({ context, extensionId }) => {
    // Add test items to storage before each test
    const page = await context.newPage();
    await page.goto(`chrome-extension://${extensionId}/popup.html`);

    await page.evaluate(() => {
      const testItems = [
        { id: 'item_1', name: 'Tomaten', originalName: '500g Tomaten', checked: false },
        { id: 'item_2', name: 'Zwiebeln', originalName: '2 Zwiebeln', checked: false },
        { id: 'item_3', name: 'Knoblauch', originalName: '3 Zehen Knoblauch', checked: false },
      ];
      return new Promise((resolve) => {
        chrome.storage.local.set({
          cookidooList: testItems,
          lastUpdated: Date.now(),
          sidebarClosed: false
        }, resolve);
      });
    });

    await page.close();
  });

  test('should show toggle button on Knuspr', async ({ context }) => {
    const page = await context.newPage();
    await page.goto('https://www.knuspr.de/', { waitUntil: 'domcontentloaded' });

    // Wait for extension to inject
    await page.waitForTimeout(2000);

    // Toggle button should be visible
    const toggleBtn = page.locator('#grocery-sidebar-toggle');
    await expect(toggleBtn).toBeVisible({ timeout: 10000 });
  });

  test('should show toggle button on REWE', async ({ context }) => {
    const page = await context.newPage();
    await page.goto('https://www.rewe.de/', { waitUntil: 'domcontentloaded' });

    // Wait for extension to inject
    await page.waitForTimeout(2000);

    // Toggle button should be visible
    const toggleBtn = page.locator('#grocery-sidebar-toggle');
    await expect(toggleBtn).toBeVisible({ timeout: 10000 });
  });

  test('should show badge with unchecked count on Knuspr', async ({ context }) => {
    const page = await context.newPage();
    await page.goto('https://www.knuspr.de/', { waitUntil: 'domcontentloaded' });

    await page.waitForTimeout(2000);

    // Badge should show 3 (unchecked items)
    const badge = page.locator('#grocery-sidebar-toggle .grocery-toggle-badge');
    await expect(badge).toHaveText('3', { timeout: 10000 });
  });

  test('should toggle sidebar visibility', async ({ context }) => {
    const page = await context.newPage();
    await page.goto('https://www.knuspr.de/', { waitUntil: 'domcontentloaded' });

    await page.waitForTimeout(2000);

    const sidebar = page.locator('#grocery-sidebar-container');
    const toggleBtn = page.locator('#grocery-sidebar-toggle');

    // Sidebar should be visible initially (sidebarClosed: false)
    await expect(sidebar).toBeVisible({ timeout: 10000 });

    // Click to close
    await toggleBtn.click();
    await expect(sidebar).not.toBeVisible();

    // Click to open
    await toggleBtn.click();
    await expect(sidebar).toBeVisible();
  });

  test('should display items in sidebar', async ({ context }) => {
    const page = await context.newPage();
    await page.goto('https://www.knuspr.de/', { waitUntil: 'domcontentloaded' });

    await page.waitForTimeout(2000);

    // Check items are displayed
    await expect(page.locator('.grocery-item:has-text("Tomaten")')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.grocery-item:has-text("Zwiebeln")')).toBeVisible();
    await expect(page.locator('.grocery-item:has-text("Knoblauch")')).toBeVisible();
  });

  test('should show progress bar in sidebar', async ({ context }) => {
    const page = await context.newPage();
    await page.goto('https://www.knuspr.de/', { waitUntil: 'domcontentloaded' });

    await page.waitForTimeout(2000);

    // Progress bar should exist
    const progressBar = page.locator('.grocery-progress');
    await expect(progressBar).toBeVisible({ timeout: 10000 });

    // Progress text should show 0/3
    const progressText = page.locator('.grocery-progress-text');
    await expect(progressText).toContainText('0/3');
  });

  test('should check off item when clicked', async ({ context }) => {
    const page = await context.newPage();
    await page.goto('https://www.knuspr.de/', { waitUntil: 'domcontentloaded' });

    await page.waitForTimeout(2000);

    // Find Tomaten checkbox and click it
    const tomatoItem = page.locator('.grocery-item:has-text("Tomaten")');
    await tomatoItem.locator('.grocery-checkbox').click();

    // Wait for animation
    await page.waitForTimeout(500);

    // Progress should update to 1/3
    const progressText = page.locator('.grocery-progress-text');
    await expect(progressText).toContainText('1/3');

    // Badge should update to 2
    const badge = page.locator('#grocery-sidebar-toggle .grocery-toggle-badge');
    await expect(badge).toHaveText('2');
  });

  test('should have search button for each item', async ({ context }) => {
    const page = await context.newPage();
    await page.goto('https://www.knuspr.de/', { waitUntil: 'domcontentloaded' });

    await page.waitForTimeout(2000);

    // Each item should have a search button
    const searchButtons = page.locator('.grocery-search-btn');
    await expect(searchButtons).toHaveCount(3, { timeout: 10000 });
  });

  test('should have "Search next" button', async ({ context }) => {
    const page = await context.newPage();
    await page.goto('https://www.knuspr.de/', { waitUntil: 'domcontentloaded' });

    await page.waitForTimeout(2000);

    const searchNextBtn = page.locator('.grocery-search-next');
    await expect(searchNextBtn).toBeVisible({ timeout: 10000 });
  });

  test('should have add item input', async ({ context }) => {
    const page = await context.newPage();
    await page.goto('https://www.knuspr.de/', { waitUntil: 'domcontentloaded' });

    await page.waitForTimeout(2000);

    const addInput = page.locator('.grocery-add-input');
    await expect(addInput).toBeVisible({ timeout: 10000 });
    await expect(addInput).toHaveAttribute('placeholder', 'Neue Zutat hinzufügen...');
  });

  test('should add new item via input', async ({ context }) => {
    const page = await context.newPage();
    await page.goto('https://www.knuspr.de/', { waitUntil: 'domcontentloaded' });

    await page.waitForTimeout(2000);

    // Type new item
    const addInput = page.locator('.grocery-add-input');
    await addInput.fill('Paprika');
    await addInput.press('Enter');

    // Wait for item to be added
    await page.waitForTimeout(500);

    // New item should appear
    await expect(page.locator('.grocery-item:has-text("Paprika")')).toBeVisible();

    // Progress should update to 0/4
    const progressText = page.locator('.grocery-progress-text');
    await expect(progressText).toContainText('0/4');

    // Badge should show 4
    const badge = page.locator('#grocery-sidebar-toggle .grocery-toggle-badge');
    await expect(badge).toHaveText('4');
  });
});
