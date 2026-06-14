// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // Production canonical origin — required for sitemap, OG URLs, and SEO component
  site: 'https://vegantattoostudios.com',

  // WordPress uses trailing slashes on all permalinks (verified via legacy URLs)
  trailingSlash: 'always',

  // Fully static prerender — hosted on Cloudflare Pages as static assets
  output: 'static',

  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [
    sitemap({
      filter: (page) => !page.includes('/api/'),
    }),
  ],
});
