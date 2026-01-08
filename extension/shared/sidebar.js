// shared/sidebar.js
// Reusable sidebar component for grocery sites

(function() {
  'use strict';

  var shoppingList = [];
  var sidebarVisible = false;
  var currentSite = null;

  // Undo delete support
  var deletedItems = [];
  var UNDO_TIMEOUT = 4000;
  var editingItemId = null;

  // Auto-sort state
  var autoSortByUnitPrice = false;
  var lastSortApplyUrl = '';
  var sortApplied = false;

  window.GrocerySidebar = {
    // Initialize sidebar for a specific site
    init: function(siteConfig) {
      currentSite = siteConfig;
      console.log('[Warenkorb] Sidebar geladen auf', siteConfig.name);

      // Load shopping list
      this.loadList();

      // Load auto-sort setting
      this.loadAutoSortSetting();

      // Create toggle button
      this.createToggleButton();

      // Listen for storage changes
      GroceryStorage.onChanged(function(changes) {
        if (changes.cookidooList) {
          shoppingList = changes.cookidooList.newValue || [];
          window.GrocerySidebar.refresh();
        }
        if (changes.autoSortByUnitPrice) {
          autoSortByUnitPrice = Boolean(changes.autoSortByUnitPrice.newValue);
        }
      });
    },

    // Load shopping list from storage
    loadList: function() {
      var self = this;
      GroceryStorage.loadShoppingList(function(list, lastUpdated) {
        if (list && list.length > 0) {
          shoppingList = list;
          console.log('[Warenkorb] Liste geladen:', shoppingList.length, 'Items');
          self.updateToggleButton();

          // Only auto-open if user hasn't explicitly closed it
          GroceryStorage.getSidebarClosed(function(closed) {
            if (!closed && !sidebarVisible) {
              self.show();
            }
          });
        }
      });
    },

    // Load auto-sort setting
    loadAutoSortSetting: function() {
      var self = this;
      GroceryStorage.getAutoSort(function(enabled) {
        autoSortByUnitPrice = enabled;
        if (autoSortByUnitPrice && currentSite.isSearchPage(window.location)) {
          self.ensureAutoSort();
        }
      });
    },

    // Create toggle button
    createToggleButton: function() {
      if (document.getElementById('grocery-sidebar-toggle')) return;

      var button = document.createElement('button');
      button.id = 'grocery-sidebar-toggle';
      button.className = 'gs-toggle-btn';
      button.innerHTML =
        '<span class="gs-toggle-btn__icon">\uD83D\uDCCB</span>' +
        '<span class="gs-toggle-btn__badge" id="gs-badge">0</span>';
      button.title = 'Warenkorb+';

      var self = this;
      button.addEventListener('click', function() { self.toggle(); });

      document.body.appendChild(button);
    },

    // Update toggle button badge
    updateToggleButton: function() {
      var badge = document.getElementById('gs-badge');
      if (badge) {
        var remaining = shoppingList.filter(function(i) { return !i.checked; }).length;
        badge.textContent = remaining;
        badge.style.display = remaining > 0 ? 'flex' : 'none';
      }
    },

    // Toggle sidebar visibility
    toggle: function() {
      if (sidebarVisible) {
        this.hide();
      } else {
        this.show();
      }
    },

    // Show sidebar
    show: function() {
      var existing = document.getElementById('grocery-sidebar');
      if (existing) {
        existing.classList.add('gs-sidebar--visible');
        sidebarVisible = true;
        GroceryStorage.setSidebarClosed(false);
        return;
      }

      var sidebar = document.createElement('div');
      sidebar.id = 'grocery-sidebar';
      sidebar.className = 'gs-sidebar';
      sidebar.innerHTML = this.getHTML();

      document.body.appendChild(sidebar);
      this.attachEvents();

      setTimeout(function() { sidebar.classList.add('gs-sidebar--visible'); }, 10);
      sidebarVisible = true;
      GroceryStorage.setSidebarClosed(false);
    },

    // Hide sidebar
    hide: function() {
      var sidebar = document.getElementById('grocery-sidebar');
      if (sidebar) {
        sidebar.classList.remove('gs-sidebar--visible');
        sidebarVisible = false;
        GroceryStorage.setSidebarClosed(true);
      }
    },

    // Generate sidebar HTML
    getHTML: function() {
      var uncheckedItems = shoppingList.filter(function(i) { return !i.checked; });
      var checkedItems = shoppingList.filter(function(i) { return i.checked; });
      var progress = shoppingList.length > 0
        ? Math.round((checkedItems.length / shoppingList.length) * 100)
        : 0;

      var html = '' +
        '<div class="gs-sidebar__header">' +
          '<div class="gs-sidebar__title">' +
            '<span class="gs-sidebar__logo">\uD83D\uDED2</span>' +
            '<span>Warenkorb+</span>' +
          '</div>' +
          '<button class="gs-sidebar__close" id="gs-close">\u00D7</button>' +
        '</div>' +

        '<div class="gs-sidebar__progress">' +
          '<div class="gs-sidebar__progress-bar">' +
            '<div class="gs-sidebar__progress-fill" style="width: ' + progress + '%"></div>' +
          '</div>' +
          '<span class="gs-sidebar__progress-text">' + checkedItems.length + ' / ' + shoppingList.length + '</span>' +
        '</div>' +

        '<form class="gs-sidebar__add-form" id="gs-add-form">' +
          '<input type="text" class="gs-sidebar__add-input" placeholder="Zutat hinzuf\u00FCgen..." id="gs-add-input">' +
          '<button type="submit" class="gs-sidebar__add-btn">+</button>' +
        '</form>' +

        '<div class="gs-sidebar__content">';

      if (shoppingList.length === 0) {
        html +=
          '<div class="gs-sidebar__empty">' +
            '<span class="gs-sidebar__empty-icon">\uD83D\uDCDD</span>' +
            '<p>Keine Einkaufsliste vorhanden</p>' +
            '<p class="gs-sidebar__empty-hint">Gehe zu <a href="https://cookidoo.de/shopping/de-DE" target="_blank">Cookidoo</a> und klicke "Zu ' + currentSite.name + ' exportieren"</p>' +
          '</div>';
      } else {
        html += '<ul class="gs-sidebar__list" id="gs-list">';
        for (var i = 0; i < uncheckedItems.length; i++) {
          var item = uncheckedItems[i];
          html +=
            '<li class="gs-item' + (i === 0 ? ' gs-item--active' : '') + '" data-id="' + item.id + '">' +
              '<button class="gs-item__check" data-action="check" title="Abhaken">' +
                '<span class="gs-item__checkbox"></span>' +
              '</button>' +
              '<span class="gs-item__name">' + GroceryUtils.escapeHtml(item.originalName) + '</span>' +
              '<button class="gs-item__search" data-action="search" title="Suchen">\uD83D\uDD0D</button>' +
              '<button class="gs-item__delete" data-action="delete" title="L\u00F6schen">\uD83D\uDDD1</button>' +
            '</li>';
        }
        html += '</ul>';

        if (checkedItems.length > 0) {
          html +=
            '<details class="gs-sidebar__checked">' +
              '<summary>Erledigt (' + checkedItems.length + ')</summary>' +
              '<ul class="gs-sidebar__list gs-sidebar__list--checked">';
          for (var j = 0; j < checkedItems.length; j++) {
            var checkedItem = checkedItems[j];
            html +=
              '<li class="gs-item gs-item--checked" data-id="' + checkedItem.id + '">' +
                '<button class="gs-item__check" data-action="uncheck" title="Wiederherstellen">' +
                  '<span class="gs-item__checkbox gs-item__checkbox--checked">\u2713</span>' +
                '</button>' +
                '<span class="gs-item__name">' + GroceryUtils.escapeHtml(checkedItem.originalName) + '</span>' +
                '<button class="gs-item__delete" data-action="delete" title="L\u00F6schen">\uD83D\uDDD1</button>' +
              '</li>';
          }
          html += '</ul></details>';
        }
      }

      html += '</div>';

      html +=
        '<div class="gs-undo-toast" id="gs-undo-toast" style="display: ' + (deletedItems.length > 0 ? 'flex' : 'none') + ';">' +
          '<span id="gs-undo-text">' + (deletedItems.length === 1 ? '1 gel\u00F6scht' : deletedItems.length + ' gel\u00F6scht') + '</span>' +
          '<button class="gs-undo-toast__btn" id="gs-undo-btn">R\u00FCckg\u00E4ngig</button>' +
        '</div>';

      html +=
        '<div class="gs-sidebar__footer">' +
          '<button class="gs-sidebar__btn gs-sidebar__btn--secondary" id="gs-clear">Liste leeren</button>' +
          '<button class="gs-sidebar__btn gs-sidebar__btn--primary" id="gs-search-next">N\u00E4chste suchen \u2192</button>' +
        '</div>';

      return html;
    },

    // Attach event listeners
    attachEvents: function() {
      var self = this;

      document.getElementById('gs-close')?.addEventListener('click', function() { self.hide(); });
      document.getElementById('gs-clear')?.addEventListener('click', function() { self.clearList(); });
      document.getElementById('gs-search-next')?.addEventListener('click', function() { self.searchNext(); });
      document.getElementById('gs-undo-btn')?.addEventListener('click', function() { self.undoDelete(); });

      var addForm = document.getElementById('gs-add-form');
      if (addForm) {
        addForm.addEventListener('submit', function(e) {
          e.preventDefault();
          var input = document.getElementById('gs-add-input');
          if (input) {
            self.addItem(input.value);
            input.value = '';
            input.focus();
          }
        });
      }

      var list = document.getElementById('gs-list');
      if (list) {
        list.addEventListener('click', function(e) { self.handleItemClick(e); });
      }

      var checkedList = document.querySelector('.gs-sidebar__list--checked');
      if (checkedList) {
        checkedList.addEventListener('click', function(e) { self.handleItemClick(e); });
      }
    },

    // Handle item clicks
    handleItemClick: function(e) {
      // Handle name click for inline edit
      var nameEl = e.target.closest('.gs-item__name');
      if (nameEl && !nameEl.querySelector('input')) {
        var itemEl = nameEl.closest('.gs-item');
        var itemId = itemEl?.dataset.id;
        if (itemId) {
          this.startEdit(itemId);
          return;
        }
      }

      var button = e.target.closest('[data-action]');
      if (!button) return;

      var item = button.closest('.gs-item');
      var itemId = item?.dataset.id;
      var action = button.dataset.action;

      if (!itemId) return;

      switch (action) {
        case 'check': this.checkItem(itemId); break;
        case 'uncheck': this.uncheckItem(itemId); break;
        case 'search': this.searchItem(itemId); break;
        case 'delete': this.deleteItem(itemId); break;
      }
    },

    // Check item
    checkItem: function(itemId) {
      var index = shoppingList.findIndex(function(i) { return i.id === itemId; });
      if (index !== -1) {
        shoppingList[index].checked = true;
        this.saveAndRefresh();
      }
    },

    // Uncheck item
    uncheckItem: function(itemId) {
      var index = shoppingList.findIndex(function(i) { return i.id === itemId; });
      if (index !== -1) {
        shoppingList[index].checked = false;
        this.saveAndRefresh();
      }
    },

    // Delete item with undo support
    deleteItem: function(itemId) {
      var index = shoppingList.findIndex(function(i) { return i.id === itemId; });
      if (index === -1) return;

      var item = shoppingList[index];
      shoppingList.splice(index, 1);

      var timeout = setTimeout(function() {
        deletedItems = deletedItems.filter(function(d) { return d.item.id !== item.id; });
        window.GrocerySidebar.updateUndoToast();
      }, UNDO_TIMEOUT);

      deletedItems.push({ item: item, index: index, timeout: timeout });
      this.saveAndRefresh();
      this.showUndoToast();
    },

    // Undo last delete
    undoDelete: function() {
      if (deletedItems.length === 0) return;

      var last = deletedItems.pop();
      clearTimeout(last.timeout);
      var insertIndex = Math.min(last.index, shoppingList.length);
      shoppingList.splice(insertIndex, 0, last.item);
      this.saveAndRefresh();
      this.updateUndoToast();
    },

    // Show undo toast
    showUndoToast: function() {
      var toast = document.getElementById('gs-undo-toast');
      var text = document.getElementById('gs-undo-text');
      if (!toast || !text) return;

      text.textContent = deletedItems.length === 1 ? '1 gel\u00F6scht' : deletedItems.length + ' gel\u00F6scht';
      toast.style.display = 'flex';
    },

    // Update undo toast
    updateUndoToast: function() {
      if (deletedItems.length === 0) {
        var toast = document.getElementById('gs-undo-toast');
        if (toast) toast.style.display = 'none';
      } else {
        this.showUndoToast();
      }
    },

    // Add new item
    addItem: function(name) {
      var trimmed = name.trim();
      if (!trimmed) return;

      var newItem = {
        id: GroceryUtils.generateId(),
        name: trimmed,
        originalName: trimmed,
        checked: false
      };
      shoppingList.unshift(newItem);
      this.saveAndRefresh();
    },

    // Start inline edit
    startEdit: function(itemId) {
      if (editingItemId) return;
      editingItemId = itemId;

      var itemEl = document.querySelector('.gs-item[data-id="' + itemId + '"]');
      var nameEl = itemEl?.querySelector('.gs-item__name');
      if (!nameEl) {
        editingItemId = null;
        return;
      }

      var item = shoppingList.find(function(i) { return i.id === itemId; });
      var currentName = item?.originalName || '';

      var input = document.createElement('input');
      input.type = 'text';
      input.className = 'gs-item__name-input';
      input.value = currentName;

      nameEl.innerHTML = '';
      nameEl.appendChild(input);
      input.focus();
      input.select();

      var self = this;
      var saved = false;

      var save = function() {
        if (saved) return;
        saved = true;
        editingItemId = null;
        self.saveEdit(itemId, input.value);
      };

      var cancel = function() {
        if (saved) return;
        saved = true;
        editingItemId = null;
        self.saveAndRefresh();
      };

      input.addEventListener('blur', save);
      input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') { e.preventDefault(); save(); }
        if (e.key === 'Escape') { e.preventDefault(); cancel(); }
      });
    },

    // Save edited item
    saveEdit: function(itemId, newName) {
      var index = shoppingList.findIndex(function(i) { return i.id === itemId; });
      if (index === -1) {
        this.saveAndRefresh();
        return;
      }

      var trimmed = newName.trim();
      if (trimmed) {
        shoppingList[index].name = trimmed;
        shoppingList[index].originalName = trimmed;
      }
      this.saveAndRefresh();
    },

    // Search for a specific item
    searchItem: function(itemId) {
      var item = shoppingList.find(function(i) { return i.id === itemId; });
      if (item) {
        this.performSearch(item.name);
        this.highlightItem(itemId);
      }
    },

    // Search next unchecked item
    searchNext: function() {
      var unchecked = shoppingList.filter(function(i) { return !i.checked; });
      if (unchecked.length > 0) {
        var item = unchecked[0];
        this.performSearch(item.name);
        this.highlightItem(item.id);
      }
    },

    // Perform search on current site
    performSearch: function(query) {
      if (!currentSite) return;

      sortApplied = false;
      var url = currentSite.searchUrl(query);

      // Append sort param if auto-sort enabled and site supports it
      if (autoSortByUnitPrice && currentSite.sortQueryParam) {
        url += (url.includes('?') ? '&' : '?') + currentSite.sortQueryParam;
      }

      window.location.href = url;
    },

    // Highlight an item as active
    highlightItem: function(itemId) {
      document.querySelectorAll('.gs-item').forEach(function(el) {
        el.classList.remove('gs-item--active');
      });
      var el = document.querySelector('.gs-item[data-id="' + itemId + '"]');
      if (el) el.classList.add('gs-item--active');
    },

    // Save list and refresh UI
    saveAndRefresh: function() {
      var self = this;
      GroceryStorage.saveShoppingList(shoppingList, function() {
        self.refresh();
      });
    },

    // Refresh sidebar UI
    refresh: function() {
      var sidebar = document.getElementById('grocery-sidebar');
      if (sidebar) {
        sidebar.innerHTML = this.getHTML();
        this.attachEvents();
      }
      this.updateToggleButton();
    },

    // Clear list
    clearList: function() {
      if (confirm('M\u00F6chtest du die gesamte Liste wirklich l\u00F6schen?')) {
        shoppingList = [];
        var self = this;
        GroceryStorage.clearShoppingList(function() {
          self.refresh();
        });
      }
    },

    // Auto-sort functionality
    ensureAutoSort: function() {
      var self = this;

      if (!autoSortByUnitPrice) return;
      if (sortApplied) return;
      if (lastSortApplyUrl === location.href) return;
      if (!currentSite.sortSelectors) return;

      GroceryUtils.waitForElement(currentSite.sortSelectors.container).then(function(container) {
        if (!container) return;

        var button = container.querySelector(currentSite.sortSelectors.button);
        var clickTarget = button || container;
        clickTarget.click();

        GroceryUtils.waitForElement(currentSite.sortSelectors.option, 3000).then(function(option) {
          if (option) {
            option.click();
            sortApplied = true;
            lastSortApplyUrl = location.href;
            console.log('[Warenkorb] Auto-Sort angewendet');
          }
        });
      });
    }
  };

})();
