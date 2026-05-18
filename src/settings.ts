import { App, PluginSettingTab, Setting } from "obsidian";
import type CockpitPlugin from "./main";
import { CockpitView, VIEW_TYPE } from "./CockpitView";

export interface QuickAction {
  label: string;
  templatePath: string;
  prefix: string;
}

export interface CockpitSettings {
  projectsFolder: string;
  journalFolder: string;
  openOnNewTab: boolean;
  quickActions: QuickAction[];
  sections: {
    stats: boolean;
    projects: boolean;
    todos: boolean;
    recentSessions: boolean;
    heatmap: boolean;
    graph: boolean;
    backlinks: boolean;
  };
}

export const DEFAULT_SETTINGS: CockpitSettings = {
  projectsFolder: "01_Projekte/",
  journalFolder: "04_Journal/",
  openOnNewTab: true,
  quickActions: [
    { label: "New session", templatePath: "05_Templates/Projekt-Session.md", prefix: "Session" },
    { label: "Journal today", templatePath: "05_Templates/Journal.md", prefix: "Journal" },
    { label: "New idea", templatePath: "05_Templates/Idee.md", prefix: "Idea" },
  ],
  sections: {
    stats: true,
    projects: true,
    todos: true,
    recentSessions: true,
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

    new Setting(containerEl).setName("Visible sections").setHeading();

    const sectionDefs: {
      key: keyof CockpitSettings["sections"];
      name: string;
      desc: string;
    }[] = [
      { key: "stats", name: "Stats bar", desc: "Active projects, open todos, journal streak" },
      { key: "projects", name: "Projects", desc: "Project status grid" },
      { key: "todos", name: "Open todos", desc: "Open task items across project notes" },
      {
        key: "recentSessions",
        name: "Recently edited",
        desc: "Most recently modified notes in the projects folder",
      },
      { key: "heatmap", name: "Journal heatmap", desc: "Activity heatmap for journal entries" },
      { key: "graph", name: "Graph", desc: "Mini graph of connected notes" },
      { key: "backlinks", name: "Most linked", desc: "Notes with the most incoming links" },
    ];

    for (const { key, name, desc } of sectionDefs) {
      new Setting(containerEl)
        .setName(name)
        .setDesc(desc)
        .addToggle((toggle) =>
          toggle.setValue(this.plugin.settings.sections[key]).onChange(async (value) => {
            this.plugin.settings.sections[key] = value;
            await this.plugin.saveSettings();
            this.refreshCockpit();
          })
        );
    }

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
}
