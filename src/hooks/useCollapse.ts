import { useCallback, useState } from "react";
import { App } from "obsidian";

export function useCollapse(app: App, key: string, defaultOpen = true): [boolean, () => void] {
  const storageKey = `cockpit-section-${key}`;

  const [open, setOpen] = useState<boolean>(() => {
    const stored = app.loadLocalStorage(storageKey) as string | null;
    return stored === null ? defaultOpen : stored === "true";
  });

  const toggle = useCallback(() => {
    setOpen((prev) => {
      const next = !prev;
      app.saveLocalStorage(storageKey, String(next));
      return next;
    });
  }, [app, storageKey]);

  return [open, toggle];
}
