#!/usr/bin/env node

/**
 * Find studio, spa, and gym outreach leads from the Overture Maps Places dataset.
 *
 * Overture publishes ~75M global POIs as GeoParquet on S3 under a permissive
 * license (CDLA 2.0), with websites, socials, emails, and phones as first-class
 * fields. This queries that data in place with DuckDB — no bulk download — and
 * keeps only US places that have a usable contact path.
 *
 * Usage:
 *   make studios                                  # home, statewide, then national
 *   make studios ARGS="--metro=lansing --limit=60"
 *   make studios ARGS="--metro=michigan"
 *   make studios ARGS="--list-metros"
 *   node scripts/find-studios.js --help
 *
 * Requires the DuckDB CLI (`brew install duckdb`). No API key — the data is open.
 * Results are written to leads/ (gitignored) alongside the Exa reports.
 */

import { mkdirSync, writeFileSync } from 'fs';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

import { KNOWN_TARGETS } from './find-leads.config.js';
import {
  scoreContact,
  byContactQuality,
  renderContactLines,
  MIN_CONTACT_SCORE,
  STRONG_CONTACT_SCORE,
} from './lead-contact.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const outputDir = join(rootDir, 'leads');

const S3_REGION = 'us-west-2';
const DEFAULT_LIMIT = 40;
const QUERY_TIMEOUT_MS = 600_000;

/**
 * Overture taxonomy values that map to AtLeast's practice areas.
 *
 * These are exact values, verified against the live dataset — not guesses.
 * Prefix matching was tried first and is wrong here: `spa%` also matches
 * `spanish_restaurant`, and plausible-looking values like `wellness_center` or
 * `climbing` simply don't exist in the taxonomy.
 *
 * `gym` and `fitness` are deliberately excluded — big-box gyms convert far worse
 * than practice-specific studios, and they flood the results.
 */
const CATEGORIES = [
  'yoga_studio',
  'meditation_center',
  'pilates_studio',
  'martial_arts_club',
  'spa',
  'day_spa',
  'health_spa',
  'medical_spa',
  'health_and_wellness_club',
  'wellness_service',
  'sauna',
  'cryotherapy',
  'rock_climbing_gym',
];

/**
 * Search areas as bounding boxes. Overture partitions by geometry, so a bbox
 * filter is what keeps these queries cheap — a nationwide scan reads far more
 * data for a list nobody could work through anyway.
 *
 * Optional per-area fields:
 *   regions State values to accept, added to the WHERE clause. A bbox is a
 *           rectangle, so a whole-state box catches neighbours; Michigan's
 *           box also covers Chicago, Milwaukee, Toledo, and part of Ontario.
 *           Overture documents this field as an ISO 3166-2 code, but the data
 *           is aggregated from many sources, so list the spelled-out name too.
 *   limit   Default result cap, for areas where the shared default is too tight.
 *           An explicit --limit still wins.
 */
const METROS = {
  // Home first. Local outreach is the cheapest kind — these are places you can
  // walk into with the watch on your wrist.
  lansing: {
    label: 'Greater Lansing',
    group: 'Michigan',
    // Lansing, East Lansing, Okemos, Haslett, Grand Ledge, DeWitt, Mason, Williamston.
    bbox: [-84.9, 42.5, -84.2, 42.95],
  },
  michigan: {
    label: 'Michigan (statewide)',
    group: 'Michigan',
    bbox: [-90.42, 41.69, -82.12, 48.31],
    regions: ['MI', 'Michigan'],
    // A whole state holds more than one city's worth of studios.
    limit: 80,
  },
  detroit: { label: 'Detroit Metro', group: 'Michigan', bbox: [-83.65, 42.05, -82.85, 42.8] },
  annarbor: { label: 'Ann Arbor', group: 'Michigan', bbox: [-83.95, 42.15, -83.55, 42.4] },
  grandrapids: { label: 'Grand Rapids', group: 'Michigan', bbox: [-85.85, 42.8, -85.45, 43.1] },

  sf: { label: 'San Francisco Bay Area', group: 'National', bbox: [-122.75, 37.15, -121.75, 38.05] },
  la: { label: 'Los Angeles', group: 'National', bbox: [-118.95, 33.6, -117.6, 34.35] },
  nyc: { label: 'New York City', group: 'National', bbox: [-74.3, 40.5, -73.65, 40.95] },
  austin: { label: 'Austin', group: 'National', bbox: [-98.05, 30.05, -97.5, 30.55] },
  denver: { label: 'Denver / Boulder', group: 'National', bbox: [-105.35, 39.5, -104.6, 40.1] },
  seattle: { label: 'Seattle', group: 'National', bbox: [-122.5, 47.4, -122.1, 47.8] },
  portland: { label: 'Portland', group: 'National', bbox: [-122.85, 45.4, -122.4, 45.65] },
  chicago: { label: 'Chicago', group: 'National', bbox: [-87.95, 41.65, -87.5, 42.05] },
  boston: { label: 'Boston', group: 'National', bbox: [-71.25, 42.25, -70.95, 42.45] },
  sandiego: { label: 'San Diego', group: 'National', bbox: [-117.35, 32.65, -117.0, 33.0] },
};

