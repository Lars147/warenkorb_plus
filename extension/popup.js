// popup.js

// Show popup error message
function showPopupError(message) {
  var errorEl = document.getElementById('popup-error');
  if (!errorEl) {
    errorEl = document.createElement('div');
    errorEl.id = 'popup-error';
    errorEl.className = 'popup-error';
    var container = document.querySelector('.popup-content');
    if (container) {
      container.insertBefore(errorEl, container.firstChild);
    }
  }
  errorEl.textContent = message;
  errorEl.style.display = 'block';
  setTimeout(function() { errorEl.style.display = 'none'; }, 5000);
}

document.addEventListener('DOMContentLoaded', function() {
  var siteSelect = document.getElementById('site-select');
  var groceryLink = document.getElementById('open-grocery');
  var groceryName = document.getElementById('grocery-name');

  // Load current settings
  chrome.storage.local.get(['cookidooList', 'lastUpdated', 'autoSortByUnitPrice', 'selectedSite'], function(result) {
    // Check for storage error
    if (chrome.runtime.lastError) {
      console.error('[Warenkorb] Popup load error:', chrome.runtime.lastError.message);
      showPopupError('Einstellungen konnten nicht geladen werden');
      // Use defaults
      document.getElementById('auto-sort').checked = false;
      siteSelect.value = 'knuspr';
      updateGroceryLink('knuspr');
      document.getElementById('item-count').textContent = '?';
      document.getElementById('last-updated').textContent = 'Laden fehlgeschlagen';
      return;
    }

    // Auto-sort setting
    document.getElementById('auto-sort').checked = Boolean(result.autoSortByUnitPrice);

    // Selected site
    var selectedSite = result.selectedSite || 'knuspr';
    siteSelect.value = selectedSite;
    updateGroceryLink(selectedSite);

    // Item count
    var list = result.cookidooList || [];
    var unchecked = list.filter(function(i) { return !i.checked; }).length;
    document.getElementById('item-count').textContent = unchecked;

    // Last updated
    if (result.lastUpdated) {
      var date = new Date(result.lastUpdated);
      var timeAgo = getTimeAgo(date);
      document.getElementById('last-updated').textContent = 'Aktualisiert ' + timeAgo;
    } else {
      document.getElementById('last-updated').textContent = 'Noch keine Liste importiert';
    }
  });

  // Site selection change
  siteSelect.addEventListener('change', function(e) {
    var siteId = e.target.value;
    chrome.storage.local.set({ selectedSite: siteId }, function() {
      if (chrome.runtime.lastError) {
        console.error('[Warenkorb] Save site error:', chrome.runtime.lastError.message);
        showPopupError('Einstellung konnte nicht gespeichert werden');
        return;
      }
      updateGroceryLink(siteId);
    });
  });

  // Update grocery link based on selected site
  function updateGroceryLink(siteId) {
    var site = window.GrocerySites[siteId];
    if (site) {
      groceryLink.href = site.homeUrl;
      groceryName.textContent = site.name;
    }
  }

  // Clear button - show confirmation
  document.getElementById('clear-btn').addEventListener('click', function() {
    document.getElementById('clear-btn').style.display = 'none';
    document.getElementById('confirm-dialog').style.display = 'flex';
  });

  // Confirm Yes - clear the list
  document.getElementById('confirm-yes').addEventListener('click', function() {
    chrome.storage.local.remove(['cookidooList', 'lastUpdated'], function() {
      if (chrome.runtime.lastError) {
        console.error('[Warenkorb] Clear error:', chrome.runtime.lastError.message);
        showPopupError('Liste konnte nicht gelöscht werden');
        document.getElementById('confirm-dialog').style.display = 'none';
        document.getElementById('clear-btn').style.display = 'flex';
        return;
      }
      document.getElementById('item-count').textContent = '0';
      document.getElementById('last-updated').textContent = 'Liste gelöscht';
      document.getElementById('confirm-dialog').style.display = 'none';
      document.getElementById('clear-btn').style.display = 'flex';
    });
  });

  // Confirm No - cancel
  document.getElementById('confirm-no').addEventListener('click', function() {
    document.getElementById('confirm-dialog').style.display = 'none';
    document.getElementById('clear-btn').style.display = 'flex';
  });

  // Auto-sort toggle
  document.getElementById('auto-sort').addEventListener('change', function(e) {
    var checkbox = e.target;
    var newValue = checkbox.checked;
    chrome.storage.local.set({ autoSortByUnitPrice: newValue }, function() {
      if (chrome.runtime.lastError) {
        console.error('[Warenkorb] Save auto-sort error:', chrome.runtime.lastError.message);
        showPopupError('Einstellung konnte nicht gespeichert werden');
        // Revert checkbox state
        checkbox.checked = !newValue;
      }
    });
  });
});

// Relative time string (German)
function getTimeAgo(date) {
  var seconds = Math.floor((new Date() - date) / 1000);

  if (seconds < 60) return 'gerade eben';
  if (seconds < 3600) return 'vor ' + Math.floor(seconds / 60) + ' Min.';
  if (seconds < 86400) return 'vor ' + Math.floor(seconds / 3600) + ' Std.';
  return 'vor ' + Math.floor(seconds / 86400) + ' Tagen';
}
