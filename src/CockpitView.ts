import { ItemView, WorkspaceLeaf } from "obsidian";
import { createRoot, Root } from "react-dom/client";
import { createElement } from "react";
import type CockpitPlugin from "./main";
import { Cockpit } from "./components/Cockpit";

export const VIEW_TYPE = "obsidian-cockpit";

export class CockpitView extends ItemView {
  private root: Root | null = null;
  plugin: CockpitPlugin;

  constructor(leaf: WorkspaceLeaf, plugin: CockpitPlugin) {
    super(leaf);
    this.plugin = plugin;
  }

  getViewType(): string {
    return VIEW_TYPE;
  }

  getDisplayText(): string {
    return "Cockpit";
  }

  getIcon(): string {
    return "layout-dashboard";
  }

  onOpen(): Promise<void> {
    const container = this.containerEl.children[1] as HTMLElement;
    container.empty();
    container.addClass("obsidian-cockpit-container");

    this.root = createRoot(container);
    this.root.render(createElement(Cockpit, { app: this.app, plugin: this.plugin }));
    return Promise.resolve();
  }

  onClose(): Promise<void> {
    this.root?.unmount();
    this.root = null;
    return Promise.resolve();
  }
}
