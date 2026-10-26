import {
  copyFileSync,
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync
} from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(fileURLToPath(new URL('../', import.meta.url)));
const distRoot = resolve(projectRoot, 'dist');

if (dirname(distRoot) !== projectRoot) {
  throw new Error(`Refusing to clean an unexpected deployment path: ${distRoot}`);
}

const rootFiles = [
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
  'sitemap.xml'
];

const assetFiles = [
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
  'assets/logos/vml.svg'
];

const pageDirectories = [
  'system-audits',
  'critical-builds',
  'fractional-architecture',
  'insights'
];

const nestedPages = [
  'insights/before-you-replatform/index.html',
  'insights/production-ready-critical-software/index.html',
  'insights/when-a-fractional-architect-makes-sense/index.html'
];

const requiredSources = [
  ...rootFiles,
  ...assetFiles,
  ...pageDirectories.map((directory) => `${directory}/index.html`),
  ...nestedPages
];

for (const relativePath of requiredSources) {
  if (!existsSync(join(projectRoot, relativePath))) {
    throw new Error(`Missing public source file: ${relativePath}`);
  }
}

rmSync(distRoot, { recursive: true, force: true });
mkdirSync(distRoot, { recursive: true });

function copy(relativePath) {
  const source = join(projectRoot, relativePath);
  const destination = join(distRoot, relativePath);
  mkdirSync(dirname(destination), { recursive: true });
  copyFileSync(source, destination);
}

for (const relativePath of [...rootFiles, ...assetFiles]) {
  copy(relativePath);
}

for (const directory of pageDirectories) {
  cpSync(join(projectRoot, directory), join(distRoot, directory), {
    recursive: true,
    filter: (source) => statSync(source).isDirectory() || source.endsWith('.html')
  });
}

writeFileSync(join(distRoot, '.nojekyll'), '');

function countFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).reduce((total, entry) => {
    const entryPath = join(directory, entry.name);
    return total + (entry.isDirectory() ? countFiles(entryPath) : 1);
  }, 0);
}

console.log(`Built ${countFiles(distRoot)} public files in dist/.`);
