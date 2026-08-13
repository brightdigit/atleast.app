# AtLeast Website — Setup Instructions for Claude

This document provides step-by-step instructions for setting up the **atleast.app** marketing website for the AtLeast passive timer app.

---

## Overview

**Goal:** A minimal, beautiful static marketing site that communicates AtLeast's core value proposition and drives App Store downloads.

**Domain:** `atleast.app`
**Support email:** `support@atleast.app`
**Company:** BrightDigit
**Copyright:** © 2026 BrightDigit. All rights reserved.

**Design philosophy:** Match the calm, eyes-free ethos of the app itself. The site should feel like silence — spacious, focused, no clutter.

---

## Tech Stack

Use **Astro** (static site generator) with **Tailwind CSS**.

- Astro: fast, zero JS by default, excellent for content sites
- Tailwind CSS: utility-first, easy to maintain
- Deploy to **GitHub Pages** (custom domain support via Namecheap DNS)
- No database, no backend, no CMS — pure static HTML

### Initialize the project

```bash
# Create a new directory alongside the AtLeast app repo (do NOT put inside it)
# Suggested path: ~/Documents/Projects/AtLeastWebsite/

npm create astro@latest atleast-website -- --template minimal --typescript strict --no-git
cd atleast-website
npx astro add tailwind
```

Configure `astro.config.mjs`:

```js
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://atleast.app',
  integrations: [tailwind()],
});
```

---

## Pages to Create

### 1. Home (`/`) — `src/pages/index.astro`

The single-page marketing site. Sections (in order):

#### Hero Section
- Large headline: **"Done when the silence comes."**
- Subheadline: "AtLeast taps your Apple Watch gently during your practice. When tapping stops, you've reached your minimum."
- App Store download badge (link to App Store listing — add when live)
- Subtle animated visual: three concentric rings pulsing then fading to stillness (CSS animation, no JS library)

#### How It Works Section
Three steps, icon + short text:

1. **Set your minimum** — Choose a duration (1–60 min) and tap interval.
2. **Feel the rhythm** — Gentle haptic taps keep you present without distraction.
3. **Silence means done** — When taps stop, you've reached your goal. No alarm. No interruption.

#### Use Cases Section
Five cards (horizontal scroll on mobile, grid on desktop):

- 🧘 Meditation
- 🧊 Cold exposure
- 🧘‍♀️ Yoga & stretching
- 🏋️ Static holds (planks, wall sits)
- 💻 Focused work (Pomodoro)

Each card: icon + label + one-sentence description.

#### Why AtLeast Section
Split layout — left copy, right visual (Apple Watch mockup or abstract):

Copy:
> **No jarring alarm.** Traditional timers interrupt the very state you're trying to maintain. AtLeast inverts this — taps encourage you during practice and go silent when you've earned it.
>
> **Eyes-free, by design.** Built for Apple Watch. No screen-checking, no distractions.
>
> **"At least" mindset.** Setting a minimum threshold, not a hard deadline. More forgiving. More human.

#### Privacy Section
Short paragraph + three icons:

- No account required
- Session and haptic logic run on-device
- Cookieless analytics only (Plausible)

> AtLeast is privacy-first. Session and haptic logic run on your devices. The website, iPhone app, and Apple Watch app use cookieless Plausible analytics—no accounts, no advertising, no cross-app tracking.

#### Footer
- App Store badge (repeated)
- Links: Privacy Policy · Support
- `© 2026 BrightDigit. All rights reserved.`

---

### 2. Privacy Policy (`/privacy`) — `src/pages/privacy.astro`

Required for App Store submission. Use a clean, readable layout.

Content template:

```
AtLeast Privacy Policy
Last updated: [date]

AtLeast is privacy-first. No accounts. Session and haptic logic run on-device.
Limited cookieless Plausible analytics on the website, iPhone app, and Apple Watch app.

What stays on-device:
- Timer settings — UserDefaults on Apple Watch
- Session and haptic logic — local on the watch
- Starting a session also sends limited configuration via analytics (below)—not as an account/profile

Analytics:
- Website: Plausible page analytics for atleast.app; outbound-link clicks; custom events Nav: UseCases click (variant) and TestFlight: Click (variant, location)
- iPhone and Apple Watch apps (AviaryInsights / Plausible): ios_open (watch_paired); pageview screen views; session_start with duration_seconds, tap_interval_seconds, haptic_config, preloaded_from_phone
- Cookieless; no persistent identifiers; not used for advertising or cross-app/site tracking

What we do not collect:
- No accounts or sign-in
- No crash reporting sent off-device
- No personal identifiers or advertising IDs
- No location data

Third parties:
- Plausible (and AviaryInsights on iPhone and Apple Watch). No advertising SDKs.

Contact:
support@atleast.app
```