/**
 * Areas searched when none are named: home, then the rest of the state, then the
 * metros where cold plunge and studio culture run strong.
 *
 * Order matters. Areas run in sequence and a place already reported is skipped,
 * so listing Lansing before Michigan keeps local results in the local section and
 * leaves the statewide section to cover everywhere else.
 */
const DEFAULT_METROS = ['lansing', 'michigan', 'sf', 'la', 'nyc', 'austin', 'denver'];

// ---------------------------------------------------------------------------
// Argument parsing
// ---------------------------------------------------------------------------

function parseArgs(argv) {
  // limit stays null until asked for, so each area can fall back to its own default.
  const opts = { metros: null, limit: null, release: null, dryRun: false };

  for (const arg of argv) {
    if (arg === '--help' || arg === '-h') opts.help = true;
    else if (arg === '--dry-run') opts.dryRun = true;
    else if (arg === '--list-metros') opts.listMetros = true;
    else if (arg.startsWith('--metro=')) opts.metros = arg.slice(8).split(',').map((s) => s.trim());
    else if (arg.startsWith('--limit=')) opts.limit = Number(arg.slice(8));
    else if (arg.startsWith('--release=')) opts.release = arg.slice(10);
    else {
      console.error(`Unknown argument: ${arg}`);
      opts.help = true;
    }
  }
  return opts;
}

/** Group the areas by region so the list stays scannable as it grows. */
function metroLines(indent = '    ') {
  const groups = new Map();
  for (const [key, metro] of Object.entries(METROS)) {
    const group = metro.group ?? 'Other';
    if (!groups.has(group)) groups.set(group, []);
    groups.get(group).push(`${indent}  ${key.padEnd(12)} ${metro.label}`);
  }

  return [...groups]
    .map(([group, lines]) => [`${indent}${group}:`, ...lines].join('\n'))
    .join('\n\n');
}

function printHelp() {
  console.log(`
Find studio/spa outreach leads from the Overture Maps Places dataset.

Usage:
  node scripts/find-studios.js [options]

Options:
  --metro=a,b       Areas to search (default: ${DEFAULT_METROS.join(',')})
  --limit=N         Max leads per area (default: ${DEFAULT_LIMIT}; statewide areas set their own)
  --release=VER     Overture release, e.g. 2026-07-22.0 (default: latest)
  --dry-run         Print the SQL without running it
  --list-metros     List available areas
  --help            Show this message

Areas:
${metroLines()}

Requires the DuckDB CLI:  brew install duckdb
No API key needed — Overture Places is open data (CDLA Permissive 2.0).
`);
}

// ---------------------------------------------------------------------------
// DuckDB
// ---------------------------------------------------------------------------

function duckdbVersion() {
  try {
    return execFileSync('duckdb', ['--version'], { encoding: 'utf8' }).trim();
  } catch {
    return null;
  }
}

/**
 * Resolve the newest Overture release. The release path is date-versioned and a
 * hardcoded date silently goes stale, so probe the S3 listing and fall back to a
 * known-good release if the listing is unreachable.
 */
