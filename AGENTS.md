# AGENTS.md

This file provides guidance to coding agents working in this repository.

## Project

Marketing website for **AtLeast**, a passive haptic timer app for Apple Watch. Static site deployed to GitHub Pages at `atleast.app`.

Full website spec (pages, sections, copy, SEO, deployment details) is in `.claude/WEBSITE.md`.

## Tech Stack

- **Astro** (static site generator) with **Tailwind CSS**
- TypeScript (strict mode)
- Deployed to **GitHub Pages** (domain via Namecheap)
- No backend, no database, no CMS — pure static HTML

## Commands

Always run commands through `mise` or `make` — do not invoke `npm` directly as it may not be on PATH.

```bash
make install   # Install dependencies
make dev       # Start dev server
make build     # Production build (output: dist/)
make preview   # Preview production build locally
make lighthouse  # Run Lighthouse CI
make check:links # Verify internal links in dist/ (run after make build)
```

Or equivalently via mise:
```bash
mise exec -- npm run dev
mise exec -- npm run build
```

## Architecture

- `src/pages/` — Static pages (`index.astro`, `use-cases.astro`, `privacy.astro`,
  `terms.astro`, `support.astro`, `press.astro`), the `/guides` hub, and
  `[slug].astro` which renders guide articles at the top level
- `src/content/articles/` — Guide articles (markdown); schema in `src/content.config.ts`.
  See `docs/content-guide.md`
- `src/components/` — Astro components (Nav, Footer, BaseHead, HeroRings, cards, etc.)
- `src/layouts/` — Shared page layout (`Layout.astro`)
- `src/styles/` — Global CSS including Tailwind
- `public/` — Static assets (favicon, OG image, App Store badge SVG)

## Design System

- **Dark theme** — near-black background (`#0A0A0A`), light text (`#F5F5F5`)
- Brand colors defined as `brand-*` in Tailwind config: `bg`, `surface`, `border`, `text`, `muted`, `accent` (blue `#6B8FF8`), `pulse` (purple `#9B7FE8`)
- System font stack: `-apple-system`, `SF Pro Display`, `Inter`, `system-ui`
- Generous whitespace — minimum `py-24` between major sections
- CSS-only animations (no JS animation libraries)

## Content Voice

Calm, confident, minimal. Use words like "gentle", "silence", "rhythm", "practice". Avoid hype words like "revolutionary" or "game-changing". Frame features as benefits. Always mention privacy-first positioning — no accounts; session and haptic logic run on-device; cookieless Plausible analytics only (website pageviews, outbound-link clicks, and custom events; iPhone and Apple Watch apps via AviaryInsights: ios_open, pageview, and session_start with session config props), never for advertising or cross-app tracking. Privacy copy must match the app’s real analytics surface (Watch + iPhone, not iOS-only).

See [`docs/positioning.md`](docs/positioning.md) for who the app is for, what it
is, and why it's better — the source of truth for marketing copy and article
intros. [`docs/content-guide.md`](docs/content-guide.md) covers how to add a
guide article (frontmatter, slug table, citation targets, and the "do not
claim" list).

## Key Details

- **Company:** BrightDigit
- **Support email:** support@atleast.app
- **Copyright:** © 2026 BrightDigit. All rights reserved.

## Memory & Corrections Convention

`.claude/agent-notes.md` is the versioned, in-repo source of truth for user
corrections and standing always/never directives.

- **Read it first** at the start of every session before doing work.
- **Append proactively** (without being asked) one line per correction or
  always/never instruction the user gives.
- Newest entries at the bottom; one line per entry.
- When a new directive supersedes an earlier one, update or remove the stale
  line rather than leaving both.
