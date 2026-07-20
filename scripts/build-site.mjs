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
  'og-image.svg',
  'site.webmanifest',
  'robots.txt',
  'sitemap.xml'
];

const assetFiles = [
  'assets/site.css',
  'assets/theme.css',
  'assets/site.js'
];

const pageDirectories = [
  'system-audits',
  'critical-builds',
  'fractional-architecture'
];

const requiredSources = [
  ...rootFiles,
  ...assetFiles,
  ...pageDirectories.map((directory) => `${directory}/index.html`)
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
