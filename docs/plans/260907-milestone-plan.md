# Milestone 260907 — Implementation Plan

Agent-consumable plan for closing every open issue in GitHub milestone **260907**
(`brightdigit/atleast.app`, milestone number 3). Written 2026-09-07 against
`main` @ `594fc9b`. Branch `260907` already exists and equals `main`.

Read this whole file before doing anything. Then read, in the target worktree,
`CLAUDE.md`, `.claude/agent-notes.md`, and `.claude/WEBSITE.md`.

---

## 0. Ground rules (apply to orchestrator and every subagent)

### Repo layout
The project uses a bare repo + one worktree per branch, managed by `git-trees`
(`git trees ...`). Container: `/Users/leo/Documents/Projects/atleast.app/`.
Existing worktrees: `main/`, `260907/`, plus unrelated lead-gen branches.

- Every branch gets its own worktree. **Never `git checkout` another branch
  inside a worktree.** Never touch `atleast.app.git/`.
- Create: `git trees add <branch> 260907 --print-path` (run from the container
  dir; prints the new worktree path; sets upstream and pushes the branch).
- Remove after merge: `git trees rm <branch> --apply`.
- Branch names: **`260907-<slug>`** (hyphen, not slash — `refs/heads/260907`
  already exists as a file, so `260907/<x>` is impossible).
- Bare `git stash` is forbidden (shared stash). Use a WIP commit if you must.

### Commands
- `make install` (once per new worktree; `node_modules` is per worktree)
- `make build` — must succeed before every push. Output in `dist/`.
- `make dev` / `make preview` for manual checks.
- Never call `npm` directly; `mise exec -- npm ...` if `make` lacks a target.
- Images/video are **git LFS** (`.gitattributes`). New `.mp4/.webm/.jpg/.webp`
  files are LFS automatically; `git lfs` must be installed. If `prebuild`
  (`scripts/generate-webp.js`) fails on pointer files, run `git lfs pull`.

### Integration model — parent feature branch (chosen over stacked PRs)
```
main  ◄── one final PR ─── 260907  ◄── many small PRs ─── 260907-<slug>
```
- `260907` is the integration branch. **All work PRs target `260907`**, are
  squash-merged with `gh pr merge --squash --delete-branch`, never merged
  locally (repo rule: integrate via GitHub PRs).
- Stacked PRs were rejected: the only true stack is "infra → articles"; after
  that, the 20 articles are mutually independent files. A parent branch gives
  the fan-out for free and lets the final review happen once.
- The final `260907 → main` PR is opened by the orchestrator at the end
  (§6). If the user wants an early release (e.g. breathing pacer live sooner),
  merge `260907 → main` with a **merge commit** (`--merge`, not squash) so the
  branch stays mergeable for a second integration later.
- `main` is unprotected; CI on PRs to `main` = build (`deploy.yml`) +
  Lighthouse (`lighthouse.yml`). **PRs into `260907` get no CI until Wave 0
  widens the workflow triggers** — Wave 0 must merge first.

### PR conventions
- Title: `<Area>: <what>`; body: summary, test plan, `Closes #N` for each
  issue it finishes, `Refs #N` for objectives it advances.
- Body ends with `🤖 Generated with [Claude Code](https://claude.com/claude-code)`.
- CodeRabbit reviews PRs; address its comments before merge.
- One PR ≈ one issue (articles) or one coherent change (infra, privacy, video).

### Subagent contract
Each subagent is spawned with: the worktree path, the branch name, the issue
number(s), the relevant §4 spec, and the instruction to finish with a pushed
branch and an open PR to `260907`. It must **not** merge its own PR. It reports:
PR URL, build status, anything it could not verify, and any product-fact it was
unsure about (see §2).

Suggested concurrency: **max 4–5 worktrees at once** (each has its own
`node_modules`; `make install` ≈ 30 s with a warm npm cache).

---

## 1. Issue inventory and disposition

