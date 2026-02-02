// @ts-check
const { test, expect } = require('./fixtures');

test.describe('Sidebar on Grocery Sites', () => {
  /**
   * Helper to dismiss cookie consent popups
   */
  async function dismissCookiePopup(page) {
    // Wait for page to stabilize
    await page.waitForTimeout(1500);

    // Remove Usercentrics overlay via JavaScript (most reliable method)
    await page.evaluate(() => {
      // Remove usercentrics popup completely
      const uc = document.querySelector('#usercentrics-cmp-ui');
      if (uc) uc.remove();

      // Remove any backdrop/overlay
      const backdrop = document.querySelector('[class*="backdrop"], [class*="overlay"]');
      if (backdrop) backdrop.remove();
    });

    try {
      // Close delivery area popup if present (Knuspr)
      const closeBtn = page.locator('button[aria-label="close"]');
      if (await closeBtn.isVisible({ timeout: 1000 })) {
        await closeBtn.click();
        await page.waitForTimeout(300);
      }
    } catch {
      // No popup
    }

    // Wait for DOM to settle
    await page.waitForTimeout(300);
  }

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
    await dismissCookiePopup(page);

    // Toggle button should be visible
    const toggleBtn = page.locator('#grocery-sidebar-toggle');
    await expect(toggleBtn).toBeVisible({ timeout: 10000 });
  });

  test('should show toggle button on REWE', async ({ context }) => {
    const page = await context.newPage();
    await page.goto('https://www.rewe.de/', { waitUntil: 'domcontentloaded' });
    await dismissCookiePopup(page);

    // Toggle button should be visible
    const toggleBtn = page.locator('#grocery-sidebar-toggle');
    await expect(toggleBtn).toBeVisible({ timeout: 10000 });
  });

  test('should show badge with unchecked count on Knuspr', async ({ context }) => {
    const page = await context.newPage();
    await page.goto('https://www.knuspr.de/', { waitUntil: 'domcontentloaded' });
    await dismissCookiePopup(page);

    // Badge should show 3 (unchecked items)
    const badge = page.locator('#gs-badge');
    await expect(badge).toHaveText('3', { timeout: 10000 });
  });

  test('should toggle sidebar visibility', async ({ context }) => {
    const page = await context.newPage();
    await page.goto('https://www.knuspr.de/', { waitUntil: 'domcontentloaded' });
    await dismissCookiePopup(page);

    const sidebar = page.locator('#grocery-sidebar');
    const toggleBtn = page.locator('#grocery-sidebar-toggle');
    const closeBtn = page.locator('#gs-close');

    // Sidebar should be visible initially (sidebarClosed: false)
    await expect(sidebar).toHaveClass(/gs-sidebar--visible/, { timeout: 10000 });

    // Click close button inside sidebar to close
    await closeBtn.click();
    await page.waitForTimeout(300);
    await expect(sidebar).not.toHaveClass(/gs-sidebar--visible/);

    // Click toggle button to open (now not blocked by sidebar)
    await toggleBtn.click();
    await page.waitForTimeout(300);
    await expect(sidebar).toHaveClass(/gs-sidebar--visible/);
  });

  test('should display items in sidebar', async ({ context }) => {
    const page = await context.newPage();
    await page.goto('https://www.knuspr.de/', { waitUntil: 'domcontentloaded' });
    await dismissCookiePopup(page);

    // Check items are displayed
    await expect(page.locator('.gs-item:has-text("Tomaten")')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.gs-item:has-text("Zwiebeln")')).toBeVisible();
    await expect(page.locator('.gs-item:has-text("Knoblauch")')).toBeVisible();
  });

  test('should show progress bar in sidebar', async ({ context }) => {
    const page = await context.newPage();
    await page.goto('https://www.knuspr.de/', { waitUntil: 'domcontentloaded' });
    await dismissCookiePopup(page);

    // Progress bar should exist
    const progressBar = page.locator('.gs-sidebar__progress');
    await expect(progressBar).toBeVisible({ timeout: 10000 });

    // Progress text should show 0 / 3
    const progressText = page.locator('.gs-sidebar__progress-text');
    await expect(progressText).toContainText('0 / 3');
  });

  test('should check off item when clicked', async ({ context }) => {
    const page = await context.newPage();
    await page.goto('https://www.knuspr.de/', { waitUntil: 'domcontentloaded' });
    await dismissCookiePopup(page);

    // Find Tomaten checkbox and click it
    const tomatoItem = page.locator('.gs-item:has-text("Tomaten")');
    await tomatoItem.locator('.gs-item__check').click();

    // Wait for animation
    await page.waitForTimeout(500);

    // Progress should update to 1 / 3
    const progressText = page.locator('.gs-sidebar__progress-text');
    await expect(progressText).toContainText('1 / 3');

    // Badge should update to 2
    const badge = page.locator('#gs-badge');
    await expect(badge).toHaveText('2');
  });

  test('should have search button for each item', async ({ context }) => {
    const page = await context.newPage();
    await page.goto('https://www.knuspr.de/', { waitUntil: 'domcontentloaded' });
    await dismissCookiePopup(page);

    // Each item should have a search button
    const searchButtons = page.locator('.gs-item__search');
    await expect(searchButtons).toHaveCount(3, { timeout: 10000 });
  });

  test('should have "Search next" button', async ({ context }) => {
    const page = await context.newPage();
    await page.goto('https://www.knuspr.de/', { waitUntil: 'domcontentloaded' });
    await dismissCookiePopup(page);

    const searchNextBtn = page.locator('#gs-search-next');
    await expect(searchNextBtn).toBeVisible({ timeout: 10000 });
  });

  test('should have add item input', async ({ context }) => {
    const page = await context.newPage();
    await page.goto('https://www.knuspr.de/', { waitUntil: 'domcontentloaded' });
    await dismissCookiePopup(page);

    const addInput = page.locator('#gs-add-input');
    await expect(addInput).toBeVisible({ timeout: 10000 });
    await expect(addInput).toHaveAttribute('placeholder', 'Zutat hinzufügen...');
  });

  test('should add new item via input', async ({ context }) => {
    const page = await context.newPage();
    await page.goto('https://www.knuspr.de/', { waitUntil: 'domcontentloaded' });
    await dismissCookiePopup(page);

    // Type new item
    const addInput = page.locator('#gs-add-input');
    await addInput.fill('Paprika');
    await addInput.press('Enter');

    // Wait for item to be added
    await page.waitForTimeout(500);

    // New item should appear
    await expect(page.locator('.gs-item:has-text("Paprika")')).toBeVisible();

    // Progress should update to 0 / 4
    const progressText = page.locator('.gs-sidebar__progress-text');
    await expect(progressText).toContainText('0 / 4');

    // Badge should show 4
    const badge = page.locator('#gs-badge');
    await expect(badge).toHaveText('4');
  });
});
