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
- Privacy policy: state on-device guarantees, never name a storage API (e.g. UserDefaults)—timer settings are not persisted yet and future persistence may span iPhone + Watch with a different mechanism.
- SEO: never create or optimise content for 'may I watch at least' / webtoon queries; those impressions are a brand-name collision, not progress on any objective (#126).
- App analytics events (iPhone + Watch) carry a `system-model` hardware identifier (e.g. `iPhone16,1`, `Watch7,4`) and it is in the Plausible User-Agent; /privacy discloses it—it is a model, not a personal identifier, so "no personal identifiers or advertising IDs" stays true.
- Purchase history is processed by RevenueCat (anonymous app user ID, no accounts; app functionality + analytics; not linked to identity; not tracking); /privacy has a Purchases section and /terms a subscriptions clause—never imply "no third parties" or "no network".
