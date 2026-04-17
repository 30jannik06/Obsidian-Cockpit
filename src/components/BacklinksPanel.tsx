import React, { useCallback, useEffect, useState } from "react";
import { App, TFile, TFolder } from "obsidian";
import type CockpitPlugin from "../main";
import { Spinner } from "./Spinner";

interface BacklinkEntry {
  file: TFile;
  incomingCount: number;
  isHub: boolean;
}

interface BacklinksPanelProps {
  app: App;
  plugin: CockpitPlugin;
}

export function BacklinksPanel({ app, plugin }: BacklinksPanelProps) {
  const [entries, setEntries] = useState<BacklinkEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    const { projectsFolder, hubFrontmatterKey, hubFrontmatterValue } = plugin.settings;
    const folder = app.vault.getAbstractFileByPath(projectsFolder.replace(/\/$/, ""));
    if (!(folder instanceof TFolder)) {
      setLoading(false);
      return;
    }

    const projectFiles = new Set<string>();
    function collect(f: TFolder) {
      for (const child of f.children) {
        if (child instanceof TFolder) collect(child);
        else if (child instanceof TFile && child.extension === "md") projectFiles.add(child.path);
      }
    }
    collect(folder);

    const incoming = new Map<string, number>();
    for (const [src, targets] of Object.entries(app.metadataCache.resolvedLinks)) {
      if (!projectFiles.has(src)) continue;
      for (const [tgt, count] of Object.entries(targets)) {
        if (projectFiles.has(tgt)) incoming.set(tgt, (incoming.get(tgt) ?? 0) + count);
      }
    }

    const result: BacklinkEntry[] = [];
    for (const [path, count] of [...incoming.entries()].sort((a, b) => b[1] - a[1]).slice(0, 7)) {
      const file = app.vault.getAbstractFileByPath(path);
      if (!(file instanceof TFile)) continue;
      const fm = app.metadataCache.getFileCache(file)?.frontmatter;
      result.push({
        file,
        incomingCount: count,
        isHub: fm?.[hubFrontmatterKey] === hubFrontmatterValue,
      });
    }

    setEntries(result);
    setLoading(false);
  }, [app, plugin]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const ref = app.metadataCache.on("changed", () => {
      activeWindow.clearTimeout(t);
      t = activeWindow.setTimeout(() => load(), 600);
    });
    return () => {
      activeWindow.clearTimeout(t);
      app.metadataCache.offref(ref);
    };
  }, [app, load]);

  if (loading) return <Spinner />;
  if (entries.length === 0) return <p className="cockpit-empty">Keine Verlinkungen gefunden.</p>;

  return (
    <div className="backlinks-list">
      {entries.map((e) => (
        <div
          key={e.file.path}
          className={`backlink-item${e.isHub ? " backlink-item--hub" : ""}`}
          onClick={() => {
            void app.workspace.openLinkText(e.file.path, "", false);
          }}
          role="button"
          tabIndex={0}
          onKeyDown={(ev) =>
            ev.key === "Enter" && void app.workspace.openLinkText(e.file.path, "", false)
          }
        >
          <span className="backlink-item__name">{e.file.basename}</span>
          <span className="backlink-item__count" title="Incoming links">
            {e.incomingCount}
          </span>
        </div>
      ))}
    </div>
  );
}
