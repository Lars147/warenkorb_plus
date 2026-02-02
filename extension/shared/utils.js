// shared/utils.js
// Utility functions shared across all scripts

(function() {
  'use strict';

  window.GroceryUtils = {
    // Generate a unique ID for items
    generateId: function() {
      return 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },

    // Escape HTML to prevent XSS
    escapeHtml: function(text) {
      var div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    },

    // Wait for an element to appear in the DOM
    waitForElement: function(selector, timeout) {
      timeout = timeout || 15000;
      return new Promise(function(resolve) {
        var el = document.querySelector(selector);
        if (el) return resolve(el);

        var observer = new MutationObserver(function() {
          var found = document.querySelector(selector);
          if (found) {
            observer.disconnect();
            resolve(found);
          }
        });

        observer.observe(document.documentElement, { childList: true, subtree: true });
        setTimeout(function() {
          observer.disconnect();
          resolve(null);
        }, timeout);
      });
    },

    // Show a toast notification
    showNotification: function(message, type, duration) {
      type = type || 'info';
      duration = duration || (type === 'error' ? 6000 : 4000);

      // Remove old notifications
      document.querySelectorAll('.grocery-notification').forEach(function(n) { n.remove(); });

      var icons = {
        success: '\u2713',
        warning: '\u26A0',
        info: '\u2139',
        error: '\u2717'
      };

      var notification = document.createElement('div');
      notification.className = 'grocery-notification grocery-notification--' + type;
      notification.innerHTML =
        '<span class="grocery-notification__icon">' + (icons[type] || icons.info) + '</span>' +
        '<span class="grocery-notification__text">' + this.escapeHtml(message) + '</span>';

      document.body.appendChild(notification);

      // Animation
      setTimeout(function() { notification.classList.add('grocery-notification--visible'); }, 10);
      setTimeout(function() {
        notification.classList.remove('grocery-notification--visible');
        setTimeout(function() { notification.remove(); }, 300);
      }, duration);
    },

    // Show user-friendly error notification with German messages
    showError: function(errorType) {
      var messages = {
        'save': 'Speichern fehlgeschlagen',
        'load': 'Laden fehlgeschlagen',
        'clear': 'Löschen fehlgeschlagen',
        'export': 'Export fehlgeschlagen',
        'quota': 'Speichern fehlgeschlagen'
      };
      var reasons = {
        'quota': 'Speicherplatz voll (max. 10 MB)',
        'save': 'Bitte versuche es erneut',
        'load': 'Bitte versuche es erneut',
        'clear': 'Bitte versuche es erneut',
        'export': 'Bitte versuche es erneut'
      };

      var msg = messages[errorType] || 'Fehler aufgetreten';
      var hint = reasons[errorType] || 'Bitte versuche es erneut';

      this.showNotification(msg + ': ' + hint, 'error');
    },

    // Clean ingredient name for search (removes quantities, units, parentheses)
    cleanIngredientName: function(name) {
      return name
        // Remove parentheses with content like "(zuhause)", "(opt.)", "(verschiedene)"
        .replace(/\s*\([^)]*\)\s*/g, ' ')
        // Remove quantity at start like "200 g", "1 EL", "2 Stuck"
        .replace(/^\d+[\s,\.]*\d*\s*(g|kg|ml|l|EL|TL|St\u00FCck|Scheiben?|Bund|Prise|Zehe[n]?|Dose[n]?|Packung|Pkg|Becher|Glas|Gl\u00E4ser|gro\u00DFe?|kleine?|mittlere?)\s*/gi, '')
        // Trim whitespace
        .trim()
        // Replace multiple spaces
        .replace(/\s+/g, ' ');
    },

    // Get relative time string (German)
    getTimeAgo: function(date) {
      var seconds = Math.floor((new Date() - date) / 1000);

      if (seconds < 60) return 'gerade eben';
      if (seconds < 3600) return 'vor ' + Math.floor(seconds / 60) + ' Min.';
      if (seconds < 86400) return 'vor ' + Math.floor(seconds / 3600) + ' Std.';
      return 'vor ' + Math.floor(seconds / 86400) + ' Tagen';
    }
  };

})();