---

### 3. Support (`/support`) — `src/pages/support.astro`

Simple FAQ + contact page.

FAQ items to include:

- **Why did my taps stop before my timer finished?** — If taps stopped, you've reached your minimum duration. The silence is intentional — it means you're done.
- **Can I use AtLeast with the screen off?** — Yes. AtLeast uses an Extended Runtime Session to continue haptics with the watch face off.
- **Why doesn't AtLeast alarm when it finishes?** — That's by design. The absence of taps is the signal. No alarm means no interruption to your flow state.
- **What Apple Watch models are supported?** — Apple Watch Series 6 or later running watchOS 26.0 or later.
- **Can I use AtLeast without my iPhone?** — Yes. The watchOS app runs independently.

Contact section:
> Questions or feedback? Email us at **support@atleast.app**

---

## Design System

### Colors

```css
/* Tailwind config additions */
colors: {
  brand: {
    bg:       '#0A0A0A',   /* near-black background */
    surface:  '#141414',   /* card/section background */
    border:   '#222222',   /* subtle borders */
    text:     '#F5F5F5',   /* primary text */
    muted:    '#888888',   /* secondary text */
    accent:   '#6B8FF8',   /* calm blue — primary CTA, links */
    pulse:    '#9B7FE8',   /* soft purple — secondary accent */
  }
}
```

