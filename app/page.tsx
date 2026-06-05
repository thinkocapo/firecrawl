"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import CrawlForm from "./components/CrawlForm";
import StatusBar from "./components/StatusBar";

const GraphView = dynamic(() => import("./components/GraphView"), { ssr: false });

type Status = "idle" | "crawling" | "analyzing" | "done" | "error";

const DEMO_NODES = [
  { id: "c",  label: "example", type: "topic"   as const, weight: 1.0 },
  { id: "n1", label: "example", type: "entity"  as const, weight: 0.5 },
  { id: "n2", label: "example", type: "feature" as const, weight: 0.5 },
  { id: "n3", label: "example", type: "claim"   as const, weight: 0.5 },
  { id: "n4", label: "example", type: "entity"  as const, weight: 0.5 },
];
const DEMO_EDGES = [
  { source: "c", target: "n1", label: "relates to" },
  { source: "c", target: "n2", label: "relates to" },
  { source: "c", target: "n3", label: "relates to" },
  { source: "c", target: "n4", label: "relates to" },
];

interface GraphData {
  nodes: { id: string; label: string; type: "topic" | "entity" | "feature" | "claim"; weight: number }[];
  edges: { source: string; target: string; label: string }[];
}

export default function Home() {
  const [status, setStatus] = useState<Status>("idle");
  const [graph, setGraph] = useState<GraphData | null>(null);
  const [error, setError] = useState<string>();

  async function handleSubmit(url: string, mode: "single" | "full") {
    setStatus("crawling");
    setGraph(null);
    setError(undefined);

    try {
      const crawlRes = await fetch("/api/crawl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, mode }),
      });
      const crawlData = await crawlRes.json();
      if (!crawlRes.ok) throw new Error(crawlData.error ?? "Crawl failed");

      setStatus("analyzing");

      const analyzeRes = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markdown: crawlData.markdown }),
      });
      const graphData = await analyzeRes.json();
      if (!analyzeRes.ok) throw new Error(graphData.error ?? "Analysis failed");

      setGraph(graphData);
      setStatus("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setStatus("error");
    }
  }

  return (
    <div className="flex h-screen flex-col bg-zinc-950 text-white">
      <header className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Knowledge Graph</h1>
          <p className="text-xs text-zinc-500">Crawl a URL and visualize its semantic structure</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="password"
            placeholder="Anthropic key"
            className="w-44 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none"
          />
          <button
            type="button"
            className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-300 hover:border-zinc-500 hover:text-white transition-colors"
          >
            Download as HTML
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="flex w-80 flex-shrink-0 flex-col gap-4 border-r border-zinc-800 p-5">
          <CrawlForm onSubmit={handleSubmit} disabled={status === "crawling" || status === "analyzing"} />
          <StatusBar status={status} nodeCount={graph?.nodes.length} error={error} />
        </aside>

        <main className="relative flex-1 p-4">
          {graph ? (
            <GraphView nodes={graph.nodes} edges={graph.edges} />
          ) : (
            <GraphView nodes={DEMO_NODES} edges={DEMO_EDGES} dim={status === "crawling" || status === "analyzing"} />
          )}
        </main>
      </div>
    </div>
  );
}
