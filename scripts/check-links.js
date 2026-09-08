#!/usr/bin/env node
// Internal link checker for the built site.
//
// Walks dist/**/*.html, collects every href that starts with "/", and fails if
// the target has no file in dist/. Paths listed in scripts/check-links.allow
// are skipped — that is how we can cross-link an article before it is written.
//
// Usage: make check:links  (after make build)

import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, dirname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
const ALLOW_FILE = join(ROOT, 'scripts', 'check-links.allow');

if (!existsSync(DIST)) {
  console.error('check:links — dist/ not found. Run `make build` first.');
  process.exit(1);
}

/** Recursively collect every .html file under dir. */
function htmlFiles(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...htmlFiles(full));
    else if (name.endsWith('.html')) out.push(full);
  }
  return out;
}

/** Paths that are allowed to 404 for now (one per line; # starts a comment). */
function readAllowlist() {
  if (!existsSync(ALLOW_FILE)) return new Set();
  return new Set(
    readFileSync(ALLOW_FILE, 'utf8')
      .split('\n')
      .map((line) => line.replace(/#.*$/, '').trim())
      .filter(Boolean)
      .map(normalize),
  );
}

/** Strip the fragment, the query string, and any trailing slash. */
function normalize(href) {
  const path = href.split('#')[0].split('?')[0];
  if (path === '/' || path === '') return '/';
  return path.replace(/\/+$/, '');
}

/** Absolute path under DIST for this internal URL path, or null if it escapes. */
function targetUnderDist(path) {
  const relative = path === '/' ? '' : path.replace(/^\//, '');
  const target = resolve(DIST, relative);
  if (target !== DIST && !target.startsWith(DIST + sep)) return null;
  return target;
}

/** Does dist/ contain a file for this internal path? */
function resolves(path) {
  const target = targetUnderDist(path);
  if (target === null) return false;
  if (path === '/') return existsSync(join(DIST, 'index.html'));
  return (
    (existsSync(target) && statSync(target).isFile()) ||
    existsSync(join(target, 'index.html'))
  );
}

const allow = readAllowlist();
const HREF = /\bhref\s*=\s*"([^"]*)"|\bhref\s*=\s*'([^']*)'/gi;
const broken = new Map(); // path -> Set of source pages

for (const file of htmlFiles(DIST)) {
  const html = readFileSync(file, 'utf8');
  const source = '/' + file.slice(DIST.length + 1);
  let match;
  while ((match = HREF.exec(html)) !== null) {
    const raw = (match[1] ?? match[2] ?? '').trim();
    // Internal, absolute paths only. Skips #anchors, ?queries on their own,
    // mailto:, tel:, http(s):, protocol-relative //host, and relative links.
    if (!raw.startsWith('/') || raw.startsWith('//')) continue;
    const path = normalize(raw);
    if (path === '/' && raw.startsWith('#')) continue;
    if (allow.has(path)) continue;
    if (resolves(path)) continue;
    if (!broken.has(path)) broken.set(path, new Set());
    broken.get(path).add(source);
  }
}

if (broken.size > 0) {
  console.error(`check:links — ${broken.size} broken internal link(s):\n`);
  for (const [path, sources] of [...broken].sort()) {
    console.error(`  ${path}`);
    for (const source of [...sources].sort()) console.error(`      from ${source}`);
  }
  console.error(
    '\nFix the link, or add the path to scripts/check-links.allow if the page is coming in a later PR.',
  );
  process.exit(1);
}

console.log('check:links — all internal links resolve.');
