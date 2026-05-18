import React, { useEffect, useState } from "react";
import { App, TFile, moment } from "obsidian";
import type CockpitPlugin from "../main";

interface PinnedNotesProps {
  app: App;
  plugin: CockpitPlugin;
}

export function PinnedNotes({ app, plugin }: PinnedNotesProps) {
  const [files, setFiles] = useState<TFile[]>([]);

  useEffect(() => {
    const resolved = plugin.settings.pinnedNotes
      .map((p) => app.vault.getAbstractFileByPath(p))
      .filter((f): f is TFile => f instanceof TFile);
    setFiles(resolved);
  }, [app, plugin, plugin.settings.pinnedNotes]);

  if (files.length === 0)
    return (
      <p className="cockpit-empty">
        No pinned notes yet — add note paths in <em>Settings → Project Cockpit</em>.
      </p>
    );

  return (
    <div className="pinned-notes">
      {files.map((f) => (
        <div
          key={f.path}
          className="pinned-note-item"
          onClick={() => void app.workspace.openLinkText(f.path, "", false)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && void app.workspace.openLinkText(f.path, "", false)}
        >
          <span className="pinned-note-item__name">{f.basename}</span>
          <span className="pinned-note-item__meta">{moment(f.stat.mtime).fromNow()}</span>
        </div>
      ))}
    </div>
  );
}
