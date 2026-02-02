// @ts-check
const { test, expect } = require('./fixtures');

test.describe('Extension Storage', () => {
  test('should persist site selection across popup opens', async ({ context, extensionId }) => {
    // Open popup and change site
    const popup1 = await context.newPage();
    await popup1.goto(`chrome-extension://${extensionId}/popup.html`);

    await popup1.locator('#site-select').selectOption('rewe');
    await popup1.waitForTimeout(500); // Wait for storage to save

    // Close and reopen popup
    await popup1.close();

    const popup2 = await context.newPage();
    await popup2.goto(`chrome-extension://${extensionId}/popup.html`);

    // Should remember REWE selection
    await expect(popup2.locator('#site-select')).toHaveValue('rewe');
    await expect(popup2.locator('#grocery-name')).toHaveText('REWE');
  });

  test('should persist auto-sort setting', async ({ context, extensionId }) => {
    // Open popup and enable auto-sort
    const popup1 = await context.newPage();
    await popup1.goto(`chrome-extension://${extensionId}/popup.html`);

    await popup1.locator('.setting__toggle').click();
    await expect(popup1.locator('#auto-sort')).toBeChecked();
    await popup1.waitForTimeout(500);

    // Close and reopen
    await popup1.close();

    const popup2 = await context.newPage();
    await popup2.goto(`chrome-extension://${extensionId}/popup.html`);

    // Should remember auto-sort enabled
    await expect(popup2.locator('#auto-sort')).toBeChecked();
  });

  test('should update item count after storing list via evaluate', async ({ context, extensionId }) => {
    const page = await context.newPage();
    await page.goto(`chrome-extension://${extensionId}/popup.html`);

    // Initially 0 items
    await expect(page.locator('#item-count')).toHaveText('0');

    // Add items to storage directly
    await page.evaluate(() => {
      const testItems = [
        { id: 'test1', name: 'Tomaten', originalName: '500g Tomaten', checked: false },
        { id: 'test2', name: 'Zwiebeln', originalName: '2 Zwiebeln', checked: false },
        { id: 'test3', name: 'Knoblauch', originalName: '3 Zehen Knoblauch', checked: true },
      ];
      return new Promise((resolve) => {
        chrome.storage.local.set({
          cookidooList: testItems,
          lastUpdated: Date.now()
        }, resolve);
      });
    });

    // Refresh popup
    await page.reload();

    // Should show 2 unchecked items
    await expect(page.locator('#item-count')).toHaveText('2');

    // Should show relative time
    const lastUpdated = page.locator('#last-updated');
    await expect(lastUpdated).toContainText('Aktualisiert');
  });

  test('should clear list and update UI', async ({ context, extensionId }) => {
    const page = await context.newPage();
    await page.goto(`chrome-extension://${extensionId}/popup.html`);

    // Add items first
    await page.evaluate(() => {
      const testItems = [
        { id: 'test1', name: 'Tomaten', checked: false },
      ];
      return new Promise((resolve) => {
        chrome.storage.local.set({
          cookidooList: testItems,
          lastUpdated: Date.now()
        }, resolve);
      });
    });

    await page.reload();
    await expect(page.locator('#item-count')).toHaveText('1');

    // Clear list
    await page.locator('#clear-btn').click();
    await page.locator('#confirm-yes').click();

    // Should show 0 and "Liste gelöscht"
    await expect(page.locator('#item-count')).toHaveText('0');
    await expect(page.locator('#last-updated')).toHaveText('Liste gelöscht');
  });
});
