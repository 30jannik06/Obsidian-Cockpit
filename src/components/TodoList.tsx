import React, { useCallback, useEffect, useState } from "react";
import { App, MarkdownView, TFile, TFolder } from "obsidian";
import type CockpitPlugin from "../main";
import { Spinner } from "./Spinner";

interface TodoItem {
  text: string;
  file: TFile;
  line: number;
  project: string;
}

interface TodoListProps {
  app: App;
  plugin: CockpitPlugin;
}

export function TodoList({ app, plugin }: TodoListProps) {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingItems, setCheckingItems] = useState<Set<string>>(new Set());

  const [noFolder, setNoFolder] = useState(false);

  const loadTodos = useCallback(async () => {
    const { projectsFolder } = plugin.settings;
    const folder = app.vault.getAbstractFileByPath(projectsFolder.replace(/\/$/, ""));
    if (!(folder instanceof TFolder)) {
      setNoFolder(true);
      setLoading(false);
      return;
    }
    setNoFolder(false);

    const items: TodoItem[] = [];

    async function scanFolder(f: TFolder, projectName: string) {
      for (const child of f.children) {
        if (child instanceof TFolder) {
          await scanFolder(child, child.name);
        } else if (child instanceof TFile && child.extension === "md") {
          const content = await app.vault.cachedRead(child);
          content.split("\n").forEach((line, i) => {
            if (/^- \[ \] /.test(line)) {
              items.push({
                text: line.replace(/^- \[ \] /, "").trim(),
                file: child,
                line: i,
                project: projectName,
              });
            }
          });
        }
      }
    }

    for (const child of folder.children) {
      if (child instanceof TFolder) await scanFolder(child, child.name);
    }

    setTodos(items);
    setLoading(false);
  }, [app, plugin]);

  useEffect(() => {
    void loadTodos();
  }, [loadTodos]);

  useEffect(() => {
    let t: number;
    const ref = app.vault.on("modify", () => {
      window.clearTimeout(t);
      t = window.setTimeout(() => {
        void loadTodos();
      }, 600);
    });
    return () => {
      window.clearTimeout(t);
      app.vault.offref(ref);
    };
  }, [app, loadTodos]);

  async function checkTodo(item: TodoItem, e: React.MouseEvent) {
    e.stopPropagation();
    const key = `${item.file.path}:${item.line}`;
    setCheckingItems((prev) => new Set(prev).add(key));

    await app.vault.process(item.file, (content) => {
      const lines = content.split("\n");
      const line = lines[item.line];
      if (line?.includes("- [ ] ")) lines[item.line] = line.replace("- [ ] ", "- [x] ");
      return lines.join("\n");
    });

    window.setTimeout(() => {
      setTodos((prev) =>
        prev.filter((t) => !(t.file.path === item.file.path && t.line === item.line))
      );
      setCheckingItems((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    }, 350);
  }

  async function openTodo(item: TodoItem) {
    const leaf = app.workspace.getLeaf(false);
    await leaf.openFile(item.file);
    const view = leaf.view;
    if (view instanceof MarkdownView) {
      view.editor.setCursor({ line: item.line, ch: 0 });
      view.editor.scrollIntoView(
        { from: { line: item.line, ch: 0 }, to: { line: item.line, ch: 0 } },
        true
      );
    }
  }

  if (loading) return <Spinner />;

  if (noFolder)
    return (
      <p className="cockpit-empty">
        Folder <code>{plugin.settings.projectsFolder}</code> not found — check{" "}
        <em>Settings → Project Cockpit</em>.
      </p>
    );

  if (todos.length === 0) return <p className="cockpit-empty">No open todos found.</p>;

  const grouped = todos.reduce<Record<string, TodoItem[]>>((acc, t) => {
    (acc[t.project] = acc[t.project] ?? []).push(t);
    return acc;
  }, {});

  return (
    <div className="todo-list">
      {Object.entries(grouped).map(([project, items]) => (
        <div key={project} className="todo-group">
          <div className="todo-group__name">{project}</div>
          {items.map((item) => {
            const key = `${item.file.path}:${item.line}`;
            const checking = checkingItems.has(key);
            return (
              <div
                key={key}
                className={`todo-item${checking ? " todo-item--checking" : ""}`}
                onClick={() => {
                  void openTodo(item);
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && void openTodo(item)}
                title={item.file.path}
              >
                <button
                  className={`todo-checkbox${checking ? " todo-checkbox--checking" : ""}`}
                  onClick={(e) => {
                    void checkTodo(item, e);
                  }}
                  aria-label="Mark as done"
                  tabIndex={-1}
                >
                  {checking ? "✓" : "○"}
                </button>
                <span className="todo-item__text">{item.text}</span>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
