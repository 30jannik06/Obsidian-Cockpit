import React from "react";
import { App, TFile } from "obsidian";
import type CockpitPlugin from "../main";
import { ProjectsGrid } from "./ProjectsGrid";
import { TodoList } from "./TodoList";
import { JournalHeatmap } from "./JournalHeatmap";
import { RecentSessions } from "./RecentSessions";
import { MiniGraph } from "./MiniGraph";
import { StatsBar } from "./StatsBar";
import { BacklinksPanel } from "./BacklinksPanel";
import { CollapsibleSection } from "./CollapsibleSection";
import { ErrorBoundary } from "./ErrorBoundary";

interface CockpitProps {
  app: App;
  plugin: CockpitPlugin;
}

export function Cockpit({ app, plugin }: CockpitProps) {
  const today = new Date().toISOString().slice(0, 10);
  const { sections, quickActions } = plugin.settings;

  async function createFromTemplate(templatePath: string, prefix: string): Promise<void> {
    const newPath = prefix + "-" + today + ".md";
    const existing = app.vault.getAbstractFileByPath(newPath);
    if (existing instanceof TFile) {
      void app.workspace.openLinkText(existing.path, "", false);
      return;
    }
    const templateFile = app.vault.getAbstractFileByPath(templatePath);
    let content = "";
    if (templateFile instanceof TFile) content = await app.vault.cachedRead(templateFile);
    content = content.replace(/{{date}}/g, today).replace(/{{title}}/g, prefix + " " + today);
    const newFile = await app.vault.create(newPath, content);
    void app.workspace.openLinkText(newFile.path, "", false);
  }

  return (
    <div className="cockpit-root">
      <header className="cockpit-header">
        <h1 className="cockpit-title">Cockpit</h1>
        <span className="cockpit-date">{today}</span>
      </header>

      {sections.stats && (
        <ErrorBoundary label="stats">
          <StatsBar app={app} plugin={plugin} />
        </ErrorBoundary>
      )}

      {quickActions.length > 0 && (
        <div className="cockpit-quick-actions">
          {quickActions.map((action) => (
            <button
              key={action.label + action.prefix}
              className="cockpit-action-btn"
              onClick={() => {
                void createFromTemplate(action.templatePath, action.prefix);
              }}
            >
              + {action.label}
            </button>
          ))}
        </div>
      )}

      <div className="cockpit-grid">
        {sections.projects && (
          <CollapsibleSection
            app={app}
            title="Projects"
            storageKey="projects"
            className="cockpit-section--wide"
          >
            <ErrorBoundary label="projects">
              <ProjectsGrid app={app} plugin={plugin} />
            </ErrorBoundary>
          </CollapsibleSection>
        )}

        {sections.todos && (
          <CollapsibleSection app={app} title="Open todos" storageKey="todos">
            <ErrorBoundary label="todos">
              <TodoList app={app} plugin={plugin} />
            </ErrorBoundary>
          </CollapsibleSection>
        )}

        {sections.recentSessions && (
          <CollapsibleSection app={app} title="Recently edited" storageKey="recent">
            <ErrorBoundary label="recent sessions">
              <RecentSessions app={app} plugin={plugin} />
            </ErrorBoundary>
          </CollapsibleSection>
        )}
      </div>

      {sections.heatmap && (
        <CollapsibleSection
          app={app}
          title="Journal activity"
          storageKey="heatmap"
          className="cockpit-section--full"
        >
          <ErrorBoundary label="journal heatmap">
            <JournalHeatmap app={app} plugin={plugin} />
          </ErrorBoundary>
        </CollapsibleSection>
      )}

      {(sections.graph || sections.backlinks) && (
        <div className="cockpit-bottom-row">
          {sections.graph && (
            <CollapsibleSection
              app={app}
              title="Graph"
              storageKey="graph"
              className="cockpit-section--grow"
            >
              <ErrorBoundary label="graph">
                <MiniGraph app={app} plugin={plugin} />
              </ErrorBoundary>
            </CollapsibleSection>
          )}

          {sections.backlinks && (
            <CollapsibleSection
              app={app}
              title="Most linked"
              storageKey="backlinks"
              className="cockpit-section--grow"
            >
              <ErrorBoundary label="backlinks">
                <BacklinksPanel app={app} plugin={plugin} />
              </ErrorBoundary>
            </CollapsibleSection>
          )}
        </div>
      )}
    </div>
  );
}
