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

## Outreach Lead Tooling

`scripts/find-*.js` build outreach lists. They are working tools for marketing the app,
not part of the site build — nothing they produce is ever published.

```bash
make leads        # press, communities, creators, studios, local (Exa; EXA_API_KEY)
make studios      # studios/spas from Overture Maps (needs the DuckDB CLI, no key)
make podcasts     # shows from Podcast Index (PODCAST_INDEX_KEY / _SECRET)
make verify-leads # live-check links and email domains in the newest reports
make leads-known  # refresh KNOWN_TARGETS from open GitHub issues
```

Each script takes `--help` and `--dry-run`; `--dry-run` needs no key or DuckDB, so it is
the way to check a query change here. Pass flags through `ARGS="..."`.

- **Output** goes to `leads/`, which is gitignored — the reports carry contact details and
  are backed up to a separate private repo (`make leads-backup`). Never commit them, and
  never put a lead's contact details into site content.
- **Home region is Greater Lansing, Michigan**, with Michigan statewide behind it. Both run
  by default: `SEARCHES.local` in `find-leads.config.js`, and the `lansing` / `michigan`
  areas in `find-studios.js`. Areas there run in listed order and a place already reported
  by an earlier area is skipped, so home must stay first in `DEFAULT_METROS`.
- **Statewide region filter:** `michigan` matches `upper(addresses[1].region)` against
  `MI`/`MICHIGAN`. Verified live against Overture `2026-08-19.0` on 2026-08-24 (Lansing
  returned rows and statewide returned additional MI places with Lansing URLs deduped).
  If a future release returns an empty statewide section while metro boxes still work,
  inspect that field first.
- Leads are model- or index-extracted and go stale. Verify before contacting anyone, and
  keep the CAN-SPAM note in the studio report intact — those businesses did not opt in.

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
