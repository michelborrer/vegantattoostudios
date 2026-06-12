# Deploy to Cloudflare Pages via GitHub

This project deploys through **Cloudflare Pages ↔ GitHub** integration (not GitHub Actions).

## Prerequisites

- [GitHub](https://github.com) account
- [Cloudflare](https://dash.cloudflare.com) account with `vegantattoostudios.com` in your zone (for custom domain)

## 1. Push to GitHub

```bash
# Create a new empty repo at https://github.com/new named "vegantattoostudios"
# Do NOT initialize with README (this repo already has one)

git remote add origin https://github.com/YOUR_USERNAME/vegantattoostudios.git
git branch -M main
git push -u origin main
```

## 2. Connect Cloudflare Pages to GitHub

1. Open [Cloudflare Dashboard](https://dash.cloudflare.com) → **Workers & Pages** → **Create**
2. Choose **Pages** → **Connect to Git**
3. Authorize Cloudflare to access GitHub and select the `vegantattoostudios` repository
4. Configure build settings:

| Setting | Value |
|---|---|
| **Production branch** | `main` |
| **Framework preset** | Astro |
| **Build command** | `npm run build` |
| **Build output directory** | `dist/client` |
| **Root directory** | `/` |

5. **Environment variables** (optional but recommended):

| Variable | Value |
|---|---|
| `NODE_VERSION` | `22` |

6. Click **Save and Deploy**

Cloudflare will run `npm run build` on every push to `main`. The `wrangler.jsonc` in this repo tells Cloudflare where static assets live (`dist/client`).

## 3. Custom domain (vegantattoostudios.com)

After the first successful deploy:

1. Go to your Pages project → **Custom domains** → **Set up a custom domain**
2. Enter `vegantattoostudios.com` and `www.vegantattoostudios.com`
3. Cloudflare will configure DNS automatically if the domain is on your account
4. Wait for SSL certificate provisioning (usually a few minutes)

## 4. Verify SEO assets

After deploy, confirm these URLs respond correctly:

- `https://vegantattoostudios.com/` (homepage)
- `https://vegantattoostudios.com/sitemap-index.xml`
- `https://vegantattoostudios.com/robots.txt`
- `https://vegantattoostudios.com/_redirects` (301 rules applied by Cloudflare)
- A legacy blog URL, e.g. `/what-it-takes-to-make-a-vegan-tattoo/`

## Local preview (before pushing)

```bash
npm run build
npx wrangler pages dev dist/client
```

## Troubleshooting

| Issue | Fix |
|---|---|
| Build fails on Node version | Set `NODE_VERSION=22` in Pages env vars |
| 404 on routes with trailing slash | Astro is configured with `trailingSlash: 'always'` — ensure you are not stripping slashes at the CDN |
| Wrong output directory | Must be `dist/client`, not `dist` |
| Images not loading | Featured images load from legacy WP CDN; migrate to `public/` when ready |

## Wrangler CLI deploy (alternative to Git)

If you prefer direct deploy without GitHub:

```bash
npx wrangler login
npm run build
npx wrangler pages deploy dist/client --project-name=vegantattoostudios
```

Git-based deploy is recommended for production so every merge to `main` auto-deploys.
