# SineThamsanqa Business Solutions

## Description

**SineThamsanqa Business Solutions** is a Next.js web app (AI content generator) that uses [OpenRouter](https://openrouter.ai/) to turn product or service details into ready-to-post social content. You pick a platform, describe what you’re promoting, and get multiple copy variations with one-click copy for titles, hashtags, threads, and more.

## What it does

The app sends your inputs to a language model and returns **three structured variations** tailored to the network you selected. Each variation is validated on the server so you get consistent fields (for example Pinterest titles and tags, or LinkedIn headlines and body text). The UI is optimized for quickly copying pieces into Pinterest, X, Threads, or LinkedIn without reformatting.

## Features

- **Multi-platform output** — Pinterest, X (Twitter), Threads, and LinkedIn in one flow.
- **Content focus** — Choose **Affiliate Product** or **Service** so prompts match how you sell.
- **Pinterest** — Pin titles, descriptions, hashtags, and optional **AI image prompts** for pin visuals.
- **X (Twitter)** — Tweets and hashtags; optional **thread** generation.
- **Threads** — Hook, body, and hashtags tuned for short-form posts.
- **LinkedIn** — Headline, body, hashtags; optional **call-to-action** line.
- **Three variations per run** — Compare angles side by side.
- **Copy-friendly UI** — Copy individual fields, tags, or **everything** for a variation at once.
- **Validated API responses** — Server-side parsing and checks (Zod) before results reach the client.
- **Edge API route** — Generation runs on the Edge runtime for low latency.

## Getting started

Install dependencies and run the dev server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Configure OpenRouter by setting environment variables (for example in `.env.local`):

- `OPENROUTER_API_KEY` — required for generation.
- `OPENROUTER_MODEL` — optional; defaults to a configured model in `lib/openrouter.ts`.
- `NEXT_PUBLIC_SITE_URL` — optional; used as the HTTP referer for OpenRouter.

## Build

```bash
npm run build
npm start
```

## Tech stack

Next.js (App Router), React, TypeScript, Tailwind CSS, OpenAI-compatible client via OpenRouter, Zod.
