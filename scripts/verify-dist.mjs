import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(fileURLToPath(new URL('../', import.meta.url)));
const distRoot = join(projectRoot, 'dist');

const expectedFiles = [
  '.nojekyll',
  'index.html',
  'privacy.html',
  '404.html',
  'CNAME',
  'favicon.svg',
  'favicon.ico',
  'favicon-32.png',
  'apple-touch-icon.png',
  'logo.svg',
  'og-image.png',
  'site.webmanifest',
  'robots.txt',
  'sitemap.xml',
  'assets/site.css',
  'assets/theme.css',
  'assets/site.js',
  'assets/fonts/inter-latin.woff2',
  'assets/fonts/inter-latin-ext.woff2',
  'assets/fonts/playfair-display-latin.woff2',
  'assets/fonts/playfair-display-latin-ext.woff2',
  'assets/og/system-audits.png',
  'assets/og/critical-builds.png',
  'assets/og/fractional-architecture.png',
  'assets/og/insights.png',
  'assets/og/insight-before-you-replatform.png',
  'assets/og/insight-production-ready-critical-software.png',
  'assets/og/insight-when-a-fractional-architect-makes-sense.png',
  'assets/logos/sendcloud.svg',
  'assets/logos/new10.svg',
  'assets/logos/abn-amro.svg',
  'assets/logos/rabobank.png',
  'assets/logos/sns.svg',
  'assets/logos/helmes.svg',
  'assets/logos/costa-coffee.svg',
  'assets/logos/coca-cola.svg',
  'assets/logos/vml.svg',
  'system-audits/index.html',
  'critical-builds/index.html',
  'fractional-architecture/index.html',
  'insights/index.html',
  'insights/before-you-replatform/index.html',
  'insights/production-ready-critical-software/index.html',
  'insights/when-a-fractional-architect-makes-sense/index.html'
].sort();

function listFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = join(directory, entry.name);
    if (entry.isDirectory()) return listFiles(entryPath);
    return [relative(distRoot, entryPath).split(sep).join('/')];
  });
}

if (!existsSync(distRoot)) {
  throw new Error('Missing dist/. Run npm run build first.');
}

const actualFiles = listFiles(distRoot).sort();
const missing = expectedFiles.filter((file) => !actualFiles.includes(file));
const unexpected = actualFiles.filter((file) => !expectedFiles.includes(file));

if (missing.length > 0) {
  throw new Error(`Deployment artifact is missing: ${missing.join(', ')}`);
}

if (unexpected.length > 0) {
  throw new Error(`Deployment artifact contains unexpected files: ${unexpected.join(', ')}`);
}

const customDomain = readFileSync(join(distRoot, 'CNAME'), 'utf8').trim();
if (customDomain !== 'intervencija.eu') {
  throw new Error(`Unexpected CNAME value: ${customDomain || '(empty)'}`);
}

for (const htmlFile of actualFiles.filter((file) => file.endsWith('.html'))) {
  const html = readFileSync(join(distRoot, htmlFile), 'utf8');
  if (html.includes('cdn.tailwindcss.com')) {
    throw new Error(`${htmlFile} still loads Tailwind from the CDN.`);
  }
  if (/fonts\.(googleapis|gstatic)\.com/.test(html)) {
    throw new Error(`${htmlFile} still requests third-party fonts.`);
  }
  if (!html.includes('/assets/site.css')) {
    throw new Error(`${htmlFile} does not load the compiled site stylesheet.`);
  }
}

console.log(`Verified a clean GitHub Pages artifact with ${actualFiles.length} files.`);
