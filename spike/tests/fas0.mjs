// Mätningar för fas 0. Kör mot produktionsbygget: npm run build && npm run preview -- --port 4322
// Därefter: node tests/fas0.mjs
import { chromium, webkit } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';

const ADRESS = process.env.SPIKE_URL ?? 'http://localhost:4322/';
const UT = new URL('../rapport/', import.meta.url).pathname;
mkdirSync(UT, { recursive: true });
const resultat = {};
const logg = (nyckel, varde) => {
  resultat[nyckel] = varde;
  console.log(nyckel, JSON.stringify(varde));
};

const MOBIL = { viewport: { width: 375, height: 812 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true };
const DATOR = { viewport: { width: 1280, height: 900 } };

async function korSteg(page) {
  await page.getByRole('button', { name: 'Sortera tvätten' }).click();
  await page.waitForTimeout(1500);
  await page.getByRole('button', { name: 'Vrid ratten' }).click();
  await page.getByRole('button', { name: 'Välj temperatur' }).click();
}

// Mäter bildrutor under tvätten. Returnerar median och 95:e percentil i ms samt andel tappade bildrutor.
async function matBildrutor(page, sekunder) {
  return page.evaluate(async (sek) => {
    const tider = [];
    let forra = performance.now();
    const slut = forra + sek * 1000;
    await new Promise((klar) => {
      const steg = (nu) => {
        tider.push(nu - forra);
        forra = nu;
        if (nu < slut) requestAnimationFrame(steg);
        else klar();
      };
      requestAnimationFrame(steg);
    });
    tider.shift();
    tider.sort((a, b) => a - b);
    const p = (q) => tider[Math.min(tider.length - 1, Math.floor(q * tider.length))];
    return {
      bildrutor: tider.length,
      median_ms: +p(0.5).toFixed(1),
      p95_ms: +p(0.95).toFixed(1),
      over_25ms_andel: +(tider.filter((x) => x > 25).length / tider.length).toFixed(3),
    };
  }, sekunder);
}

const browser = await chromium.launch();

// 1. Skärmdumpar
for (const [namn, profil] of [['mobil', MOBIL], ['dator', DATOR]]) {
  const ctx = await browser.newContext(profil);
  const page = await ctx.newPage();
  await page.goto(ADRESS, { waitUntil: 'networkidle' });
  await page.screenshot({ path: `${UT}${namn}-1-start.png`, fullPage: false });
  await korSteg(page);
  await page.getByRole('button', { name: 'Starta tvätten' }).click();
  await page.waitForTimeout(4000);
  await page.locator('.scen').screenshot({ path: `${UT}${namn}-2-tvattar-genomskarning.png` });
  await page.getByLabel('Visa genomskärning').uncheck();
  await page.waitForTimeout(300);
  await page.locator('.scen').screenshot({ path: `${UT}${namn}-3-tvattar-lucka.png` });
  await page.locator('input[type=range]').fill('0');
  await page.locator('.scen').screenshot({ path: `${UT}${namn}-4-utan-handritat.png` });
  await page.locator('input[type=range]').fill('10');
  await page.locator('.scen').screenshot({ path: `${UT}${namn}-5-max-handritat.png` });
  await page.screenshot({ path: `${UT}${namn}-6-helsida.png`, fullPage: true });
  await ctx.close();
}

// 2. Prestanda med strypt nät och processor (CDP, bara Chromium)
{
  const ctx = await browser.newContext(MOBIL);
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
  // Ungefär "Slow 4G" i Chrome DevTools: 150 ms latens, 1,6 Mbit/s ned, 750 kbit/s upp.
  await cdp.send('Network.emulateNetworkConditions', {
    offline: false,
    latency: 150,
    downloadThroughput: (1.6 * 1024 * 1024) / 8,
    uploadThroughput: (750 * 1024) / 8,
  });
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await page.goto(ADRESS, { waitUntil: 'load' });
  // Väntar tills React-ön har hydrerat (knapparna reagerar).
  await page.waitForFunction(() => document.querySelector('astro-island:not([ssr])') !== null, null, { timeout: 30000 });
  const tid = await page.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0];
    const fcp = performance.getEntriesByName('first-contentful-paint')[0];
    const resurser = performance.getEntriesByType('resource');
    const overfort = resurser.reduce((s, r) => s + (r.transferSize || 0), nav.transferSize || 0);
    return {
      fcp_ms: Math.round(fcp?.startTime ?? -1),
      dom_klar_ms: Math.round(nav.domContentLoadedEventEnd),
      load_ms: Math.round(nav.loadEventEnd),
      hydrerad_ms: Math.round(performance.now()),
      overfort_kB: +(overfort / 1024).toFixed(1),
    };
  });
  logg('laddning_slow4g_cpu4x', tid);

  await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });
  await korSteg(page);
  for (const niva of ['3', '0', '10']) {
    await page.locator('input[type=range]').fill(niva);
    for (const snitt of [true, false]) {
      await page.getByLabel('Visa genomskärning').setChecked(snitt);
      if (await page.getByRole('button', { name: 'Stoppa tvätten' }).count()) {
        await page.getByRole('button', { name: 'Stoppa tvätten' }).click();
      }
      await page.getByRole('button', { name: 'Starta tvätten' }).click();
      await page.waitForTimeout(3000);
      logg(`bildrutor_cpu4x_handritad${niva}_${snitt ? 'snitt' : 'lucka'}`, await matBildrutor(page, 4));
    }
  }
  await ctx.close();
}

