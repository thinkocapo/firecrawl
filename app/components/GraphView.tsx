"use client";

import { useEffect, useRef, useState } from "react";
import ForceGraph2D from "react-force-graph-2d";

interface Node {
  id: string;
  label: string;
  type: "topic" | "entity" | "feature" | "claim";
  weight: number;
}

interface Edge {
  source: string;
  target: string;
  label: string;
}

interface Props {
  nodes: Node[];
  edges: Edge[];
  dim?: boolean;
}

const TYPE_COLORS: Record<string, string> = {
  topic: "#6366f1",   // indigo
  entity: "#22d3ee",  // cyan
  feature: "#34d399", // emerald
  claim: "#f59e0b",   // amber
};

export default function GraphView({ nodes, edges, dim = false }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setSize({ width: el.clientWidth, height: el.clientHeight });
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const graphData = {
    nodes: nodes.map((n) => ({ ...n, name: n.label })),
    links: edges.map((e) => ({ ...e })),
  };

  return (
    <div ref={containerRef} className={`relative w-full h-full rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800 transition-opacity duration-500 ${dim ? "opacity-30" : "opacity-100"}`}>
      <ForceGraph2D
        graphData={graphData}
        nodeLabel="name"
        nodeVal={(n) => (n as unknown as Node).weight * 20}
        nodeColor={(n) => TYPE_COLORS[(n as unknown as Node).type] ?? "#6366f1"}
        nodeCanvasObject={(node, ctx, globalScale) => {
          const n = node as unknown as Node & { x: number; y: number };
          const r = Math.max(4, n.weight * 14);
          const color = TYPE_COLORS[n.type] ?? "#6366f1";

          // Draw circle
          ctx.beginPath();
          ctx.arc(n.x, n.y, r, 0, 2 * Math.PI);
          ctx.fillStyle = color + "cc";
          ctx.fill();
          ctx.strokeStyle = color;
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Draw label
          const fontSize = Math.max(16, r * 1.4) / globalScale;
          ctx.font = `${fontSize}px Inter, sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillStyle = "#f4f4f5";
          ctx.fillText(n.label, n.x, n.y + r + fontSize);
        }}
        linkColor={() => "#3f3f46"}
        linkDirectionalArrowLength={4}
        linkDirectionalArrowRelPos={1}
        linkLabel="label"
        backgroundColor="#09090b"
        width={size.width}
        height={size.height}
      />

      {/* Legend */}
      <div className="absolute bottom-4 left-4 flex flex-col gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/90 p-3 text-xs text-zinc-300 backdrop-blur">
        {Object.entries(TYPE_COLORS).map(([type, color]) => (
          <div key={type} className="flex items-center gap-2">
            <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: color }} />
            {type}
          </div>
        ))}
      </div>
    </div>
  );
}
