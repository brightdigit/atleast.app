# Version C — Builder cut (~1:50)

Aimed at **Shipaton judges**, especially the **HAMM Award** ("smartest use of RevenueCat") and the **Design Award**.
It keeps the story short and adds a segment on **how Pro is built on RevenueCat and why it's priced the way it is**. This is the only version that states prices.

Shot codes and the ending swap are explained in the [README](README.md). Shot IDs refer to the [shot list](shot-list.md).

| TIME | VIDEO | AUDIO | ON-SCREEN |
| --- | --- | --- | --- |
| **0:00** | **BR** ECU W3: the pulse on the wrist, then it settles. | NAT: two taps, then **SILENCE**, 2 seconds. | — |
| **0:04** | **TH** MS. | ON CAM: "Timers are built to make you stop. I wanted one that tells me when I've done *at least* enough, and lets me keep going." | Lower third: **Leo Dion · Indie developer, BrightDigit** |
| **0:11** | **BR** L3 → L6: a plank, hands on the floor. The alarm blares and the plank collapses. Cut to L4: meditation. L2: prayer. | VO: "Mid-plank, mid-meditation, mid-prayer, the last thing you want is to reach over and silence an alarm. As a father of six, I get fifteen quiet minutes a day, if I'm lucky." | — |
| **0:21** | **BR** W3 ECU. | VO: "AtLeast is a passive timer for Apple Watch. Gentle taps mean keep going. Silence means you've reached your minimum." | **Taps mean keep going. Silence means enough.** |
| **0:28** | **SR** W1 → W2 → **Start** → W3. **BR** L4: wrist down, eyes closed. | VO: "Pick a minimum, press Start, put your wrist down. No countdown, nothing to look at." | **1 · Pick · 2 · Start · 3 · Feel it** |
| **0:34** | **BR** the taps stop. | **SILENCE**, 2 seconds. | — |
| **0:36** | **SR** W4 → W5: **Done**. The summary shows elapsed / goal / **+X over**, "Saved as Mindful Minutes". | VO: "Keep going as long as you like. It shows how far past your minimum you went, and it's saved to Apple Health." | — |
| **0:43** | **SR** P1 → P2 (Apple Watch chip → "Press Start on Apple Watch"), then P4 (**Start on iPhone**). | VO: "Start it from your iPhone, or run it on the phone itself." | — |
| **0:48** | **TH** MS. A section change: lean in slightly. | ON CAM: "Now, how it makes money." | Section card: **Built on RevenueCat** |
| **0:51** | **SR** montage of the four paywall triggers, about 1.5s each:<br>• P6: **Save** on a new timer<br>• P7: tap the blurred **History** preview<br>• P9: pick a Pro **Session Type** (Core Training)<br>• P10: **Settings → AtLeast Pro**<br>Each ends on the same **AtLeast Pro** paywall. | VO: "Everything that makes the practice work is free: the timer, the Watch, the iPhone, and Apple Health. Pro shows up only when you reach for more: saving your own timers, your history, and every session type." | Labels per trigger: **Save timer · History · Session Type · Settings** |
| **1:01** | **SR** P5: the paywall full screen, calm scroll. Annual is selected; "Start Free Trial". | VO: "The paywall is RevenueCat Paywalls, built and configured in the RevenueCat dashboard, so I can change the offer and the copy without shipping an app update." | **RevenueCat Paywalls** |
| **1:09** | **SR** P5, highlighting each plan in turn. | VO: "Pricing is deliberately small: ninety-nine cents a month, $9.99 a year with a seven-day free trial, or a one-time AtLeast Founder plan at $49.99. A daily practice shouldn't cost more than the habit is worth." | **$0.99/mo · $9.99/yr with a 7-day free trial · $49.99 once (Founder)** |
| **1:21** | **SR** split screen: P5, complete the purchase in sandbox → W2 on the Watch, where "Unlock on iPhone" turns into **Save as new timer**. | VO: "There's no paywall on the Watch. It just says 'Unlock on iPhone', and one purchase unlocks both." | **Buy on iPhone → unlocked on Watch** |
| **1:28** | **SR** P8: History unlocked, with streak, this week and quiet minutes. Scroll through days of sessions. | VO: "And Pro turns your practice into something you can see: streaks, your week, total quiet minutes." | — |
| **1:34** | **TH** MS. **[CUTTABLE]** | ON CAM: "No account. Session logic runs on the device, and your data syncs through your own iCloud." **[CUTTABLE]** | **No account** **[CUTTABLE]** |
| **1:40** | **BR** callback: ECU of the wrist, the pulse settling. | **SILENCE**, 1 second. | **Silence means enough.** |
| **1:42** | **END CARD** (see README). | VO: **LIVE** or **PENDING** ending. | Icon · **atleast.app** · badge (LIVE only) |
| **~1:49** | End. | | |

**Running time:** about 1:49, or 1:43 without the privacy line. This is the closest to 2:00. If it runs long, cut the History beat at 1:28 first. The trigger montage and the "no paywall on the Watch" beat are the parts that make this version.

## Before you record: check these

- **Prices:** they must match `PRICING` in `src/config.ts` and App Store Connect on the day you record. If a price changes, re-record the 1:09 line.
- **"Change the offer without shipping an app update"** is true because the paywall is RevenueCat Paywalls, served from the dashboard. **Don't** say "A/B test" or "experiments" unless you actually set up a RevenueCat Experiment before you submit.
- **The sandbox purchase at 1:21:** use a sandbox tester account and hide the sandbox banner or email in the edit.
- **Growth numbers** for the Grand Prize are left out on purpose. If you have real launch numbers by Sept 30, the 1:28 beat is where one line would go.
