import { App, PluginSettingTab, Setting } from "obsidian";
import type CockpitPlugin from "./main";
import { CockpitView, VIEW_TYPE } from "./CockpitView";

export type SectionKey =
  | "stats"
  | "pinnedNotes"
  | "projects"
  | "todos"
  | "recentSessions"
  | "tags"
  | "heatmap"
  | "graph"
  | "backlinks";

export const DEFAULT_SECTION_ORDER: SectionKey[] = [
  "stats",
  "projects",
  "todos",
  "recentSessions",
  "pinnedNotes",
  "tags",
  "heatmap",
  "graph",
  "backlinks",
];

const SECTION_DEFS: Record<SectionKey, { name: string; desc: string }> = {
  stats: { name: "Stats bar", desc: "Active projects, open todos, journal streak" },
  pinnedNotes: { name: "Pinned notes", desc: "Quick access to notes you pin below" },
  projects: { name: "Projects", desc: "Project status grid" },
  todos: { name: "Open todos", desc: "Open task items across project notes" },
  recentSessions: { name: "Recently edited", desc: "Most recently modified notes" },
  tags: { name: "Tags overview", desc: "Most-used tags with search links" },
  heatmap: { name: "Journal heatmap", desc: "Activity heatmap for journal entries" },
  graph: { name: "Graph", desc: "Mini graph of connected notes" },
  backlinks: { name: "Most linked", desc: "Notes with the most incoming links" },
};

export interface QuickAction {
  label: string;
  templatePath: string;
  prefix: string;
}

export interface CockpitSettings {
  projectsFolder: string;
  sessionsFolder: string;
  journalFolder: string;
  openOnNewTab: boolean;
  quickActions: QuickAction[];
  pinnedNotes: string[];
  sectionOrder: SectionKey[];
  sections: {
    stats: boolean;
    pinnedNotes: boolean;
    projects: boolean;
    todos: boolean;
    recentSessions: boolean;
    tags: boolean;
    heatmap: boolean;
    graph: boolean;
    backlinks: boolean;
  };
}

export const DEFAULT_SETTINGS: CockpitSettings = {
  projectsFolder: "01_Projekte/",
  sessionsFolder: "",
  journalFolder: "04_Journal/",
  openOnNewTab: true,
  quickActions: [
    { label: "New session", templatePath: "05_Templates/Projekt-Session.md", prefix: "Session" },
    { label: "Journal today", templatePath: "05_Templates/Journal.md", prefix: "Journal" },
    { label: "New idea", templatePath: "05_Templates/Idee.md", prefix: "Idea" },
  ],
  pinnedNotes: [],
  sectionOrder: [...DEFAULT_SECTION_ORDER],
  sections: {
    stats: true,
    pinnedNotes: false,
    projects: true,
    todos: true,
    recentSessions: true,
    tags: false,
    heatmap: true,
    graph: true,
    backlinks: true,
  },
};

export class CockpitSettingTab extends PluginSettingTab {
  plugin: CockpitPlugin;

