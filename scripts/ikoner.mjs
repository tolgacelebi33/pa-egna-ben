// Skapar PNG-ikoner från public/favicon.svg. Körs för hand när ikonen ändras: node scripts/ikoner.mjs
// iPhone kräver PNG (apple-touch-icon). "maskable" har extra marginal så att ikonen inte beskärs på Android.
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';

const svg = readFileSync('public/favicon.svg', 'utf8');
const browser = await chromium.launch();
const page = await browser.newPage();
for (const [namn, storlek, marginal] of [
  ['ikon-180.png', 180, 0],
  ['ikon-192.png', 192, 0],
  ['ikon-512.png', 512, 0],
  ['ikon-maskable-512.png', 512, 0.12],
]) {
  await page.setViewportSize({ width: storlek, height: storlek });
  const inre = Math.round(storlek * (1 - marginal * 2));
  await page.setContent(
    `<body style="margin:0;background:#f4eee3;display:grid;place-items:center;height:${storlek}px">` +
      `<div style="width:${inre}px;height:${inre}px">${svg.replace('<svg ', `<svg width="${inre}" height="${inre}" `)}</div></body>`,
  );
  await page.screenshot({ path: `public/${namn}`, omitBackground: false });
  console.log(namn);
}
await browser.close();
