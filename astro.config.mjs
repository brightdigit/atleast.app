// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import { copyFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

function copyAppleTouchIcons() {
  return {
    name: 'copy-apple-touch-icons',
    hooks: {
      'astro:build:done': ({ dir }) => {
        const outDir = fileURLToPath(dir);
        const src = resolve(outDir, 'press/icons/apple-touch-icon.png');
        if (existsSync(src)) {
          copyFileSync(src, resolve(outDir, 'apple-touch-icon.png'));
          copyFileSync(src, resolve(outDir, 'apple-touch-icon-precomposed.png'));
        } else {
          console.warn('⚠️  apple-touch-icon.png not found, skipping copy');
        }
      },
    },
  };
}

// https://astro.build/config
export default defineConfig({
  site: 'https://atleast.app',
  integrations: [sitemap(), copyAppleTouchIcons()],
  vite: {
    plugins: [tailwindcss()],
  },
});
