// shared/config.js
// Site configurations for supported grocery stores

(function() {
  'use strict';

  window.GrocerySites = {
    knuspr: {
      id: 'knuspr',
      name: 'Knuspr',
      hostname: 'www.knuspr.de',
      homeUrl: 'https://www.knuspr.de/',
      searchUrl: function(query) {
        return 'https://www.knuspr.de/suche?q=' + encodeURIComponent(query) + '&companyId=1';
      },
      isSearchPage: function(location) {
        return location.pathname.includes('/suche');
      },
      sortSelectors: {
        container: '[data-test="sortingButton"]',
        button: '[data-test="dropdown-button"]',
        option: '[data-test-value="unit-price-asc"]'
      }
    },

    rewe: {
      id: 'rewe',
      name: 'REWE',
      hostname: 'www.rewe.de',
      homeUrl: 'https://www.rewe.de/',
      searchUrl: function(query) {
        return 'https://www.rewe.de/shop/productList?search=' + encodeURIComponent(query);
      },
      isSearchPage: function(location) {
        return location.pathname.includes('/productList') || location.search.includes('search=');
      },
      sortSelectors: null,
      sortQueryParam: 'sorting=PRICE_ASC'
    }
  };

  // Get site config by hostname
  window.GrocerySites.getByHostname = function(hostname) {
    for (var key in window.GrocerySites) {
      if (typeof window.GrocerySites[key] === 'object' && window.GrocerySites[key].hostname === hostname) {
        return window.GrocerySites[key];
      }
    }
    return null;
  };

  // Get all site IDs
  window.GrocerySites.getAllIds = function() {
    return Object.keys(window.GrocerySites).filter(function(key) {
      return typeof window.GrocerySites[key] === 'object' && window.GrocerySites[key].id;
    });
  };

})();
