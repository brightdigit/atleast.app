#!/usr/bin/env node

/**
 * Print outreach targets referenced by open GitHub issues, for pasting into the
 * KNOWN_TARGETS list in find-leads.config.js.
 *
 * Extraction is intentionally shallow — it pulls subreddits and domains, which are
 * unambiguous. Outlet and community names mentioned only in prose still need to be
 * added by hand, so this is a starting point rather than a full replacement.
 *
 * Usage:
 *   make leads-known
 *
 * Requires the `gh` CLI, authenticated.
 */

import { execFileSync } from 'child_process';

import { KNOWN_TARGETS } from './find-leads.config.js';

const REPO = 'brightdigit/atleast.app';

let raw;
try {
  raw = execFileSync(
    'gh',
    ['issue', 'list', '--repo', REPO, '--state', 'open', '--limit', '200', '--json', 'number,title,body'],
    { encoding: 'utf8' }
  );
} catch (error) {
  console.error(`Failed to read issues from ${REPO}.`);
  console.error('Is the `gh` CLI installed and authenticated? Try: gh auth status');
  process.exit(1);
}

const issues = JSON.parse(raw);
const found = new Set();

for (const issue of issues) {
  const text = `${issue.title ?? ''}\n${issue.body ?? ''}`;

  for (const [, sub] of text.matchAll(/\br\/([A-Za-z0-9_]+)/g)) {
    found.add(`r/${sub}`);
  }
  for (const [, host] of text.matchAll(/https?:\/\/([a-z0-9.-]+)/gi)) {
    found.add(host.toLowerCase().replace(/^www\./, ''));
  }
}

// Hosts that appear in issues but say nothing about an outreach target.
const IGNORED_HOSTS = new Set(['github.com', 'atleast.app', 'linkedin.com', 'threads.com']);

const targets = [...found].filter((target) => !IGNORED_HOSTS.has(target)).sort();

const tracked = new Set(KNOWN_TARGETS.map((t) => t.toLowerCase()));
const missing = targets.filter((t) => !tracked.has(t.toLowerCase()));

console.log(`Found ${targets.length} extractable targets across ${issues.length} open issues.\n`);
console.log(targets.map((t) => `  '${t}',`).join('\n'));

if (missing.length) {
  console.log(`\n${missing.length} not yet in KNOWN_TARGETS — add these to find-leads.config.js:\n`);
  console.log(missing.map((t) => `  '${t}',`).join('\n'));
} else {
  console.log('\nAll extractable targets are already in KNOWN_TARGETS.');
}

console.log('\nNote: outlet and community names mentioned only in prose (e.g. "MacStories",');
console.log('"Dharma Overground") are not extracted automatically — add those by hand.');
