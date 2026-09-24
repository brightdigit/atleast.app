// App
export const APP_NAME = "AtLeast";
// The public TestFlight beta continues after launch. It is no longer the
// primary CTA, but the constant stays exported for secondary links and for
// switching PRIMARY_CTA back to "testflight" (e.g. a future pre-release).
export const TESTFLIGHT_URL = "https://testflight.apple.com/join/WUR3Wf47";

// Primary call to action — the single source of truth for every CTA on the site.
// AtLeast is live on the App Store, so this is "appstore": AppStoreBadge, the
// nav "Download" button, and every article CTA point at APP_STORE_URL. Setting
// it to "testflight" switches them all back to the beta (atleast.app#167).
export const APP_STORE_URL =
  "https://apps.apple.com/us/app/atleast-silent-timer/id6759622997";
// Numeric App Store ID, derived from APP_STORE_URL — used by the Safari Smart
// App Banner (apple-itunes-app meta in BaseHead).
export const APP_STORE_ID = APP_STORE_URL.match(/\/id(\d+)/)?.[1] ?? "";
export const PRIMARY_CTA: "testflight" | "appstore" = "appstore";

if (PRIMARY_CTA === "appstore" && APP_STORE_URL.trim() === "") {
  throw new Error('APP_STORE_URL is required when PRIMARY_CTA is "appstore"');
}

// Pricing — the one place launch pricing is written. The press fact sheet, the
// line under the hero CTA, and the /compare table all read these, so a price
// change is a one-line edit here. Keep it identical to App Store Connect.
export const PRICING = {
  download: "Free",
  pro: {
    monthly: "$0.99/mo",
    annual: "$9.99/yr",
    annualTrial: "7-day free trial",
    lifetime: "$49.99 once",
  },
} as const;

// "$0.99/mo, $9.99/yr with a 7-day free trial, or $49.99 once"
export const PRO_PRICE_LINE = `${PRICING.pro.monthly}, ${PRICING.pro.annual} with a ${PRICING.pro.annualTrial}, or ${PRICING.pro.lifetime}`;

// Contact
export const SUPPORT_EMAIL = "support@atleast.app";

// Brand
export const COMPANY_NAME = "BrightDigit";
export const COPYRIGHT_YEAR = "2026";

// URLs
export const WEBSITE_URL = "https://atleast.app";
export const OG_IMAGE_URL = "https://atleast.app/og.png";
export const COMPANY_WEBSITE_URL = "https://brightdigit.com";

// Social links
export const SOCIAL_LINKS = [
  { icon: "github", url: "https://github.com/brightdigit", label: "GitHub" },
  { icon: "x-twitter", url: "https://x.com/leogdion", label: "X (Twitter)" },
  { icon: "mastodon", url: "https://c.im/@leogdion", label: "Mastodon" },
  { icon: "linkedin", url: "https://www.linkedin.com/in/leogdion/", label: "LinkedIn" },
  { icon: "producthunt", url: "https://www.producthunt.com/products/atleast-passive-timer-for-apple-watch?launch=atleast-passive-timer-for-apple-watch", label: "AtLeast on Product Hunt" },
  { icon: "youtube", url: "https://www.youtube.com/@brightdigit", label: "YouTube" },
  { icon: "patreon", url: "https://www.patreon.com/c/brightdigit", label: "Patreon" },
  { icon: "podcast", url: "https://www.empowerapps.show/", label: "Empower Apps Podcast" },
  { icon: "appstore", url: APP_STORE_URL, label: "AtLeast on the App Store" },
  // Unverified: the catalog renders client-side, so confirm the listing resolves.
  { icon: "indiecatalog", url: `https://indieappcatalog.com/app/${APP_STORE_ID}/atleast-silent-timer`, label: "AtLeast on Indie App Catalog" },
] as const;

// Content clusters — the article hub at /guides groups articles by these keys.
// `issue` is the GitHub objective issue that tracks the cluster's performance.
export const CLUSTERS = [
  {
    key: "breathwork",
    short: "Breathwork",
    icon: "ph:wind",
    label: "Breathwork Pacing Timers for Apple Watch",
    issue: 104,
    description:
      "Pace box breathing, 4-7-8, and Wim Hof rounds by feel, with taps on your wrist instead of a screen to watch.",
  },
  {
    key: "meditation",
    short: "Meditation",
    icon: "ph:flower-lotus",
    label: "Silent Meditation Timer on Apple Watch",
    issue: 103,
    description:
      "Sit without an alarm waiting at the end. Gentle taps mark the time; silence tells you the session is complete.",
  },
  {
    key: "cold-plunge",
    short: "Cold plunge",
    icon: "ph:snowflake",
    label: "Cold Plunge Timing from the Wrist",
    issue: 105,
    description:
      "Hold your minimum in cold water with nothing to tap, read, or dry off — the timing stays on your wrist.",
  },
  {
    key: "haptic",
    short: "Haptic timers",
    icon: "ph:vibrate",
    label: "Timer That Taps Instead of Rings",
    issue: 106,
    description:
      "A timer that never makes a sound: haptic nudges during the practice, and quiet when you have reached your minimum.",
  },
] as const;

export type ClusterKey = (typeof CLUSTERS)[number]["key"];
