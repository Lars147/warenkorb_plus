# 🛒 Warenkorb+

[![Chrome Web Store](https://img.shields.io/badge/Chrome-Install-green?logo=googlechrome&logoColor=white)](https://chromewebstore.google.com/detail/kjgdjddfhgoeemlfgadcmipgfdojffbd)
[![Firefox Add-ons](https://img.shields.io/badge/Firefox-Install-orange?logo=firefox&logoColor=white)](https://addons.mozilla.org/de/firefox/addon/warenkorb-plus/)

Eine Browser-Extension für Chrome und Firefox, die deine Cookidoo-Einkaufsliste direkt in Knuspr / Rewe nutzbar macht.

## ✨ Features

- **Export von Cookidoo**: Ein Klick exportiert deine gesamte Einkaufsliste
- **Sidebar auf Knuspr / Rewe**: Zeigt deine Zutaten als praktische Checkliste
- **Schritt-für-Schritt**: Gehe jede Zutat einzeln durch
- **Automatische Suche**: Klicke auf eine Zutat → der Shop sucht automatisch
- **Abhaken**: Markiere erledigte Zutaten

## 📦 Installation

### Option 1: Aus dem Store installieren (empfohlen)

**Chrome:**
1. Öffne den [Chrome Web Store](https://chromewebstore.google.com/detail/kjgdjddfhgoeemlfgadcmipgfdojffbd)
2. Klicke auf **"Hinzufügen"**

**Firefox:**
1. Öffne [Firefox Add-ons](https://addons.mozilla.org/de/firefox/addon/warenkorb-plus/)
2. Klicke auf **"Zu Firefox hinzufügen"**

### Option 2: Manuell installieren (für Entwickler)

**Chrome:**
1. Öffne Chrome und gehe zu `chrome://extensions/`
2. Aktiviere oben rechts den **Entwicklermodus**
3. Klicke auf **"Entpackte Erweiterung laden"**
4. Wähle den Ordner `extension/` aus

**Firefox:**
1. Öffne Firefox und gehe zu `about:debugging#/runtime/this-firefox`
2. Klicke auf **"Temporäres Add-on laden..."**
3. Wähle die Datei `extension/manifest.json` aus

### Schritt 2: Einkaufsliste exportieren

1. Gehe zu [cookidoo.de](https://cookidoo.de/shopping/de-DE)
2. Melde dich an und öffne deine Einkaufsliste
3. Klicke auf den orangenen Button **"Zu Knuspr exportieren"**

### Schritt 3: Im Online-Supermarkt einkaufen

**Option A: Knuspr**
1. Gehe zu [knuspr.de](https://www.knuspr.de/)

**Option B: REWE**
1. Gehe zu [rewe.de](https://www.rewe.de/)

**Dann in beiden Shops:**
2. Die Sidebar erscheint automatisch mit deiner Liste
3. Klicke auf 🔍 um eine Zutat zu suchen
4. Hake erledigte Zutaten ab ✓
5. Klicke "Nächste suchen →" für die nächste Zutat

## 🎯 Workflow

```
Cookidoo                          Knuspr / REWE
┌─────────────┐                   ┌─────────────────────────┐
│             │                   │              [Sidebar]  │
│ Einkaufs-   │   "Exportieren"   │ Sucher-      □ Tomaten  │
│ liste       │ ───────────────►  │ gebnisse     ■ Käse ←   │
│             │                   │              □ Milch    │
└─────────────┘                   └─────────────────────────┘
```

## 🔧 Technische Details

- **Browser**: Chrome & Firefox
- **Manifest Version**: 3
- **Permissions**: `storage` (zum Speichern der Liste)
- **Unterstützte Seiten**:
  - `cookidoo.de/shopping/*`
  - `knuspr.de/*`
  - `rewe.de/*`

## 🐛 Troubleshooting

**Liste wird nicht angezeigt?**
- Stelle sicher, dass du auf Cookidoo die Liste exportiert hast
- Klicke auf das Extension-Icon um den Status zu prüfen

**Button auf Cookidoo nicht sichtbar?**
- Warte bis die Seite vollständig geladen ist
- Versuche die Seite neu zu laden (F5)

**Suche funktioniert nicht?**
- Knuspr: Die Extension navigiert zu `knuspr.de/suche?q=...`
- REWE: Die Extension navigiert zu `rewe.de/shop/productList?search=...`
- Der jeweilige Shop muss eingeloggt sein für volle Funktionalität

## 📝 Changelog

### v2.0.0
- Firefox Add-ons Unterstützung
- Cross-Browser Kompatibilität

### v1.0.0
- Initiale Version
- Export von Cookidoo
- Sidebar auf Knuspr & Rewe
- Abhaken & Suchen

## 🤝 Beitragen

Pull Requests willkommen! Bei Problemen bitte ein Issue erstellen.

## 📜 Lizenz

MIT License - Frei verwendbar
