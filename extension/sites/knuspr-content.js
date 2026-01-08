// sites/knuspr-content.js
// Knuspr-specific initialization

(function() {
  'use strict';

  var site = window.GrocerySites.knuspr;

  function init() {
    console.log('[Grocery Extension] Geladen auf Knuspr');

    // Initialize sidebar with Knuspr config
    window.GrocerySidebar.init(site);

    // Apply auto-sort on search pages
    if (site.isSearchPage(window.location)) {
      window.GrocerySidebar.ensureAutoSort();
    }

    // Watch for URL changes (SPA navigation)
    observeUrlChanges();
  }

  // Observe URL changes for SPA navigation
  function observeUrlChanges() {
    var lastUrl = location.href;

    new MutationObserver(function() {
      if (location.href !== lastUrl) {
        lastUrl = location.href;

        // Re-apply auto-sort on new search pages
        if (site.isSearchPage(window.location)) {
          window.GrocerySidebar.ensureAutoSort();
        }
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
