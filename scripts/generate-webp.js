#!/usr/bin/env node

/**
 * Convert all PNGs under public/press/ to WebP.
 * Runs automatically as a prebuild/predev step.
 */

import sharp from 'sharp';
import { readdirSync, statSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const pressDir = join(__dirname, '..', 'public', 'press');

function findPngs(dir) {
  const results = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findPngs(full));
    } else if (entry.isFile() && entry.name.endsWith('.png')) {
      results.push(full);
    }
  }
  return results;
}

console.log('🖼️  Converting press PNGs to WebP...');

async function generateWebP() {
  const pngs = findPngs(pressDir);

  if (pngs.length === 0) {
    console.log('  No PNGs found in public/press/\n');
    return;
  }

  await Promise.all(pngs.map(async (png) => {
    const webp = png.replace(/\.png$/, '.webp');
    await sharp(png).webp({ quality: 90 }).toFile(webp);
    console.log(`  ✓ ${webp.replace(pressDir + '/', '')}`);
  }));

  console.log(`✅ ${pngs.length} WebP file(s) generated\n`);
}

generateWebP().catch((err) => {
  console.error('❌ Error generating WebP:', err);
  process.exit(1);
});
