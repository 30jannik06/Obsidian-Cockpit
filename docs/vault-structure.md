---
title: Vault Structure
---

# Vault Structure

[← Back](index)

Project Cockpit expects a specific folder structure to detect projects, TODOs, and journal entries.

## Projects

Each project is a **subfolder** inside your configured projects folder. The subfolder must contain one **hub file** — a Markdown file with the configured frontmatter key/value pair.

```
01_Projekte/
  My-Project/
    My-Project.md       ← hub file (type: hub)
    Session-2026-04-17.md
    notes.md
  Another-Project/
    Another-Project.md  ← hub file (type: hub)
    ideas.md
```

### Hub File Example

```yaml
---
type: hub
title: My Project
status: active
---
# My Project

A short description of what this project is about.
```

The `title` field is shown on the project card. If omitted, the filename is used instead.

### Supported Status Values

| Frontmatter value | Shown as |
|---|---|
| `active` / `aktiv` | Active (green) |
| `paused` / `pause` | Paused (yellow) |
| `done` / `abgeschlossen` | Done (grey) |

---

## TODOs

Any unchecked `- [ ]` item in any Markdown file inside the projects folder is picked up as an open TODO. Checked items (`- [x]`) are ignored.

```markdown
- [ ] This shows up in the TODO panel
- [x] This is already done and hidden
```

TODOs are grouped by the project folder they belong to.

---

## Journal

The journal folder should contain one file per day. Two formats are supported:

**Filename-based:**
```
04_Journal/
  2026-04-17.md
  2026-04-16.md
```

**Frontmatter-based** (any filename):
```yaml
---
datum: 2026-04-17
---
```
or
```yaml
---
datum: 17.04.2026
---
```

---

## Templates

Templates are plain Markdown files. Two placeholders are replaced when creating a new file:

| Placeholder | Replaced with |
|---|---|
| `{{date}}` | Today's date in `YYYY-MM-DD` format |
| `{{title}}` | The generated file title |

```
05_Templates/
  Session.md
  Journal.md
  Idee.md
```
