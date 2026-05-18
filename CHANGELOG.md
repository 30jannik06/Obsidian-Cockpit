# Changelog

All notable changes to Project Cockpit are documented here.
Format based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [0.1.7] — 2026-05-18

### Added
- Quick actions are now fully configurable — set label, template path, and filename prefix per button
- Add and remove quick action buttons from settings
- Seven dashboard sections can each be toggled on or off independently
- Settings changes instantly re-render the open cockpit view without reopening
- Automatic migration of legacy `templateNewSession` / `templateJournalToday` / `templateNewIdea` fields to the new `quickActions` array

## [0.1.6] — 2026-05-18

### Fixed
- Release CI now uses `pnpm install --frozen-lockfile` for reproducible builds
- Node.js version pinned via `.node-version` file (20.19.0) to prevent minor-version drift between builds

## [0.1.5] — 2026-05-15

### Fixed
- Forced `fast-uri >= 3.1.2` via `pnpm.overrides` to resolve a transitive vulnerability in `eslint-plugin-obsidianmd`

## [0.1.4] — 2026-05-15

### Fixed
- Replaced `activeWindow` timer calls with `window` to satisfy Obsidian's API linter
- Removed duplicate CSS selector that caused a build warning
- Synced lockfile with Obsidian 1.12.3 peer dependency pin

## [0.1.3] — 2026-05-15

### Changed
- Replaced `lint-staged` with `nano-staged` for faster pre-commit hooks
- Added GitHub artifact attestations for `main.js` and `styles.css` in the release workflow
- Resolved all remaining Obsidian Community Plugin marketplace ESLint violations

## [0.1.2] — 2026-04-20

### Fixed
- Renamed plugin ID from `obsidian-cockpit` to `project-cockpit` to meet Obsidian marketplace naming requirements

## [0.1.1] — 2026-04-20

### Fixed
- Hub file detection now correctly handles sibling-file vault structures where the hub `.md` sits next to the project subfolder rather than inside it

## [0.1.0] — 2026-04-17

### Added
- ProjectsGrid — project cards with status filter (Active / Paused / Done) and TODO count badges
- TodoList — open TODOs grouped by project with inline checkoff via `vault.process()`
- RecentSessions — recently modified files with project name and timestamp
- JournalHeatmap — GitHub-style activity grid for the last 52 weeks with streak counter
- MiniGraph — force-directed graph of project links with zoom, pan, and drag
- StatsBar — at-a-glance numbers: active projects, open TODOs, journal entries this week, streak
- BacklinksPanel — top 7 most linked files within the projects folder
- Quick actions — one-click buttons to create new session, journal, or idea from templates
- Collapsible sections with per-section collapse state persisted in `localStorage`
- Settings tab for folder paths and template configuration
- Auto-replaces empty new tabs with the cockpit view (configurable)
- Full React 18 UI with error boundaries per section
- ESLint (`eslint-plugin-obsidianmd`) + Prettier setup with pre-commit hooks
