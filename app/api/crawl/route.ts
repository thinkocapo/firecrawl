import { NextRequest, NextResponse } from "next/server";
import FirecrawlApp from "@mendable/firecrawl-js";

export async function POST(req: NextRequest) {
  const { url, mode } = await req.json();

  if (!url) return NextResponse.json({ error: "url required" }, { status: 400 });

  const firecrawl = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY! });

  try {
    let markdown: string;

    if (mode === "single") {
      const result = await firecrawl.scrapeUrl(url, { formats: ["markdown"] });
      if (!result.success) throw new Error("Scrape failed");
      markdown = result.markdown ?? "";
    } else {
      const result = await firecrawl.crawlUrl(url, {
        limit: 50,
        scrapeOptions: { formats: ["markdown"] },
      });
      if (!result.success) throw new Error("Crawl failed");
      markdown = result.data
        .map((p: { markdown?: string }) => p.markdown ?? "")
        .filter(Boolean)
        .join("\n\n---\n\n");
    }

    return NextResponse.json({ markdown });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
