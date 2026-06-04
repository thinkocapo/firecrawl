"use client";

type Status = "idle" | "crawling" | "analyzing" | "done" | "error";

interface Props {
  status: Status;
  nodeCount?: number;
  error?: string;
}

const messages: Record<Status, string> = {
  idle: "",
  crawling: "Crawling site…",
  analyzing: "Building knowledge graph…",
  done: "",
  error: "",
};

export default function StatusBar({ status, nodeCount, error }: Props) {
  if (status === "idle") return null;

  if (status === "error") {
    return (
      <div className="rounded-lg border border-red-800 bg-red-950 px-4 py-3 text-sm text-red-300">
        {error ?? "Something went wrong."}
      </div>
    );
  }

  if (status === "done") {
    return (
      <div className="text-sm text-zinc-400">
        {nodeCount} nodes rendered
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 text-sm text-zinc-400">
      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
      {messages[status]}
    </div>
  );
}
