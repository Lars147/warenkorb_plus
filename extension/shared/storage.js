// shared/storage.js
// Chrome storage operations for the shopping list

(function() {
  'use strict';

  window.GroceryStorage = {
    // Storage keys
    KEYS: {
      LIST: 'cookidooList',
      LAST_UPDATED: 'lastUpdated',
      SELECTED_SITE: 'selectedSite',
      AUTO_SORT: 'autoSortByUnitPrice',
      SIDEBAR_CLOSED: 'sidebarClosed'
    },

    // Load shopping list from storage
    loadShoppingList: function(callback) {
      chrome.storage.local.get([this.KEYS.LIST, this.KEYS.LAST_UPDATED], function(result) {
        // Check lastError FIRST before any other operation
        if (chrome.runtime.lastError) {
          console.error('[Warenkorb] Load error:', chrome.runtime.lastError.message);
          if (callback) callback({ type: 'load', raw: chrome.runtime.lastError.message }, [], null);
          return;
        }
        var list = result.cookidooList || [];
        var lastUpdated = result.lastUpdated || null;
        callback(null, list, lastUpdated);
      });
    },

    // Save shopping list to storage
    saveShoppingList: function(items, callback) {
      var data = {};
      data[this.KEYS.LIST] = items;
      data[this.KEYS.LAST_UPDATED] = Date.now();
      chrome.storage.local.set(data, function() {
        // Check lastError FIRST before any other operation
        if (chrome.runtime.lastError) {
          var rawMsg = chrome.runtime.lastError.message;
          console.error('[Warenkorb] Save error:', rawMsg);
          var errorType = rawMsg.includes('QUOTA') ? 'quota' : 'save';
          if (callback) callback({ type: errorType, raw: rawMsg });
          return;
        }
        console.log('[Warenkorb] Liste gespeichert:', items.length, 'Items');
        if (callback) callback(null);
      });
    },

    // Clear shopping list
    clearShoppingList: function(callback) {
      chrome.storage.local.remove([this.KEYS.LIST, this.KEYS.LAST_UPDATED], function() {
        // Check lastError FIRST before any other operation
        if (chrome.runtime.lastError) {
          console.error('[Warenkorb] Clear error:', chrome.runtime.lastError.message);
          if (callback) callback({ type: 'clear', raw: chrome.runtime.lastError.message });
          return;
        }
        console.log('[Warenkorb] Liste gelöscht');
        if (callback) callback(null);
      });
    },

    // Get selected grocery site
    getSelectedSite: function(callback) {
      var self = this;
      chrome.storage.local.get([this.KEYS.SELECTED_SITE], function(result) {
        // Check lastError FIRST before any other operation
        if (chrome.runtime.lastError) {
          console.error('[Warenkorb] Get site error:', chrome.runtime.lastError.message);
          if (callback) callback(null, 'knuspr'); // Return default on error
          return;
        }
        // Default to knuspr if not set
        callback(null, result[self.KEYS.SELECTED_SITE] || 'knuspr');
      });
    },

    // Set selected grocery site
    setSelectedSite: function(siteId, callback) {
      var data = {};
      data[this.KEYS.SELECTED_SITE] = siteId;
      chrome.storage.local.set(data, function() {
        // Check lastError FIRST before any other operation
        if (chrome.runtime.lastError) {
          console.error('[Warenkorb] Set site error:', chrome.runtime.lastError.message);
          if (callback) callback({ type: 'save', raw: chrome.runtime.lastError.message });
          return;
        }
        console.log('[Warenkorb] Site ausgewählt:', siteId);
        if (callback) callback(null);
      });
    },

    // Get auto-sort setting
    getAutoSort: function(callback) {
      var self = this;
      chrome.storage.local.get([this.KEYS.AUTO_SORT], function(result) {
        // Check lastError FIRST before any other operation
        if (chrome.runtime.lastError) {
          console.error('[Warenkorb] Get auto-sort error:', chrome.runtime.lastError.message);
          if (callback) callback(null, false); // Return default on error
          return;
        }
        callback(null, Boolean(result[self.KEYS.AUTO_SORT]));
      });
    },

    // Set auto-sort setting
    setAutoSort: function(enabled, callback) {
      var data = {};
      data[this.KEYS.AUTO_SORT] = enabled;
      chrome.storage.local.set(data, function() {
        // Check lastError FIRST before any other operation
        if (chrome.runtime.lastError) {
          console.error('[Warenkorb] Set auto-sort error:', chrome.runtime.lastError.message);
          if (callback) callback({ type: 'save', raw: chrome.runtime.lastError.message });
          return;
        }
        if (callback) callback(null);
      });
    },

    // Get sidebar closed state
    getSidebarClosed: function(callback) {
      var self = this;
      chrome.storage.local.get([this.KEYS.SIDEBAR_CLOSED], function(result) {
        // Check lastError FIRST before any other operation
        if (chrome.runtime.lastError) {
          console.error('[Warenkorb] Get sidebar state error:', chrome.runtime.lastError.message);
          if (callback) callback(null, false); // Return default on error
          return;
        }
        callback(null, Boolean(result[self.KEYS.SIDEBAR_CLOSED]));
      });
    },

    // Set sidebar closed state
    setSidebarClosed: function(closed, callback) {
      var data = {};
      data[this.KEYS.SIDEBAR_CLOSED] = closed;
      chrome.storage.local.set(data, function() {
        // Check lastError FIRST before any other operation
        if (chrome.runtime.lastError) {
          console.error('[Warenkorb] Set sidebar state error:', chrome.runtime.lastError.message);
          if (callback) callback({ type: 'save', raw: chrome.runtime.lastError.message });
          return;
        }
        if (callback) callback(null);
      });
    },

    // Listen for storage changes
    onChanged: function(callback) {
      chrome.storage.onChanged.addListener(function(changes, area) {
        if (area === 'local') {
          callback(changes);
        }
      });
    }
  };

})();
