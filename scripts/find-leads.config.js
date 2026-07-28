/**
 * Configuration for the AtLeast outreach lead finder.
 *
 * Two things live here:
 *   1. KNOWN_TARGETS — outreach targets already tracked as GitHub issues, so the
 *      search doesn't hand back work that's already planned. Refresh with:
 *        make leads-known
 *   2. SEARCHES — one entry per outreach category, each with its own query,
 *      output schema, and source-preference prompt.
 */

/**
 * Targets already covered by open issues in brightdigit/atleast.app.
 * Matched case-insensitively against each result's title, URL, and name.
 * Regenerate with `make leads-known` after filing new outreach issues.
 */
export const KNOWN_TARGETS = [
  // Subreddits (#42 #45 #68 #69 #73 #87 #90 #91 #92)
  'r/AppleWatch',
  'r/watchOS',
  'r/iosapps',
  'r/iOSProgramming',
  'r/SideProject',
  'r/coldplunge',
  'r/breathwork',
  'r/Wimhof',
  'r/QuantifiedSelf',
  'r/pomodoro',
  'r/getdisciplined',

  // Press & directories (#38 #39 #40 #41 #43 #44 #46 #47 #67)
  'MacStories',
  '9to5Mac',
  'The Sweet Setup',
  'Product Hunt',
  'Hacker News',
  'WatchAware',
  'IndieAppsHub',
  'Indie App Catalog',
  'Indie Watch',
  'indie.watch',
  'indiecatalog.app',
  'indieappshub.com',
  'watchaware.com',
  'producthunt.com',

  // Communities & forums (#64 #65 #66 #70 #71 #72 #74 #75 #76 #77 #78
  //                       #79 #80 #81 #82 #83 #84 #85 #86 #88 #89)
  'indieweb.social',
  'iosdev.space',
  'iOS Dev Space',
  'iOS Developers HQ',
  'DeeperBlue',
  'Dharma Overground',
  'Molchanovs',
  'Wim Hof Method',
  'SOMA Breath',
  'StrongFirst',
  'Insight Timer',
  'Meditation Mind',
  'Dhamma Wheel',
  'Dharma Wheel',
  'Waking Up',
  'Ten Percent Happier',
  'Mindfulness Exercises',
  'Everyday Mindfulness',
  'SuttaCentral',
  'Quantified Self',
  'Dumbphones',
  'dumbphones.org',
];

/** Shared context so every search understands what it's looking for. */
const APP_CONTEXT = `AtLeast is a passive haptic timer app for Apple Watch, made by
the indie developer BrightDigit. Instead of counting down to an alarm, the user sets a
MINIMUM duration; gentle taps mark time on the wrist and the taps stopping signals the
minimum was reached. It is eyes-free, silent, fully offline, collects zero data, and
requires no account. Its practice areas are meditation, breathwork (box breathing,
4-7-8, Wim Hof), yoga and stretching, cold plunge and cold exposure, static holds and
isometrics, and focused/deep work.`;

/**
 * Guidance applied to every search. Keeps output grounded and actionable rather
 * than a list of plausible-sounding names.
 */
const BASE_SYSTEM_PROMPT = `${APP_CONTEXT}

You are building an outreach list for this app. Rules:
- Only include targets you found real evidence for on the open web. Never invent a
  name, URL, contact address, or follower count.
- Every entry must have a working, specific URL — the actual community, article, or
  profile, not a site's homepage.
- Prefer targets that are currently active. Skip anything with no sign of activity in
  the last year.
- Leave a field as an empty string when the source does not support a value. An empty
  field is far better than a guess.
- Collapse duplicates: one entry per organization or community.`;

/**
 * Reusable schema fragment. Exa caps schemas at depth 2 and 10 total properties,
 * so each search keeps its item shape lean.
 */
const leadSchema = (description, itemProperties) => ({
  type: 'object',
  description,
  required: ['leads'],
  properties: {
    leads: {
      type: 'array',
      description,
      items: {
        type: 'object',
        required: ['name', 'url', 'why_relevant'],
        properties: itemProperties,
      },
    },
  },
});

/** Fields shared by every category. */
const commonFields = {
  name: { type: 'string', description: 'Name of the outlet, community, person, or business' },
  url: { type: 'string', description: 'Direct URL to the target — not a homepage' },
  why_relevant: {
    type: 'string',
    description:
      'One concrete sentence on why this target fits AtLeast, referencing something specific they published or discuss',
  },
};

