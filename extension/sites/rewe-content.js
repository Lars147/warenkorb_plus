// sites/rewe-content.js
// REWE-specific initialization

(function() {
  'use strict';

  var site = window.GrocerySites.rewe;

  function init() {
    console.log('[Grocery Extension] Geladen auf REWE');

    // Initialize sidebar with REWE config
    window.GrocerySidebar.init(site);

    // REWE-specific: auto-sort could be added here once selectors are known
    // if (site.isSearchPage(window.location) && site.sortSelectors) {
    //   window.GrocerySidebar.ensureAutoSort();
    // }

    // Watch for URL changes (SPA navigation)
    observeUrlChanges();
  }

  // Observe URL changes for SPA navigation
  function observeUrlChanges() {
    var lastUrl = location.href;

    new MutationObserver(function() {
      if (location.href !== lastUrl) {
        lastUrl = location.href;
        // Could trigger actions on URL change
      }
    }).observe(document.body, { subtree: true, childList: true });
  }

  // Start when DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
