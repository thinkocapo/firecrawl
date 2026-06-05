import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const MAX_CHARS = 320_000; // ~80k tokens at chars÷4

function truncate(markdown: string): string {
  if (markdown.length <= MAX_CHARS) return markdown;
  return markdown.slice(0, MAX_CHARS) + "\n\n[Content truncated due to length]";
}

export async function POST(req: NextRequest) {
  const { markdown, anthropicKey } = await req.json();
  if (!markdown) return NextResponse.json({ error: "markdown required" }, { status: 400 });

  const apiKey = anthropicKey || process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "No Anthropic API key found. Paste your key into the field at the top of the page." },
      { status: 500 },
    );
  }

  const client = new Anthropic({ apiKey });
  const content = truncate(markdown);

  const prompt = `You are analyzing web content to extract a semantic knowledge graph.

Given the following markdown content from a website, return a JSON object with:
- nodes: key topics, entities, features, and claims. Each node has:
  - id: unique string
  - label: short display name (2-4 words max)
  - type: one of "topic" | "entity" | "feature" | "claim"
  - weight: number 0–1 representing importance/centrality (higher = bigger node)
- edges: relationships between nodes. Each edge has:
  - source: node id
  - target: node id
  - label: short verb phrase describing the relationship

Aim for 15–40 nodes. Merge near-duplicate concepts. Weight the most central themes highest (0.8–1.0). Supporting details should be lower (0.2–0.5).

Return ONLY valid JSON — no markdown fences, no explanation.

CONTENT:
${content}`;

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    });

    const text = message.content[0].type === "text" ? message.content[0].text : "";
    // Be tolerant of stray markdown fences or surrounding prose.
    const jsonSlice = text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1);
    const graph = JSON.parse(jsonSlice || text);
    return NextResponse.json(graph);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