**Design direction:** Dark background, light text. Think Apple Watch UI — high contrast, minimal color noise. The accent blue (#6B8FF8) should appear only on CTAs and key highlights.

### Typography

```css
fontFamily: {
  sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'Inter', 'system-ui', 'sans-serif'],
}
```

Sizing scale:
- Hero headline: `text-5xl md:text-7xl font-bold tracking-tight`
- Section headline: `text-3xl md:text-4xl font-semibold`
- Body: `text-lg text-brand-muted leading-relaxed`

### Spacing

Use generous whitespace. Minimum `py-24` between major sections. Let the layout breathe — mirrors the app's calm ethos.

### Animation

One subtle CSS animation for the hero visual — three concentric rings that pulse then fade:

```css
@keyframes pulse-fade {
  0%   { opacity: 0.8; transform: scale(1); }
  50%  { opacity: 0.4; transform: scale(1.08); }
  100% { opacity: 0;   transform: scale(1.15); }
}
```

Run the animation in sequence across three rings with increasing delays, then stop (mirroring the "silence" concept). No looping after initial load.

---

## Components to Create

Create in `src/components/`:

| File | Purpose |
|------|---------|
| `AppStoreBadge.astro` | Apple App Store download button (SVG badge + link) |
| `HeroRings.astro` | Animated concentric circles SVG animation |
| `StepCard.astro` | "How it works" numbered step |
| `UseCaseCard.astro` | Use case icon + label + description |
| `FeatureRow.astro` | Icon + heading + paragraph for "Why AtLeast" |
| `Footer.astro` | Shared footer with links + copyright |
| `Nav.astro` | Minimal top nav (logo + Privacy + Support links) |

---

## SEO & Metadata

Add to every page via a shared `<BaseHead>` component:

```astro
---
// src/components/BaseHead.astro
const { title, description } = Astro.props;
---
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>{title}</title>
<meta name="description" content={description} />
<link rel="canonical" href={Astro.url.href} />

<!-- Open Graph -->
<meta property="og:title" content={title} />
<meta property="og:description" content={description} />
<meta property="og:type" content="website" />
<meta property="og:url" content={Astro.url.href} />
<meta property="og:image" content="https://atleast.app/og.png" />

<!-- Twitter -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content={title} />
<meta name="twitter:description" content={description} />
<meta name="twitter:image" content="https://atleast.app/og.png" />
```

**Default values per page:**

| Page | Title | Description |
|------|-------|-------------|
| `/` | `AtLeast — Passive Timer for Apple Watch` | `Gentle haptic taps during your practice. Silence means done. No alarm. No interruption. A mindful timer for meditation, cold plunge, yoga, and focused work.` |
| `/privacy` | `Privacy Policy — AtLeast` | `AtLeast runs timer logic on-device. The website, iPhone app, and Apple Watch app use cookieless Plausible analytics—no accounts, no advertising, no cross-app tracking.` |
| `/support` | `Support — AtLeast` | `Frequently asked questions and support contact for AtLeast, the passive Apple Watch timer.` |

**Create an OG image** (`public/og.png`, 1200×630px):
- Dark background (#0A0A0A)
- AtLeast wordmark centered
- Tagline: "Gentle taps, silent success."
- Three concentric rings visual (right side)

---

## Static Assets

Place in `public/`:

```
public/
├── favicon.ico              # 32×32 favicon
├── apple-touch-icon.png     # 180×180 for iOS home screen
├── og.png                   # 1200×630 Open Graph image
└── app-store-badge.svg      # Apple App Store download badge (official SVG)
```

Obtain the official App Store badge SVG from Apple's marketing resources page.

---

## Deployment — GitHub Pages

1. Push to the `main` branch — the `deploy.yml` workflow builds and publishes automatically
2. Build settings (configured in `.github/workflows/deploy.yml`):
   - Build command: `npm run build`
   - Output directory: `dist`
3. Enable GitHub Pages in repo Settings → Pages → Source: **GitHub Actions**
4. Add custom domain `atleast.app` in Pages → Custom domain
5. Set DNS records at **Namecheap** to point to GitHub Pages:
   - A records: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - CNAME `www` → `<org>.github.io`

---

## File Structure Reference

```
atleast-website/
├── src/
│   ├── components/
│   │   ├── AppStoreBadge.astro
│   │   ├── BaseHead.astro
│   │   ├── FeatureRow.astro
│   │   ├── Footer.astro
│   │   ├── HeroRings.astro
│   │   ├── Nav.astro
│   │   ├── StepCard.astro
│   │   └── UseCaseCard.astro
│   ├── layouts/
│   │   └── Layout.astro
│   ├── pages/
│   │   ├── index.astro
│   │   ├── privacy.astro
│   │   └── support.astro
│   └── styles/
│       └── global.css
├── public/
│   ├── favicon.ico
│   ├── apple-touch-icon.png
│   ├── og.png
│   └── app-store-badge.svg
├── astro.config.mjs
├── tailwind.config.mjs
└── package.json
```

---

## Content & Copy Guidelines

- **Voice:** Calm, confident, minimal. Never hype. Speak to the practitioner, not the consumer.
- **Avoid:** "Revolutionary", "game-changing", "powerful" — too loud for this brand.
- **Use:** "gentle", "minimum", "silence", "rhythm", "practice", "earn it"
- **Frame features as benefits:** Not "configurable tap intervals" → "choose the rhythm that fits your practice"
- **Privacy-forward:** Always mention privacy-first positioning when relevant — it's a genuine differentiator.

---

## Launch Checklist

Before going live, verify:

- [ ] All pages render correctly on mobile (375px) and desktop (1280px)
- [ ] App Store badge links to correct App Store URL (update once app is live)
- [ ] Privacy policy is publicly accessible (required for App Store submission)
- [ ] Support email (`support@atleast.app`) is active and receives mail
- [ ] OG image renders correctly (test with [opengraph.xyz](https://www.opengraph.xyz))
- [ ] Canonical URLs are correct (no trailing slash issues)
- [ ] Favicon appears in browser tab
- [ ] GitHub Pages deployment succeeds with no build errors
- [ ] Custom domain `atleast.app` resolves and SSL certificate is active
- [ ] No console errors in browser

---

## Future Additions (Post-MVP)

- **Press kit page** (`/press`): high-res app icon, screenshots, founder bio, app description
- **Blog** (`/blog`): Astro content collections — "How to meditate with AtLeast", build story post
- **Changelog** (`/changelog`): version history, linked from app's "What's New"
- **Localization**: Add `/ja`, `/de`, `/fr` routes when app localizes (Phase 2 per MARKETING.md)