// 3. Offline efter första besöket
{
  const ctx = await browser.newContext(MOBIL);
  const page = await ctx.newPage();
  await page.goto(ADRESS, { waitUntil: 'networkidle' });
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null || true);
  const cache = await page.evaluate(async () => {
    const namn = await caches.keys();
    let antal = 0;
    for (const n of namn) antal += (await (await caches.open(n)).keys()).length;
    return { cacher: namn, poster: antal };
  });
  logg('offline_cache', cache);
  await ctx.setOffline(true);
  let svar;
  try {
    svar = await page.reload({ waitUntil: 'load' });
  } catch (e) {
    svar = null;
    logg('offline_fel', String(e));
  }
  const fungerar = await page.evaluate(async () => {
    const knapp = [...document.querySelectorAll('button')].find((b) => b.textContent.includes('Sortera'));
    knapp?.click();
    await new Promise((r) => setTimeout(r, 300));
    return {
      rubrik: document.querySelector('h1')?.textContent,
      status: document.querySelector('.status')?.textContent,
      fran_service_worker: performance.getEntriesByType('navigation')[0]?.workerStart > 0,
    };
  });
  logg('offline_omladdning', { http: svar?.status(), fran_sw: svar?.fromServiceWorker(), ...fungerar });
  await page.screenshot({ path: `${UT}offline-mobil.png` });
  await ctx.close();
}

// 4. Tangentbord och reducerad rörelse
{
  const ctx = await browser.newContext({ ...DATOR, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto(ADRESS, { waitUntil: 'networkidle' });
  const fokusordning = [];
  for (let i = 0; i < 14; i++) {
    await page.keyboard.press('Tab');
    fokusordning.push(
      await page.evaluate(() => {
        const el = document.activeElement;
        return el.getAttribute('aria-label') || el.textContent.trim().slice(0, 30) || el.tagName;
      }),
    );
  }
  logg('tabbordning', fokusordning);

  await page.locator('.ratt').focus();
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowRight');
  const ratt1 = await page.locator('.ratt').getAttribute('aria-valuetext');
  await page.keyboard.press('End');
  const ratt2 = await page.locator('.ratt').getAttribute('aria-valuetext');
  await page.keyboard.press('ArrowLeft');
  const ratt3 = await page.locator('.ratt').getAttribute('aria-valuetext');
  await page.locator('.scen').screenshot({ path: `${UT}tangentbord-fokus-ratt.png` });
  logg('ratt_tangentbord', { tva_hoger: ratt1, end: ratt2, vanster: ratt3 });

  // Start med tangentbord: Enter på knapparna.
  await page.getByRole('button', { name: 'Sortera tvätten' }).focus();
  await page.keyboard.press('Enter');
  await page.getByRole('button', { name: 'Välj temperatur' }).focus();
  await page.keyboard.press('Enter');
  await page.getByRole('button', { name: 'Starta tvätten' }).focus();
  await page.keyboard.press('Enter');
  const t1 = await page.evaluate(() => document.querySelector('.trumma-bak')?.nextElementSibling?.getAttribute('transform'));
  await page.waitForTimeout(1500);
  const t2 = await page.evaluate(() => document.querySelector('.trumma-bak')?.nextElementSibling?.getAttribute('transform'));
  const status = await page.locator('.status').textContent();
  logg('reducerad_rorelse', { trumma_fore: t1, trumma_efter: t2, snurrar_inte: t1 === t2, status });
  await ctx.close();
}

// 5. Direkt vridning av ratten med pekare (dra)
{
  const ctx = await browser.newContext(DATOR);
  const page = await ctx.newPage();
  await page.goto(ADRESS, { waitUntil: 'networkidle' });
  const box = await page.locator('.ratt .ratt-knopp').boundingBox();
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;
  await page.mouse.move(cx, cy);
  await page.mouse.down();
  // Drar ett varv medurs runt rattens mitt.
  const lagen = [];
  for (let i = 0; i <= 12; i++) {
    const a = (-140 + i * 22) * (Math.PI / 180);
    await page.mouse.move(cx + Math.sin(a) * 40, cy - Math.cos(a) * 40);
    lagen.push(await page.locator('.ratt').getAttribute('aria-valuenow'));
  }
  await page.mouse.up();
  logg('ratt_dra', lagen.join(','));
  await ctx.close();
}

await browser.close();

// 6. WebKit (närmast Safari på iPhone som går att köra här)
for (const lage of ['standard', 'hela']) {
  const wk = await webkit.launch();
  const ctx = await wk.newContext(MOBIL);
  const page = await ctx.newPage();
  await page.goto(lage === 'hela' ? `${ADRESS}?filter=hela` : ADRESS, { waitUntil: 'networkidle' });
  await korSteg(page);
  await page.getByRole('button', { name: 'Starta tvätten' }).click();
  await page.waitForTimeout(3000);
  await page.locator('.scen').screenshot({ path: `${UT}webkit-mobil-tvattar-${lage}.png` });
  logg(`webkit_${lage}_handritad3`, await matBildrutor(page, 3));
  await page.locator('input[type=range]').fill('0');
  await page.waitForTimeout(300);
  logg(`webkit_${lage}_handritad0`, await matBildrutor(page, 3));
  await page.locator('input[type=range]').fill('10');
  await page.waitForTimeout(300);
  logg(`webkit_${lage}_handritad10`, await matBildrutor(page, 3));
  const sw = await page.evaluate(async () => {
    if (!('serviceWorker' in navigator)) return 'saknas';
    const reg = await Promise.race([navigator.serviceWorker.ready, new Promise((r) => setTimeout(() => r(null), 5000))]);
    return reg ? 'registrerad' : 'inte klar inom 5 s';
  });
  logg(`webkit_${lage}_service_worker`, sw);
  await wk.close();
}

writeFileSync(`${UT}matningar.json`, JSON.stringify(resultat, null, 2));
