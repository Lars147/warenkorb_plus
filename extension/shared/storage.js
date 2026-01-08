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
        var list = result.cookidooList || [];
        var lastUpdated = result.lastUpdated || null;
        callback(list, lastUpdated);
      });
    },

    // Save shopping list to storage
    saveShoppingList: function(items, callback) {
      var data = {};
      data[this.KEYS.LIST] = items;
      data[this.KEYS.LAST_UPDATED] = Date.now();
      chrome.storage.local.set(data, function() {
        console.log('[Warenkorb] Liste gespeichert:', items.length, 'Items');
        if (callback) callback();
      });
    },

    // Clear shopping list
    clearShoppingList: function(callback) {
      chrome.storage.local.remove([this.KEYS.LIST, this.KEYS.LAST_UPDATED], function() {
        console.log('[Warenkorb] Liste gelöscht');
        if (callback) callback();
      });
    },

    // Get selected grocery site
    getSelectedSite: function(callback) {
      var self = this;
      chrome.storage.local.get([this.KEYS.SELECTED_SITE], function(result) {
        // Default to knuspr if not set
        callback(result[self.KEYS.SELECTED_SITE] || 'knuspr');
      });
    },

    // Set selected grocery site
    setSelectedSite: function(siteId, callback) {
      var data = {};
      data[this.KEYS.SELECTED_SITE] = siteId;
      chrome.storage.local.set(data, function() {
        console.log('[Warenkorb] Site ausgewählt:', siteId);
        if (callback) callback();
      });
    },

    // Get auto-sort setting
    getAutoSort: function(callback) {
      var self = this;
      chrome.storage.local.get([this.KEYS.AUTO_SORT], function(result) {
        callback(Boolean(result[self.KEYS.AUTO_SORT]));
      });
    },

    // Set auto-sort setting
    setAutoSort: function(enabled, callback) {
      var data = {};
      data[this.KEYS.AUTO_SORT] = enabled;
      chrome.storage.local.set(data, function() {
        if (callback) callback();
      });
    },

    // Get sidebar closed state
    getSidebarClosed: function(callback) {
      var self = this;
      chrome.storage.local.get([this.KEYS.SIDEBAR_CLOSED], function(result) {
        callback(Boolean(result[self.KEYS.SIDEBAR_CLOSED]));
      });
    },

    // Set sidebar closed state
    setSidebarClosed: function(closed, callback) {
      var data = {};
      data[this.KEYS.SIDEBAR_CLOSED] = closed;
      chrome.storage.local.set(data, function() {
        if (callback) callback();
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
