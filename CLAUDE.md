# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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
```

Or equivalently via mise:
```bash
mise exec -- npm run dev
mise exec -- npm run build
```

## Architecture

- `src/pages/` — Three pages: `index.astro` (home), `privacy.astro`, `support.astro`
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

Calm, confident, minimal. Use words like "gentle", "silence", "rhythm", "practice". Avoid hype words like "revolutionary" or "game-changing". Frame features as benefits. Always mention privacy-first positioning — the app collects zero data and runs entirely on-device.

## Key Details

- **Company:** BrightDigit
- **Support email:** support@brightdigit.com
- **Copyright:** © 2026 BrightDigit. All rights reserved.
