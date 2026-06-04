"use client";

type Mode = "single" | "full";

interface Props {
  onSubmit: (url: string, mode: Mode) => void;
  disabled: boolean;
}

export default function CrawlForm({ onSubmit, disabled }: Props) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        onSubmit(fd.get("url") as string, fd.get("mode") as Mode);
      }}
      className="flex flex-col gap-4"
    >
      <input
        name="url"
        type="url"
        required
        placeholder="https://example.com"
        disabled={disabled}
        className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none disabled:opacity-50"
      />

      <div className="flex gap-3">
        {(["single", "full"] as Mode[]).map((m) => (
          <label
            key={m}
            className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border border-zinc-700 px-4 py-3 text-sm font-medium text-zinc-300 has-[:checked]:border-indigo-500 has-[:checked]:bg-indigo-950 has-[:checked]:text-white"
          >
            <input
              type="radio"
              name="mode"
              value={m}
              defaultChecked={m === "single"}
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
