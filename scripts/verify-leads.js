#!/usr/bin/env node

/**
 * Verify the contact info in the latest lead reports.
 *
 * The finders (find-leads, find-studios, find-podcasts) pull from indexes that
 * are weeks to months behind reality: businesses close, podcasts move hosts,
 * domains lapse. Before anyone sits down to do outreach, every lead's links get
 * checked live and every email domain gets an MX lookup, so time isn't wasted
 * on contacts that no longer exist.
 *
 * What "dead" means here is conservative. A site that refuses bots (403/429,
 * or a social platform's login wall) proves nothing about the business, so it
 * is recorded as blocked rather than dead. Only hard failures — DNS that does
 * not resolve, 404/410, connection refused — count against a lead, and even
 * then the lead is kept and flagged rather than deleted, so nothing silently
 * vanishes from the dataset.
 *
 * Emails are validated by MX lookup only. No SMTP probing — mailbox
 * verification against servers we don't own is abuse, and MX presence is
 * enough to separate lapsed domains from live ones.
 *
 * Usage:
 *   make verify-leads
 *   make verify-leads ARGS="--only=studios --limit=20"
 *   node scripts/verify-leads.js --help
 *
 * Reads the newest leads-*.json, studios-*.json, and podcasts-*.json from
 * leads/ and writes leads/verified-YYYY-MM-DD.json.
 */

import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { resolveMx } from 'dns/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

import { isSocialUrl, normalizeUrl } from './lead-contact.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const leadsDir = join(rootDir, 'leads');

const REQUEST_TIMEOUT_MS = 12_000;
const CONCURRENCY = 10;

// Some sites hard-block anything that looks like a script. A browser-shaped
// User-Agent keeps false "dead" verdicts down; the blocked bucket catches the
// rest.
const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';

// Statuses that mean "we were refused", not "this doesn't exist".
const BLOCKED_STATUSES = new Set([401, 403, 405, 406, 429, 999]);

// ---------------------------------------------------------------------------
// Argument parsing
// ---------------------------------------------------------------------------

function parseArgs(argv) {
  const opts = { only: null, limit: null, help: false };
  for (const arg of argv) {
    if (arg === '--help' || arg === '-h') opts.help = true;
    else if (arg.startsWith('--only=')) opts.only = arg.slice(7).split(',').map((s) => s.trim());
    else if (arg.startsWith('--limit=')) opts.limit = Number(arg.slice(8));
    else {
      console.error(`Unknown argument: ${arg}`);
      opts.help = true;
    }
  }
  return opts;
}

function printHelp() {
  console.log(`
Verify links and email domains in the latest lead reports.

Usage:
  node scripts/verify-leads.js [options]

Options:
  --only=a,b   Verify only these sources: leads, studios, podcasts (default: all)
  --limit=N    Verify at most N leads per source (for quick test runs)
  --help       Show this help

Output:
  leads/verified-YYYY-MM-DD.json — every lead with a verification block.
`);
}

// ---------------------------------------------------------------------------
// Loading the newest report of each kind
// ---------------------------------------------------------------------------

/** Newest file matching a prefix, relying on the ISO date in the filename. */
function latestReport(prefix) {
  const files = readdirSync(leadsDir)
    .filter((f) => f.startsWith(`${prefix}-`) && f.endsWith('.json'))
    .sort();
  if (!files.length) return null;
  const file = files[files.length - 1];
  return { file, data: JSON.parse(readFileSync(join(leadsDir, file), 'utf8')) };
}

/**
 * Flatten the three report shapes into one list of leads, each tagged with its
 * source and section and with its checkable URLs/emails pulled out.
 */