  constructor(app: App, plugin: CockpitPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  private refreshCockpit(): void {
    for (const leaf of this.app.workspace.getLeavesOfType(VIEW_TYPE)) {
      (leaf.view as CockpitView).refresh();
    }
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    new Setting(containerEl).setName("Folders").setHeading();

    new Setting(containerEl)
      .setName("Projects folder")
      .setDesc("Folder containing your project files")
      .addText((text) =>
        text
          .setPlaceholder("01_projekte/")
          .setValue(this.plugin.settings.projectsFolder)
          .onChange(async (value) => {
            this.plugin.settings.projectsFolder = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Sessions folder")
      .setDesc("Override folder for recently edited — leave empty to scan the projects folder")
      .addText((text) =>
        text
          .setPlaceholder("05_sessions/")
          .setValue(this.plugin.settings.sessionsFolder)
          .onChange(async (value) => {
            this.plugin.settings.sessionsFolder = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Journal folder")
      .setDesc("Folder containing your daily journal entries")
      .addText((text) =>
        text
          .setPlaceholder("04_journal/")
          .setValue(this.plugin.settings.journalFolder)
          .onChange(async (value) => {
            this.plugin.settings.journalFolder = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl).setName("Quick actions").setHeading();

    const actionsContainer = containerEl.createDiv();
    this.renderActions(actionsContainer);

    new Setting(containerEl).setName("Pinned notes").setHeading();

    const pinnedContainer = containerEl.createDiv();
    this.renderPinnedNotes(pinnedContainer);

    new Setting(containerEl).setName("Sections").setHeading();

    const sectionsContainer = containerEl.createDiv();
    this.renderSectionOrder(sectionsContainer);

    new Setting(containerEl).setName("Behavior").setHeading();

    new Setting(containerEl)
      .setName("Open cockpit on new tab")
      .setDesc("Automatically replace empty new tabs with the cockpit view")
      .addToggle((toggle) =>
        toggle.setValue(this.plugin.settings.openOnNewTab).onChange(async (value) => {
          this.plugin.settings.openOnNewTab = value;
          await this.plugin.saveSettings();
        })
      );
  }

  private renderActions(container: HTMLElement): void {
    container.empty();

    this.plugin.settings.quickActions.forEach((action, i) => {
      new Setting(container)
        .setName(`Action ${i + 1}`)
        .setHeading()
        .addExtraButton((btn) =>
          btn
            .setIcon("trash")
            .setTooltip("Remove action")
            .onClick(async () => {
              this.plugin.settings.quickActions.splice(i, 1);
              await this.plugin.saveSettings();
              this.refreshCockpit();
              this.renderActions(container);
            })
        );

      new Setting(container)
        .setName("Label")
        .setDesc("Button text shown on the dashboard")
        .addText((text) =>
          text.setValue(action.label).onChange(async (value) => {
            this.plugin.settings.quickActions[i].label = value;
            await this.plugin.saveSettings();
            this.refreshCockpit();
          })
        );

      new Setting(container)
        .setName("Template path")
        .setDesc("Vault-relative path to the template file (optional)")
        .addText((text) =>
          text
            .setPlaceholder("05_Templates/my-template.md")
            .setValue(action.templatePath)
            .onChange(async (value) => {
              this.plugin.settings.quickActions[i].templatePath = value;
              await this.plugin.saveSettings();
            })
        );

      new Setting(container)
        .setName("File prefix")
        .setDesc("Prefix for the filename, e.g. 'session-2026-05-18.md'")
        .addText((text) =>
          text
            .setPlaceholder("Note")
            .setValue(action.prefix)
            .onChange(async (value) => {
              this.plugin.settings.quickActions[i].prefix = value;
              await this.plugin.saveSettings();
            })
        );
    });

    new Setting(container).addButton((btn) =>
      btn.setButtonText("Add action").onClick(async () => {
        this.plugin.settings.quickActions.push({
          label: "New action",
          templatePath: "",
          prefix: "Note",
        });
        await this.plugin.saveSettings();
        this.refreshCockpit();
        this.renderActions(container);
      })
    );
  }

  private renderPinnedNotes(container: HTMLElement): void {
    container.empty();

    this.plugin.settings.pinnedNotes.forEach((path, i) => {
      new Setting(container).setName(path).addExtraButton((btn) =>
        btn
          .setIcon("trash")
          .setTooltip("Remove")
          .onClick(async () => {
            this.plugin.settings.pinnedNotes.splice(i, 1);
            await this.plugin.saveSettings();
            this.refreshCockpit();
            this.renderPinnedNotes(container);
          })
      );
    });

    let newPath = "";
    new Setting(container)
      .setName("Add note")
      .setDesc("Vault-relative path to the note")
      .addText((text) =>
        text.setPlaceholder("path/to/note.md").onChange((v) => {
          newPath = v;
        })
      )
      .addButton((btn) =>
        btn.setButtonText("Add").onClick(async () => {
          const trimmed = newPath.trim();
          if (!trimmed) return;
          this.plugin.settings.pinnedNotes.push(trimmed);
          await this.plugin.saveSettings();
          this.refreshCockpit();
          this.renderPinnedNotes(container);
        })
      );
  }

  private renderSectionOrder(container: HTMLElement): void {
    container.empty();

    const order = this.plugin.settings.sectionOrder;

    order.forEach((key, i) => {
      const def = SECTION_DEFS[key];
      new Setting(container)
        .setName(def.name)
        .setDesc(def.desc)
        .addExtraButton((btn) =>
          btn
            .setIcon("chevron-up")
            .setTooltip("Move up")
            .onClick(async () => {
              if (i === 0) return;
              [order[i - 1], order[i]] = [order[i], order[i - 1]];
              await this.plugin.saveSettings();
              this.refreshCockpit();
              this.renderSectionOrder(container);
            })
        )
        .addExtraButton((btn) =>
          btn
            .setIcon("chevron-down")
            .setTooltip("Move down")
            .onClick(async () => {
              if (i === order.length - 1) return;
              [order[i], order[i + 1]] = [order[i + 1], order[i]];
              await this.plugin.saveSettings();
              this.refreshCockpit();
              this.renderSectionOrder(container);
            })
        )
        .addToggle((toggle) =>
          toggle.setValue(this.plugin.settings.sections[key]).onChange(async (value) => {
            this.plugin.settings.sections[key] = value;
            await this.plugin.saveSettings();
            this.refreshCockpit();
          })
        );
    });
  }
}
