// @ts-check
const { test, expect } = require('./fixtures');

test.describe('Extension Popup', () => {
  test('should display popup with correct elements', async ({ extensionPopup }) => {
    // Check header
    await expect(extensionPopup.locator('.header__title')).toHaveText('Warenkorb+');
    await expect(extensionPopup.locator('.header__subtitle')).toHaveText('Einkaufslisten-Import');

    // Check status section
    await expect(extensionPopup.locator('.status__label')).toHaveText('Zutaten in der Liste');
    await expect(extensionPopup.locator('#item-count')).toBeVisible();

    // Check settings
    await expect(extensionPopup.locator('#site-select')).toBeVisible();
    // Note: #auto-sort checkbox is hidden (CSS display:none), check the visible toggle instead
    await expect(extensionPopup.locator('.setting__toggle')).toBeVisible();

    // Check action buttons
    await expect(extensionPopup.locator('text=Cookidoo öffnen')).toBeVisible();
    await expect(extensionPopup.locator('#open-grocery')).toBeVisible();
    await expect(extensionPopup.locator('#clear-btn')).toBeVisible();
  });

  test('should show 0 items when list is empty', async ({ extensionPopup }) => {
    await expect(extensionPopup.locator('#item-count')).toHaveText('0');
    await expect(extensionPopup.locator('#last-updated')).toHaveText('Noch keine Liste importiert');
  });

  test('should have correct site options', async ({ extensionPopup }) => {
    const select = extensionPopup.locator('#site-select');
    await expect(select.locator('option[value="knuspr"]')).toHaveText('Knuspr');
    await expect(select.locator('option[value="rewe"]')).toHaveText('REWE');
  });

  test('should change grocery link when site is changed', async ({ extensionPopup }) => {
    // Initially should be Knuspr
    await expect(extensionPopup.locator('#grocery-name')).toHaveText('Knuspr');
    await expect(extensionPopup.locator('#open-grocery')).toHaveAttribute('href', 'https://www.knuspr.de/');

    // Change to REWE
    await extensionPopup.locator('#site-select').selectOption('rewe');
    await expect(extensionPopup.locator('#grocery-name')).toHaveText('REWE');
    await expect(extensionPopup.locator('#open-grocery')).toHaveAttribute('href', 'https://www.rewe.de/');
  });

  test('should toggle auto-sort setting', async ({ extensionPopup }) => {
    const checkbox = extensionPopup.locator('#auto-sort');

    // Initially unchecked
    await expect(checkbox).not.toBeChecked();

    // Toggle on
    await extensionPopup.locator('.setting__toggle').click();
    await expect(checkbox).toBeChecked();

    // Toggle off
    await extensionPopup.locator('.setting__toggle').click();
    await expect(checkbox).not.toBeChecked();
  });

  test('should show confirmation dialog when clearing list', async ({ extensionPopup }) => {
    const clearBtn = extensionPopup.locator('#clear-btn');
    const confirmDialog = extensionPopup.locator('#confirm-dialog');

    // Initially clear button visible, confirmation hidden
    await expect(clearBtn).toBeVisible();
    await expect(confirmDialog).not.toBeVisible();

    // Click clear button
    await clearBtn.click();

    // Confirmation dialog should appear
    await expect(confirmDialog).toBeVisible();
    await expect(extensionPopup.locator('.confirm-text')).toHaveText('Wirklich löschen?');
  });

  test('should cancel clear when clicking No', async ({ extensionPopup }) => {
    const clearBtn = extensionPopup.locator('#clear-btn');
    const confirmDialog = extensionPopup.locator('#confirm-dialog');

    // Show confirmation
    await clearBtn.click();
    await expect(confirmDialog).toBeVisible();

    // Click No
    await extensionPopup.locator('#confirm-no').click();

    // Confirmation should hide, clear button visible
    await expect(confirmDialog).not.toBeVisible();
    await expect(clearBtn).toBeVisible();
  });

  test('should have correct Cookidoo link', async ({ extensionPopup }) => {
    const cookidooLink = extensionPopup.locator('a:has-text("Cookidoo öffnen")');
    await expect(cookidooLink).toHaveAttribute('href', 'https://cookidoo.de/shopping/de-DE');
    await expect(cookidooLink).toHaveAttribute('target', '_blank');
  });
});
