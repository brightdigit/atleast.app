// App
export const APP_NAME = "AtLeast";
export const TESTFLIGHT_URL = "https://testflight.apple.com/join/WUR3Wf47";

// Primary call to action — the single source of truth for every CTA on the site.
// While AtLeast is in beta this is "testflight". At App Store launch, fill in
// APP_STORE_URL and flip PRIMARY_CTA to "appstore"; AppStoreBadge, the nav
// "Join Beta" button, and every article CTA follow automatically.
export const APP_STORE_URL = ""; // fill at launch
export const PRIMARY_CTA: "testflight" | "appstore" = "testflight";

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
  { icon: "youtube", url: "https://www.youtube.com/@brightdigit", label: "YouTube" },
  { icon: "patreon", url: "https://www.patreon.com/c/brightdigit", label: "Patreon" },
  { icon: "podcast", url: "https://www.empowerapps.show/", label: "Empower Apps Podcast" },
] as const;

// Content clusters — the article hub at /guides groups articles by these keys.
// `issue` is the GitHub objective issue that tracks the cluster's performance.
export const CLUSTERS = [
  {
    key: "breathwork",
    label: "Breathwork Pacing Timers for Apple Watch",
    issue: 104,
    description:
      "Pace box breathing, 4-7-8, and Wim Hof rounds by feel, with taps on your wrist instead of a screen to watch.",
  },
  {
    key: "meditation",
    label: "Silent Meditation Timer on Apple Watch",
    issue: 103,
    description:
      "Sit without an alarm waiting at the end. Gentle taps mark the time; silence tells you the session is complete.",
  },
  {
    key: "cold-plunge",
    label: "Cold Plunge Timing from the Wrist",
    issue: 105,
    description:
      "Hold your minimum in cold water with nothing to tap, read, or dry off — the timing stays on your wrist.",
  },
  {
    key: "haptic",
    label: "Timer That Taps Instead of Rings",
    issue: 106,
    description:
      "A timer that never makes a sound: haptic nudges during the practice, and quiet when you have reached your minimum.",
  },
] as const;

export type ClusterKey = (typeof CLUSTERS)[number]["key"];
