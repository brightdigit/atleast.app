# AtLeast Demo Video — Scripts

Scripts for the **RevenueCat Shipaton 2026** Devpost submission, reworked from the
rough draft in [`../video-copy.md`](../video-copy.md). Decisions behind them are in
[`../video-script-questions.md`](../video-script-questions.md).

| File | Version | Length | Idea |
| --- | --- | --- | --- |
| [a-story-first.md](a-story-first.md) | A | ~1:50 | Your draft's order, tightened: problem → you → solution → demo → Pro → CTA |
| [a-story-first-60s.md](a-story-first-60s.md) | A | ~0:60 | Short cut of A |
| [b-cold-open.md](b-cold-open.md) | B | ~1:45 | Opens on the wrist: taps, then silence, then eyes open. Story comes second |
| [b-cold-open-60s.md](b-cold-open-60s.md) | B | ~0:60 | Short cut of B |
| [c-builder-cut.md](c-builder-cut.md) | C | ~1:50 | For judges: adds how Pro is built on RevenueCat and why it's priced the way it is |
| [c-builder-cut-60s.md](c-builder-cut-60s.md) | C | ~0:60 | Short cut of C |
| [shot-list.md](shot-list.md) | all | — | Every shot the scripts use, grouped for filming |

## Contest rules that shape every version

From the [Shipaton rules](https://revenuecat-shipaton-2026.devpost.com/rules). Deadline **Wed Sept 30, 2026, 11:45pm PDT**.

- **Under 2:00.** Judges aren't required to watch past two minutes.
- **Show the app running on the device.** The demo beats use real screen recordings and footage of the real Watch.
- **No unlicensed music, and no third-party trademarks without permission.** There's no music at all. Apple product names (Apple Watch, iPhone, Apple Health, App Store) are used as Apple's guidelines require, and the App Store badge appears only in the Live ending.
- Upload publicly to YouTube or Vimeo, in English.

## How to read a script

Each beat is one row:

| Column | Meaning |
| --- | --- |
| **TIME** | Approximate running time, assuming speech at about 150 words per minute |
| **VIDEO** | The shot. `TH` = talking head (you, on camera). `BR` = b-roll. `SR` = screen recording. `ECU` / `CU` / `MS` / `WS` = extreme close-up / close-up / medium / wide |
| **AUDIO** | `VO:` voiceover, `ON CAM:` spoken on camera, `NAT:` natural sound, `SILENCE` = no voice, room sound only |
| **ON-SCREEN** | Captions and lower thirds |

**[CUTTABLE]** marks a line you can drop if the edit runs long. The privacy line is always cuttable, because the answer to Q6 was "depends on time".

## Audio

No music, as decided in Q13. Use room sound, breath, and the faint buzz of the Watch motor recorded close. The emotional peak in every version is the **drop to silence** when the taps stop, so leave it long enough to feel.

## Endings: swap during the edit

The last line of every version is **voiceover over an end card**, not on camera, so swapping endings means changing one audio clip and one graphic. Record both endings in the same session.

| Ending | VO | End card |
| --- | --- | --- |
| **LIVE** (the app is approved) | "AtLeast is on the App Store now. Go to atleast.app and try it today." | AtLeast icon · **atleast.app** · App Store badge |
| **PENDING** (the app is still in review) | "AtLeast is coming soon to the App Store. Go to atleast.app to find out more." | AtLeast icon · **atleast.app** · "Coming soon to the App Store" |

> Shipaton only accepts an app whose first public version is released by Sept 30. The PENDING ending keeps the video usable outside the contest; it doesn't make an unreleased app eligible.

## Facts checked against the app (1.0.0-beta.10)

- **In a session, the Watch shows only a dim pulsing circle.** There's no countdown, ring or timer, so never say "rings" or "countdown".
- **Tapping during a session** shows *Stop* before the minimum and *Done* after it. The summary shows elapsed / goal / **+X over**, and **"Saved as …"** if a Session Type is set.
- **Health is free for Mindfulness and Yoga.** Pro unlocks every other Session Type, saving your own timers, and History.
- **The paywall is RevenueCat Paywalls** (`PaywallView`), configured in the RevenueCat dashboard. The code has no Experiments or Targeting, so the scripts never claim either.
- **Plans:** Monthly, Annual (7-day free trial, selected by default), and the lifetime **AtLeast Founder**. Prices are spoken only in C and come from `PRICING` in `src/config.ts`.
- **There's no paywall on the Watch.** It shows "Unlock on iPhone", and buying on the phone unlocks the Watch.
- **A session can run on the iPhone alone.** It shows the same pulse on screen but has no haptics.

## Site copy that's now out of date (not part of this work)

- "The iPhone only picks, pre-loads, or mirrors a session" is no longer true: a session can now run on the phone alone, silently, with the on-screen pulse only. "Taps always happen on the wrist" is still true, since the phone never taps.
