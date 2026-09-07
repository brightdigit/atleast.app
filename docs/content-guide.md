# Content Guide — How to Add an Article

Everything you need to write and ship a guide article. Read
[`docs/positioning.md`](positioning.md) first for voice and claims.

Articles live in `src/content/articles/<slug>.md`. **The file name is the
slug** — `box-breathing-timer.md` publishes at `/box-breathing-timer`. They are
rendered by `src/pages/[slug].astro` through `src/layouts/ArticleLayout.astro`
and listed on the `/guides` hub, grouped by cluster.

---

## Frontmatter

The schema is defined in `src/content.config.ts`; the build fails on anything
that does not validate.

```yaml
---
title: "Box Breathing Timer for Apple Watch"     # H1 and <title> (" — AtLeast" is appended)
description: "Set a four-second tap interval and let each tap mark a phase change — no screen, no counting."   # ≤ 160 chars, answer-first
cluster: breathwork                              # breathwork | meditation | cold-plunge | haptic
pillar: false                                    # true only for the cluster's pillar article
order: 1                                         # position within the cluster on /guides (pillar is always first)
targetQueries:                                   # at least one; the queries this page is written for
  - box breathing timer
  - box breathing apple watch
datePublished: 2026-09-12
dateModified: 2026-09-12                         # optional; defaults to datePublished
related:                                         # slugs; ones that do not exist yet are silently skipped
  - breathing-pacer
  - 4-7-8-breathing-timer
citations:                                       # rendered as the References list with #ref-N anchors
  - text: "Cleveland Clinic — Box Breathing Benefits"
    url: "https://health.clevelandclinic.org/box-breathing-benefits"
faq:                                             # optional; becomes FAQPage JSON-LD
  - q: "How long should a box breathing session be?"
    a: "Five minutes is a common starting point; build up from there."
issue: 108                                       # GitHub issue, for traceability
draft: false                                     # true keeps the page out of the build entirely
---
```

Notes:

- `description` doubles as the meta description **and** the answer-first opening
  paragraph on the page. Write it to answer the target query in one sentence.
- `related` is order-preserving. Put the cluster pillar first for a spoke.
  Slugs that are not in the collection are dropped, so you can link a neighbour
  before it is written.
- `citations` are numbered in array order. Reference them in the body as
  `<sup><a href="#ref-1">[1]</a></sup>`.
- `draft: true` excludes the article from `getStaticPaths`, the hub, and the
  sitemap.

## Slug table

Fixed up front so cross-links can be written before their targets exist.

