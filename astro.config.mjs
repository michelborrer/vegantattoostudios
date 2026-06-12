// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // Production canonical origin — required for sitemap, OG URLs, and SEO component
  site: 'https://vegantattoostudios.com',

  // WordPress uses trailing slashes on all permalinks (verified via legacy URLs)
  trailingSlash: 'always',

  // Fully static prerender — no SSR; ideal for Cloudflare Pages edge caching
  output: 'static',

  vite: {
    plugins: [tailwindcss()],
  },

  adapter: cloudflare({
    imageService: 'compile',
  }),

  integrations: [
    sitemap({
      // Exclude draft or utility routes when added in later phases
      filter: (page) => !page.includes('/api/'),
    }),
  ],
});
