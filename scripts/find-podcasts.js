#!/usr/bin/env node

/**
 * Find podcast outreach leads from the Podcast Index API.
 *
 * Podcast Index is a free, open index of ~4M feeds. It searches titles, authors,
 * and owners, which suits outreach: a show about breathwork usually says so in
 * its title or author field.
 *
 * On contact data: the index stores `ownerEmail` from each feed's `itunes:owner`
 * tag but deliberately does NOT expose it via the API, specifically to prevent
 * bulk harvesting. So this script never has an email to hand you. It ranks shows
 * by how easy they are to reach another way — a real site link, recent episodes,
 * an active feed — and you take the last step manually. That is the intended use
 * of the index, and it keeps outreach on the right side of the line.
 *
 * Usage:
 *   make podcasts                                   # all practice areas
 *   make podcasts ARGS="--only=breathwork --max=40"
 *   make podcasts ARGS="--dry-run"
 *   node scripts/find-podcasts.js --help
 *
 * Requires PODCAST_INDEX_KEY and PODCAST_INDEX_SECRET in the environment or a
 * .env file at the repo root. Free keys: https://api.podcastindex.org/signup
 */

import { createHash } from 'crypto';
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

import { KNOWN_TARGETS } from './find-leads.config.js';
import { scoreContact, byContactQuality, renderContactLines, normalizeUrl } from './lead-contact.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const outputDir = join(rootDir, 'leads');

const API_BASE = 'https://api.podcastindex.org/api/1.0';
const DEFAULT_MAX = 25;
const REQUEST_TIMEOUT_MS = 45_000;

// The index rejects generic or library-default User-Agent strings outright, so
// identify the script properly. This is a hard requirement, not a courtesy.
const USER_AGENT = 'AtLeastLeadFinder/1.0 (+https://atleast.app)';

/** A feed with no episode in this window is treated as dormant. */
const ACTIVE_WINDOW_DAYS = 180;

/** Shows below this episode count are usually abandoned pilots. */
const MIN_EPISODES = 8;

/**
 * One entry per practice area, each with several query phrasings. Podcast Index
 * does literal term matching rather than semantic search, so coverage comes from
 * trying multiple phrasings rather than from one clever query.
 */
const SEARCHES = {
  meditation: {
    label: 'Meditation & mindfulness',
    queries: ['meditation', 'mindfulness practice', 'guided meditation', 'vipassana', 'zen practice'],
  },
  breathwork: {
    label: 'Breathwork',
    queries: ['breathwork', 'breathing practice', 'wim hof', 'pranayama', 'box breathing'],
  },
  cold: {
    label: 'Cold exposure & recovery',
    queries: ['cold plunge', 'cold exposure', 'ice bath', 'sauna recovery', 'contrast therapy'],
  },
  focus: {
    label: 'Focus & deep work',
    queries: ['deep work', 'focus productivity', 'pomodoro', 'attention management', 'digital minimalism'],
  },
  yoga: {
    label: 'Yoga & movement',
    queries: ['yoga practice', 'yoga teacher', 'mobility practice', 'somatic movement'],
  },
  quantified: {
    label: 'Quantified self & biohacking',
    queries: ['quantified self', 'biohacking', 'wearable health', 'habit tracking'],
  },
};

// ---------------------------------------------------------------------------
// Argument parsing
// ---------------------------------------------------------------------------

function parseArgs(argv) {
  const opts = { only: null, max: DEFAULT_MAX, dryRun: false, includeDormant: false };

  for (const arg of argv) {
    if (arg === '--help' || arg === '-h') opts.help = true;
    else if (arg === '--dry-run') opts.dryRun = true;
    else if (arg === '--include-dormant') opts.includeDormant = true;
    else if (arg.startsWith('--only=')) opts.only = arg.slice(7).split(',').map((s) => s.trim());
    else if (arg.startsWith('--max=')) opts.max = Number(arg.slice(6));
    else {
      console.error(`Unknown argument: ${arg}`);
      opts.help = true;
    }
  }
  return opts;
}

function printHelp() {
  const categories = Object.entries(SEARCHES)
    .map(([key, s]) => `    ${key.padEnd(12)} ${s.label}`)
    .join('\n');

  console.log(`
Find podcast outreach leads via the Podcast Index API.

Usage:
  node scripts/find-podcasts.js [options]

Options:
  --only=a,b          Run only these categories (default: all)
  --max=N             Results per query (default: ${DEFAULT_MAX})
  --include-dormant   Keep feeds with no episode in ${ACTIVE_WINDOW_DAYS} days
  --dry-run           Print the requests without calling the API
  --help              Show this message

Categories:
${categories}

Environment:
  PODCAST_INDEX_KEY     Required.
  PODCAST_INDEX_SECRET  Required.

Free keys: https://api.podcastindex.org/signup

Note: the API does not expose podcast owner emails by design. Leads are ranked
by reachability — site link, activity, episode count — and the final contact
lookup is manual.
`);
}

// ---------------------------------------------------------------------------
// Environment
// ---------------------------------------------------------------------------