async function latestRelease() {
  const url = `https://overturemaps-${S3_REGION}.s3.amazonaws.com/?list-type=2&prefix=release/&delimiter=/`;

  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(20_000) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const xml = await response.text();
    const releases = [...xml.matchAll(/<Prefix>release\/([^<]+?)\/<\/Prefix>/g)]
      .map((m) => m[1])
      .filter((r) => /^\d{4}-\d{2}-\d{2}\.\d+$/.test(r))
      .sort();

    if (!releases.length) throw new Error('no releases matched');
    return releases[releases.length - 1];
  } catch (error) {
    console.warn(`  ! Could not resolve latest release (${error.message}); using 2026-07-22.0`);
    return '2026-07-22.0';
  }
}

/** SQL string literal escape. */
const sqlStr = (value) => `'${String(value).replace(/'/g, "''")}'`;

/**
 * Build the query for one metro.
 *
 * Contact filtering happens in SQL rather than in JS on purpose: it turns a
 * multi-million-row scan into a few hundred rows over the wire. The WHERE clause
 * is the whole point of this script — a place with no website, email, social, or
 * phone cannot be contacted, so there is no reason to transfer it.
 */
function buildQuery(release, metro, limit) {
  const [xmin, ymin, xmax, ymax] = metro.bbox;
  const path = `s3://overturemaps-${S3_REGION}/release/${release}/theme=places/type=place/*`;
  const categoryList = CATEGORIES.map(sqlStr).join(', ');
  // A bbox is a rectangle, so a state-sized box always catches its neighbours.
  // Filtering on the region is what makes a statewide search actually statewide.
  const regionClause = metro.regions?.length
    ? `\n    AND upper(addresses[1].region) IN (${metro.regions.map((r) => sqlStr(r.toUpperCase())).join(', ')})`
    : '';

  return `
INSTALL spatial; LOAD spatial;
INSTALL httpfs; LOAD httpfs;
SET s3_region = ${sqlStr(S3_REGION)};

WITH candidates AS (
  SELECT
    names.primary                          AS name,
    COALESCE(taxonomy.primary, '')         AS primary_cat,
    confidence,
    operating_status,
    websites,
    socials,
    emails,
    phones,
    addresses[1].freeform                  AS street,
    addresses[1].locality                  AS locality,
    addresses[1].region                    AS region,
    bbox.xmin                              AS lon,
    bbox.ymin                              AS lat
  FROM read_parquet(${sqlStr(path)}, filename = true, hive_partitioning = 1)
  WHERE bbox.xmin BETWEEN ${xmin} AND ${xmax}
    AND bbox.ymin BETWEEN ${ymin} AND ${ymax}
    AND addresses[1].country = 'US'${regionClause}
)
SELECT
  name,
  primary_cat,
  confidence,
  websites,
  socials,
  emails,
  phones,
  street,
  locality,
  region,
  lon,
  lat
FROM candidates
WHERE name IS NOT NULL
  AND primary_cat IN (${categoryList})
  -- Never pitch a business that has closed.
  AND (operating_status IS NULL OR operating_status <> 'closed')
  -- Reachability filter: keep only places with some contact path.
  AND (
    (emails   IS NOT NULL AND len(emails)   > 0) OR
    (websites IS NOT NULL AND len(websites) > 0) OR
    (socials  IS NOT NULL AND len(socials)  > 0) OR
    (phones   IS NOT NULL AND len(phones)   > 0)
  )
  -- Overture's own confidence in the record. Below ~0.5 the rows get noticeably
  -- noisy: closed businesses, duplicates, and mis-geocoded entries.
  AND confidence >= 0.5
ORDER BY
  (emails   IS NOT NULL AND len(emails)   > 0) DESC,
  (websites IS NOT NULL AND len(websites) > 0) DESC,
  confidence DESC
LIMIT ${Number(limit)};
`.trim();
}

function runQuery(sql) {
  const json = execFileSync('duckdb', ['-json', '-c', sql], {
    encoding: 'utf8',
    timeout: QUERY_TIMEOUT_MS,
    maxBuffer: 64 * 1024 * 1024,
  });

  const trimmed = json.trim();
  if (!trimmed) return [];

  const parsed = JSON.parse(trimmed);
  return Array.isArray(parsed) ? parsed : [];
}

// ---------------------------------------------------------------------------
// Leads
// ---------------------------------------------------------------------------

