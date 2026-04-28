## Vault Lookup                                                                                                                                                                                                          
  Bevor du neue Features, Libraries oder Projekt-Ideen vorschlägst, schau zuerst im Vault nach:                                                                                                                            
                                                                                                                                                                                                                           
  - **Ideen:** `C:\Users\j.sommer\Documents\github\ClaudeBrain\03_Ideen\` — prüfe ob eine passende Idee bereits existiert, referenziere sie mit `[[IdeenName]]` in Session-Notizen                                         
  - **Tech-Stack:** `C:\Users\j.sommer\Documents\github\ClaudeBrain\02_Lernen\Technologien\` — lies vorhandene Lernnotizen bevor du Technologien empfiehlst; erstelle eine neue Datei wenn eine neue Technologie eingesetzt
   wird
  - **Projekte:** `C:\Users\j.sommer\Documents\github\ClaudeBrain\01_Projekte\Privat\` — Hub-Dateien enthalten Status, offene TODOs und Entscheidungen zu allen Projekten

  Neue Technologien die im Projekt eingesetzt werden immer als `[[TechName]]`-Notiz in `02_Lernen/Technologien/` anlegen falls noch nicht vorhanden.

  ## Brain/Vault
  Speichere Session-Notizen immer in:
  C:\Users\j.sommer\Documents\github\ClaudeBrain\01_Projekte\Privat\Obsidian-Cockpit\

  Nutze das Template aus:
  C:\Users\j.sommer\Documents\github\ClaudeBrain\05_Templates\Projekt-Session.md

  ## Daily Note
  Erstelle beim Start falls nicht vorhanden:
  C:\Users\j.sommer\Documents\github\ClaudeBrain\04_Journal\<heutiges Datum YYYY-MM-DD>.md
  Nutze Template aus:
  C:\Users\j.sommer\Documents\github\ClaudeBrain\05_Templates\Journal.md

  ## Autostart
  Erstelle beim Start automatisch die Daily Note für heute.

  ## Obsidian Plugin Entwicklung
  - **Referenz-Projekt:** `C:\Users\j.sommer\Documents\github\ClaudeBrain\01_Projekte\Privat\Obsidian-Presence.md` — gleicher Tech-Stack, gleiche Build-Pipeline
  - **Build:** `pnpm build` via esbuild — Output ist `main.js` im Root
  - **Testen:** Plugin-Ordner ist symlinkt in den lokalen Obsidian-Vault unter `.obsidian/plugins/obsidian-cockpit/`
  - **Obsidian API:** Keine externen HTTP-Requests im Main-Thread; `app.metadataCache` für Vault-Daten nutzen statt direktem File-Parsing
  - **React:** Als UI-Layer erlaubt — per `ReactDOM.render()` in `ItemView.containerEl` mounten
  - **Release:** Tag muss exakt der Versionsnummer entsprechen (kein `v`-Prefix) — Obsidian Marketplace-Validator-Anforderung

## Graphify
Knowledge Graph ist für dieses Projekt konfiguriert.
- Graph liegt in: graphify-out/graph.json
- Nach jeder Session Graphify-Output in Vault exportieren:
  /graphify . dann Output nach C:\Users\j.sommer\Documents\github\ClaudeBrain\01_Projekte\Privat\Obsidian-Cockpit\ kopieren
- Claude Code liest graph.json automatisch vor dem Zugriff auf Dateien (PreToolUse Hook aktiv)