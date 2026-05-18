import React, { useCallback, useEffect, useState } from "react";
import { App, MetadataCache } from "obsidian";
import { Spinner } from "./Spinner";

type MetadataCacheWithTags = MetadataCache & { getTags(): Record<string, number> };

interface TagsOverviewProps {
  app: App;
}

interface TagEntry {
  tag: string;
  count: number;
}

export function TagsOverview({ app }: TagsOverviewProps) {
  const [tags, setTags] = useState<TagEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    const raw = (app.metadataCache as MetadataCacheWithTags).getTags();
    const sorted = Object.entries(raw)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 30);
    setTags(sorted);
    setLoading(false);
  }, [app]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    let t: number;
    const ref = app.metadataCache.on("changed", () => {
      window.clearTimeout(t);
      t = window.setTimeout(() => load(), 600);
    });
    return () => {
      window.clearTimeout(t);
      app.metadataCache.offref(ref);
    };
  }, [app, load]);

  function openSearch(tag: string): void {
    void app.workspace.getLeaf(false).setViewState({
      type: "search",
      state: { query: `tag:${tag}` },
    });
  }

  if (loading) return <Spinner />;
  if (tags.length === 0) return <p className="cockpit-empty">No tags found in vault.</p>;

  return (
    <div className="tags-overview">
      {tags.map(({ tag, count }) => (
        <button
          key={tag}
          className="tag-chip"
          onClick={() => openSearch(tag)}
          title={`${count} occurrence${count !== 1 ? "s" : ""}`}
        >
          {tag}
          <span className="tag-chip__count">{count}</span>
        </button>
      ))}
    </div>
  );
}