const normalize = (value) => String(value ?? '').toLowerCase();

/** Reuse the Exa script's exclusion list so the two reports don't overlap. */
function isKnown(name, urls) {
  const haystack = `${normalize(name)} ${urls.map(normalize).join(' ')}`;
  return KNOWN_TARGETS.some((target) => haystack.includes(normalize(target)));
}

/** Overture nests contact values in structs; flatten whatever shape comes back. */
function flatten(value) {
  if (value == null) return [];
  const items = Array.isArray(value) ? value : [value];
  return items
    .map((item) => (item && typeof item === 'object' ? item.value ?? item.url ?? null : item))
    .filter(Boolean)
    .map(String);
}

/** An explicit --limit wins; otherwise each area may set its own. */
const limitFor = (metro, opts) => opts.limit ?? metro.limit ?? DEFAULT_LIMIT;

/**
 * Key for suppressing a place already reported by an earlier area. Areas overlap
 * by design — Greater Lansing sits inside Michigan — so without this a local
 * studio shows up twice.
 *
 * Keyed on the contact URL rather than the location: one entry per contactable
 * organization is what outreach wants, so a two-location studio sharing one
 * domain is one pitch, not two.
 */
function dedupeKey(lead) {
  const url = lead.contact.websites[0] ?? lead.contact.socials[0];
  return url ? `url:${normalize(url)}` : `place:${normalize(lead.name)}|${lead.mapUrl ?? ''}`;
}

