import React, { ReactNode } from "react";

interface CollapsibleSectionProps {
  app?: unknown;
  title: string;
  storageKey?: string;
  defaultOpen?: boolean;
  className?: string;
  children: ReactNode;
}

export function CollapsibleSection({ title, className = "", children }: CollapsibleSectionProps) {
  return (
    <section className={`cockpit-section ${className}`}>
      <div className="cockpit-section-title">{title}</div>
      <div className="cockpit-section-body">{children}</div>
    </section>
  );
}
