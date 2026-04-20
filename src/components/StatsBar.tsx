import React, { useCallback, useEffect, useState } from "react";
import { App, TFile, TFolder, moment } from "obsidian";
import type CockpitPlugin from "../main";

interface Stats {
  totalProjects: number;
  activeProjects: number;
  openTodos: number;
  journalThisWeek: number;
  streak: number;
}

interface StatsBarProps {
  app: App;
  plugin: CockpitPlugin;
}

export function StatsBar({ app, plugin }: StatsBarProps) {
  const [stats, setStats] = useState<Stats>({
    totalProjects: 0,
    activeProjects: 0,
    openTodos: 0,
    journalThisWeek: 0,
    streak: 0,
  });

  const computeStats = useCallback(() => {
    const { projectsFolder, journalFolder } = plugin.settings;

    let totalProjects = 0;
    let activeProjects = 0;
    let openTodos = 0;

    const projFolder = app.vault.getAbstractFileByPath(projectsFolder.replace(/\/$/, ""));
    if (projFolder instanceof TFolder) {
      for (const child of projFolder.children) {
        if (!(child instanceof TFolder)) continue;
        // Hub file is a sibling with the same name as the folder
        const hubFile = projFolder.children.find(
          (f): f is TFile => f instanceof TFile && f.basename === child.name && f.extension === "md"
        );
        if (!hubFile) continue;
        totalProjects++;
        const fm = app.metadataCache.getFileCache(hubFile)?.frontmatter;
        const s = (fm?.status as string | undefined)?.toLowerCase() ?? "";
        if (s === "active" || s === "aktiv") activeProjects++;
        for (const f of child.children) {
          if (!(f instanceof TFile) || f.extension !== "md") continue;
          const cache = app.metadataCache.getFileCache(f);
          openTodos += cache?.listItems?.filter((i) => i.task === " ").length ?? 0;
        }
      }
    }

    const journFolder = app.vault.getAbstractFileByPath(journalFolder.replace(/\/$/, ""));
    const weekAgo = moment().subtract(7, "days").startOf("day");
    let journalThisWeek = 0;
    let streak = 0;
    const entryDates = new Set<string>();

    if (journFolder instanceof TFolder) {
      for (const child of journFolder.children) {
        if (!(child instanceof TFile) || child.extension !== "md") continue;
        if (/^\d{4}-\d{2}-\d{2}$/.test(child.basename)) {
          entryDates.add(child.basename);
          if (moment(child.basename).isSameOrAfter(weekAgo)) journalThisWeek++;
        } else {
          const datum = app.metadataCache.getFileCache(child)?.frontmatter?.datum as
            | string
            | undefined;
          if (datum) {
            const parsed = moment(datum, ["YYYY-MM-DD", "DD.MM.YYYY"], true);
            if (parsed.isValid()) {
              entryDates.add(parsed.format("YYYY-MM-DD"));
              if (parsed.isSameOrAfter(weekAgo)) journalThisWeek++;
            }
          }
        }
      }
    }

    const today = moment();
    for (let i = 0; i < 365; i++) {
      if (entryDates.has(today.clone().subtract(i, "days").format("YYYY-MM-DD"))) streak++;
      else break;
    }

    setStats({ totalProjects, activeProjects, openTodos, journalThisWeek, streak });
  }, [app, plugin]);

  useEffect(() => {
    computeStats();
  }, [computeStats]);

  useEffect(() => {
    let t: number;
    const ref = app.metadataCache.on("changed", () => {
      activeWindow.clearTimeout(t);
      t = activeWindow.setTimeout(() => computeStats(), 500);
    });
    return () => {
      activeWindow.clearTimeout(t);
      app.metadataCache.offref(ref);
    };
  }, [app, computeStats]);

  const items = [
    {
      value: stats.activeProjects,
      label: "aktive Projekte",
      sub: stats.totalProjects > 0 ? `von ${stats.totalProjects}` : undefined,
    },
    { value: stats.openTodos, label: "offene TODOs", sub: undefined },
    { value: stats.journalThisWeek, label: "Journal diese Woche", sub: undefined },
    {
      value: stats.streak,
      label: `Tag${stats.streak !== 1 ? "e" : ""} Streak`,
      sub: undefined,
      accent: stats.streak > 0,
    },
  ];

  return (
    <div className="stats-bar">
      {items.map((item) => (
        <div key={item.label} className="stat-item">
          <span className={`stat-value${item.accent ? " stat-value--accent" : ""}`}>
            {item.value}
          </span>
          <div className="stat-meta">
            <span className="stat-label">{item.label}</span>
            {item.sub && <span className="stat-sub">{item.sub}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}