function collectLeads(opts) {
  const leads = [];
  const sources = [];

  const want = (name) => !opts.only || opts.only.includes(name);

  if (want('leads')) {
    const report = latestReport('leads');
    if (report) {
      sources.push(report.file);
      for (const section of report.data.sections) {
        for (const lead of section.leads ?? []) {
          const pitchMail = /^mailto:/i.test(lead.pitch_url ?? '')
            ? lead.pitch_url.replace(/^mailto:/i, '').split('?')[0]
            : null;
          leads.push({
            source: 'exa',
            section: section.key,
            sectionLabel: section.label,
            name: lead.name,
            lead,
            urls: [lead.url, pitchMail ? null : lead.pitch_url].map(normalizeUrl).filter(Boolean),
            emails: pitchMail ? [pitchMail] : [],
            feedUrl: null,
          });
        }
      }
    }
  }

  if (want('studios')) {
    const report = latestReport('studios');
    if (report) {
      sources.push(report.file);
      for (const section of report.data.sections) {
        for (const lead of [...(section.strong ?? []), ...(section.weak ?? [])]) {
          leads.push({
            source: 'studios',
            section: section.key,
            sectionLabel: section.label,
            name: lead.name,
            lead,
            urls: [...(lead.contact?.websites ?? []), ...(lead.contact?.socials ?? [])],
            emails: lead.contact?.emails ?? [],
            feedUrl: null,
          });
        }
      }
    }
  }

  if (want('podcasts')) {
    const report = latestReport('podcasts');
    if (report) {
      sources.push(report.file);
      for (const section of report.data.sections) {
        for (const lead of section.leads ?? []) {
          leads.push({
            source: 'podcasts',
            section: section.key,
            sectionLabel: section.label,
            name: lead.name,
            lead,
            urls: [...(lead.contact?.websites ?? []), ...(lead.contact?.socials ?? [])],
            emails: lead.contact?.emails ?? [],
            feedUrl: lead.feedUrl ?? null,
          });
        }
      }
    }
  }

  if (opts.limit) {
    const bySource = new Map();
    return {
      sources,
      leads: leads.filter((l) => {
        const n = (bySource.get(l.source) ?? 0) + 1;
        bySource.set(l.source, n);
        return n <= opts.limit;
      }),
    };
  }
  return { sources, leads };
}

// ---------------------------------------------------------------------------
// Checks
// ---------------------------------------------------------------------------

/** GET a URL, follow redirects, never read the body. */
async function checkUrl(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      redirect: 'follow',
      signal: controller.signal,
      headers: { 'User-Agent': USER_AGENT, Accept: '*/*' },
    });
    // The body is irrelevant; cancel it so sockets free up quickly.
    res.body?.cancel().catch(() => {});

    const finalUrl = res.url && res.url !== url ? res.url : null;
    if (res.ok || (res.status >= 300 && res.status < 400)) {
      return { url, result: 'ok', status: res.status, finalUrl };
    }
    if (BLOCKED_STATUSES.has(res.status)) {
      return { url, result: 'blocked', status: res.status, finalUrl };
    }
    // 5xx is most often a broken site, occasionally a bad day. Record the
    // status so a spot check can tell the difference.
    return { url, result: 'dead', status: res.status, finalUrl };
  } catch (error) {
    const cause = error?.cause?.code ?? error?.code ?? (error.name === 'AbortError' ? 'TIMEOUT' : null);
    // No DNS record is the one network error that is definitive.
    if (cause === 'ENOTFOUND') return { url, result: 'dead', error: cause };
    if (cause === 'TIMEOUT') return { url, result: 'blocked', error: cause };
    return { url, result: 'dead', error: cause ?? String(error.message ?? error) };
  } finally {
    clearTimeout(timer);
  }
}

/** MX lookup for an email's domain; cached because studios share providers. */
const mxCache = new Map();
async function checkEmailDomain(email) {
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) return { email, result: 'invalid' };
  if (!mxCache.has(domain)) {
    mxCache.set(
      domain,
      resolveMx(domain).then(
        (records) => (records.length ? 'ok' : 'no-mx'),
        (error) => (error?.code === 'ENOTFOUND' || error?.code === 'ENODATA' ? 'no-mx' : 'error')
      )
    );
  }
  return { email, result: await mxCache.get(domain), domain };
}

