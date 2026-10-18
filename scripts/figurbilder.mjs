// Tar stillbilder av de färdiga figurerna till startsidan och figurlistan.
// Körs för hand när en figur ändras, mot ett körande utkastbygge:
//   npm run build:utkast && npx astro preview --port 4323
//   node scripts/figurbilder.mjs
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { FIGURER } from '../src/data/figurer.js';

const ADRESS = process.env.ADRESS ?? 'http://localhost:4323';
mkdirSync('public/figurer', { recursive: true });
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 1000, height: 900 }, deviceScaleFactor: 1.5 });

for (const f of FIGURER.filter((x) => x.klar)) {
  await page.goto(`${ADRESS}/figur/${f.id}/`, { waitUntil: 'networkidle' });
  const scen = page.locator('.figur3d-scen, .figur .scen').first();
  await scen.waitFor();
  await page.waitForTimeout(1500);
  // Etiketter och verktyg döljs, bilden ska bara visa figuren.
  await page.addStyleTag({ content: '.tre-etiketter, .figur3d-verktyg, .etikett, .etikett-nr, .korg-namn { display: none !important; }' });
  await page.waitForTimeout(200);
  await scen.screenshot({ path: `public/figurer/${f.id}.jpg`, type: 'jpeg', quality: 82 });
  console.log(`public/figurer/${f.id}.jpg`);
}
await browser.close();
