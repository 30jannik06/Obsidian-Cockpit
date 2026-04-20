import React, { useEffect, useState } from "react";
import { App, TFile, TFolder, moment } from "obsidian";
import type CockpitPlugin from "../main";
import { Spinner } from "./Spinner";

interface SessionFile {
  file: TFile;
  project: string;
  mtime: number;
}

interface RecentSessionsProps {
  app: App;
  plugin: CockpitPlugin;
}

export function RecentSessions({ app, plugin }: RecentSessionsProps) {
  const [sessions, setSessions] = useState<SessionFile[]>([]);
  const [loading, setLoading] = useState(true);

  function collectSessions() {
    const { projectsFolder } = plugin.settings;
    const folder = app.vault.getAbstractFileByPath(projectsFolder.replace(/\/$/, ""));
    if (!(folder instanceof TFolder)) {
      setLoading(false);
      return;
    }

    const files: SessionFile[] = [];

    function collectFiles(f: TFolder, projectName: string) {
      for (const child of f.children) {
        if (child instanceof TFolder) {
          collectFiles(child, child.name);
        } else if (child instanceof TFile && child.extension === "md") {
          files.push({ file: child, project: projectName, mtime: child.stat.mtime });
        }
      }
    }

    for (const child of folder.children) {
      if (child instanceof TFolder) collectFiles(child, child.name);
    }

    files.sort((a, b) => b.mtime - a.mtime);
    setSessions(files.slice(0, 7));
    setLoading(false);
  }

  useEffect(() => {
    collectSessions();
  }, [app, plugin]);

  useEffect(() => {
    let timeout: number;
    const ref = app.vault.on("modify", () => {
      activeWindow.clearTimeout(timeout);
      timeout = activeWindow.setTimeout(() => {
        collectSessions();
      }, 400);
    });
    return () => {
      activeWindow.clearTimeout(timeout);
      app.vault.offref(ref);
    };
  }, [app, plugin]);

  if (loading) return <Spinner />;
  if (sessions.length === 0)
    return <p className="cockpit-empty">Keine Session-Dateien gefunden.</p>;

  return (
    <div className="recent-sessions">
      {sessions.map((s) => (
        <div
          key={s.file.path}
          className="session-item"
          onClick={() => {
            void app.workspace.openLinkText(s.file.path, "", false);
          }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) =>
            e.key === "Enter" && void app.workspace.openLinkText(s.file.path, "", false)
          }
        >
          <div className="session-item__name">{s.file.basename}</div>
          <div className="session-item__meta">
            <span className="session-item__project">{s.project}</span>
            <span className="session-item__time">{moment(s.mtime).fromNow()}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