/** Run tasks with bounded concurrency, preserving order. */
async function withConcurrency(items, limit, worker) {
  const results = new Array(items.length);
  let next = 0;
  let done = 0;
  const lanes = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const i = next++;
      results[i] = await worker(items[i], i);
      done += 1;
      if (done % 25 === 0) process.stderr.write(`  ${done}/${items.length} leads checked\n`);
    }
  });
  await Promise.all(lanes);
  return results;
}

// Identical URLs recur across leads (shared hosting pages, chains); check once.
const urlCache = new Map();
function checkUrlCached(url) {
  if (!urlCache.has(url)) urlCache.set(url, checkUrl(url));
  return urlCache.get(url);
}

/**
 * Verify one lead: all its URLs and email domains. The verdict deliberately
 * separates "confirmed reachable" from "couldn't confirm" from "gone":
 *
 *   alive   — at least one owned/hosted URL loads, the feed loads, or an email
 *             domain has MX. There is a working way in.
 *   blocked — nothing confirmed, but every failure was a refusal (bot wall,
 *             timeout). Verify by hand before writing the lead off.
 *   dead    — every check failed hard and no email domain resolves.
 */
async function verifyLead(entry) {
  const socialUrls = entry.urls.filter((u) => isSocialUrl(u));
  const siteUrls = entry.urls.filter((u) => !isSocialUrl(u));

  const [siteChecks, socialChecks, feedCheck, emailChecks] = await Promise.all([
    Promise.all(siteUrls.map(checkUrlCached)),
    Promise.all(socialUrls.map(checkUrlCached)),
    entry.feedUrl ? checkUrlCached(entry.feedUrl) : Promise.resolve(null),
    Promise.all(entry.emails.map(checkEmailDomain)),
  ]);

  const emailOk = emailChecks.some((c) => c.result === 'ok');
  const hardChecks = [...siteChecks, ...(feedCheck ? [feedCheck] : [])];
  const anyOk = hardChecks.some((c) => c.result === 'ok');
  const anyBlocked = [...hardChecks, ...socialChecks].some((c) => c.result === 'blocked');

  let status;
  if (anyOk || emailOk) status = 'alive';
  else if (anyBlocked) status = 'blocked';
  else if (hardChecks.length || entry.emails.length) status = 'dead';
  // Social-profile-only leads whose platform blocks bots can't be confirmed
  // either way; without even a social URL there was nothing to check at all.
  else status = socialUrls.length ? 'blocked' : 'unchecked';

  return {
    ...entry,
    verification: {
      status,
      checkedAt: new Date().toISOString(),
      urls: [...siteChecks, ...socialChecks],
      feed: feedCheck,
      emails: emailChecks,
    },
  };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help) {
    printHelp();
    return;
  }

  const { sources, leads } = collectLeads(opts);
  if (!leads.length) {
    console.error('No lead reports found in leads/. Run the finders first.');
    process.exitCode = 1;
    return;
  }

  console.error(`Verifying ${leads.length} leads from: ${sources.join(', ')}`);
  const verified = await withConcurrency(leads, CONCURRENCY, verifyLead);

  const counts = {};
  for (const v of verified) counts[v.verification.status] = (counts[v.verification.status] ?? 0) + 1;
  console.error(
    `Done: ${Object.entries(counts)
      .map(([k, n]) => `${n} ${k}`)
      .join(', ')}`
  );

  const date = new Date().toISOString().slice(0, 10);
  const outPath = join(leadsDir, `verified-${date}.json`);
  mkdirSync(leadsDir, { recursive: true });
  writeFileSync(outPath, JSON.stringify({ generatedAt: new Date().toISOString(), sources, counts, leads: verified }, null, 1));
  console.error(`Wrote ${outPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
