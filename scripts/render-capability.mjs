// Renders the one-page A4 capability statement from scripts/capability/statement.html.
// Not part of the CI build: the PDF is committed. To regenerate after copy changes:
//   npm run serve:local                      (in one terminal)
//   npm i --no-save playwright-core && npx playwright install chromium
//   node scripts/render-capability.mjs [http://127.0.0.1:8765]
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const projectRoot = fileURLToPath(new URL('../', import.meta.url));
const base = process.argv[2] || 'http://127.0.0.1:8765';
const out = 'intervencija-capability-statement.pdf';

let chromium;
try {
  ({ chromium } = await import('playwright-core'));
} catch {
  console.error('playwright-core is not installed. See the usage notes at the top of this script.');
  process.exit(1);
}

const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const page = await browser.newPage();
await page.goto(`${base}/scripts/capability/statement.html`, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.pdf({ path: join(projectRoot, out), format: 'A4', printBackground: true, preferCSSPageSize: true });
console.log(`Rendered ${out}`);
await browser.close();
