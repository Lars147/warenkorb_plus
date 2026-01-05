# 🛒 Warenkorb+

Eine Chrome Extension, die deine Cookidoo-Einkaufsliste direkt in Knuspr / Rewe nutzbar macht.

## ✨ Features

- **Export von Cookidoo**: Ein Klick exportiert deine gesamte Einkaufsliste
- **Sidebar auf Knuspr / Rewe**: Zeigt deine Zutaten als praktische Checkliste
- **Schritt-für-Schritt**: Gehe jede Zutat einzeln durch
- **Automatische Suche**: Klicke auf eine Zutat → der Shop sucht automatisch
- **Abhaken**: Markiere erledigte Zutaten

## 📦 Installation

### Schritt 1: Extension laden

1. Öffne Chrome und gehe zu `chrome://extensions/`
2. Aktiviere oben rechts den **Entwicklermodus**
3. Klicke auf **"Entpackte Erweiterung laden"**
4. Wähle den Ordner `warenkorb` aus

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

### v1.0.0
- Initiale Version
- Export von Cookidoo
- Sidebar auf Knuspr & Rewe
- Abhaken & Suchen

## 🤝 Beitragen

Pull Requests willkommen! Bei Problemen bitte ein Issue erstellen.

## 📜 Lizenz

MIT License - Frei verwendbar
