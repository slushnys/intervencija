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
  'og-image.svg',
  'site.webmanifest',
  'robots.txt',
  'sitemap.xml',
  'assets/site.css',
  'assets/theme.css',
  'assets/site.js',
  'system-audits/index.html',
  'critical-builds/index.html',
  'fractional-architecture/index.html'
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
  if (!html.includes('/assets/site.css')) {
    throw new Error(`${htmlFile} does not load the compiled site stylesheet.`);
  }
}

console.log(`Verified a clean GitHub Pages artifact with ${actualFiles.length} files.`);
