// Renders the 1200x630 social preview images from scripts/og/card.html.
// Not part of the CI build: the PNGs are committed. To regenerate after copy changes:
//   npm run serve:local                      (in one terminal)
//   npm i --no-save playwright-core && npx playwright install chromium
//   node scripts/render-og.mjs [http://127.0.0.1:8765]
import { fileURLToPath } from 'node:url';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';

const projectRoot = fileURLToPath(new URL('../', import.meta.url));
const base = process.argv[2] || 'http://127.0.0.1:8765';

const cards = [
  { out: 'og-image.png', eyebrow: 'Software architecture & engineering', title: 'Software your business', accent: 'can’t afford to get wrong.', foot: 'System Audits · Critical Builds · Fractional Architecture' },
  { out: 'assets/og/system-audits.png', eyebrow: 'System Audits', title: 'A clear view.', accent: 'A confident next decision.', foot: 'Architecture reviews and technical due diligence' },
  { out: 'assets/og/critical-builds.png', eyebrow: 'Critical Builds', title: 'Important software.', accent: 'Considered from the start.', foot: 'Senior-led delivery for business-critical systems' },
  { out: 'assets/og/fractional-architecture.png', eyebrow: 'Fractional Architecture', title: 'Senior perspective.', accent: 'Ongoing momentum.', foot: 'Part-time architecture leadership for engineering teams' },
  { out: 'assets/og/insights.png', eyebrow: 'Insights', title: 'Practical notes for', accent: 'technology leaders.', foot: 'Checklists and perspectives on business-critical software' },
  { out: 'assets/og/insight-before-you-replatform.png', eyebrow: 'Insights · Checklist', title: 'Before you replatform:', accent: '12 questions to answer first.', foot: 'System Audits' },
  { out: 'assets/og/insight-production-ready-critical-software.png', eyebrow: 'Insights · Checklist', title: 'What production-ready means', accent: 'for business-critical software.', foot: 'Critical Builds' },
  { out: 'assets/og/insight-when-a-fractional-architect-makes-sense.png', eyebrow: 'Insights · Perspective', title: 'When a fractional architect makes sense,', accent: 'and when it doesn’t.', foot: 'Fractional Architecture' }
];

let chromium;
try {
  ({ chromium } = await import('playwright-core'));
} catch {
  console.error('playwright-core is not installed. See the usage notes at the top of this script.');
  process.exit(1);
}

const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });

for (const { out, ...text } of cards) {
  const url = `${base}/scripts/og/card.html?${new URLSearchParams(text)}`;
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  const destination = join(projectRoot, out);
  mkdirSync(dirname(destination), { recursive: true });
  await page.screenshot({ path: destination, type: 'png' });
  console.log(`Rendered ${out}`);
}

await browser.close();
