# Knowledge Graph from Web Content

## What it does
User enters a URL and selects a crawl mode. Firecrawl fetches the content, Claude analyzes it into a semantic graph, and the browser renders an interactive force-directed knowledge graph.

---

## Crawl Modes

**Mode 1 — Single Page**
Calls `firecrawl.scrapeUrl(url)`. Returns one markdown document.

**Mode 2 — Full Site**
Calls `firecrawl.crawlUrl(url, { limit: 50 })`. Returns an array of markdown documents (one per page). All pages are concatenated before being sent to Claude — the result is one merged semantic graph, not per-page graphs.

---

## Data Flow

```
[URL input + mode select]
        ↓
[POST /api/crawl]          ← client hits this first, shows "Crawling…"
  → Firecrawl SDK (server-side, FIRECRAWL_API_KEY)
  → returns { markdown: string }
        ↓
[POST /api/analyze]        ← client hits this second, shows "Analyzing…"
  → token estimate: count chars ÷ 4 as rough token proxy
  → if over ~80k tokens: truncate to most-relevant sections (trim from the end)
  → Anthropic SDK (server-side, ANTHROPIC_API_KEY)
  → prompt: extract semantic graph as JSON
  → returns { nodes, edges }
        ↓
[Graph component]
  → react-force-graph-2d
  → renders nodes sized by weight, colored by type
```

Two separate API routes so the UI can show distinct status messages for each phase.

---

## Graph Schema

Claude is asked to return this JSON shape:

```json
{
  "nodes": [
    { "id": "1", "label": "string", "type": "topic|entity|feature|claim", "weight": 0.0–1.0 }
  ],
  "edges": [
    { "source": "1", "target": "2", "label": "string" }
  ]
}
```

- `weight` controls node size in the visualization
- `type` controls node color
- Claude decides the hierarchy — not HTML tag structure

---

## Claude Prompt (sketch)

```
You are analyzing web content to extract a semantic knowledge graph.

Given the following markdown content from a website, return a JSON object with:
- nodes: key topics, entities, features, and claims. Each has an id, label, type (topic|entity|feature|claim), and weight (0–1, representing importance/centrality).
- edges: relationships between nodes. Each has source id, target id, and a short label describing the relationship.

Aim for 15–40 nodes. Merge near-duplicate concepts. Weight central themes higher.

Return only valid JSON.

CONTENT:
{markdown}
```

---

## File Structure

```
app/
  page.tsx                  # URL input form + mode toggle
  api/
    crawl/route.ts          # Firecrawl logic, returns merged markdown
    analyze/route.ts        # Anthropic SDK call, returns graph JSON
  components/
    GraphView.tsx           # react-force-graph-2d wrapper
    CrawlForm.tsx           # URL input + mode select + submit
    StatusBar.tsx           # "Crawling… / Analyzing… / Done" feedback
.env.local                  # FIRECRAWL_API_KEY, ANTHROPIC_API_KEY
```

---

## UI States

1. **Idle** — form visible, graph area empty
2. **Crawling** — spinner, "Crawling site…" message, form disabled
3. **Analyzing** — spinner, "Building knowledge graph…"
4. **Done** — graph rendered, form re-enabled, node count shown
5. **Error** — inline error message with retry

---

## Key Dependencies

| Package | Purpose |
|---|---|
| `@mendable/firecrawl-js` | Crawl/scrape |
| `@anthropic-ai/sdk` | Claude analysis |
| `react-force-graph-2d` | Graph visualization |

---

## Out of Scope (for now)

- Saving/exporting graphs
- Per-page graph navigation
- Auth / storing API keys beyond `.env.local`
- Crawl depth configuration (Mode 2 uses a fixed limit of 50 pages)
- Smarter truncation (e.g. semantic chunking) — initial version trims from the end at ~80k token estimate (chars ÷ 4)
