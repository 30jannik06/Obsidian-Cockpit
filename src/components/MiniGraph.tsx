import React, { useCallback, useEffect, useRef, useState } from "react";
import { App, TFile, TFolder } from "obsidian";
import type CockpitPlugin from "../main";

interface GraphNode {
  id: string;
  label: string;
  isHub: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

interface GraphEdge {
  source: string;
  target: string;
}

interface MiniGraphProps {
  app: App;
  plugin: CockpitPlugin;
}

const REPULSION = 4000;
const SPRING_K = 0.04;
const SPRING_REST = 90;
const DAMPING = 0.78;
const CENTERING = 0.008;
const CANVAS_HEIGHT = 260;
const STOP_THRESHOLD = 0.05;
const WARMUP_TICKS = 60;
const ZOOM_MIN = 0.2;
const ZOOM_MAX = 5;

export function MiniGraph({ app, plugin }: MiniGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<Map<string, GraphNode>>(new Map());
  const edgesRef = useRef<GraphEdge[]>([]);
  const animRef = useRef<number | null>(null);
  const tickRef = useRef(0);

  // Viewport transform
  const scaleRef = useRef(1);
  const panRef = useRef({ x: 0, y: 0 });

  // Drag state
  const dragRef = useRef({ active: false, startX: 0, startY: 0, panX: 0, panY: 0, moved: false });

  // Hover state for tooltip
  const [hoveredLabel, setHoveredLabel] = useState<string | null>(null);

  const [ready, setReady] = useState(false);

  // Draw function — called by simulation loop AND imperatively on zoom/pan
  const drawRef = useRef<(() => void) | null>(null);

  const stopAnimation = useCallback(() => {
    if (animRef.current !== null) {
      cancelAnimationFrame(animRef.current);
      animRef.current = null;
    }
  }, []);

  const loadGraph = useCallback(() => {
    stopAnimation();
    tickRef.current = 0;
    scaleRef.current = 1;
    panRef.current = { x: 0, y: 0 };

    const { projectsFolder, hubFrontmatterKey, hubFrontmatterValue } = plugin.settings;
    const folder = app.vault.getAbstractFileByPath(projectsFolder.replace(/\/$/, ""));
    if (!(folder instanceof TFolder)) return;

    const projectFiles = new Set<string>();
    function collectFiles(f: TFolder) {
      for (const child of f.children) {
        if (child instanceof TFolder) collectFiles(child);
        else if (child instanceof TFile && child.extension === "md") projectFiles.add(child.path);
      }
    }
    collectFiles(folder);

    const canvas = canvasRef.current;
    const W = canvas?.offsetWidth ?? 500;
    const H = CANVAS_HEIGHT;

    const nodes = new Map<string, GraphNode>();
    for (const path of projectFiles) {
      const file = app.vault.getAbstractFileByPath(path);
      if (!(file instanceof TFile)) continue;
      const fm = app.metadataCache.getFileCache(file)?.frontmatter;
      const isHub = fm?.[hubFrontmatterKey] === hubFrontmatterValue;
      const prev = nodesRef.current.get(path);
      nodes.set(path, {
        id: path,
        label: file.basename,
        isHub,
        x: prev?.x ?? W / 2 + (Math.random() - 0.5) * 120,
        y: prev?.y ?? H / 2 + (Math.random() - 0.5) * 80,
        vx: 0,
        vy: 0,
      });
    }

    const edges: GraphEdge[] = [];
    for (const [src, targets] of Object.entries(app.metadataCache.resolvedLinks)) {
      if (!projectFiles.has(src)) continue;
      for (const tgt of Object.keys(targets)) {
        if (projectFiles.has(tgt)) edges.push({ source: src, target: tgt });
      }
    }

    nodesRef.current = nodes;
    edgesRef.current = edges;
    setReady(true);
  }, [app, plugin, stopAnimation]);

  useEffect(() => {
    loadGraph();
    return stopAnimation;
  }, [loadGraph, stopAnimation]);

  // Set up canvas, draw loop, and wheel listener
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !ready) return;

    const dpr = activeWindow.devicePixelRatio ?? 1;
    const W = canvas.offsetWidth;
    canvas.width = W * dpr;
    canvas.height = CANVAS_HEIGHT * dpr;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    const cs = getComputedStyle(canvas);
    const accent = cs.getPropertyValue("--interactive-accent").trim() || "#7c6aff";
    const textMuted = cs.getPropertyValue("--text-muted").trim() || "#888";
    const borderColor = cs.getPropertyValue("--background-modifier-border").trim() || "#444";
    const textNormal = cs.getPropertyValue("--text-normal").trim() || "#ddd";

    function draw() {
      ctx!.clearRect(0, 0, W, CANVAS_HEIGHT);
      ctx!.save();
      ctx!.translate(panRef.current.x, panRef.current.y);
      ctx!.scale(scaleRef.current, scaleRef.current);

      // Edges
      ctx!.strokeStyle = borderColor;
      ctx!.lineWidth = 1 / scaleRef.current;
      ctx!.globalAlpha = 0.5;
      for (const edge of edgesRef.current) {
        const a = nodesRef.current.get(edge.source);
        const b = nodesRef.current.get(edge.target);
        if (!a || !b) continue;
        ctx!.beginPath();
        ctx!.moveTo(a.x, a.y);
        ctx!.lineTo(b.x, b.y);
        ctx!.stroke();
      }
      ctx!.globalAlpha = 1;

      // Nodes
      for (const node of nodesRef.current.values()) {
        const r = node.isHub ? 8 : 5;
        ctx!.beginPath();
        ctx!.arc(node.x, node.y, r, 0, Math.PI * 2);
        ctx!.fillStyle = node.isHub ? accent : textMuted;
        ctx!.fill();

        if (node.isHub || scaleRef.current > 1.4) {
          const fontSize = Math.max(9, 11 / scaleRef.current);
          ctx!.font = `${node.isHub ? "bold " : ""}${fontSize}px var(--font-interface, system-ui, sans-serif)`;
          ctx!.fillStyle = textNormal;
          ctx!.textAlign = "center";
          ctx!.textBaseline = "bottom";
          ctx!.fillText(node.label, node.x, node.y - r - 3 / scaleRef.current);
        }
      }

      ctx!.restore();
    }

