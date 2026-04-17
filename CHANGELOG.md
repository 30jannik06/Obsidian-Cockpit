# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-04-17

### Added

- **ProjectsGrid** — project cards with status filter (Active / Paused / Done) and todo count badges
- **TodoList** — open TODOs grouped by project with inline checkoff via `vault.process()`
- **RecentSessions** — recently modified files with project and timestamp
- **JournalHeatmap** — GitHub-style activity grid for the last 52 weeks with streak counter
- **MiniGraph** — force-directed graph of project links with zoom and pan
- **StatsBar** — at-a-glance numbers: active projects, open TODOs, journal entries this week, streak
- **BacklinksPanel** — top 7 most linked files within the projects folder
- **Quick Actions** — one-click buttons to create a new session, journal entry, or idea from templates
- Settings tab to configure folders, frontmatter keys, and template paths
- ESLint (`eslint-plugin-obsidianmd`) + Prettier setup with pre-commit hooks
