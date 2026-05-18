import React from "react";
import { App, TFile } from "obsidian";
import type CockpitPlugin from "../main";
import type { SectionKey } from "../settings";
import { ProjectsGrid } from "./ProjectsGrid";
import { TodoList } from "./TodoList";
import { JournalHeatmap } from "./JournalHeatmap";
import { RecentSessions } from "./RecentSessions";
import { MiniGraph } from "./MiniGraph";
import { StatsBar } from "./StatsBar";
import { BacklinksPanel } from "./BacklinksPanel";
import { PinnedNotes } from "./PinnedNotes";
import { TagsOverview } from "./TagsOverview";
import { CollapsibleSection } from "./CollapsibleSection";
import { ErrorBoundary } from "./ErrorBoundary";

interface CockpitProps {
  app: App;
  plugin: CockpitPlugin;
}

export function Cockpit({ app, plugin }: CockpitProps) {
  const today = new Date().toISOString().slice(0, 10);
  const { sections, quickActions, sectionOrder } = plugin.settings;

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

  function renderSection(key: SectionKey): React.ReactNode {
    if (!sections[key]) return null;

    switch (key) {
      case "stats":
        return (
          <div key="stats" className="cockpit-section--span-4">
            <ErrorBoundary label="stats">
              <StatsBar app={app} plugin={plugin} />
            </ErrorBoundary>
          </div>
        );
      case "pinnedNotes":
        return (
          <CollapsibleSection
            key="pinnedNotes"
            app={app}
            title="Pinned notes"
            storageKey="pinnedNotes"
            className="cockpit-section--span-2"
          >
            <ErrorBoundary label="pinned notes">
              <PinnedNotes app={app} plugin={plugin} />
            </ErrorBoundary>
          </CollapsibleSection>
        );
      case "projects":
        return (
          <CollapsibleSection
            key="projects"
            app={app}
            title="Projects"
            storageKey="projects"
            className="cockpit-section--span-2"
          >
            <ErrorBoundary label="projects">
              <ProjectsGrid app={app} plugin={plugin} />
            </ErrorBoundary>
          </CollapsibleSection>
        );
      case "todos":
        return (
          <CollapsibleSection key="todos" app={app} title="Open todos" storageKey="todos">
            <ErrorBoundary label="todos">
              <TodoList app={app} plugin={plugin} />
            </ErrorBoundary>
          </CollapsibleSection>
        );
      case "recentSessions":
        return (
          <CollapsibleSection
            key="recentSessions"
            app={app}
            title="Recently edited"
            storageKey="recent"
          >
            <ErrorBoundary label="recent sessions">
              <RecentSessions app={app} plugin={plugin} />
            </ErrorBoundary>
          </CollapsibleSection>
        );
      case "tags":
        return (
          <CollapsibleSection
            key="tags"
            app={app}
            title="Tags"
            storageKey="tags"
            className="cockpit-section--span-2"
          >
            <ErrorBoundary label="tags">
              <TagsOverview app={app} />
            </ErrorBoundary>
          </CollapsibleSection>
        );
      case "heatmap":
        return (
          <CollapsibleSection
            key="heatmap"
            app={app}
            title="Journal activity"
            storageKey="heatmap"
            className="cockpit-section--span-4"
          >
            <ErrorBoundary label="journal heatmap">
              <JournalHeatmap app={app} plugin={plugin} />
            </ErrorBoundary>
          </CollapsibleSection>
        );
      case "graph":
        return (
          <CollapsibleSection
            key="graph"
            app={app}
            title="Graph"
            storageKey="graph"
            className="cockpit-section--span-2"
          >
            <ErrorBoundary label="graph">
              <MiniGraph app={app} plugin={plugin} />
            </ErrorBoundary>
          </CollapsibleSection>
        );
      case "backlinks":
        return (
          <CollapsibleSection
            key="backlinks"
            app={app}
            title="Most linked"
            storageKey="backlinks"
            className="cockpit-section--span-2"
          >
            <ErrorBoundary label="backlinks">
              <BacklinksPanel app={app} plugin={plugin} />
            </ErrorBoundary>
          </CollapsibleSection>
        );
      default:
        return null;
    }
  }

  return (
    <div className="cockpit-root">
      <header className="cockpit-header">
        <h1 className="cockpit-title">Cockpit</h1>
        <span className="cockpit-date">{today}</span>
      </header>

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

      <div className="cockpit-sections">{sectionOrder.map(renderSection)}</div>
    </div>
  );
}