function toLead(row, metroKey) {
  const address = [row.street, row.locality, row.region].filter(Boolean).join(', ') || null;

  const contact = scoreContact({
    emails: flatten(row.emails),
    websites: flatten(row.websites),
    socials: flatten(row.socials),
    phones: flatten(row.phones),
    address,
  });

  return {
    name: row.name,
    category: row.primary_cat,
    confidence: typeof row.confidence === 'number' ? Number(row.confidence.toFixed(3)) : null,
    metro: metroKey,
    mapUrl: row.lat != null && row.lon != null ? `https://www.openstreetmap.org/#map=18/${row.lat}/${row.lon}` : null,
    contact,
  };
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

function renderLead(lead) {
  const primary = lead.contact.websites[0] ?? lead.contact.socials[0] ?? lead.mapUrl;
  const lines = [`### ${lead.name}`, ''];

  if (primary) lines.push(`<${primary}>`, '');

  const meta = [`- **Category:** ${lead.category || 'uncategorized'}`];
  if (lead.confidence != null) meta.push(`- **Overture confidence:** ${lead.confidence}`);
  lines.push(...meta, ...renderContactLines(lead.contact), '');

  return lines.join('\n');
}

function renderSection(section) {
  const lines = [`## ${section.label}`, ''];

  if (section.error) {
    lines.push(`> Query failed: ${section.error}`, '');
    return lines.join('\n');
  }

  const { strong, weak } = section;
  const dupeNote = section.dupeCount ? ` · ${section.dupeCount} shown under an earlier area` : '';
  lines.push(
    `${strong.length + weak.length} leads · ${strong.length} with a direct contact path · ` +
      `${section.knownCount} already tracked${dupeNote}`,
    ''
  );

  if (strong.length) {
    lines.push('### Direct contact available', '');
    lines.push(...strong.map(renderLead));
  }

  if (weak.length) {
    lines.push('### Website only — needs a contact-page lookup', '');
    lines.push(...weak.map(renderLead));
  }

  if (!strong.length && !weak.length) lines.push('_No leads met the contact threshold._', '');

  return lines.join('\n');
}

function renderReport(sections, release, timestamp) {
  const strong = sections.reduce((sum, s) => sum + (s.strong?.length ?? 0), 0);
  const weak = sections.reduce((sum, s) => sum + (s.weak?.length ?? 0), 0);

  return [
    '# AtLeast studio & spa leads',
    '',
    `Generated ${timestamp} · Overture Maps release \`${release}\``,
    '',
    `**${strong + weak} leads** across ${sections.length} areas — ` +
      `${strong} with a direct contact path, ${weak} needing a contact-page lookup.`,
    '',
    'Sorted by contact quality: places with a published email come first, then those',
    'with an owned website, then social-only listings.',
    '',
    'Verify before contacting. Overture aggregates third-party data and a listing can',
    'be stale or wrong. A business appearing here has not consented to be contacted —',
    'check CAN-SPAM obligations before any bulk send.',
    '',
    `Place data © Overture Maps Foundation, licensed CDLA Permissive 2.0.`,
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

  if (opts.listMetros) {
    console.log(metroLines(''));
    return 0;
  }

  const keys = opts.metros ?? DEFAULT_METROS;
  const unknown = keys.filter((key) => !METROS[key]);
  if (unknown.length) {
    console.error(`Unknown metro: ${unknown.join(', ')}`);
    console.error(`Available: ${Object.keys(METROS).join(', ')}`);
    return 1;
  }

  // --dry-run only prints SQL, so it must work without DuckDB installed.
  if (opts.dryRun) {
    const release = opts.release ?? (await latestRelease());
    for (const key of keys) {
      console.log(`\n--- ${key} ---`);
      console.log(buildQuery(release, METROS[key], limitFor(METROS[key], opts)));
    }
    return 0;
  }

  if (!duckdbVersion()) {
    console.error('The DuckDB CLI is required but was not found on PATH.\n');
    console.error('  brew install duckdb\n');
    console.error('DuckDB queries the Overture Parquet files directly on S3, so');
    console.error('there is nothing else to download and no API key to configure.');
    return 1;
  }

  const release = opts.release ?? (await latestRelease());

  console.log(`Querying Overture release ${release} across ${keys.length} metro(s)...`);
  console.log('First query downloads Parquet metadata and can take a minute.\n');

  // Sequential on purpose: each query streams a lot of remote Parquet, and running
  // them concurrently competes for the same bandwidth without finishing sooner.
  // The sequence also decides which area keeps an overlapping place — the first
  // one to report it wins, which is why home comes first in DEFAULT_METROS.
  const sections = [];
  const seen = new Set();

  for (const key of keys) {
    const metro = METROS[key];
    try {
      const rows = runQuery(buildQuery(release, metro, limitFor(metro, opts)));
      const all = rows.map((row) => toLead(row, key));

      const fresh = all.filter(
        (lead) => !isKnown(lead.name, [...lead.contact.websites, ...lead.contact.socials])
      );
      const knownCount = all.length - fresh.length;

      const unseen = fresh.filter((lead) => !seen.has(dedupeKey(lead)));
      const dupeCount = fresh.length - unseen.length;
      for (const lead of unseen) seen.add(dedupeKey(lead));

      const usable = unseen
        .filter((lead) => lead.contact.score >= MIN_CONTACT_SCORE)
        .sort(byContactQuality((a, b) => (b.confidence ?? 0) - (a.confidence ?? 0)));

      const strong = usable.filter((lead) => lead.contact.score >= STRONG_CONTACT_SCORE);
      const weak = usable.filter((lead) => lead.contact.score < STRONG_CONTACT_SCORE);

      const dupeNote = dupeCount ? `, ${dupeCount} already in an earlier area` : '';
      console.log(
        `  ✓ ${metro.label}: ${strong.length} direct, ${weak.length} site-only, ${knownCount} tracked${dupeNote}`
      );
      sections.push({ key, label: metro.label, strong, weak, knownCount, dupeCount });
    } catch (error) {
      const message = error.stderr?.toString().trim() || error.message;
      console.error(`  ✗ ${metro.label}: ${message.slice(0, 300)}`);
      sections.push({
        key,
        label: metro.label,
        strong: [],
        weak: [],
        knownCount: 0,
        dupeCount: 0,
        error: message,
      });
    }
  }

  const now = new Date();
  const stamp = now.toISOString().slice(0, 10);
  mkdirSync(outputDir, { recursive: true });

  const reportPath = join(outputDir, `studios-${stamp}.md`);
  const jsonPath = join(outputDir, `studios-${stamp}.json`);

  writeFileSync(reportPath, renderReport(sections, release, now.toISOString()));
  writeFileSync(jsonPath, JSON.stringify({ generatedAt: now.toISOString(), release, sections }, null, 2));

  const total = sections.reduce((sum, s) => sum + s.strong.length + s.weak.length, 0);
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
