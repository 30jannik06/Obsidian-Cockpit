import { App, PluginSettingTab, Setting } from "obsidian";
import type CockpitPlugin from "./main";

export interface CockpitSettings {
  projectsFolder: string;
  journalFolder: string;
  templateNewSession: string;
  templateJournalToday: string;
  templateNewIdea: string;
  openOnNewTab: boolean;
}

export const DEFAULT_SETTINGS: CockpitSettings = {
  projectsFolder: "01_Projekte/",
  journalFolder: "04_Journal/",
  templateNewSession: "05_Templates/Projekt-Session.md",
  templateJournalToday: "05_Templates/Journal.md",
  templateNewIdea: "05_Templates/Idee.md",
  openOnNewTab: true,
};

export class CockpitSettingTab extends PluginSettingTab {
  plugin: CockpitPlugin;

  // eslint-disable-next-line obsidianmd/prefer-active-doc
  constructor(app: App, plugin: CockpitPlugin) {
    super(app, plugin);
    this.plugin = plugin;
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

    new Setting(containerEl).setName("Quick action templates").setHeading();

    new Setting(containerEl)
      .setName("New session template")
      // eslint-disable-next-line obsidianmd/ui/sentence-case
      .setDesc('Template for the "Neue Session" button')
      .addText((text) =>
        text
          .setPlaceholder("05_Templates/Projekt-Session.md")
          .setValue(this.plugin.settings.templateNewSession)
          .onChange(async (value) => {
            this.plugin.settings.templateNewSession = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Journal today template")
      // eslint-disable-next-line obsidianmd/ui/sentence-case
      .setDesc('Template for the "Journal heute" button')
      .addText((text) =>
        text
          .setPlaceholder("05_Templates/Journal.md")
          .setValue(this.plugin.settings.templateJournalToday)
          .onChange(async (value) => {
            this.plugin.settings.templateJournalToday = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("New idea template")
      // eslint-disable-next-line obsidianmd/ui/sentence-case
      .setDesc('Template for the "Neue Idee" button')
      .addText((text) =>
        text
          .setPlaceholder("05_Templates/Idee.md")
          .setValue(this.plugin.settings.templateNewIdea)
          .onChange(async (value) => {
            this.plugin.settings.templateNewIdea = value;
            await this.plugin.saveSettings();
          })
      );

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
}