| # | Title | Disposition | Wave | PR |
|---|---|---|---|---|
| 130 | Loop composite video on homepage | implement | 0 | `260907-hero-video` |
| 98 | Privacy: disclose device model | implement | 0 | `260907-privacy` |
| 102 | Privacy: RevenueCat purchase history | implement | 0 | `260907-privacy` |
| 99 | Privacy: CloudKit sync (future) | **no copy change now** (issue says so); comment + leave open | 0 | none |
| 35 | Positioning Guide | write `docs/positioning.md` (Who / What / Why-better) | 0 | `260907-content-infra` |
| 126 | Guardrail: ignore "may I watch at least" | add standing line to `.claude/agent-notes.md`; close | 0 | `260907-content-infra` |
| 124 | Swap CTAs at App Store launch | **prep only** now (single CTA source of truth); leave open until launch | 0 | `260907-content-infra` |
| 107 + 122 | Breathing Pacer PILLAR + publish draft | implement | 1 | `260907-breathing-pacer` |
| 114 | Cold Plunge Timer PILLAR | implement | 1 | `260907-cold-plunge-timer` |
| 115 + 21 | Apple Watch Meditation Timer PILLAR (+ old guide-page issue) | implement; #21 closed by same PR | 1 | `260907-apple-watch-meditation-timer` |
| 123 | Timer That Vibrates PILLAR | implement | 1 | `260907-timer-that-vibrates` |
| 22 | Comparison page `/compare` | implement | 1 | `260907-compare` |
| 108–113 | Breathwork spokes (6) | implement | 2 | one PR each |
| 117, 119, 121 | Meditation spokes (3) | implement | 2 | one PR each |
| 116, 118, 120 | Cold-plunge spokes (3) | implement | 2 | one PR each |
| 125, 127, 128, 129 | Haptic spokes (4) | implement | 2 | one PR each |
| 103–106 | SEO objectives (4) | tracking issues; link children as sub-issues; **leave open** (measured over 28/90 days) | 0 | none |

Totals: 20 articles, 1 comparison page, 1 privacy PR, 1 video PR, 1 infra PR.
Issues that remain open after the milestone work: #99, #124 (until launch),
#103–#106 (until measured).

---

## 2. Product truth — the only claims articles may make

Verified from the live site (`src/pages/*.astro`) on 2026-09-07. Articles must
not invent features. If an article's brief needs a capability not listed here,
write around it honestly and add it under "Open questions" in the PR body.

**What AtLeast is.** A passive haptic timer for Apple Watch. You set a minimum
duration (1–60 min) and a tap interval. Gentle taps on the wrist mark time
during the session; when the taps stop you have reached your minimum. No alarm,
no sound, no screen to check. "Set a floor, not a ceiling."

**Verified facts**
- Runs entirely on Apple Watch; works offline; no phone needed.
- Continues haptics with the watch face off (Extended Runtime Session).
- Optional iPhone companion: pre-load/pick a timer on iPhone, press Start on the
  Watch, iPhone mirrors the live session. Taps always happen on the wrist.
- Requires Apple Watch Series 6 or later, watchOS 26.0+.
- Privacy-first: no accounts; session and haptic logic on-device; cookieless
  Plausible analytics (website, iPhone, Watch via AviaryInsights). Never for
  advertising or cross-app tracking.
- Currently a **TestFlight beta** (`TESTFLIGHT_URL` in `src/config.ts`);
  App Store launch planned end of September 2026. Price today: free.
- Session config has: duration, tap interval (seconds), haptic config.

**Do not claim**
- Multi-phase breathing patterns with distinct inhale/hold/exhale cues. The app
  has one tap interval per session. For box breathing (4-4-4-4) a 4 s interval
  taps every phase change; for uneven patterns (4-7-8, Wim Hof rounds) describe
  a practical setup (e.g. a short steady interval you count against, or one
  interval per round) rather than pretending the app knows the pattern.
- App Store availability, ratings, or a price after launch.
- Health outcomes beyond what a cited source supports. Terms say "not a medical
  device"; keep cold-plunge and breathwork safety caveats.
- Competitor facts you have not checked on the competitor's own page.

**Voice** (from `CLAUDE.md`): calm, confident, minimal. Words: gentle, silence,
rhythm, practice. No hype ("revolutionary", "game-changing"). Frame features as
benefits. Always mention privacy-first. `<em>AtLeast</em>` in HTML; `*AtLeast*`
in markdown body.

