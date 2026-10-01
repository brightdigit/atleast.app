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
| [lessons-learned.md](lessons-learned.md) | all | — | What finishing Version A taught us: export checks, captions, music, upload |
| [shipaton-final/](shipaton-final/README.md) | A | 1:59.7 | Record of the submitted video: export specs, music, YouTube captions, thumbnail |

## Contest rules that shape every version

From the [Shipaton rules](https://revenuecat-shipaton-2026.devpost.com/rules). Deadline **Wed Sept 30, 2026, 11:45pm PDT**.

- **Under 2:00.** Judges aren't required to watch past two minutes.
- **Show the app running on the device.** The demo beats use real screen recordings and footage of the real Watch.
- **No unlicensed music, and no third-party trademarks without permission.** Music is allowed only if it's a track you hold a license for (see [Audio](#audio)). Apple product names (Apple Watch, iPhone, Apple Health, App Store) are used as Apple's guidelines require, and the App Store badge appears on the end card.
- Upload publicly to YouTube or Vimeo, in English.

## How to read a script

Each beat is one row:

| Column | Meaning |
| --- | --- |
| **TIME** | Approximate running time, assuming speech at about 150 words per minute |
| **VIDEO** | The shot. `TH01`…`TH13` = talking-head clips (IDs are FCP labels; see the [shot list](shot-list.md)). `BR` = b-roll. `SR` = screen recording. `ECU` / `CU` / `MS` / `WS` = extreme close-up / close-up / medium / wide |
| **AUDIO** | `VO01`…`VO45` = voiceover clips (FCP labels; see the [shot list](shot-list.md)). `ON CAM:` spoken on camera. `NAT:` natural sound. `SILENCE` = no voice, room sound only |
| **ON-SCREEN** | Captions and lower thirds |

**[CUTTABLE]** marks a line you can drop if the edit runs long. The privacy line is always cuttable, because the answer to Q6 was "depends on time".

## Audio

A quiet licensed track is optional; the video still works without one (Q13). Either way, use room sound, breath, and the faint buzz of the Watch motor recorded close. The emotional peak in every version is the **drop to silence** when the taps stop, so leave it long enough to feel. **Music must never play under a `SILENCE` beat.**

### Picking a track

- **Feel:** calm, warm and unhurried: ambient pads, soft felt piano, or sparse guitar. It should sound like the room you'd practice in, not like an ad.
- **Avoid:** drums or a steady beat (they fight the taps), vocals (they fight the voiceover), big builds or drops, and anything "inspirational corporate" or upbeat. Search terms: *ambient*, *minimal piano*, *meditative*, *drone*, *calm*.
- **Tempo:** slow, around 60–80 BPM or no clear pulse at all. The Watch taps are the rhythm, so the music shouldn't set a competing one.
- **Shape:** a track with few changes that can be cut anywhere. You'll hard-cut it several times, so a looping or stem-based track is easier than one with a strong arc.
- **Timbre:** keep the low end clean so the close-miked motor buzz stays audible under it.

### Where it goes

| Beat | Music |
| --- | --- |
| Cold open (B and C: taps → `SILENCE`) | **None.** Let the taps and silence land dry |
| Alarm gag (L6) | **Cut hard** on the alarm, so it's harsh by contrast, then bring it back gently after |
| Story, how it works, iPhone, Pro | Under the VO, low: about 20 dB below the voice, never competing for words |
| Any `SILENCE` beat (e.g. "the taps stop") | **Hard cut** to room tone (NAT1) on the frame the taps stop, not a fade |
| Closing silence callback | **None** |
| End card (VO45) | Optional: bring it back softly under the last line and let it ring out |

Mix the voice to about −14 LUFS integrated for YouTube, and check the silence beats on headphones, where a leftover music tail is easiest to hear.

### License

- The license must cover **online distribution and promotional/commercial use** on YouTube (and Vimeo, if you upload there), since the video markets a paid app.
- If the library registers its tracks with **YouTube Content ID**, clear or whitelist your channel *before* the deadline so the submission isn't claimed or muted.
- Keep the license certificate with the project files and note the track title and artist in the YouTube description if the license requires credit.

## Ending

The app is **live on the App Store**. Every version ends with voiceover over an end card (not on camera):

| VO | End card |
| --- | --- |
| **VO45:** "AtLeast is on the App Store now. Go to atleast.app and try it today." | AtLeast icon · **atleast.app** · App Store badge |

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
