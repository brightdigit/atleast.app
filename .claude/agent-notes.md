# Agent notes (corrections & standing directives)

Read this file at the start of every session before doing work. It is the
in-repo source of truth for user corrections and standing always/never
directives for how to work in this repository.

## How to maintain

- Append one line per directive **proactively** (without being asked) whenever
  the user makes a correction or gives an always/never instruction.
- Newest lines at the bottom.
- One line per entry.
- When a directive supersedes an earlier one, update or remove the stale line
  rather than leaving both.

## Log

- Privacy copy must match app analytics: website + iPhone + Apple Watch; events ios_open, pageview, and session_start (including duration_seconds, tap_interval_seconds, haptic_config, preloaded_from_phone)—do not claim iOS-only or that session config never leaves the device.
- ASC privacy labels were already correct; accuracy gaps were website-copy only—do not treat ASC re-declaration as a follow-up for this disclosure work.
- Privacy policy: state on-device guarantees, never name a storage API for local persistence (e.g. UserDefaults). CloudKit ships with v1.0.0 — update `/privacy` in that release using the ready-to-paste paragraph on #99 ("synced through your own iCloud account, which we cannot access"); do not claim settings never leave the device after that.
- SEO: never create or optimise content for 'may I watch at least' / webtoon queries; those impressions are a brand-name collision, not progress on any objective (#126).
- App analytics events (iPhone + Watch) carry a `system-model` hardware identifier (e.g. `iPhone16,1`, `Watch7,4`) and it is in the Plausible User-Agent; /privacy discloses it—it is a model, not a personal identifier, so "no personal identifiers or advertising IDs" stays true.
- Purchase history is processed by RevenueCat (anonymous app user ID, no accounts; app functionality + analytics; not linked to identity; not tracking); /privacy has a Purchases section and /terms a subscriptions clause—never imply "no third parties" or "no network".
- CloudKit private-database sync for timers/history ships with app v1.0.0; "no AtLeast account" and "works offline" stay true, but do not imply nothing is ever synced — settings sync via the user's iCloud, which BrightDigit cannot read (#99).
- After 260907 content PRs merge to main (and deploy), re-check internal article links on the live site — cross-links between milestone pages 404 on atleast.app until main ships (e.g. /timer-that-vibrates from #148).
- Never merge PRs unless the user explicitly asks — open them, leave them for review.
- Safari 27 fully decodes VP9 (`canPlayType` "probably"); a hero video showing poster+play button there is muted-autoplay being refused (per-site Auto-Play setting / Low Power Mode), NOT a codec or `<source>`-order problem — verify with `play()`'s rejection before theorising.