/** Minimal .env reader, matching find-leads.js so there's no dotenv dependency. */
function loadEnv(name) {
  if (process.env[name]) return process.env[name];

  const envPath = join(rootDir, '.env');
  if (!existsSync(envPath)) return null;

  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const match = line.match(new RegExp(`^\\s*(?:export\\s+)?${name}\\s*=\\s*(.*)$`));
    if (match) return match[1].trim().replace(/^["']|["']$/g, '');
  }
  return null;
}

/**
 * Podcast Index auth: sha1(key + secret + unixSeconds) as lowercase hex, sent
 * alongside the key and the same timestamp.
 */
function authHeaders(key, secret) {
  const seconds = Math.floor(Date.now() / 1000).toString();
  const hash = createHash('sha1').update(key + secret + seconds).digest('hex');

  return {
    'User-Agent': USER_AGENT,
    'X-Auth-Key': key,
    'X-Auth-Date': seconds,
    Authorization: hash,
  };
}

// ---------------------------------------------------------------------------
// API
// ---------------------------------------------------------------------------

function buildUrl(query, max) {
  const params = new URLSearchParams({
    q: query,
    max: String(max),
    clean: 'true', // drop explicit feeds — a poor fit for a calm-practice pitch
    fulltext: 'false',
  });
  return `${API_BASE}/search/byterm?${params}`;
}

async function search(query, max, credentials) {
  const response = await fetch(buildUrl(query, max), {
    headers: authHeaders(credentials.key, credentials.secret),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`HTTP ${response.status}: ${body.slice(0, 200)}`);
  }

  const data = await response.json();
  return Array.isArray(data.feeds) ? data.feeds : [];
}

// ---------------------------------------------------------------------------
// Leads
// ---------------------------------------------------------------------------

const normalize = (value) => String(value ?? '').toLowerCase();

function isKnown(feed) {
  const haystack = `${normalize(feed.title)} ${normalize(feed.link)} ${normalize(feed.author)}`;
  return KNOWN_TARGETS.some((target) => haystack.includes(normalize(target)));
}

const daysSince = (epochSeconds) =>
  !epochSeconds ? null : Math.floor((Date.now() / 1000 - epochSeconds) / 86_400);

/**
 * Convert a feed into a scored lead.
 *
 * `link` is the show's own site — the actual outreach path. The feed `url` is
 * only an RSS endpoint, so it never counts as a contact route.
 */
function toLead(feed, categoryKey) {
  const site = normalizeUrl(feed.link);
  const lastEpisodeDays = daysSince(feed.newestItemPubdate ?? feed.lastUpdateTime);

  const contact = scoreContact({ websites: site ? [site] : [] });

  return {
    name: feed.title,
    author: feed.author || feed.ownerName || '',
    description: (feed.description || '').replace(/\s+/g, ' ').trim().slice(0, 280),
    site,
    feedUrl: feed.url,
    itunesId: feed.itunesId ?? null,
    episodeCount: feed.episodeCount ?? 0,
    lastEpisodeDays,
    categories: Object.values(feed.categories ?? {}),
    category: categoryKey,
    contact,
  };
}

/**
 * Quality gate. The index contains a great many dead and near-empty feeds, and
 * pitching one wastes the same effort as pitching a live show.
 */
function isWorthContacting(lead, feed, opts) {
  if (feed.dead === 1) return false;
  if (!lead.name) return false;
  if (lead.episodeCount < MIN_EPISODES) return false;
  if (!lead.site) return false; // no site means no way in
  if (!opts.includeDormant && lead.lastEpisodeDays != null && lead.lastEpisodeDays > ACTIVE_WINDOW_DAYS) {
    return false;
  }
  return true;
}

/** Dedupe across queries within a category — phrasings overlap heavily. */
function dedupe(leads) {
  const seen = new Set();
  return leads.filter((lead) => {
    const key = lead.itunesId ? `itunes:${lead.itunesId}` : normalizeUrl(lead.feedUrl) ?? normalize(lead.name);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

function renderLead(lead) {
  const lines = [`### ${lead.name}`, ''];
  if (lead.site) lines.push(`<${lead.site}>`, '');

  if (lead.author) lines.push(`- **Host/author:** ${lead.author}`);
  lines.push(`- **Episodes:** ${lead.episodeCount}`);
  if (lead.lastEpisodeDays != null) {
    lines.push(`- **Last episode:** ${lead.lastEpisodeDays} days ago`);
  }
  if (lead.categories.length) lines.push(`- **Categories:** ${lead.categories.join(', ')}`);

  lines.push(...renderContactLines(lead.contact));
  lines.push(`- **Feed:** <${lead.feedUrl}>`);

  if (lead.description) lines.push('', lead.description);
  lines.push('');

  return lines.join('\n');
}

function renderSection(section) {
  const lines = [`## ${section.label}`, ''];

  if (section.error) {
    lines.push(`> Search failed: ${section.error}`, '');
    return lines.join('\n');
  }

  lines.push(
    `${section.leads.length} active shows · ${section.filtered} filtered as dead, tiny, or siteless · ` +
      `${section.knownCount} already tracked`,
    ''
  );

  if (!section.leads.length) {
    lines.push('_No leads met the quality threshold._', '');
    return lines.join('\n');
  }

  lines.push(...section.leads.map(renderLead));
  return lines.join('\n');
}

function renderReport(sections, timestamp) {
  const total = sections.reduce((sum, s) => sum + s.leads.length, 0);

  return [
    '# AtLeast podcast leads',
    '',
    `Generated ${timestamp} · Podcast Index API`,
    '',
    `**${total} active shows** across ${sections.length} practice areas.`,
    '',
    'Sorted by reachability, then by recency and episode count. Every show listed has',
    'a working site link, at least ' + MIN_EPISODES + ' episodes, and recent activity.',
    '',
    '**Contact lookup is manual by design.** Podcast Index stores owner emails from',
    'each feed but does not expose them through the API, specifically to prevent bulk',
    'harvesting. Use the site link to find the show\'s own preferred contact route —',
    'which also tends to get a better response than a cold address would.',
    '',
    ...sections.map(renderSection),
  ].join('\n');
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const opts = parseArgs(process.argv.slice(2));

  if (opts.help) {
    printHelp();
    return 0;
  }

  const keys = opts.only ?? Object.keys(SEARCHES);
  const unknown = keys.filter((key) => !SEARCHES[key]);
  if (unknown.length) {
    console.error(`Unknown category: ${unknown.join(', ')}`);
    console.error(`Available: ${Object.keys(SEARCHES).join(', ')}`);
    return 1;
  }

  if (opts.dryRun) {
    for (const key of keys) {
      console.log(`\n--- ${key} ---`);
      for (const query of SEARCHES[key].queries) console.log(buildUrl(query, opts.max));
    }
    return 0;
  }

  const key = loadEnv('PODCAST_INDEX_KEY');
  const secret = loadEnv('PODCAST_INDEX_SECRET');

  if (!key || !secret) {
    console.error('PODCAST_INDEX_KEY and PODCAST_INDEX_SECRET are required.\n');
    console.error('  export PODCAST_INDEX_KEY="..."      # or add them to .env at the repo root');
    console.error('  export PODCAST_INDEX_SECRET="..."');
    console.error('\nFree keys: https://api.podcastindex.org/signup');
    return 1;
  }

  const credentials = { key, secret };
  console.log(`Searching ${keys.length} categor${keys.length === 1 ? 'y' : 'ies'}...\n`);

  const sections = [];
  for (const categoryKey of keys) {
    const { label, queries } = SEARCHES[categoryKey];

    // Queries within a category run concurrently; a single failure shouldn't
    // cost the whole category.
    const settled = await Promise.allSettled(
      queries.map((query) => search(query, opts.max, credentials))
    );

    const failures = settled.filter((r) => r.status === 'rejected');
    if (failures.length === settled.length) {
      const message = failures[0].reason.message;
      console.error(`  ✗ ${label}: ${message}`);
      sections.push({ key: categoryKey, label, leads: [], knownCount: 0, filtered: 0, error: message });
      continue;
    }

    const feeds = settled.flatMap((r) => (r.status === 'fulfilled' ? r.value : []));

    let filtered = 0;
    const candidates = [];
    for (const feed of feeds) {
      const lead = toLead(feed, categoryKey);
      if (!isWorthContacting(lead, feed, opts)) {
        filtered += 1;
        continue;
      }
      candidates.push(lead);
    }

    const unique = dedupe(candidates);
    const tracked = (lead) => isKnown({ title: lead.name, link: lead.site, author: lead.author });
    const knownCount = unique.filter(tracked).length;
    const leads = unique.filter((lead) => !tracked(lead));

    leads.sort(
      byContactQuality(
        (a, b) => (a.lastEpisodeDays ?? 9999) - (b.lastEpisodeDays ?? 9999) || b.episodeCount - a.episodeCount
      )
    );

    console.log(`  ✓ ${label}: ${leads.length} active, ${filtered} filtered, ${knownCount} already tracked`);
    sections.push({ key: categoryKey, label, leads, knownCount, filtered });
  }

  const now = new Date();
  const stamp = now.toISOString().slice(0, 10);
  mkdirSync(outputDir, { recursive: true });

  const reportPath = join(outputDir, `podcasts-${stamp}.md`);
  const jsonPath = join(outputDir, `podcasts-${stamp}.json`);

  writeFileSync(reportPath, renderReport(sections, now.toISOString()));
  writeFileSync(jsonPath, JSON.stringify({ generatedAt: now.toISOString(), sections }, null, 2));

  const total = sections.reduce((sum, s) => sum + s.leads.length, 0);
  console.log(`\n${total} leads written to:`);
  console.log(`  ${reportPath}`);
  console.log(`  ${jsonPath}`);

  return sections.every((s) => s.error) ? 1 : 0;
}

main().then(
  (code) => process.exit(code),
  (error) => {
    console.error(error);
    process.exit(1);
  }
);