    drawRef.current = draw;

    function tick() {
      const nodes = Array.from(nodesRef.current.values());
      if (nodes.length === 0) return;
      tickRef.current++;

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const d2 = dx * dx + dy * dy + 0.01;
          const d = Math.sqrt(d2);
          const f = REPULSION / d2;
          a.vx -= (dx / d) * f;
          a.vy -= (dy / d) * f;
          b.vx += (dx / d) * f;
          b.vy += (dy / d) * f;
        }
      }

      for (const edge of edgesRef.current) {
        const a = nodesRef.current.get(edge.source);
        const b = nodesRef.current.get(edge.target);
        if (!a || !b) continue;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const d = Math.sqrt(dx * dx + dy * dy) || 1;
        const f = (d - SPRING_REST) * SPRING_K;
        a.vx += (dx / d) * f;
        a.vy += (dy / d) * f;
        b.vx -= (dx / d) * f;
        b.vy -= (dy / d) * f;
      }

      let energy = 0;
      for (const node of nodes) {
        node.vx += (W / 2 - node.x) * CENTERING;
        node.vy += (CANVAS_HEIGHT / 2 - node.y) * CENTERING;
        node.vx *= DAMPING;
        node.vy *= DAMPING;
        node.x = Math.max(12, Math.min(W - 12, node.x + node.vx));
        node.y = Math.max(12, Math.min(CANVAS_HEIGHT - 12, node.y + node.vy));
        energy += node.vx * node.vx + node.vy * node.vy;
      }

      draw();

      if (energy >= STOP_THRESHOLD || tickRef.current <= WARMUP_TICKS) {
        animRef.current = requestAnimationFrame(tick);
      } else {
        animRef.current = null;
      }
    }

    animRef.current = requestAnimationFrame(tick);

    // Non-passive wheel for zoom-to-cursor
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const factor = e.deltaY < 0 ? 1.12 : 0.9;
      const newScale = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, scaleRef.current * factor));
      const ratio = newScale / scaleRef.current;
      panRef.current.x = mx - (mx - panRef.current.x) * ratio;
      panRef.current.y = my - (my - panRef.current.y) * ratio;
      scaleRef.current = newScale;
      draw();
    };

    canvas.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      stopAnimation();
      canvas.removeEventListener("wheel", onWheel);
    };
  }, [ready, stopAnimation]);

  // --- Pointer events for pan + click ---

  function screenToWorld(sx: number, sy: number) {
    return {
      x: (sx - panRef.current.x) / scaleRef.current,
      y: (sy - panRef.current.y) / scaleRef.current,
    };
  }

  function nodeAt(sx: number, sy: number): GraphNode | null {
    const { x, y } = screenToWorld(sx, sy);
    for (const node of nodesRef.current.values()) {
      const r = (node.isHub ? 8 : 5) + 4 / scaleRef.current;
      if ((x - node.x) ** 2 + (y - node.y) ** 2 <= r * r) return node;
    }
    return null;
  }

  function handleMouseDown(e: React.MouseEvent<HTMLCanvasElement>) {
    dragRef.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      panX: panRef.current.x,
      panY: panRef.current.y,
      moved: false,
    };
  }

  function handleMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;

    if (dragRef.current.active) {
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) dragRef.current.moved = true;
      if (dragRef.current.moved) {
        panRef.current.x = dragRef.current.panX + dx;
        panRef.current.y = dragRef.current.panY + dy;
        drawRef.current?.();
      }
    }

    // Hover label
    const node = nodeAt(sx, sy);
    setHoveredLabel(node ? node.label : null);
    canvas.dataset.cursor = node ? "pointer" : dragRef.current.active ? "grabbing" : "grab";
  }

  function handleMouseUp(e: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const wasDrag = dragRef.current.moved;
    dragRef.current.active = false;
    dragRef.current.moved = false;
    canvas.dataset.cursor = "grab";

    if (!wasDrag) {
      const rect = canvas.getBoundingClientRect();
      const node = nodeAt(e.clientX - rect.left, e.clientY - rect.top);
      if (node) void app.workspace.openLinkText(node.id, "", false);
    }
  }

  function handleMouseLeave() {
    dragRef.current.active = false;
    dragRef.current.moved = false;
    setHoveredLabel(null);
    if (canvasRef.current) canvasRef.current.dataset.cursor = "grab";
  }

  function handleDoubleClick() {
    scaleRef.current = 1;
    panRef.current = { x: 0, y: 0 };
    drawRef.current?.();
  }

  return (
    <div className="mini-graph-wrapper">
      <canvas
        ref={canvasRef}
        className="mini-graph-canvas"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onDoubleClick={handleDoubleClick}
        title="Scroll to zoom · Drag to pan · Double-click to reset"
      />
      <div className="mini-graph-footer">
        {hoveredLabel && <span className="mini-graph-label">{hoveredLabel}</span>}
        <span className="mini-graph-hint">scroll · drag · dblclick reset</span>
      </div>
    </div>
  );
}
