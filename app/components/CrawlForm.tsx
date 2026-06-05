"use client";

import { useState } from "react";

type Mode = "single" | "full";

interface Props {
  onSubmit: (url: string, mode: Mode) => void;
  disabled: boolean;
}

export default function CrawlForm({ onSubmit, disabled }: Props) {
  const [url, setUrl] = useState("");
  const [mode, setMode] = useState<Mode>("single");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(url, mode);
      }}
      className="flex flex-col gap-4"
    >
      <input
        name="url"
        type="url"
        required
        placeholder="https://example.com"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        disabled={disabled}
        className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none disabled:opacity-50"
      />

      <div className="flex gap-3">
        {(["single", "full"] as Mode[]).map((m) => (
          <label
            key={m}
            className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium transition-colors ${
              mode === m
                ? "border-indigo-500 bg-indigo-950 text-white"
                : "border-zinc-700 text-zinc-300"
            }`}
          >
            <input
              type="radio"
              name="mode"
              value={m}
              checked={mode === m}
              onChange={() => setMode(m)}
              disabled={disabled}
              className="sr-only"
            />
            {m === "single" ? "Single page" : "Full site crawl"}
          </label>
        ))}
      </div>

      <button
        type="submit"
        disabled={disabled}
        className="rounded-lg bg-indigo-600 px-4 py-3 font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Build Knowledge Graph
      </button>
    </form>
  );
}