export const SEARCHES = {
  press: {
    label: 'Press & reviewers',
    issue: 94,
    query:
      'Apple Watch app reviewers, indie iOS app blogs, and newsletters that cover new watchOS apps, mindfulness apps, or privacy-first indie apps and accept pitches or app submissions',
    additionalQueries: [
      'indie iOS app review site submit your app for review',
      'Apple Watch app roundup blog 2026',
      'mindfulness and wellness app newsletter that features new apps',
      'journalist who covers Apple wearables and health apps',
    ],
    systemPrompt: `${BASE_SYSTEM_PROMPT}
- Prioritize outlets that visibly review or feature INDIE apps, especially watchOS ones.
- Find the app-submission or tip page when one exists; otherwise a contact or editor page.
- Skip large general tech outlets that never cover small indie apps.`,
    outputSchema: leadSchema('Press outlets, reviewers, and newsletters worth pitching', {
      ...commonFields,
      outlet_type: {
        type: 'string',
        description: 'One of: blog, newsletter, podcast, youtube, journalist, directory',
      },
      pitch_url: {
        type: 'string',
        description: 'URL of the submission, tip, or contact page if one exists',
      },
      audience_note: {
        type: 'string',
        description: 'Audience size or reach if stated on the source; empty string if unknown',
      },
    }),
  },

  communities: {
    label: 'Communities to join',
    query:
      'active online communities, forums, Discord servers, and Facebook groups for meditation, breathwork, cold plunge, and Apple Watch users where members discuss apps and tools',
    additionalQueries: [
      'meditation timer app discussion forum community',
      'cold plunge and ice bath community forum Discord',
      'breathwork practitioners online community group',
      'Apple Watch enthusiast forum discussing watch apps',
      'deep work and focus community forum',
    ],
    systemPrompt: `${BASE_SYSTEM_PROMPT}
- Focus on communities where members actually discuss apps, gear, or tools.
- Report the self-promotion rules when the community states them — this decides whether
  the app can be shared directly or only mentioned after participating.
- Note the platform (Reddit, Discord, Discourse forum, Facebook, Slack, Mastodon).`,
    outputSchema: leadSchema('Online communities where AtLeast could be shared', {
      ...commonFields,
      platform: {
        type: 'string',
        description: 'Reddit, Discord, Discourse, Facebook, Slack, Mastodon, or other',
      },
      size: {
        type: 'string',
        description: 'Member count if stated on the source; empty string if unknown',
      },
      promo_rules: {
        type: 'string',
        description:
          'What the community says about self-promotion — e.g. "no self-promo", "Saturdays only", "allowed with flair"',
      },
    }),
  },

  creators: {
    label: 'Practitioners & creators',
    query:
      'meditation teachers, breathwork coaches, cold exposure instructors, and mindfulness content creators with an online audience who review or recommend apps and tools to their followers',
    additionalQueries: [
      'breathwork coach YouTube channel recommends apps',
      'meditation teacher newsletter recommends tools',
      'cold plunge influencer gear and app recommendations',
      'mindfulness podcast that features app creators',
    ],
    systemPrompt: `${BASE_SYSTEM_PROMPT}
- Look for creators who have demonstrably recommended apps, gear, or tools before —
  that is the signal that outreach could work.
- Capture the best contact route: a business email, a contact page, or the platform
  where they are most active.
- Skip celebrity-tier creators unlikely to respond to an indie developer.`,
    outputSchema: leadSchema('Practitioners and creators who could advocate for AtLeast', {
      ...commonFields,
      practice: {
        type: 'string',
        description: 'Their main practice area: meditation, breathwork, cold exposure, yoga, focus',
      },
      channel: {
        type: 'string',
        description: 'Primary platform: YouTube, podcast, newsletter, Instagram, TikTok',
      },
      contact: {
        type: 'string',
        description: 'Contact email or contact-page URL if published; empty string if unknown',
      },
    }),
  },

  studios: {
    label: 'Studios & facilities',
    query:
      'yoga studios, meditation centers, cold plunge and contrast therapy facilities, and wellness retreat centers that recommend apps or tools to their clients',
    additionalQueries: [
      'cold plunge studio contrast therapy facility',
      'meditation center that recommends apps to students',
      'wellness retreat center resources for practitioners',
    ],
    systemPrompt: `${BASE_SYSTEM_PROMPT}
- Favor facilities that publish a blog, resource list, or client recommendations —
  they have a channel through which an app could reach clients.
- Multi-location or well-known operators are worth more than single small studios.
- Capture the city or region so outreach can be prioritized geographically.`,
    outputSchema: leadSchema('Studios and facilities that could recommend AtLeast to clients', {
      ...commonFields,
      facility_type: {
        type: 'string',
        description: 'yoga studio, meditation center, cold plunge facility, or retreat center',
      },
      location: {
        type: 'string',
        description: 'City, region, or country; empty string if unknown',
      },
      contact: {
        type: 'string',
        description: 'Contact email or contact-page URL if published; empty string if unknown',
      },
    }),
  },
};
