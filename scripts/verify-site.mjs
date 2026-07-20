import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const pages = [
  'index.html',
  'system-audits/index.html',
  'critical-builds/index.html',
  'fractional-architecture/index.html',
  'privacy.html'
];
const publicPages = pages.filter((page) => page !== 'privacy.html');
const errors = [];
const titles = new Map();
const descriptions = new Map();
const canonicals = new Map();
const documents = new Map();

const fail = (message) => errors.push(message);
const decode = (value) => value.replaceAll('&amp;', '&').replaceAll('&#39;', "'").replaceAll('&quot;', '"');

for (const page of pages) {
  const path = resolve(root, page);
  if (!existsSync(path)) {
    fail(`${page}: file is missing`);
    continue;
  }

  const html = readFileSync(path, 'utf8');
  documents.set(page, html);

  const title = decode(html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.trim() || '');
  const description = decode(html.match(/<meta\s+name="description"\s+content="([^"]+)"/i)?.[1] || '');
  const canonical = html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i)?.[1] || '';
  const h1Count = (html.match(/<h1\b/gi) || []).length;

  if (!title) fail(`${page}: title is missing`);
  if (!description) fail(`${page}: meta description is missing`);
  if (!canonical) fail(`${page}: canonical URL is missing`);
  if (h1Count !== 1) fail(`${page}: expected one H1, found ${h1Count}`);
  if (html.includes('—')) fail(`${page}: contains an em dash`);
  if (html.includes('cdn.tailwindcss.com')) fail(`${page}: still uses the Tailwind browser CDN`);
  if (!html.includes('href="/assets/site.css"')) fail(`${page}: compiled production stylesheet is missing`);

  if (titles.has(title)) fail(`${page}: title duplicates ${titles.get(title)}`);
  if (descriptions.has(description)) fail(`${page}: description duplicates ${descriptions.get(description)}`);
  if (canonicals.has(canonical)) fail(`${page}: canonical duplicates ${canonicals.get(canonical)}`);
  titles.set(title, page);
  descriptions.set(description, page);
  canonicals.set(canonical, page);

  for (const match of html.matchAll(/<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/gi)) {
    try {
      JSON.parse(match[1]);
    } catch (error) {
      fail(`${page}: invalid JSON-LD (${error.message})`);
    }
  }

  const ids = new Set(Array.from(html.matchAll(/\sid="([^"]+)"/g), (match) => match[1]));
  for (const match of html.matchAll(/href="([^"]+)"/g)) {
    const href = match[1];
    if (href.startsWith('#')) {
      if (!ids.has(href.slice(1))) fail(`${page}: missing local anchor ${href}`);
      continue;
    }

    if (!href.startsWith('/')) continue;
    const url = new URL(href, 'https://intervencija.eu/');
    const target = url.pathname === '/'
      ? 'index.html'
      : url.pathname.endsWith('/')
        ? `${url.pathname.slice(1)}index.html`
        : url.pathname.slice(1);

    if (!existsSync(resolve(root, target))) fail(`${page}: link target ${url.pathname} does not exist`);
    if (url.hash) {
      const targetHtml = documents.get(target) || readFileSync(resolve(root, target), 'utf8');
      if (!targetHtml.includes(`id="${url.hash.slice(1)}"`)) fail(`${page}: target ${href} has no matching ID`);
    }
  }
}

const homepage = documents.get('index.html') || '';
if (!/<form\b[^>]*\bmethod="post"/i.test(homepage)) fail('index.html: enquiry form is not POST');
if (!/<form\b[^>]*\baction="https:\/\/submit-form\.com\//i.test(homepage)) fail('index.html: enquiry form action is missing');
if (!homepage.includes('id="form-note"')) fail('index.html: form-note status element is missing');
if (!homepage.includes('role="status"')) fail('index.html: form status role is missing');
if (!homepage.includes('mailto:hello@intervencija.eu')) fail('index.html: direct email fallback is missing');
if (!homepage.includes('/privacy.html')) fail('index.html: privacy link is missing');

const sitemap = readFileSync(resolve(root, 'sitemap.xml'), 'utf8');
for (const page of publicPages) {
  const canonical = Array.from(canonicals.entries()).find(([, owner]) => owner === page)?.[0];
  if (canonical && !sitemap.includes(`<loc>${canonical}</loc>`)) fail(`sitemap.xml: missing ${canonical}`);
}
if (sitemap.includes('privacy.html')) fail('sitemap.xml: noindex privacy page should not be included');

const notFoundPage = readFileSync(resolve(root, '404.html'), 'utf8');
if (!notFoundPage.includes('name="robots" content="noindex, follow"')) fail('404.html: noindex directive is missing');
if ((notFoundPage.match(/<h1\b/gi) || []).length !== 1) fail('404.html: expected one H1');
if (notFoundPage.includes('—')) fail('404.html: contains an em dash');
if (notFoundPage.includes('cdn.tailwindcss.com')) fail('404.html: still uses the Tailwind browser CDN');
if (!notFoundPage.includes('href="/assets/site.css"')) fail('404.html: compiled production stylesheet is missing');

for (const asset of [
  'favicon.svg',
  'favicon.ico',
  'apple-touch-icon.png',
  'og-image.png',
  'logo.svg',
  'site.webmanifest',
  'robots.txt',
  'assets/theme.css',
  'assets/site.css',
  'assets/site.js'
]) {
  if (!existsSync(resolve(root, asset))) fail(`${asset}: required asset is missing`);
}

const theme = readFileSync(resolve(root, 'assets/theme.css'), 'utf8');
if (!/\.reveal\s*\{\s*opacity:\s*1;/m.test(theme)) fail('assets/theme.css: reveal content is not visible by default');
if (!theme.includes('.js .reveal')) fail('assets/theme.css: progressive reveal enhancement is missing');

if (errors.length) {
  console.error(`Site verification failed with ${errors.length} issue(s):`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exitCode = 1;
} else {
  console.log(`Site verification passed for ${pages.length} pages.`);
}
