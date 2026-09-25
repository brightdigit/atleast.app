# Video Script — Open Questions

Questions to settle before `docs/video-copy.md` is reworked into A/V video scripts.
Each has a recommended answer; fill in **Answer:** (or just write "rec" to accept it).

## Context: RevenueCat Shipaton 2026

- **Deadline:** Wed **Sept 30, 2026, 11:45pm PDT** — [rules](https://revenuecat-shipaton-2026.devpost.com/rules)
- **Video:** should be **under 2:00** (judges aren't required to watch beyond that); public on YouTube or Vimeo; must show the app **functioning on the device**; no third-party trademarks or unlicensed music; English.
- **Eligibility:** first public version must be released on the App Store between Jul 31 and Sep 30, 2026 (updates to an already-released app don't count); must use the RevenueCat SDK for at least one purchase.
- **Other submission items:** text description, store URL, 1024×1024 icon, 1179×2556 screenshots (no frame), a free trial or promo code for judges.
- **Judging:** no published weights. Grand Prize favors early release + post-launch growth; HAMM ($20k) rewards "smartest use of RevenueCat to drive real revenue"; Design Award rewards "innovative ideas and/or beautiful app design and animations"; Peace Prize rewards social good.
- Showing the RevenueCat integration or the paywall is **not required**.

---

## Q1 — Which videos this round

Is this round only the Devpost submission video?
- An **App Store preview** has strict rules: up to 30s, footage recorded from the app only, no talking head and no "father of 6" story. It's a different script, not a trim of this one.
- A **website hero or social cut** would be a 30–60s version of the Devpost script.

**Recommended:** Devpost only for now. At most, tag which lines could become a 30–60s social cut later. The App Store preview is out of scope.

**Answer:**

DevPost

## Q2 — On-camera format

How do you appear in the video?
- (a) Talking head for the story and the ending, with voiceover on the demo footage.
- (b) Voiceover only, all b-roll.
- (c) Talking head all the way through, with the demo cut in as picture-in-picture.

**Recommended:** (a). The "father of 6, indie dev" line lands better on camera. The demo works better as full-frame watch and phone footage.

Yes a

**Answer:**

## Q3 — Health is not a Pro feature

The draft lists "link timers to Apple HealthKit workouts" under Pro. Per #173 and `docs/positioning.md`, saving to Health is free, and so are the Mindful Minutes and Yoga types. Pro unlocks the other five types (Mind & Body, Flexibility, Cooldown, Core Training, Traditional Strength), saved custom timers, and History.

**Recommended:** Show Health in the free demo ("finished sessions land in Apple Health as Mindful Minutes"). The Pro list becomes: *save your own timers · more Health workout types · History with streaks and total quiet minutes.*

**Answer:**

Yes you are correct.

## Q4 — "Don't have your watch? Start a timer on the iPhone"

Every public doc says the iPhone app only picks, pre-loads or mirrors a session, and the taps always happen on the wrist. Does the current build run a full session on the iPhone alone, with iPhone haptics and no watch?
- If yes, the site copy is out of date and should be flagged.
- If no, the line has to go.

**Recommended:** Your call, since you know the build. The guess is no: keep "pick a timer on your iPhone and it's ready on your wrist" and drop the no-watch line.

**Answer:**

Yes you can run on the iPhone only. No you don't not get haptics.

## Q5 — Wording of the trial

The 7-day free trial only applies to the **annual plan** ($9.99/yr). Monthly is $0.99, lifetime is $49.99. "If you subscribe now, I'll even include a free trial" suggests a limited-time offer, and it isn't one. Should the video state prices?

**Recommended:** "AtLeast is free to download. Pro includes a 7-day free trial on the annual plan." No prices spoken, so the video doesn't go stale when prices change.

**Answer:**

Agreeed

## Q6 — Privacy line

The repo's content voice says to always mention privacy-first. Should the video include one line, such as "No account. Your sessions stay yours, synced through your own iCloud."?

**Recommended:** Yes, one line near the end. It sets AtLeast apart and costs about 4 seconds. It must not claim that nothing leaves the device (Sentry, RevenueCat and CloudKit exist).

**Answer:**

Depends on time available.

## Q7 — Which practices to name

The draft lists "yoga, meditation, prayer time, rows, push ups". "Rows" reads as a typo, and rowing is a poor fit for the app. Keep prayer? The site doesn't use it anywhere, but it's personal and true to you.

**Recommended:** Keep prayer; it's your voice. Replace "rows, push ups" with "planks, breathwork", which match the site's use cases and are easy to film.

**Answer:**

sure. planks is a fine. I always want to include an exercies where your hands aren't available to stop the alarm.

## Q8 — What makes the versions different

Proposed three versions:
- **A. Story-first:** your draft's order, tightened (problem → you → solution → demo → Pro → CTA).
- **B. Cold open:** starts on a close-up of the wrist with taps, then silence, then the eyes open. The story comes after the hook.
- **C. Builder cut:** for hackathon judges. Adds a short "how it's built / how RevenueCat powers Pro" beat (shape depends on Q12).

**Recommended:** These three, unless you'd rather vary something else, like tone or length.

**Answer:**

Yes.

## Q9 — Output format and location

Each version would be a two-column A/V table (VIDEO / AUDIO), with a timecode, shot type and on-screen text per beat, followed by a shot list for filming.

**Recommended:** A new `docs/video-scripts.md`, with the draft left untouched in `docs/video-copy.md`. Also publish it as a private artifact page for easier side-by-side review.

**Answer:**

Sure but create separate files for each version.

## Q10 — Eligibility

The first public version must go live on the App Store between Jul 31 and Sep 30. The current branches (`app-store-release`, the pre-launch copy rewrite) suggest v1.0.0 isn't public yet. Will it be live by Sept 30, with a trial or promo code ready for judges? If it won't be live, the video is moot for Shipaton.

**Recommended:** Assume yes and write to that. Flag it if the release is at risk.

**Answer:**

Hopefully. It's in app review.

## Q11 — Length

The draft read aloud runs about 75–90s before the demo and Pro segments are filled in.

**Recommended:** Target **1:45** for versions A, B and C, which leaves room under the 2:00 limit. Also add a **0:60** cut of whichever you pick.

**Answer:**

Yes.

## Q12 — Which awards to aim for

This decides what the extra beat in version C shows.
- **HAMM:** the paywall on screen, plus a line on the pricing strategy (free core, $0.99/mo, annual with trial, lifetime) — RevenueCat driving revenue.
- **Design:** more time on the haptic rings and animations.
- **Grand Prize:** launch-week numbers. You'd need real ones by Sept 30.
- **Peace Prize:** the angle of a daily practice for a parent under pressure.

**Recommended:** Aim for HAMM and Design. Show the real paywall (RevenueCat-powered) in every version, and in C add one sentence on why Pro stays small and cheap. Leave growth numbers out unless there are real ones.

**Answer:**

Agreed

## Q13 — Music and audio

The rules forbid unlicensed music.
- (a) No music, with the natural sound of the room and the haptics. This fits "silence is the signal".
- (b) A royalty-free track you have a license for.

**Recommended:** (a), maybe with a quiet pad under the intro only. The drop to silence when the taps stop can be the emotional peak.

**Answer:**
Yes.
