# Knowledge Graph

Enter a URL and this app crawls it, sends the content to Claude, and renders an interactive force-directed graph of the site's semantic structure — topics, entities, features, and claims as nodes, with labeled edges showing how they relate.

You can crawl a single page or a full site (up to 50 pages). In full-site mode, all pages are merged into one unified graph rather than shown separately. Firecrawl handles the crawling and returns clean markdown; Claude analyzes that markdown and decides the conceptual hierarchy — node size reflects how central a concept is, and color indicates its type. The graph is rendered with a physics simulation so related concepts naturally cluster together.

## Setup

Add your API keys to `.env.local`:

```
FIRECRAWL_API_KEY=...
ANTHROPIC_API_KEY=...
```

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
