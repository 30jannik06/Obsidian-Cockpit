# Project Cockpit

An [Obsidian](https://obsidian.md) plugin that replaces the new tab with a project dashboard — all your active work at a glance.

**[Documentation & changelog](https://30jannik06.github.io/Obsidian-Cockpit/)**

## Features

- **Stats bar** — active projects, open TODOs, journal entries this week, current streak
- **Projects** — cards with status badges (Active / Paused / Done), TODO count, and last-modified time; filter by status
- **Open TODOs** — all unchecked `- [ ]` items across your projects, grouped by project; click to check off inline or jump to the line
- **Recently edited** — last files you touched, with project label and relative time; optionally point at a dedicated sessions folder
- **Pinned notes** — quick access to any vault files you pin; configure paths in settings
- **Tags overview** — top tags across your vault as clickable chips; click to search
- **Journal heatmap** — GitHub-style activity grid for the last 52 weeks with streak counter
- **Graph** — force-directed graph of links between project files; drag, zoom, pan, double-click to reset
- **Most linked** — the 7 most-referenced files in your projects folder
- **Quick actions** — fully configurable buttons to create files from templates
- All sections are individually **togglable** and **reorderable** from settings; collapse state is persisted per section

## Installation

### Community Plugin Store

Search for **Project Cockpit** in *Settings → Community Plugins*.

### Manual

1. Download `main.js`, `styles.css`, and `manifest.json` from the [latest release](../../releases/latest).
2. Copy them into `<vault>/.obsidian/plugins/project-cockpit/`.
3. Enable the plugin in *Settings → Community Plugins*.

## Configuration

Open *Settings → Project Cockpit*:

| Setting | Default | Description |
|---|---|---|
| Projects folder | `01_Projekte/` | Root folder scanned for project subfolders and hub files |
| Sessions folder | *(empty)* | Override folder for "Recently edited" — leave empty to scan projects folder |
| Journal folder | `04_Journal/` | Folder of daily notes for the heatmap |
| Quick actions | 3 defaults | Configurable label, template path, and filename prefix per button |
| Pinned notes | *(empty)* | List of vault-relative paths to always-accessible notes |
| Sections | all on | Toggle and reorder each section independently |
| Open on new tab | on | Replace empty new tabs with the cockpit view |

### Project structure

Each project is a **subfolder** inside your projects folder. The hub file is a sibling `.md` with the same name as the folder:

```
01_Projekte/
  My-Project/             ← session and note files
    Session-2026-04-17.md
    notes.md
  My-Project.md           ← hub file (frontmatter: status: active)
```

Supported status values: `active` / `aktiv`, `paused` / `pause`, `done` / `abgeschlossen`.

## Development

```bash
pnpm install
pnpm dev        # watch mode
pnpm build      # production build
pnpm typecheck  # TypeScript
pnpm lint       # ESLint
```

The plugin folder is symlinked into a local Obsidian vault for live testing.

## License

MIT
