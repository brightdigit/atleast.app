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

