import React, { useCallback, useEffect, useState } from "react";
import { App, TFile, TFolder, moment } from "obsidian";
import type CockpitPlugin from "../main";
import { Spinner } from "./Spinner";

interface ProjectCard {
  file: TFile;
  title: string;
  status: string;
  lastModified: number;
  openTodos: number;
  preview: string;
}

type StatusFilter = "all" | "active" | "paused" | "done";

interface ProjectsGridProps {
  app: App;
  plugin: CockpitPlugin;
}

function extractPreview(content: string): string {
  const body = content.replace(/^---[\s\S]*?---\s*\n/, "");
  for (const line of body.split("\n")) {
    const t = line.trim();
    if (
      t &&
      !t.startsWith("#") &&
      !t.startsWith("-") &&
      !t.startsWith("!") &&
      !t.startsWith(">") &&
      !t.startsWith("|") &&
      !t.startsWith("```")
    ) {
      return t.length > 160 ? t.slice(0, 160) + "…" : t;
    }
  }
  return "";
}

function normalizeStatus(s: string): StatusFilter {
  const l = s.toLowerCase();
  if (l === "active" || l === "aktiv") return "active";
  if (l === "paused" || l === "pause") return "paused";
  if (l === "done" || l === "abgeschlossen") return "done";
  return "all";
}

export function ProjectsGrid({ app, plugin }: ProjectsGridProps) {
  const [projects, setProjects] = useState<ProjectCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<StatusFilter>("all");

  const loadProjects = useCallback(async () => {
    const { projectsFolder } = plugin.settings;
    const folder = app.vault.getAbstractFileByPath(projectsFolder.replace(/\/$/, ""));
    if (!(folder instanceof TFolder)) {
      setLoading(false);
      return;
    }

    const cards: ProjectCard[] = [];

    for (const child of folder.children) {
      if (!(child instanceof TFolder)) continue;

      // Hub file is a sibling to the project folder with the same name
      const hubFile = folder.children.find(
        (f): f is TFile => f instanceof TFile && f.basename === child.name && f.extension === "md"
      );
      if (!hubFile) continue;

      const fm = app.metadataCache.getFileCache(hubFile)?.frontmatter;
      const status = (fm?.status as string | undefined) ?? "";
      const title = (fm?.title as string | undefined) ?? hubFile.basename;

      let lastModified = hubFile.stat.mtime;
      let openTodos = 0;

      const hubContent = await app.vault.cachedRead(hubFile);
      const preview = extractPreview(hubContent);

      for (const f of child.children) {
        if (!(f instanceof TFile) || f.extension !== "md") continue;
        if (f.stat.mtime > lastModified) lastModified = f.stat.mtime;
        const content = await app.vault.cachedRead(f);
        openTodos += content.match(/^- \[ \] /gm)?.length ?? 0;
      }

      cards.push({ file: hubFile, title, status, lastModified, openTodos, preview });
    }

    cards.sort((a, b) => b.lastModified - a.lastModified);
    setProjects(cards);
    setLoading(false);
  }, [app, plugin]);

  useEffect(() => {
    void loadProjects();
  }, [loadProjects]);

  useEffect(() => {
    let t: number;
    const ref = app.metadataCache.on("changed", () => {
      activeWindow.clearTimeout(t);
      t = activeWindow.setTimeout(() => {
        void loadProjects();
      }, 500);
    });
    return () => {
      activeWindow.clearTimeout(t);
      app.metadataCache.offref(ref);
    };
  }, [app, loadProjects]);

  function statusClass(status: string): string {
    switch (normalizeStatus(status)) {
      case "active":
        return "status--active";
      case "paused":
        return "status--paused";
      case "done":
        return "status--done";
      default:
        return "status--unknown";
    }
  }

  const filtered =
    filter === "all" ? projects : projects.filter((p) => normalizeStatus(p.status) === filter);

  const filterButtons: { key: StatusFilter; label: string }[] = [
    { key: "all", label: "Alle" },
    { key: "active", label: "Aktiv" },
    { key: "paused", label: "Pause" },
    { key: "done", label: "Done" },
  ];

  if (loading) return <Spinner />;

  return (
    <div className="projects-grid-wrapper">
      <div className="projects-filter-bar">
        {filterButtons.map((btn) => (
          <button
            key={btn.key}
            className={`filter-btn${filter === btn.key ? " filter-btn--active" : ""}`}
            onClick={() => setFilter(btn.key)}
          >
            {btn.label}
            {btn.key !== "all" && (
              <span className="filter-btn__count">
                {projects.filter((p) => normalizeStatus(p.status) === btn.key).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="cockpit-empty">Keine Projekte mit diesem Status.</p>
      ) : (
        <div className="projects-grid">
          {filtered.map((p) => (
            <div
              key={p.file.path}
              className="project-card"
              onClick={() => {
                void app.workspace.openLinkText(p.file.path, "", false);
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) =>
                e.key === "Enter" && void app.workspace.openLinkText(p.file.path, "", false)
              }
            >
              <div className="project-card__header">
                <span className="project-card__title">{p.title}</span>
                {p.status && (
                  <span className={`project-card__status ${statusClass(p.status)}`}>
                    {p.status}
                  </span>
                )}
              </div>
              <div className="project-card__meta">
                <span>{moment(p.lastModified).fromNow()}</span>
                {p.openTodos > 0 && (
                  <span className="project-card__todos">
                    {p.openTodos} TODO{p.openTodos !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
              {p.preview && <div className="project-card__preview-tooltip">{p.preview}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
