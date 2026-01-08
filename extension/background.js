// Minimal background service worker for extension testing
// This allows Playwright to detect the extension ID

chrome.runtime.onInstalled.addListener(() => {
  console.log('[Warenkorb+] Extension installed');
});
