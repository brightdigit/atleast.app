#!/usr/bin/env node

/**
 * Convert all PNGs under public/press/ to WebP.
 * Runs automatically as a prebuild/predev step.
 */

import sharp from 'sharp';
import { existsSync, readdirSync, statSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const pressDir = join(__dirname, '..', 'public', 'press');

function findPngs(dir) {
  if (!existsSync(dir)) return [];
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

  const results = await Promise.all(pngs.map(async (png) => {
    const webp = png.replace(/\.png$/, '.webp');
    try {
      await sharp(png).webp({ quality: 90 }).toFile(webp);
      console.log(`  ✓ ${webp.replace(pressDir + '/', '')}`);
      return true;
    } catch (err) {
      console.warn(`  ⚠️  Skipping ${png.replace(pressDir + '/', '')}: ${err.message}`);
      return false;
    }
  }));
  const converted = results.filter(Boolean).length;

  console.log(`✅ ${converted}/${pngs.length} WebP file(s) generated\n`);
}

generateWebP().catch((err) => {
  console.error('❌ Error generating WebP:', err);
  process.exit(1);
});
