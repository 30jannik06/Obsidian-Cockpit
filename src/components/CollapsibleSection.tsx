import React, { ReactNode } from "react";
import { App } from "obsidian";
import { useCollapse } from "../hooks/useCollapse";

interface CollapsibleSectionProps {
  app: App;
  title: string;
  storageKey: string;
  defaultOpen?: boolean;
  className?: string;
  children: ReactNode;
}

export function CollapsibleSection({
  app,
  title,
  storageKey,
  defaultOpen = true,
  className = "",
  children,
}: CollapsibleSectionProps) {
  const [open, toggle] = useCollapse(app, storageKey, defaultOpen);

  return (
    <section className={`cockpit-section ${className}`}>
      <button className="cockpit-section-header" onClick={toggle} aria-expanded={open}>
        <span className={`cockpit-chevron${open ? " cockpit-chevron--open" : ""}`}>▶</span>
        <span className="cockpit-section-title">{title}</span>
      </button>
      {open && <div className="cockpit-section-body">{children}</div>}
    </section>
  );
}
