// Renders the one-page A4 PDFs: the capability statement and the sample monthly report.
// Not part of the CI build: the PDF is committed. To regenerate after copy changes:
//   npm run serve:local                      (in one terminal)
//   npm i --no-save playwright-core && npx playwright install chromium
//   node scripts/render-capability.mjs [http://127.0.0.1:8765]
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const projectRoot = fileURLToPath(new URL('../', import.meta.url));
const base = process.argv[2] || 'http://127.0.0.1:8765';
const documents = [
  ['scripts/capability/statement.html', 'intervencija-capability-statement.pdf'],
  ['scripts/report/sample-report.html', 'intervencija-sample-monthly-report.pdf']
];

let chromium;
try {
  ({ chromium } = await import('playwright-core'));
} catch {
  console.error('playwright-core is not installed. See the usage notes at the top of this script.');
  process.exit(1);
}

const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const page = await browser.newPage();
for (const [source, out] of documents) {
  await page.goto(`${base}/${source}`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.pdf({ path: join(projectRoot, out), format: 'A4', printBackground: true, preferCSSPageSize: true });
  console.log(`Rendered ${out}`);
}
await browser.close();
