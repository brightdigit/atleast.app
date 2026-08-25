#!/usr/bin/env node

/**
 * Find outreach leads for AtLeast using the Exa search API.
 *
 * Searches four categories — press, communities, creators, studios — and writes a
 * Markdown report of leads that aren't already tracked as GitHub issues.
 *
 * Usage:
 *   make leads                        # all categories
 *   make leads ARGS="--only=press"    # one category
 *   node scripts/find-leads.js --help
 *
 * Requires EXA_API_KEY in the environment or in a .env file at the repo root.
 * Results are written to leads/reports/ (gitignored) — they contain contact details and
 * are a working artifact, not site content.
 */

import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

import { SEARCHES, KNOWN_TARGETS } from './find-leads.config.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const outputDir = join(rootDir, 'leads', 'reports');

const API_URL = 'https://api.exa.ai/search';
const DEFAULT_RESULTS = 15;
const REQUEST_TIMEOUT_MS = 120_000;

// ---------------------------------------------------------------------------
// Argument parsing
// ---------------------------------------------------------------------------

function parseArgs(argv) {
  const opts = { only: null, numResults: DEFAULT_RESULTS, type: 'deep', dryRun: false };

  for (const arg of argv) {
    if (arg === '--help' || arg === '-h') opts.help = true;
    else if (arg === '--dry-run') opts.dryRun = true;
    else if (arg.startsWith('--only=')) opts.only = arg.slice(7).split(',').map((s) => s.trim());
    else if (arg.startsWith('--num=')) opts.numResults = Number(arg.slice(6));
    else if (arg.startsWith('--type=')) opts.type = arg.slice(7);
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
Find outreach leads for AtLeast via the Exa search API.

Usage:
  node scripts/find-leads.js [options]

Options:
  --only=a,b     Run only these categories (default: all)
  --num=N        Results to retrieve per category (default: ${DEFAULT_RESULTS})
  --type=TYPE    Exa search type: auto, deep-lite, deep, deep-reasoning (default: deep)
  --dry-run      Print the request payloads without calling the API
  --help         Show this message

Categories:
${categories}

Environment:
  EXA_API_KEY    Required. Read from the environment or a .env file at the repo root.
`);
}

// ---------------------------------------------------------------------------
// Environment
// ---------------------------------------------------------------------------

/** Minimal .env reader so the script works without adding a dotenv dependency. */
function loadApiKey() {
  if (process.env.EXA_API_KEY) return process.env.EXA_API_KEY;

  const envPath = join(rootDir, '.env');
  if (!existsSync(envPath)) return null;

  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const match = line.match(/^\s*(?:export\s+)?EXA_API_KEY\s*=\s*(.*)$/);
    if (match) return match[1].trim().replace(/^["']|["']$/g, '');
  }
  return null;
}

// ---------------------------------------------------------------------------
// Deduplication against tracked issues
// ---------------------------------------------------------------------------

const normalize = (value) => String(value ?? '').toLowerCase();

/** Strip protocol, www, and trailing slash so URL comparisons are stable. */
function canonicalUrl(url) {
  return normalize(url)
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/+$/, '');
}

/**
 * True when a lead matches something already tracked in a GitHub issue. Matching is
 * substring-based against the lead's name and URL, which is deliberately loose: a
 * false positive costs one re-found lead, a false negative costs duplicated outreach.
 */
function isKnown(lead) {
  const haystack = `${normalize(lead.name)} ${canonicalUrl(lead.url)}`;
  return KNOWN_TARGETS.some((target) => haystack.includes(normalize(target)));
}

/** Drop leads pointing at the same URL, keeping the first occurrence. */
function dedupeByUrl(leads) {
  const seen = new Set();
  return leads.filter((lead) => {
    const key = canonicalUrl(lead.url);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// ---------------------------------------------------------------------------
// Exa API
// ---------------------------------------------------------------------------

function buildPayload(search, opts) {
  return {
    query: search.query,
    type: opts.type,
    numResults: opts.numResults,
    systemPrompt: search.systemPrompt,
    outputSchema: search.outputSchema,
    additionalQueries: search.additionalQueries,
    contents: { highlights: true },
  };
}

async function runSearch(key, search, opts, apiKey) {
  const payload = buildPayload(search, opts);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response;
  try {
    response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'x-api-key': apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error(`"${key}" timed out after ${REQUEST_TIMEOUT_MS / 1000}s`);
    }
    throw new Error(`"${key}" request failed: ${error.message}`);
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`"${key}" returned HTTP ${response.status}: ${body.slice(0, 400)}`);
  }

  const data = await response.json();
  const leads = data?.output?.content?.leads;

  if (!Array.isArray(leads)) {
    throw new Error(
      `"${key}" returned no structured leads. Response keys: ${Object.keys(data).join(', ')}`
    );
  }

  // Grounding citations are keyed by field path (e.g. "leads[0].url"), so index
  // into them to attach sources to the lead they support.
  const grounding = data?.output?.grounding ?? [];
  const sourcesFor = (index) =>
    grounding
      .filter((g) => g.field?.startsWith(`leads[${index}]`))
      .flatMap((g) => g.citations ?? [])
      .map((c) => c.url)
      .filter(Boolean);

  return leads.map((lead, index) => ({ ...lead, _sources: [...new Set(sourcesFor(index))] }));
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

/** Fields rendered as a detail line, in display order, excluding the ones in the heading. */
const DETAIL_FIELDS = [
  ['target_type', 'Type'],
  ['outlet_type', 'Type'],
  ['platform', 'Platform'],
  ['practice', 'Practice'],
  ['facility_type', 'Type'],
  ['channel', 'Channel'],
  ['size', 'Size'],
  ['audience_note', 'Audience'],
  ['city', 'City'],
  ['location', 'Location'],
  ['promo_rules', 'Self-promo rules'],
  ['contact', 'Contact'],
  ['pitch_url', 'Pitch/submit'],
];

function renderLead(lead) {
  const lines = [`### ${lead.name}`, '', `<${lead.url}>`, ''];

  const details = DETAIL_FIELDS.filter(([field]) => lead[field]).map(
    ([field, label]) => `- **${label}:** ${lead[field]}`
  );
  if (details.length) lines.push(...details, '');

  if (lead.why_relevant) lines.push(lead.why_relevant, '');

  if (lead._sources?.length) {
    lines.push(`<details><summary>Sources</summary>`, '');
    lines.push(...lead._sources.map((url) => `- <${url}>`), '');
    lines.push('</details>', '');
  }

  return lines.join('\n');
}

function renderReport(sections, opts, timestamp) {
  const total = sections.reduce((sum, s) => sum + s.leads.length, 0);
  const skipped = sections.reduce((sum, s) => sum + s.knownCount, 0);

  const lines = [
    '# AtLeast outreach leads',
    '',
    `Generated ${timestamp} · Exa \`type=${opts.type}\` · ${opts.numResults} results requested per category`,
    '',
    `**${total} new leads** across ${sections.length} categories. ` +
      `${skipped} already tracked in GitHub issues and filtered out.`,
    '',
    'Verify every contact detail before using it — these are model-extracted from web',
    'sources and can be stale or wrong.',
    '',
  ];

  for (const section of sections) {
    const issueRef = section.issue ? ` (see #${section.issue})` : '';
    lines.push(`## ${section.label}${issueRef}`, '');

    if (section.error) {
      lines.push(`> Search failed: ${section.error}`, '');
      continue;
    }

    lines.push(
      `${section.leads.length} new · ${section.knownCount} already tracked`,
      ''
    );

    if (!section.leads.length) {
      lines.push('_No new leads found._', '');
      continue;
    }

    lines.push(...section.leads.map(renderLead));
  }

  return lines.join('\n');
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
      console.log(JSON.stringify(buildPayload(SEARCHES[key], opts), null, 2));
    }
    return 0;
  }

  const apiKey = loadApiKey();
  if (!apiKey) {
    console.error('EXA_API_KEY is not set.\n');
    console.error('  export EXA_API_KEY="your-key"    # or add it to .env at the repo root');
    console.error('\nGet a key at https://dashboard.exa.ai');
    return 1;
  }

  console.log(`Searching ${keys.length} categor${keys.length === 1 ? 'y' : 'ies'} (type=${opts.type})...\n`);

  // Run all categories concurrently; one failure must not lose the others.
  const settled = await Promise.allSettled(
    keys.map((key) => runSearch(key, SEARCHES[key], opts, apiKey))
  );

  const sections = settled.map((result, i) => {
    const key = keys[i];
    const { label, issue } = SEARCHES[key];

    if (result.status === 'rejected') {
      console.error(`  ✗ ${label}: ${result.reason.message}`);
      return { key, label, issue, leads: [], knownCount: 0, error: result.reason.message };
    }

    const all = dedupeByUrl(result.value);
    const leads = all.filter((lead) => !isKnown(lead));
    const knownCount = all.length - leads.length;

    console.log(`  ✓ ${label}: ${leads.length} new, ${knownCount} already tracked`);
    return { key, label, issue, leads, knownCount };
  });

  const now = new Date();
  const stamp = now.toISOString().slice(0, 10);
  mkdirSync(outputDir, { recursive: true });

  const reportPath = join(outputDir, `leads-${stamp}.md`);
  const jsonPath = join(outputDir, `leads-${stamp}.json`);

  writeFileSync(reportPath, renderReport(sections, opts, now.toISOString()));
  writeFileSync(jsonPath, JSON.stringify({ generatedAt: now.toISOString(), opts, sections }, null, 2));

  const total = sections.reduce((sum, s) => sum + s.leads.length, 0);
  console.log(`\n${total} new leads written to:`);
  console.log(`  ${reportPath}`);
  console.log(`  ${jsonPath}`);

  // Non-zero exit if every category failed, so CI or a wrapper can react.
  return sections.every((s) => s.error) ? 1 : 0;
}

main().then(
  (code) => process.exit(code),
  (error) => {
    console.error(error);
    process.exit(1);
  }
);
