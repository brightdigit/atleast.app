// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import { copyFileSync } from 'node:fs';
import { resolve } from 'node:path';

function copyAppleTouchIcons() {
  return {
    name: 'copy-apple-touch-icons',
    hooks: {
      'astro:build:done': ({ dir }) => {
        const src = resolve(dir.pathname, 'press/icons/apple-touch-icon.png');
        copyFileSync(src, resolve(dir.pathname, 'apple-touch-icon.png'));
        copyFileSync(src, resolve(dir.pathname, 'apple-touch-icon-precomposed.png'));
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
