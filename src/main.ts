import { Plugin } from "obsidian";
import { CockpitView, VIEW_TYPE } from "./CockpitView";
import { CockpitSettingTab, CockpitSettings, DEFAULT_SETTINGS } from "./settings";

export default class CockpitPlugin extends Plugin {
  settings: CockpitSettings = DEFAULT_SETTINGS;

  async onload(): Promise<void> {
    await this.loadSettings();

    this.registerView(VIEW_TYPE, (leaf) => new CockpitView(leaf, this));

    this.addRibbonIcon("layout-dashboard", "Open cockpit", () => {
      void this.activateCockpitView();
    });

    this.addCommand({
      id: "open-cockpit",
      name: "Open cockpit dashboard",
      callback: () => {
        void this.activateCockpitView();
      },
    });

    this.addSettingTab(new CockpitSettingTab(this.app, this));

    this.app.workspace.onLayoutReady(() => {
      if (this.settings.openOnNewTab) {
        this.registerEvent(
          this.app.workspace.on("layout-change", () => {
            this.replaceEmptyLeavesWithCockpit();
          })
        );
      }
    });
  }

  async loadSettings(): Promise<void> {
    const saved = (await this.loadData()) as
      | (Partial<CockpitSettings> & {
          templateNewSession?: string;
          templateJournalToday?: string;
          templateNewIdea?: string;
        })
      | null;

    this.settings = {
      ...DEFAULT_SETTINGS,
      ...saved,
      sections: { ...DEFAULT_SETTINGS.sections, ...(saved?.sections ?? {}) },
      quickActions:
        saved?.quickActions ??
        (saved?.templateNewSession
          ? [
              { label: "New session", templatePath: saved.templateNewSession, prefix: "Session" },
              {
                label: "Journal today",
                templatePath:
                  saved.templateJournalToday ?? DEFAULT_SETTINGS.quickActions[1].templatePath,
                prefix: "Journal",
              },
              {
                label: "New idea",
                templatePath:
                  saved.templateNewIdea ?? DEFAULT_SETTINGS.quickActions[2].templatePath,
                prefix: "Idea",
              },
            ]
          : DEFAULT_SETTINGS.quickActions),
    };
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }

  async activateCockpitView(): Promise<void> {
    const { workspace } = this.app;

    const existingLeaves = workspace.getLeavesOfType(VIEW_TYPE);
    if (existingLeaves.length > 0) {
      void workspace.revealLeaf(existingLeaves[0]);
      return;
    }

    const leaf = workspace.getLeaf(false);
    await leaf.setViewState({ type: VIEW_TYPE, active: true });
    void workspace.revealLeaf(leaf);
  }

  private replaceEmptyLeavesWithCockpit(): void {
    const { workspace } = this.app;
    workspace.iterateAllLeaves((leaf) => {
      if (leaf.getViewState().type === "empty" && leaf.view.containerEl.isShown()) {
        void leaf.setViewState({ type: VIEW_TYPE, active: true });
      }
    });
  }
}
