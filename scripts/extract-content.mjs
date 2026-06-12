import fs from 'node:fs';
import path from 'node:path';
import TurndownService from 'turndown';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const TEMP = process.env.TEMP || '/tmp';

const turndown = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
});

turndown.addRule('removeEmpty', {
  filter: (node) => node.nodeName === 'SCRIPT' || node.nodeName === 'STYLE',
  replacement: () => '',
});

function decodeHtml(str) {
  return str
    .replace(/&#038;/g, '&')
    .replace(/&#8217;/g, "'")
    .replace(/&#8211;/g, '–')
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/<[^>]+>/g, '');
}

function stripShortcodes(html) {
  return html
    .replace(/\[themify_builder[^\]]*\][\s\S]*?\[\/themify_builder\]/gi, '')
    .replace(/\[[^\]]+\]/g, '');
}

function extractFeaturedImage(post) {
  const embedded = post._embedded?.['wp:featuredmedia']?.[0];
  if (!embedded) return { image: undefined, imageAlt: undefined };
  return {
    image: embedded.source_url,
    imageAlt: embedded.alt_text || decodeHtml(post.title.rendered),
  };
}

function toFrontmatter(data) {
  const lines = ['---'];
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined || value === null) continue;
    if (typeof value === 'string') {
      lines.push(`${key}: ${JSON.stringify(value)}`);
    } else {
      lines.push(`${key}: ${value}`);
    }
  }
  lines.push('---', '');
  return lines.join('\n');
}

// ── Blog posts ──────────────────────────────────────────────────────────────
const posts = JSON.parse(fs.readFileSync(path.join(TEMP, 'vts-posts.json'), 'utf8'));
const blogDir = path.join(ROOT, 'src/content/blog');
fs.mkdirSync(blogDir, { recursive: true });

for (const post of posts) {
  const yoast = post.yoast_head_json || {};
  const { image, imageAlt } = extractFeaturedImage(post);
  const title = decodeHtml(post.title.rendered);
  const description = yoast.description || post.excerpt?.rendered?.replace(/<[^>]+>/g, '').trim() || '';
  const html = stripShortcodes(post.content.rendered);
  const markdown = turndown.turndown(html);

  const frontmatter = toFrontmatter({
    title,
    description,
    pubDate: post.date,
    updatedDate: post.modified,
    author: post._embedded?.author?.[0]?.name || undefined,
    image,
    imageAlt,
    draft: false,
  });

  fs.writeFileSync(path.join(blogDir, `${post.slug}.md`), frontmatter + markdown, 'utf8');
  console.log(`✓ blog/${post.slug}.md`);
}

// ── Tattoo studios ────────────────────────────────────────────────────────────
const places = JSON.parse(fs.readFileSync(path.join(TEMP, 'vts-places.json'), 'utf8'));
const studios = places.map((p) => ({
  slug: p.slug,
  name: typeof p.title === 'object' ? p.title.rendered : p.title,
  city: p.city || '',
  region: p.region || '',
  country: p.country || '',
  street: p.street || '',
  zip: p.zip || '',
  phone: p.phone || '',
  website: p.website || '',
  email: p.email || '',
  lat: p.latitude || null,
  lng: p.longitude || null,
}));

const dataDir = path.join(ROOT, 'src/data');
fs.mkdirSync(dataDir, { recursive: true });
fs.writeFileSync(path.join(dataDir, 'studios.json'), JSON.stringify(studios, null, 2), 'utf8');
console.log(`✓ data/studios.json (${studios.length} studios)`);

// ── Static pages content ──────────────────────────────────────────────────────
const pages = JSON.parse(fs.readFileSync(path.join(TEMP, 'vts-pages.json'), 'utf8'));
const staticSlugs = ['about-us', 'contact-us', 'gallery', 'terms-and-conditions'];
const pagesDir = path.join(ROOT, 'src/data/pages');
fs.mkdirSync(pagesDir, { recursive: true });

for (const slug of staticSlugs) {
  const page = pages.find((p) => p.slug === slug);
  if (!page) continue;
  const yoast = page.yoast_head_json || {};
  const html = stripShortcodes(page.content.rendered);
  const markdown = turndown.turndown(html);
  const data = {
    slug,
    title: decodeHtml(yoast.title || page.title.rendered),
    description: yoast.description || '',
    content: markdown,
    modified: page.modified,
  };
  fs.writeFileSync(path.join(pagesDir, `${slug}.json`), JSON.stringify(data, null, 2), 'utf8');
  console.log(`✓ data/pages/${slug}.json`);
}

console.log('\nExtraction complete.');
