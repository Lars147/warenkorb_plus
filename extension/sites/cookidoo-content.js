// sites/cookidoo-content.js
// Extracts shopping list from Cookidoo

(function() {
  'use strict';

  function init() {
    console.log('[Grocery Extension] Geladen auf Cookidoo');
    createExportButton();
    observeListChanges();
  }

  // Get shopping list from DOM
  function getShoppingList() {
    var items = [];
    var grouped = new Map();

    // Recipe ingredients from both tabs
    document
      .querySelectorAll('#byCategory .pm-check-group__list-item, #byRecipe .pm-check-group__list-item')
      .forEach(function(item) {
        var checkbox =
          item.querySelector('core-checkbox[data-type="ingredient"]') ||
          item.querySelector('core-checkbox');
        if (!checkbox || isCheckboxChecked(checkbox)) return;

        var nameEl =
          item.querySelector('.pm-check-group__name[data-type="ingredientNotation"]') ||
          item.querySelector('.pm-check-group__name');
        if (!nameEl) return;

        var rawName = nameEl.textContent.trim();
        if (!rawName) return;

        var amount = extractAmount(item);
        addIngredient(grouped, rawName, amount);
      });

    // Additional items ("Weitere Einkaufe")
    document
      .querySelectorAll('pm-additional-items-list core-checkbox[data-name]')
      .forEach(function(checkbox) {
        if (isCheckboxChecked(checkbox)) return;

        var rawName = (checkbox.dataset.name || '').trim();
        if (!rawName) return;

        addIngredient(grouped, rawName, '');
      });

    grouped.forEach(function(entry) {
      items.push({
        id: GroceryUtils.generateId(),
        name: GroceryUtils.cleanIngredientName(entry.rawName),
        originalName: formatOriginalName(entry.rawName, entry.amounts),
        checked: false
      });
    });

    return items;
  }

  // Check if checkbox is checked
  function isCheckboxChecked(checkbox) {
    var input = checkbox.querySelector('input[type="checkbox"]');
    if (input) return input.checked;

    var aria = checkbox.getAttribute('aria-checked');
    if (aria === 'true') return true;
    if (aria === 'false') return false;

    if (checkbox.dataset && checkbox.dataset.isOwned === 'true') return true;
    if (checkbox.dataset && checkbox.dataset.isOwned === 'false') return false;

    return false;
  }

  // Extract amount from list item
  function extractAmount(item) {
    var amountEl = item.querySelector('.pm-check-group__amount');
    if (!amountEl) return '';

    var valueEl = amountEl.querySelector('[data-type="value"]');
    var unitEl = amountEl.querySelector('[data-type="unitNotation"]');
    var value = valueEl ? valueEl.textContent.trim() : '';
    var unit = unitEl ? unitEl.textContent.trim() : '';

    var amount = value || unit ? value + unit : amountEl.textContent;
    amount = amount.replace(/\s+/g, ' ').trim();

    return amount;
  }

  // Add ingredient to grouped map
  function addIngredient(grouped, rawName, amount) {
    var cleaned = GroceryUtils.cleanIngredientName(rawName);
    if (!cleaned) return;

    var key = cleaned.toLowerCase();
    var entry = grouped.get(key);
    if (!entry) {
      entry = { rawName: rawName.trim(), amounts: new Set() };
      grouped.set(key, entry);
    }

    if (amount) {
      entry.amounts.add(amount);
    }
  }

  // Format display name with amounts
  function formatOriginalName(rawName, amounts) {
    if (!amounts || amounts.size === 0) return rawName;
    return rawName + ' (' + Array.from(amounts).join(', ') + ')';
  }

  // Create export button
  function createExportButton() {
    if (document.getElementById('grocery-export-btn')) return;

    var button = document.createElement('button');
    button.id = 'grocery-export-btn';
    button.className = 'grocery-export-btn';

    // Get selected site name for button text
    GroceryStorage.getSelectedSite(function(siteId) {
      var siteName = window.GrocerySites[siteId]?.name || 'Grocery';
      button.innerHTML =
        '<span class="grocery-export-btn__icon">\uD83D\uDED2</span>' +
        '<span class="grocery-export-btn__text">Zu ' + siteName + ' exportieren</span>';
    });

    button.addEventListener('click', handleExport);

    // Insert button into page
    var targetContainer =
      document.querySelector('.pm-options-container') ||
      document.querySelector('.pm-shopping-list__content') ||
      document.querySelector('.pm-shopping-list');

    if (targetContainer) {
      targetContainer.insertBefore(button, targetContainer.firstChild);
    } else {
      button.classList.add('grocery-export-btn--fixed');
      document.body.appendChild(button);
    }
  }

  // Handle export button click
  function handleExport() {
    var items = getShoppingList();

    if (items.length === 0) {
      GroceryUtils.showNotification('Keine Zutaten gefunden! Fuge erst Rezepte zu deiner Einkaufsliste hinzu.', 'warning');
      return;
    }

    GroceryStorage.saveShoppingList(items, function() {
      GroceryStorage.getSelectedSite(function(siteId) {
        var site = window.GrocerySites[siteId];
        var siteName = site?.name || 'Grocery';
        GroceryUtils.showNotification(items.length + ' Zutaten exportiert! Offne jetzt ' + siteName, 'success');

        // Offer to open target site
        setTimeout(function() {
          if (site && confirm('Mochtest du ' + siteName + ' jetzt offnen?')) {
            window.open(site.homeUrl, '_blank');
          }
        }, 1000);
      });
    });
  }

  // Observe list changes
  function observeListChanges() {
    var observer = new MutationObserver(function(mutations) {
      // Could auto-update on changes if needed
    });

    var listContainer = document.querySelector('.pm-shopping-list__content');
    if (listContainer) {
      observer.observe(listContainer, { childList: true, subtree: true });
    }
  }

  // Start when DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Fallback: retry after 2 seconds (for dynamic loading)
  setTimeout(init, 2000);

})();
