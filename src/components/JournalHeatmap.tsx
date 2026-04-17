import React, { useCallback, useEffect, useState } from "react";
import { App, TFile, TFolder, moment } from "obsidian";
import type CockpitPlugin from "../main";
import { Spinner } from "./Spinner";

interface JournalHeatmapProps {
  app: App;
  plugin: CockpitPlugin;
}

const DAYS = 365;
const WEEK_COLS = Math.ceil(DAYS / 7);

export function JournalHeatmap({ app, plugin }: JournalHeatmapProps) {
  const [entryDates, setEntryDates] = useState<Set<string>>(() => new Set());
  const [loading, setLoading] = useState(true);

  const loadJournal = useCallback(async () => {
    const folder = app.vault.getAbstractFileByPath(
      plugin.settings.journalFolder.replace(/\/$/, "")
    );
    if (!(folder instanceof TFolder)) {
      setLoading(false);
      return;
    }

    const dates = new Set<string>();

    for (const child of folder.children) {
      if (!(child instanceof TFile) || child.extension !== "md") continue;

      if (/^\d{4}-\d{2}-\d{2}$/.test(child.basename)) {
        dates.add(child.basename);
        continue;
      }

      const datum = app.metadataCache.getFileCache(child)?.frontmatter?.datum as string | undefined;
      if (datum) {
        const parsed = moment(datum, ["YYYY-MM-DD", "DD.MM.YYYY"], true);
        if (parsed.isValid()) dates.add(parsed.format("YYYY-MM-DD"));
      }
    }

    setEntryDates(dates);
    setLoading(false);
  }, [app, plugin]);

  useEffect(() => {
    void loadJournal();
  }, [loadJournal]);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    const ref = app.metadataCache.on("changed", () => {
      activeWindow.clearTimeout(timeout);
      timeout = activeWindow.setTimeout(() => {
        void loadJournal();
      }, 500);
    });
    return () => {
      activeWindow.clearTimeout(timeout);
      app.metadataCache.offref(ref);
    };
  }, [app, loadJournal]);

  const today = moment();
  const startDay = today.clone().subtract(DAYS - 1, "days");

  const days: { date: string; filled: boolean }[] = [];
  for (let i = 0; i < DAYS; i++) {
    const d = startDay.clone().add(i, "days").format("YYYY-MM-DD");
    days.push({ date: d, filled: entryDates.has(d) });
  }

  let streak = 0;
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].filled) streak++;
    else break;
  }

  const weeks: { date: string; filled: boolean }[][] = [];
  for (let w = 0; w < WEEK_COLS; w++) {
    weeks.push(days.slice(w * 7, w * 7 + 7));
  }

  const monthLabels: { col: number; label: string }[] = [];
  weeks.forEach((week, wi) => {
    const firstDay = week[0];
    if (firstDay) {
      const d = moment(firstDay.date);
      if (d.date() <= 7) {
        monthLabels.push({ col: wi, label: d.format("MMM") });
      }
    }
  });

  if (loading) return <Spinner />;

  return (
    <div className="heatmap-wrapper">
      <div className="heatmap-month-row">
        {monthLabels.map(({ col, label }) => (
          <span key={col} className="heatmap-month-label" style={{ gridColumn: col + 1 }}>
            {label}
          </span>
        ))}
      </div>
      <div className="heatmap-grid">
        {weeks.map((week) => (
          <div key={week[0]?.date ?? week.length} className="heatmap-col">
            {week.map((day) => (
              <div
                key={day.date}
                className={`heatmap-cell ${day.filled ? "heatmap-cell--filled" : ""}`}
                title={day.date}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="heatmap-streak">
        {streak > 0 ? (
          <>
            <span className="heatmap-streak__count">{streak}</span>
            <span className="heatmap-streak__label"> Tag{streak !== 1 ? "e" : ""} in Folge</span>
          </>
        ) : (
          <span className="heatmap-streak__label">Kein aktueller Streak</span>
        )}
      </div>
    </div>
  );
}
