# Vegan Tattoo Studios

High-performance static rebuild of [vegantattoostudios.com](https://vegantattoostudios.com/) using Astro, Tailwind CSS, and Cloudflare Pages.

## Stack

- **Astro 6** (TypeScript strict, static output)
- **Tailwind CSS v4**
- **@astrojs/cloudflare** adapter
- **@astrojs/sitemap** for XML sitemap generation
- Content Collections for blog posts (13 articles)

## Development

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
npm run preview
```

## Cloudflare Pages deployment

| Setting | Value |
|---|---|
| Build command | `npm run build` |
| Build output directory | `dist` |
| Node.js version | `22` |

The Cloudflare adapter outputs static assets to `dist/client/`. Cloudflare Pages reads `_headers` and `_redirects` from the build output for security headers and legacy URL 301 redirects.

### Wrangler (optional)

```bash
npx wrangler pages deploy dist/client --project-name=vegantattoostudios
```

## SEO & URL preservation

- `trailingSlash: 'always'` matches legacy WordPress permalinks
- All 13 blog posts retain exact root-level slugs (e.g. `/what-it-takes-to-make-a-vegan-tattoo/`)
- Static pages: `/location/`, `/about-us/`, `/contact-us/`, `/gallery/`, `/terms-and-conditions/`
- `public/_redirects` handles legacy WordPress routes (store locator, auth pages, GeoDirectory templates)
- Yoast meta titles and descriptions preserved from WordPress REST API extraction

## Content extraction

Re-extract blog posts and studio data from the live WordPress site:

```bash
curl -sL "https://vegantattoostudios.com/wp-json/wp/v2/posts?per_page=100&_embed" -o %TEMP%/vts-posts.json
curl -sL "https://vegantattoostudios.com/wp-json/geodir/v2/places?per_page=100" -o %TEMP%/vts-places.json
curl -sL "https://vegantattoostudios.com/wp-json/wp/v2/pages?per_page=100" -o %TEMP%/vts-pages.json
node scripts/extract-content.mjs
```
