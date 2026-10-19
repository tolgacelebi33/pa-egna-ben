// Tar stillbilder av de färdiga figurerna till startsidan och figurlistan.
// Körs för hand när en figur ändras, mot ett körande utkastbygge:
//   npm run build:utkast && npx astro preview --port 4323
//   node scripts/figurbilder.mjs [figur-id]   (utan id: alla färdiga figurer)
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { FIGURER } from '../src/data/figurer.js';

const ADRESS = process.env.ADRESS ?? 'http://localhost:4323';
mkdirSync('public/figurer', { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1000, height: 900 }, deviceScaleFactor: 1.5 });

const bara = process.argv[2];
for (const f of FIGURER.filter((x) => x.klar && (!bara || x.id === bara))) {
  await page.goto(`${ADRESS}/figur/${f.id}/`, { waitUntil: 'networkidle' });
  // Budgeten fylls med belopp så att staplarna syns. Siffrorna döljs, bilden visar bara formerna.
  if (f.id === 'budget') {
    for (const [falt, v] of [['Inkomst efter skatt', '10'], ['Hyra', '4'], ['Mat', '2'], ['El', '1'], ['Nöje', '1']]) {
      await page.getByLabel(falt, { exact: true }).fill(v);
    }
  }
  // Anatomifigurer ligger i en iframe: fotografera figuren inuti den.
  const ram = await page.locator('iframe.anatomifigur').elementHandle().catch(() => null);
  const inre = ram && (await ram.contentFrame());
  const scen = inre
    ? inre.locator('.stage svg').first()
    : page.locator(f.id === 'beslutstrad' ? '.beslutstrad .kort-nod' : '.figur .scen').first();
  await scen.waitFor();
  await page.waitForTimeout(600);
  // Etiketter och verktyg döljs, bilden ska bara visa figuren.
  await page.addStyleTag({ content: '.figur3d-verktyg, .etikett, .etikett-nr { display: none !important; } .figur .scen { padding-bottom: 12px !important; }' });
  await page.waitForTimeout(200);
  await scen.screenshot({ path: `public/figurer/${f.id}.jpg`, type: 'jpeg', quality: 82 });
  if (f.id === 'budget') await page.evaluate(() => localStorage.clear());
  console.log(`public/figurer/${f.id}.jpg`);
}
await browser.close();
