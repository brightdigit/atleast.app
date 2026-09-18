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

## Outreach Lead Tooling

`scripts/find-*.js` build outreach lists. They are working tools for marketing the app,
not part of the site build — nothing they produce is ever published.

```bash
make leads        # press, communities, creators, studios, local (Exa; EXA_API_KEY)
make studios      # studios/spas from Overture Maps (needs the DuckDB CLI, no key)
make podcasts     # shows from Podcast Index (PODCAST_INDEX_KEY / _SECRET)
make verify-leads # live-check links, email domains, and publication freshness in the newest reports
make leads-known  # refresh KNOWN_TARGETS from open GitHub issues
make drafts       # queue outreach batch as Gmail drafts (GMAIL_ADDRESS / GMAIL_APP_PASSWORD)
```

Each script takes `--help` and `--dry-run`; `--dry-run` needs no key or DuckDB, so it is
the way to check a query change here. Pass flags through `ARGS="..."`.

- **Output** goes to `leads/`, which is gitignored — the reports carry contact details and
  are backed up to a separate private repo (`make leads-backup`). Never commit them, and
  never put a lead's contact details into site content. Inside `leads/`: `reports/` (raw
  finder output + verification), `plan/` (the prioritized outreach plan), `templates/`
  (email copy), `scripts/` (private outreach tooling), `drafts/` (drafting state).
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
  "Alive" means reachable, not thriving: link checks can't see whether a mailbox exists
  (two 550 hard bounces on 2026-08-25) or whether a publication still publishes, so
  `verify-leads` also reads podcast/press/community/creator feeds and demotes leads whose
  newest item is over `--stale-days` (default 365) old to `stale`. Only item-level feed
  dates count — platforms stamp a current lastBuildDate on dead feeds.
- **Sending is always manual.** Write a recipient-facing `hookLine` on each plan entry
  first (`hookLine` is not `pitchAngle` — that stays internal, notes-only), then
  `make drafts` IMAP-appends complete Gmail drafts — never sends. Leads without a
  `hookLine` are skipped. Each draft still carries a `[[ NOTES ]]` crib block to delete
  before sending; notes are mirrored to `leads/drafts/notes-<date>.md`. Default batch is
  15/day; drafted leads are tracked in `leads/drafts/log.json`. Templates live in
  `leads/templates/` in the private leads repo.

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
