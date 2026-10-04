import { access, readFile, readdir } from 'node:fs/promises';
import { dirname, extname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const publicDir = join(root, 'public');
const productDir = join(root, 'products');
const failures = [];
const warnings = [];

async function filesBelow(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => entry.isDirectory()
    ? filesBelow(join(directory, entry.name))
    : [join(directory, entry.name)]));
  return nested.flat();
}

const publicFiles = await filesBelow(publicDir);
const productFiles = await filesBelow(productDir);
const htmlFiles = [join(root, 'index.html'), ...productFiles.filter((file) => extname(file) === '.html'), ...publicFiles.filter((file) => extname(file) === '.html' && !/^google.*\.html$/i.test(file.split(/[\\/]/).at(-1)))];
const knownSpaRoutes = new Set([
  '/checkout', '/kviz', '/uslovi-kupovine', '/informacije-o-trgovcu', '/dostava', '/reklamacije',
  '/povracaj-sredstava', '/privatnost', '/bezbednost-placanja', '/payment/card', '/payment/success', '/payment/failed',
]);
const routeForFile = (file) => {
  if (file === join(root, 'index.html')) return '/';
  const baseDirectory = file.startsWith(`${productDir}${sep}`) ? root : publicDir;
  const local = relative(baseDirectory, file).split(sep).join('/');
  if (local === '404.html') return '/404.html';
  return local.endsWith('/index.html') ? `/${local.slice(0, -10)}` : `/${local}`;
};
const routes = new Set(htmlFiles.map(routeForFile));
const titles = new Map();
const canonicals = new Map();

function count(source, pattern) {
  return [...source.matchAll(pattern)].length;
}

function capture(source, pattern) {
  return source.match(pattern)?.[1]?.trim() || '';
}

function fail(file, message) {
  failures.push(`${relative(root, file)}: ${message}`);
}

for (const file of htmlFiles) {
  const source = await readFile(file, 'utf8');
  const route = routeForFile(file);
  const is404 = route === '/404.html';
  const isProductPdp = file.startsWith(`${productDir}${sep}`);
  const title = capture(source, /<title>([\s\S]*?)<\/title>/i);
  const description = capture(source, /<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
  const canonical = capture(source, /<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i);
  const robots = capture(source, /<meta\s+name=["']robots["']\s+content=["']([^"']+)["']/i);

  if (!title) fail(file, 'missing title');
  if (!description) fail(file, 'missing meta description');
  if (!is404 && !canonical) fail(file, 'missing canonical');
  if (!is404 && !canonical.startsWith('https://ridepogon.com/')) fail(file, `canonical is not on canonical host: ${canonical}`);
  if (!robots) fail(file, 'missing robots directive');
  if (!is404 && /noindex/i.test(robots)) fail(file, 'indexable page is marked noindex');

  const h1Count = count(source, /<h1(?:\s|>)/gi);
  if (!is404 && h1Count !== 1) fail(file, `expected one H1, found ${h1Count}`);

  for (const image of source.matchAll(/<img\b[^>]*>/gi)) {
    if (!/\salt=["'][^"']*["']/i.test(image[0])) fail(file, `image missing alt: ${image[0].slice(0, 90)}`);
    if (!/\bwidth=["']\d+["']/i.test(image[0]) || !/\bheight=["']\d+["']/i.test(image[0])) {
      warnings.push(`${relative(root, file)}: image lacks numeric width/height`);
    }
  }

  for (const script of source.matchAll(/<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const parsed = JSON.parse(script[1]);
      const serialized = JSON.stringify(parsed);
      if (/AggregateRating|"Review"/.test(serialized) && !isProductPdp) fail(file, 'contains prohibited unverified rating/review schema');
    } catch (error) {
      fail(file, `invalid JSON-LD: ${error.message}`);
    }
  }

  if (!is404) {
    if (titles.has(title)) fail(file, `duplicate title also used by ${titles.get(title)}`);
    else titles.set(title, relative(root, file));
    if (canonicals.has(canonical)) fail(file, `duplicate canonical also used by ${canonicals.get(canonical)}`);
    else canonicals.set(canonical, relative(root, file));
  }

  for (const match of source.matchAll(/<a\b[^>]*\shref=["']([^"']+)["'][^>]*>/gi)) {
    const href = match[1];
    if (!href.startsWith('/') || href.startsWith('//')) continue;
    const pathname = href.split('#')[0].split('?')[0] || '/';
    if (knownSpaRoutes.has(pathname) || routes.has(pathname) || routes.has(`${pathname}/`)) continue;
    if (extname(pathname)) {
      try { await access(join(publicDir, decodeURIComponent(pathname.slice(1)))); }
      catch { fail(file, `broken asset/document link: ${href}`); }
      continue;
    }
    fail(file, `broken internal link: ${href}`);
  }
}

const sitemap = await readFile(join(publicDir, 'sitemap.xml'), 'utf8');
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
const uniqueSitemapUrls = new Set(sitemapUrls);
if (sitemapUrls.length !== uniqueSitemapUrls.size) failures.push('public/sitemap.xml: duplicate URL');
for (const url of sitemapUrls) {
  if (!url.startsWith('https://ridepogon.com/')) failures.push(`public/sitemap.xml: wrong canonical host ${url}`);
  if (/checkout|payment|api|admin|\?/.test(url)) failures.push(`public/sitemap.xml: private or variant URL included ${url}`);
  const pathname = new URL(url).pathname;
  if (!knownSpaRoutes.has(pathname.replace(/\/$/, '')) && !routes.has(pathname) && !routes.has(pathname.endsWith('/') ? pathname : `${pathname}/`)) {
    failures.push(`public/sitemap.xml: unresolved route ${pathname}`);
  }
}

const robots = await readFile(join(publicDir, 'robots.txt'), 'utf8');
if (!robots.includes('Sitemap: https://ridepogon.com/sitemap.xml')) failures.push('public/robots.txt: canonical sitemap missing');
for (const route of ['/checkout', '/payment/', '/api/']) {
  if (!robots.includes(`Disallow: ${route}`)) failures.push(`public/robots.txt: missing disallow for ${route}`);
}

const guideFiles = htmlFiles.filter((file) => /public[\\/]vodici[\\/][^\\/]+[\\/]index\.html$/.test(file));
for (const file of guideFiles) {
  const source = await readFile(file, 'utf8');
  const visible = source
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[^;]+;/g, ' ');
  const words = visible.trim().split(/\s+/).filter(Boolean).length;
  if (words < 700) warnings.push(`${relative(root, file)}: ${words} visible words (review depth)`);
}

if (warnings.length) {
  console.warn(`SEO warnings (${warnings.length}):`);
  warnings.forEach((warning) => console.warn(`- ${warning}`));
}
if (failures.length) {
  console.error(`SEO verification failed (${failures.length}):`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exitCode = 1;
} else {
  console.log(`SEO verification passed for ${htmlFiles.length} HTML files and ${sitemapUrls.length} sitemap URLs.`);
}