---

## 3. Site conventions the infra must establish (Wave 0 output)

### URL scheme
- Articles: **top-level `/<slug>`** rendered by `src/pages/[slug].astro` from a
  content collection. Static pages (`/press`, `/privacy`, …) win over the
  dynamic route, so no collisions.
- Hub: `/guides` (`src/pages/guides/index.astro`) grouped by cluster, pillar
  first, then spokes by `order`.
- Comparison page: `/compare` (static page, #22).

### Slug table (fixed now so cross-links can be written before neighbours exist)

| Cluster key | Cluster label (hub / objective) | # | Slug | Role |
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

### Content collection schema (`src/content.config.ts`, Astro 6 content layer)
```ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const articles = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/articles' }),
  schema: z.object({
    title: z.string(),                 // H1 and <title> (append " — AtLeast" in layout)
    description: z.string().max(160), // meta description, answer-first
    cluster: z.enum(['breathwork', 'meditation', 'cold-plunge', 'haptic']),
    pillar: z.boolean().default(false),
    order: z.number().default(100),   // ordering within cluster on the hub
    targetQueries: z.array(z.string()).min(1),
    datePublished: z.coerce.date(),
    dateModified: z.coerce.date().optional(),
    related: z.array(z.string()).default([]), // slugs; rendered only if they exist
    citations: z.array(z.object({ text: z.string(), url: z.string().url() })).default([]),
    faq: z.array(z.object({ q: z.string(), a: z.string() })).default([]), // → FAQPage JSON-LD
    issue: z.number().optional(),     // GitHub issue number, for traceability
    draft: z.boolean().default(false),
  }),
});
export const collections = { articles };
```
File name = slug: `src/content/articles/<slug>.md`.

### Article page (`src/pages/[slug].astro` + `src/layouts/ArticleLayout.astro`)
Must render, in order:
1. Breadcrumb (Home › Guides › Cluster › Title) with `BreadcrumbList` JSON-LD.
2. H1 = `title`; first paragraph is the **answer-first** summary (≤ 50 words).
3. Body from markdown, styled with a `.prose` block added to
   `src/styles/global.css` (no new dependency required; mirror the
   `use-cases.astro` type scale: `text-base leading-relaxed text-brand-muted`,
   headings `text-brand-text`, links `text-brand-accent`, tables scroll in
   `overflow-x-auto`).
4. `ArticleCta` block (mid-article after the first H2, and at the end) using the
   shared CTA (§3 "CTA source of truth"). `data-tf-location="article-<slug>"`.
5. Related articles: cards for `related` slugs **filtered to entries that exist
   in the collection** — this is what lets pillars list spokes before the spokes
   are merged. Always include the cluster pillar for a spoke.
6. Citations list (`#ref-N` anchors like `use-cases.astro`); in-body citations
   as `[1]` superscript links.
7. `Article` JSON-LD (copy the shape in `use-cases.astro`; `citation` array,
   `author`/`publisher` = BrightDigit) and `FAQPage` JSON-LD when `faq` non-empty.
8. Canonical, OG, Twitter via existing `BaseHead`.

### CTA source of truth (prep for #124)
In `src/config.ts` add:
```ts
export const APP_STORE_URL = '';                    // fill at launch
export const PRIMARY_CTA: 'testflight' | 'appstore' = 'testflight';
```
`AppStoreBadge.astro`, `Nav.astro` "Join Beta", and the new `ArticleCta.astro`
read `PRIMARY_CTA` and render either the TestFlight badge/label or the App Store
badge (`public/app-store-badge.svg` already exists). Launch day becomes a
two-line config change plus a copy pass; articles pick it up automatically
because they all use `ArticleCta`. Keep `data-testflight-link` tracking working
for both modes (rename the Plausible event only if the user asks).

### Navigation
- `Nav.astro`: add `Guides` (`/guides`) after Use Cases. Do not add Compare to
  the nav (it is already crowded); link `/compare` from the footer, the hub, and
  the homepage comparison table section.
- `Footer.astro`: add Guides and Compare.
- Homepage and `/use-cases`: add a short "Guides" section/paragraph linking the
  four pillars (#107 acceptance: linked from homepage and use-cases page).

### Link checker
Add `scripts/check-links.js`: walk `dist/**/*.html`, collect internal `href`s,
fail if the target file does not exist. Wire as `npm run check:links` and add
`check\:links` to the Makefile `SCRIPTS` list. Every article PR runs
`make build && make check:links`.

### CI
Widen `pull_request` triggers so PRs into `260907` are built and Lighthoused:
- `.github/workflows/deploy.yml`: `pull_request: branches: [main, '260907']`
  (upload/deploy steps are already gated on `refs/heads/main`).
- `.github/workflows/lighthouse.yml`: add `'260907'` to `pull_request.branches`.
Lighthouse only audits `/` (`maxAutodiscoverUrls: 0`), so article pages are
checked by `make build` + link checker, not Lighthouse.

### Docs
- `docs/positioning.md` (#35): three sections **1. Who it's for / 2. What it
  is / 3. Why it's better**, each ≤ 200 words, sourced from §2, `WEBSITE.md`,
  the homepage and use-cases copy. Link it from `CLAUDE.md` → Content Voice.
- `docs/content-guide.md`: how to add an article (frontmatter, slug table, word
  and citation targets, internal-link rules, CTA, JSON-LD checklist, PR
  checklist). Article subagents read this instead of re-deriving conventions.

---

## 4. Work packages

### Wave 0 — run these three in parallel (independent files)

#### W0-A `260907-content-infra` (Closes #126, #35; Refs #124, #107)
Everything in §3, plus:
- `.claude/agent-notes.md` — append one line: *"SEO: never create or optimise
  content for 'may I watch at least' / webtoon queries; those impressions are a
  brand-name collision, not progress on any objective (#126)."*
- Comment on #124 describing the `PRIMARY_CTA` switch and what remains at
  launch (URL, badge copy, homepage/use-cases copy pass, article CTA check).
- Validate the pipeline with a throwaway article in `src/content/articles/`
  (build, check hub, check JSON-LD in `dist/<slug>/index.html`, run link
  checker), then **delete it before committing**.
- Do not add real articles here; keep the PR reviewable.

#### W0-B `260907-privacy` (Closes #98, #102; Refs #99)
Edit `src/pages/privacy.astro` only (plus `terms.astro` if adding IAP wording):
- Analytics → iPhone/Watch bullet: add device model, e.g. *"…and a device model
  identifier (for example `iPhone16,1` or `Watch7,4`) on all app events."*
  Keep "No personal identifiers or advertising IDs" (it stays true).
- New section **Purchases** (before "What we do not collect"): purchase history
  is processed by RevenueCat using an anonymous app user ID (no accounts); used
  for app functionality (unlocking Pro / entitlements, receipt validation) and
  analytics (purchase charts, customer history); not linked to identity; not
  used for advertising or cross-app tracking.
- Third parties: add RevenueCat alongside Plausible/AviaryInsights. Remove any
  phrasing that implies "no third parties".
- `terms.astro`: add a short subscriptions / in-app purchase clause (billing via
  Apple, managed in App Store settings, refunds via Apple).
- Bump "Last updated" to September 2026; update the meta description if needed.
- #99: **do not change copy**. Post a comment on #99 with the proposed CloudKit
  paragraph ("synced through your own iCloud account, which we cannot access")
  so it is ready to paste when the feature ships. Leave open.
- Append to `.claude/agent-notes.md`: one line each for the device-model
  disclosure and the RevenueCat disclosure (standing facts for future edits).

#### W0-C `260907-hero-video` (Closes #130)
Source: `/Users/leo/Downloads/AtLeast-Loop-Composite.mp4` (3648×2048, 6 s,
H.264, no audio, 6.8 MB). `ffmpeg` is at `/opt/homebrew/bin/ffmpeg` with
`libx264`, `libvpx-vp9`, `libsvtav1`.
Placement decision: **hero** (option 1 in the issue) — video replaces the icon
+ ripple rings as the main visual; keep the existing companion demo clip.
- Encode into `public/demo/`:
  ```sh
  ffmpeg -i in.mp4 -an -vf "scale=1600:-2" -c:v libx264 -profile:v high -crf 26 -preset slow -movflags +faststart -pix_fmt yuv420p public/demo/atleast-loop.mp4
  ffmpeg -i in.mp4 -an -vf "scale=1600:-2" -c:v libvpx-vp9 -crf 34 -b:v 0 -row-mt 1 public/demo/atleast-loop.webm
  ffmpeg -i in.mp4 -vf "select=eq(n\,0),scale=1600:-2" -frames:v 1 public/demo/atleast-loop-poster.jpg   # generate-webp.js will make the .webp
  ```
  Target ≤ ~1.5 MB mp4, ≤ ~1 MB webm. If Lighthouse performance drops below
  0.9, drop to 1280 wide and/or raise CRF.
- `index.astro` hero: `<video autoplay loop muted playsinline preload="metadata"
  poster=… aria-label="Looping animation of AtLeast tapping an Apple Watch">`
  with `<source>` webm then mp4; fixed aspect-ratio container (`aspect-[16/9]`
  or the true ratio 3648:2048 ≈ 1.78) so there is no layout jump; `max-w-3xl`.
  Respect `prefers-reduced-motion`: CSS hides the video and shows the poster.
- Keep `HeroRings`/ripple CSS in the repo only if still used elsewhere;
  otherwise remove the dead animation.
- CSP in `BaseHead.astro` is `default-src 'self'` — same-origin media is fine.
- Verify: `make build && make lighthouse` locally (needs Chrome) or rely on
  the PR's Lighthouse job once W0-A has merged; confirm loop has no seam.
- LFS: new binaries are LFS-tracked automatically; confirm with
  `git lfs ls-files | grep atleast-loop`.

#### W0-D (orchestrator, no PR) — housekeeping
- Add sub-issues: #104 ← 107,108,109,110,111,112,113; #103 ← 115,117,119,121;
  #105 ← 114,116,118,120; #106 ← 123,125,127,128,129
  (`gh api -X POST repos/brightdigit/atleast.app/issues/<parent>/sub_issues -F sub_issue_id=<child id>`;
  child *id* ≠ number, fetch with `gh api repos/.../issues/<n> --jq .id`).
- Confirm the Rank-Hub draft for #122 is available (see §5 input). If not,
  ask the user before starting W1-A.

**Gate:** merge W0-A first (it enables CI for later PRs). W0-B and W0-C can
merge in any order; rebase them on `260907` if the workflow changes conflict
(they should not — different files).

### Wave 1 — pillars + compare (5 in parallel, after W0-A merged)

Common spec for pillars: 1,800–2,500 words; 8+ citations (peer-reviewed or
institutional: NCCIH, PubMed, Cleveland Clinic, Apple support pages, etc.);
`faq` with 3–5 questions (`FAQPage` schema); `related` = all spoke slugs of the
cluster (§3 table) + one cross-cluster pillar; `pillar: true`, `order: 0`.
Comparison-style articles include a scannable table. #21's requirements
(2,000+ words, 10+ citations, Article schema, cross-links from homepage and
use-cases) apply to the meditation pillar.

| PR | Branch | Issue(s) | Notes |
|---|---|---|---|
| W1-A | `260907-breathing-pacer` | 107, 122 | Use the finalized Rank-Hub draft verbatim as the body (§5). Light edits only for house style, product truth, and links. TestFlight CTA in body (satisfied by `ArticleCta`). Link from homepage and `/use-cases` breathwork section. |
| W1-B | `260907-cold-plunge-timer` | 114 | Structure sessions by water temperature; "hold your minimum" framing; safety caveat; exclude "how long should you cold plunge" intent (#105 scope note). |
| W1-C | `260907-apple-watch-meditation-timer` | 115, 21 | Cover the built-in Mindfulness app honestly; why a nudge beats a cut-off; 10+ citations. Closes #21 as well. |
| W1-D | `260907-timer-that-vibrates` | 123 | Practice-agnostic; settings that matter (vibrate-only, no screen wake); haptic nudges vs end-of-time buzz; mention physical vibrating timers fairly. |
| W1-E | `260907-compare` | 22 | Static `src/pages/compare.astro`: table (haptic feedback, silence/no alarm, privacy, offline, Apple Watch native, simplicity, price) for AtLeast vs built-in Watch Timer, Apple Mindfulness app, and 3–4 named third-party timer/meditation apps whose facts you verify on their own pages. `ItemList`/`Article` JSON-LD. Honest, non-disparaging. Link to the four pillars. Footer + hub + homepage links. |

### Wave 2 — spokes (start a cluster's spokes once its pillar has merged; up to 5 in parallel across clusters)

Common spec for spokes: 900–1,400 words; 4+ citations; `related` = cluster
pillar + 1–2 sibling spokes; body links to the pillar in the first 200 words;
`faq` optional (2–3); `order` per table below.

Priority order (from #122 and search volume): breathing-pacer spokes first.

| Order | PR branch | Issue | Slug | Brief |
|---|---|---|---|---|
| 1 | `260907-box-breathing-timer` | 108 | `box-breathing-timer` | 4-4-4-4 with a 4 s tap interval; each tap = phase change. Acceptance: linked from the breathing pacer pillar (already in pillar `related`). |
| 2 | `260907-4-7-8-breathing-timer` | 109 | `4-7-8-breathing-timer` | Uneven phases; give a practical setup (see §2 "do not claim"); round counts. |
| 3 | `260907-apple-watch-breathing-app` | 110 | `apple-watch-breathing-app` | Comparison listicle: built-in Breathe/Mindfulness + 4–6 third-party apps + AtLeast; table; verify each app. 450/mo query. |
| 4 | `260907-cold-plunge-timer-app` | 120 | `cold-plunge-timer-app` | Comparison of phone timer, kitchen timer, rival plunge apps, AtLeast; table. |
| 5 | `260907-silent-meditation-timer` | 117 | `silent-meditation-timer` | No bells at all; ending a sit in silence. |
| 6 | `260907-vibrating-timer-apple-watch` | 125 | `vibrating-timer-apple-watch` | Wrist vs phone; how nudges work mid-practice. |
| 7 | `260907-breathing-timer-app` | 111 | `breathing-timer-app` | What to look for; eyes-free operation. |
| 8 | `260907-wim-hof-breathing-timer` | 112 | `wim-hof-breathing-timer` | Rounds + recovery breaths; one session per round or steady interval; safety (never in water). |
| 9 | `260907-how-long-should-you-do-box-breathing` | 113 | `how-long-should-you-do-box-breathing` | Informational; cite duration studies; funnel to pillar + #108. |
| 10 | `260907-meditation-timer-without-sound` | 119 | `meditation-timer-without-sound` | "No sound" phrasing; preserving the end of a sit. |
| 11 | `260907-mindfulness-timer-apple-watch` | 121 | `mindfulness-timer-apple-watch` | Bridge from Apple's Mindfulness app to practice timers. |
| 12 | `260907-ice-bath-timer` | 116 | `ice-bath-timer` | Ice-bath phrasing of the pillar intent; stopwatch vs minimum timer. |
| 13 | `260907-cold-plunge-timer-apple-watch` | 118 | `cold-plunge-timer-apple-watch` | Wet hands, phone away from tub, water resistance. |
| 14 | `260907-vibrate-only-timer` | 127 | `vibrate-only-timer` | Never makes sound; shared spaces. |
| 15 | `260907-apple-watch-timer-without-sound` | 128 | `apple-watch-timer-without-sound` | What the built-in timer can/can't do silently (verify on Apple support), then the dedicated-timer path. |
| 16 | `260907-haptic-timer-app` | 129 | `haptic-timer-app` | App-intent variant; who it's for. |

### Wave 3 — integration (orchestrator)
See §6.

---

## 5. Inputs the orchestrator needs from the user

1. **Rank-Hub draft for #122/#107.** Rank-Hub is not reachable from this
   machine (no MCP, no local copy found). Export the finalized draft *"Breathing
   Pacer: How to Pace Any Breath Pattern Without Watching a Screen"* to
   `docs/drafts/breathing-pacer.md` on `260907` (or hand it to the W1-A agent).
   Fallback if unavailable: W1-A writes from the issue brief and says so in the
   PR body; the user can replace the body later.
2. Confirm hero placement for #130 (plan assumes **hero**, keep companion clip).
3. Confirm the RevenueCat product name to use in privacy copy ("Pro" is
   assumed) and whether `/terms` should gain the IAP clause (plan assumes yes).
4. Rank-Hub logging after each article goes live on `main` is a manual user step
   (the plan cannot do it). Orchestrator lists live URLs in the final PR body to
   make that easy.

---

## 6. Orchestrator runbook

```text
0. cd /Users/leo/Documents/Projects/atleast.app     # container, not a worktree
   git -C 260907 pull --ff-only
   Spawn W0-A, W0-B, W0-C (3 subagents). Do W0-D yourself.
   Merge W0-A as soon as green + CodeRabbit addressed. Then W0-B, W0-C.
   After each merge: git -C 260907 pull --ff-only; git trees rm <branch> --apply

1. Spawn W1-A..W1-E (5 subagents). Each: git trees add <branch> 260907 --print-path
   Merge each when green. Pull 260907. Remove worktree.

2. For each cluster whose pillar merged, spawn its spokes in the §4 priority
   order, keeping ≤ 5 worktrees alive. Merge, pull, remove, repeat.

3. Final checks on 260907 (in the 260907 worktree):
   make install && make build && make check:links
   - dist/guides/index.html lists 4 clusters × (1 pillar + spokes)
   - every article has Article + BreadcrumbList JSON-LD; pillars have FAQPage
   - dist/sitemap-*.xml contains all 20 slugs + /guides + /compare
   - grep -ri "may i watch" src/ returns nothing (#126)
   - no article claims anything outside §2

4. Open PR 260907 → main: title "Milestone 260907: content clusters, privacy
   updates, hero video". Body: table of issues closed, live URL list for
   Rank-Hub logging, the open follow-ups (#99, #124, #103–#106). Let CI
   (build + Lighthouse) and CodeRabbit run; fix; merge (squash is fine for a
   single integration; use --merge if a second integration is planned).

5. After deploy: comment on #103–#106 with the published URLs and the date so
   the 28/90-day measurement windows have a start date.
```

### Subagent prompt template (article)
```text
You are working in worktree <path> on branch <branch> (base: 260907).
Read CLAUDE.md, .claude/agent-notes.md, docs/positioning.md, docs/content-guide.md,
and docs/plans/260907-milestone-plan.md §2–§3.
Task: write src/content/articles/<slug>.md for GitHub issue #<n> (title: <title>).
Brief: <issue body>. Target queries: <list>. Cluster: <key>. Role: <pillar|spoke>.
Frontmatter per docs/content-guide.md; related: <slugs>; order: <n>.
Constraints: only the product facts in the plan §2; house voice; answer-first
first paragraph; <word target>; <citation target> real, checked citations
(fetch each URL and confirm it says what you cite); no dead internal links.
Then: make install (if needed), make build, make check:links, inspect
dist/<slug>/index.html for JSON-LD and the CTA. Commit, git push -u origin HEAD,
gh pr create --base 260907 --title "Content: <title>" --body "<summary, test
plan, Closes #<n>, Refs #<objective>, 🤖 footer>". Do not merge. Report the PR
URL and any product claim you were unsure about.
```

### Subagent prompt template (non-article)
Same header; task = the W0 spec text from §4 verbatim; same finish steps.

---

## 7. Definition of done for the milestone

- [ ] 20 articles live under `/<slug>`, listed on `/guides`, in the sitemap
- [ ] `/compare` live and linked
- [ ] Privacy page discloses device model + RevenueCat; terms mention IAP
- [ ] Homepage hero uses the optimized loop video; Lighthouse ≥ 0.9 perf on `/`
- [ ] `docs/positioning.md`, `docs/content-guide.md`, agent-notes guardrail line
- [ ] `PRIMARY_CTA` switch in place; #124 comment explains launch-day steps
- [ ] Sub-issues linked under #103–#106; those four remain open with a start date
- [ ] #99 remains open with the ready-to-paste CloudKit paragraph
- [ ] All temporary worktrees removed (`git trees list` shows only long-lived ones)