| Cluster key | Cluster label (hub / objective) | Issue | Slug | Role |
|---|---|---|---|---|
| `breathwork` | Breathwork Pacing Timers for Apple Watch (#104) | 107 | `breathing-pacer` | pillar |
| | | 108 | `box-breathing-timer` | spoke |
| | | 109 | `4-7-8-breathing-timer` | spoke |
| | | 110 | `apple-watch-breathing-app` | spoke (comparison) |
| | | 111 | `breathing-timer-app` | spoke |
| | | 112 | `wim-hof-breathing-timer` | spoke |
| | | 113 | `how-long-should-you-do-box-breathing` | spoke (informational) |
| `meditation` | Silent Meditation Timer on Apple Watch (#103) | 115 | `apple-watch-meditation-timer` | pillar |
| | | 117 | `silent-meditation-timer` | spoke |
| | | 119 | `meditation-timer-without-sound` | spoke |
| | | 121 | `mindfulness-timer-apple-watch` | spoke |
| `cold-plunge` | Cold Plunge Timing from the Wrist (#105) | 114 | `cold-plunge-timer` | pillar |
| | | 116 | `ice-bath-timer` | spoke |
| | | 118 | `cold-plunge-timer-apple-watch` | spoke |
| | | 120 | `cold-plunge-timer-app` | spoke (comparison) |
| `haptic` | Timer That Taps Instead of Rings (#106) | 123 | `timer-that-vibrates` | pillar |
| | | 125 | `vibrating-timer-apple-watch` | spoke |
| | | 127 | `vibrate-only-timer` | spoke |
| | | 128 | `apple-watch-timer-without-sound` | spoke |
| | | 129 | `haptic-timer-app` | spoke |

Cluster labels and descriptions live in `CLUSTERS` in `src/config.ts`.

## Word and citation targets

| | Words | Citations | FAQ | `related` | `order` |
|---|---|---|---|---|---|
| **Pillar** | 1,800–2,500 | 8+ | 3–5 (required) | every spoke in the cluster + one cross-cluster pillar | `0`, `pillar: true` |
| **Spoke** | 900–1,400 | 4+ | 2–3 (optional) | cluster pillar + 1–2 sibling spokes | per the plan's priority order |

Citations must be peer-reviewed or institutional — NCCIH, PubMed, Cleveland
Clinic, Apple support pages, and similar. **Open every URL and confirm it says
what you are citing it for.** Comparison articles must verify competitor facts
on the competitor's own page.

## Internal-link rules

- A spoke links to its cluster pillar **within the first 200 words** of the body.
- A pillar lists all of its spokes in `related` (they render as they land).
- Link across clusters when it genuinely helps the reader, not for its own sake.
- Never invent a slug. Use the table above — a link to a slug that will never
  exist fails `make check:links`.
- Linking a page that has not shipped yet is fine, but add the path to
  `scripts/check-links.allow` and remove it in the PR that ships the page.

## CTA

Do not write a call to action into the markdown body. `ArticleLayout` inserts
`ArticleCta` twice automatically — once mid-article (after the first `##`
section) and once at the end. Both read `PRIMARY_CTA` from `src/config.ts`, so
they switch from TestFlight to the App Store at launch with no article edits.

## JSON-LD checklist

The layout emits all of this; the check is that the frontmatter feeds it correctly.

- [ ] `Article` — headline, description, dates, `citation` array, BrightDigit as author/publisher
- [ ] `BreadcrumbList` — Home › Guides › Cluster › Title
- [ ] `FAQPage` — only when `faq` is non-empty
- [ ] Canonical, OG, and Twitter tags via `BaseHead` (nothing to do per-article)

Verify by grepping the built page:

```sh
grep -o '"@type":"[A-Za-z]*"' dist/<slug>/index.html | sort -u
```

## PR checklist

```sh
make install          # first time in a new worktree only
make build
make check:links
```

- [ ] Frontmatter validates and the build succeeds
- [ ] `make check:links` passes (no unlisted dead internal links)
- [ ] `dist/<slug>/index.html` has the H1, both CTAs, and the References list
- [ ] JSON-LD types are present (see above)
- [ ] The article appears on `dist/guides/index.html` under the right cluster
- [ ] Word count and citation count meet the target for its role
- [ ] Every citation URL was opened and says what the article claims
- [ ] No claim outside the "do not claim" list below
- [ ] PR title `Content: <title>`; body has a summary, a test plan,
      `Closes #<issue>`, `Refs #<objective>`, and the
      `🤖 Generated with [Claude Code](https://claude.com/claude-code)` footer
- [ ] PR targets `260907`, and you do **not** merge it yourself

If a build shows a stale article (one you renamed or deleted still appears),
clear the content layer cache: `rm -rf node_modules/.astro dist && make build`.

## Do not claim

These are the ways it is easiest to accidentally lie about the product.

- **No multi-phase breathing patterns.** The app has one tap interval per
  session — it does not know your pattern and cannot cue inhale/hold/exhale
  distinctly. For box breathing (4-4-4-4) a 4-second interval happens to tap
  every phase change. For uneven patterns (4-7-8, Wim Hof rounds) describe a
  practical setup — a short steady interval you count against, or one session
  per round — rather than pretending the app follows the pattern.
- **No App Store availability, ratings, or post-launch price.** It is a free
  TestFlight beta today.
- **No health outcomes beyond what a cited source supports.** The Terms say
  *AtLeast* is not a medical device. Keep the safety caveats on cold-plunge and
  breathwork articles (and never breathe-hold in water).
- **No competitor facts you have not checked on the competitor's own page.**
- **No hype.** Not "revolutionary", "game-changing", or "powerful". Use gentle,
  minimum, silence, rhythm, practice, earn it. Write `*AtLeast*` in markdown
  bodies (`<em>AtLeast</em>` in `.astro` files).
- **Never write for "may I watch at least" or webtoon queries.** Those
  impressions are a brand-name collision, not an audience (#126).
