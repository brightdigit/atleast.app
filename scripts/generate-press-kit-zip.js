#!/usr/bin/env node

/**
 * Generate press kit ZIP from app icons and screenshots.
 * Runs automatically as a prebuild step.
 */

import archiver from 'archiver';
import { createWriteStream, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { basename, dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const publicDir = join(__dirname, '..', 'public');
const outputDir = join(publicDir, 'downloads');
const outputPath = join(outputDir, 'atleast-press-kit.zip');

const readme = `AtLeast Press Kit
=================

App Name: AtLeast
Developer: BrightDigit
Platform: watchOS (Apple Watch Series 6 or later)
Price: Free
Category: Health & Fitness
Website: https://atleast.app
Support: support@atleast.app

Description
-----------
AtLeast is a passive haptic timer for Apple Watch. Gentle taps mark your intervals
during meditation, breathwork, or cold exposure — when tapping stops, you've reached
your minimum. No screen. No sound. Just rhythm, then stillness.

Privacy-first: no account, no network connection, no data collection. Runs entirely
on-device.

Contents
--------
icons/        - App icons in PNG format (512px, 1024px; watchOS and iOS variants)
screenshots/  - App screenshots (watchOS, iPhone framed, iPhone raw) in PNG

Usage Guidelines
----------------
- Use the provided app icon files without modification
- Maintain the original aspect ratio
- Do not alter icon colors, add effects, or distort the icon
- Allow sufficient clear space around the icon

For press inquiries: support@atleast.app
Press page: https://atleast.app/press
`;

console.log('📦 Generating press kit ZIP...');

async function generatePressKit() {
  try {
    mkdirSync(outputDir, { recursive: true });

    const output = createWriteStream(outputPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    const done = new Promise((resolve, reject) => {
      output.on('close', resolve);
      output.on('error', reject);
      archive.on('error', reject);
    });

    archive.pipe(output);

    const EXCLUDED_NAMES = new Set([
      'apple-touch-icon.png',
      'favicon-16x16.png',
      'favicon-32x32.png',
      'og-image.png',
      'og-image.webp',
    ]);

    const filter = (entry) => {
      if (entry.name.endsWith('.webp')) return false;
      if (basename(entry.name).startsWith('.')) return false;
      if (EXCLUDED_NAMES.has(basename(entry.name))) return false;
      return entry;
    };

    archive.append(readme, { name: 'README.txt' });

    archive.directory(join(publicDir, 'press', 'icons'), 'icons', filter);
    archive.directory(join(publicDir, 'press', 'screenshots'), 'screenshots', filter);

    await archive.finalize();
    await done;

    console.log('✅ Press kit ZIP generated!\n');
  } catch (error) {
    console.error('❌ Error generating press kit:', error);
    process.exit(1);
  }
}

generatePressKit();
