# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Marketing website for **AtLeast**, a passive haptic timer app for Apple Watch. Static site deployed to Cloudflare Pages at `atleast.app`.

Full website spec (pages, sections, copy, SEO, deployment details) is in `.claude/WEBSITE.md`.

## Tech Stack

- **Astro** (static site generator) with **Tailwind CSS**
- TypeScript (strict mode)
- Deployed to **Cloudflare Pages**
- No backend, no database, no CMS — pure static HTML

## Commands

```bash
npm run dev        # Start dev server
npm run build      # Production build (output: dist/)
npm run preview    # Preview production build locally
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
- **Support email:** support@atleastapp.com
- **Copyright:** © 2026 BrightDigit. All rights reserved.
