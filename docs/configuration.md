---
title: Configuration
---

# Configuration

[← Back](index)

All settings are found under **Settings → Community Plugins → Project Cockpit**.

---

## Projects Folder

**Default:** `01_Projekte`

The root folder that contains your project subfolders. Each direct subfolder is treated as a potential project. Nested subfolders are scanned for TODOs but not shown as separate projects.

---

## Hub Frontmatter Key

**Default:** `type`

The frontmatter key used to identify the main hub file inside each project folder. Only files where this key matches the Hub Frontmatter Value are treated as project hubs.

---

## Hub Frontmatter Value

**Default:** `hub`

The value that the Hub Frontmatter Key must have. For example, with the defaults, a file with `type: hub` in its frontmatter is the hub.

---

## Journal Folder

**Default:** `04_Journal`

The folder containing your daily notes. The plugin supports two filename formats:

| Format | Example |
|---|---|
| `YYYY-MM-DD.md` | `2026-04-17.md` |
| Any filename with `datum` frontmatter | `datum: 2026-04-17` or `datum: 17.04.2026` |

---

## Template — New Session

**Default:** `05_Templates/Session.md`

Template used when clicking **+ Neue Session**. Supports `{{date}}` and `{{title}}` placeholders.

---

## Template — Journal Today

**Default:** `05_Templates/Journal.md`

Template used when clicking **+ Journal heute**. Supports `{{date}}` and `{{title}}` placeholders.

---

## Template — New Idea

**Default:** `05_Templates/Idee.md`

Template used when clicking **+ Neue Idee**. Supports `{{date}}` and `{{title}}` placeholders.

---

## Project Status Values

The status field on your hub files controls which badge is shown on the project card. Supported values:

| Status | Badge |
|---|---|
| `active` or `aktiv` | Green — Active |
| `paused` or `pause` | Yellow — Paused |
| `done` or `abgeschlossen` | Grey — Done |

See [Vault Structure](vault-structure) for a full example.
