// Webbläsartest för fas 1 mot utkastbygget.
// Kör: npm run build:utkast && npx astro preview --port 4323  och sedan  node tests/e2e/fas1.mjs
import { chromium } from 'playwright';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const BAS = process.env.ADRESS ?? 'http://localhost:4323';
const UT = new URL('../../rapport/fas1/', import.meta.url).pathname;
mkdirSync(UT, { recursive: true });
const axe = readFileSync(createRequire(import.meta.url).resolve('axe-core/axe.min.js'), 'utf8');

const MOBIL = { viewport: { width: 375, height: 812 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true };
const DATOR = { viewport: { width: 1280, height: 900 } };
const SIDOR = [
  '/',
  '/kategori/tvatt/',
  '/amne/akut-brand/',
  '/amne/fixa-el-granser/',
  '/amne/tvatt-tvattstugan/',
  '/figur/tvattmaskin/',
  '/figur/brandvarnare/',
  '/figur/elskap/',
  '/kom-igang/',
  '/installningar/',
  '/foraldralage/',
  '/ansvarsfriskrivning/',
  '/kallor-och-granskning/',
  '/sok/',
];

const resultat = [];
let fel = 0;
function kontroll(namn, ok, detalj = '') {
  resultat.push({ namn, ok, detalj });
  if (!ok) fel++;
  console.log(`${ok ? 'OK  ' : 'FEL '} ${namn}${detalj ? `: ${detalj}` : ''}`);
}

const browser = await chromium.launch();

// 1. Skärmdumpar, sidbredd, konsolfel och axe på alla sidor, mobil och dator, ljust och mörkt
for (const [profilNamn, profil] of [['mobil', MOBIL], ['dator', DATOR]]) {
  for (const tema of ['light', 'dark']) {
    const ctx = await browser.newContext({ ...profil, colorScheme: tema });
    const page = await ctx.newPage();
    const konsolfel = [];
    page.on('pageerror', (e) => konsolfel.push(String(e)));
    page.on('console', (m) => m.type() === 'error' && konsolfel.push(m.text()));
    for (const sokvag of SIDOR) {
      await page.goto(BAS + sokvag, { waitUntil: 'networkidle' });
      const namn = sokvag === '/' ? 'start' : sokvag.replace(/^\/|\/$/g, '').replace(/\//g, '-');
      if (profilNamn === 'mobil' || sokvag === '/' || sokvag.startsWith('/figur') || sokvag.startsWith('/amne/akut')) {
        await page.screenshot({ path: `${UT}${profilNamn}-${tema === 'dark' ? 'morkt' : 'ljust'}-${namn}.png`, fullPage: true });
      }
      const bredd = await page.evaluate(() => ({ dok: document.documentElement.scrollWidth, fonster: window.innerWidth }));
      if (bredd.dok > bredd.fonster) kontroll(`${profilNamn} ${sokvag} ingen vågrät rullning`, false, JSON.stringify(bredd));
      if (tema === 'light' || profilNamn === 'mobil') {
        await page.addScriptTag({ content: axe });
        const brister = await page.evaluate(async () => {
          const r = await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] } });
          return r.violations.map((v) => `${v.id} (${v.nodes.length}): ${v.nodes[0]?.target}`);
        });
        kontroll(`axe ${profilNamn} ${tema} ${sokvag}`, brister.length === 0, brister.join(' | '));
      }
    }
    kontroll(`${profilNamn} ${tema} inga konsolfel`, konsolfel.length === 0, konsolfel.slice(0, 3).join(' | '));
    await ctx.close();
  }
}

// 2. Onboarding filtrerar, går att ändra, och kommun syns i kommunrutan
{
  const ctx = await browser.newContext(MOBIL);
  const page = await ctx.newPage();
  await page.goto(BAS + '/', { waitUntil: 'networkidle' });
  kontroll('startsidan visar Anpassa appen första gången', await page.locator('[data-anpassa]').isVisible());
  await page.getByRole('link', { name: 'Anpassa appen' }).click();
  await page.getByLabel('Hyresrätt i första hand').check();
  await page.getByLabel('Egen tvättmaskin').check();
  await page.getByRole('group', { name: 'Har du diskmaskin?' }).getByLabel('Nej').check();
  await page.getByLabel('Vilken kommun flyttar du till?').fill('Exempelstad');
  await page.getByRole('button', { name: 'Spara och visa mina ämnen' }).click();
  await page.waitForURL(BAS + '/');
  kontroll('efter onboarding döljs Anpassa-rutan', !(await page.locator('[data-anpassa]').isVisible()));

  await page.goto(BAS + '/kategori/tvatt/', { waitUntil: 'networkidle' });
  const stugaDold = await page.locator('[data-amne="tvatt-tvattstugan"]').isHidden();
  const maskinSyns = await page.locator('[data-amne="tvatt-maskinen"]').isVisible();
  kontroll('egen tvättmaskin döljer tvättstugan och visar tvättmaskinen', stugaDold && maskinSyns);
  kontroll('raden om dolda ämnen visas', await page.locator('[data-filterrad]').isVisible(), await page.locator('[data-filtertext]').textContent());
  await page.getByRole('button', { name: 'Visa alla ämnen' }).click();
  kontroll('Visa alla ämnen visar det dolda', await page.locator('[data-amne="tvatt-tvattstugan"]').isVisible());
  await page.getByRole('button', { name: 'Visa bara det som passar mig' }).click();

  await page.goto(BAS + '/kategori/bostad/', { waitUntil: 'networkidle' });
  kontroll('hyresrätt döljer andrahandsämnet', await page.locator('[data-amne="bostad-andrahand"]').isHidden());
  await page.goto(BAS + '/kategori/stad/', { waitUntil: 'networkidle' });
  kontroll('ingen diskmaskin döljer diskmaskinsämnet', await page.locator('[data-amne="stad-diskmaskin"]').isHidden());

  await page.goto(BAS + '/amne/tvatt-tvattstugan/', { waitUntil: 'networkidle' });
  kontroll('kommunrutan nämner angiven kommun', (await page.locator('[data-kommun]').textContent())?.includes('Exempelstad') ?? false);

  await page.goto(BAS + '/kom-igang/', { waitUntil: 'networkidle' });
  kontroll('tidigare svar är ifyllda', await page.getByLabel('Egen tvättmaskin').isChecked());

  // Radera mina uppgifter
  await page.goto(BAS + '/installningar/', { waitUntil: 'networkidle' });
  await page.getByLabel('Mörkt').check();
  kontroll('mörkt läge sätts', (await page.evaluate(() => document.documentElement.dataset.tema)) === 'morkt');
  await page.reload({ waitUntil: 'networkidle' });
  kontroll('mörkt läge finns kvar efter omladdning', (await page.evaluate(() => document.documentElement.dataset.tema)) === 'morkt');
  page.once('dialog', (d) => d.accept());
  await page.getByRole('button', { name: 'Radera mina uppgifter' }).click();
  const kvar = await page.evaluate(() => Object.keys(localStorage).filter((k) => k.startsWith('peb:')));
  kontroll('Radera mina uppgifter tar bort allt', kvar.length === 0, kvar.join(','));
  kontroll('temat återställs vid radering', (await page.evaluate(() => document.documentElement.dataset.tema)) === undefined);
  await page.goto(BAS + '/kategori/tvatt/', { waitUntil: 'networkidle' });
  kontroll('efter radering visas allt igen', await page.locator('[data-amne="tvatt-tvattstugan"]').isVisible());
  await ctx.close();
}

// 3. Hoppa över onboarding
{
  const ctx = await browser.newContext(MOBIL);
  const page = await ctx.newPage();
  await page.goto(BAS + '/', { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Hoppa över' }).click();
  await page.reload({ waitUntil: 'networkidle' });
  kontroll('Hoppa över döljer rutan även efter omladdning', !(await page.locator('[data-anpassa]').isVisible()));
  await ctx.close();
}

// 4. Sök
{
  const ctx = await browser.newContext(MOBIL);
  const page = await ctx.newPage();
  await page.goto(BAS + '/', { waitUntil: 'networkidle' });
  await page.getByLabel('Sök bland alla ämnen').fill('tvatt');
  await page.waitForTimeout(300);
  const traffar = await page.locator('[data-sokresultat] li').count();
  kontroll('sökning på "tvatt" ger träffar', traffar >= 2, `${traffar} träffar`);
  await page.getByLabel('Sök bland alla ämnen').fill('brinner');
  await page.waitForTimeout(200);
  kontroll('sökstatus läses upp', ((await page.locator('[data-sokstatus]').textContent()) ?? '').includes('träff'));
  await page.goto(BAS + '/sok/?q=budget', { waitUntil: 'networkidle' });
  await page.locator('[data-sokresultat] li').first().waitFor({ timeout: 5000 }).catch(() => {});
  const budget = await page.locator('[data-sokresultat] li').count();
  const forsta = await page.locator('[data-sokresultat] li a').first().getAttribute('href');
  kontroll('/sok/?q= söker direkt', budget >= 1 && (forsta ?? '').endsWith('/amne/pengar-budget/'), `${budget} träffar, först ${forsta}`);
  await ctx.close();
}

// 5. Offline: akutsidor som aldrig har öppnats ska fungera efter första besöket
{
  const ctx = await browser.newContext(MOBIL);
  const page = await ctx.newPage();
  await page.goto(BAS + '/', { waitUntil: 'networkidle' });
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.waitForFunction(async () => {
    const namn = await caches.keys();
    for (const n of namn) if ((await (await caches.open(n)).keys()).length > 50) return true;
    return false;
  });
  await ctx.setOffline(true);
  for (const sokvag of ['/amne/akut-brand/', '/amne/nar-det-brinner/', '/kategori/nar/', '/amne/pengar-budget/']) {
    let ok = false;
    let detalj = '';
    try {
      const svar = await page.goto(BAS + sokvag, { waitUntil: 'load' });
      const rubrik = await page.locator('h1').first().textContent();
      ok = svar?.status() === 200 && !!rubrik;
      detalj = `${svar?.status()} "${rubrik}" från service worker: ${svar?.fromServiceWorker()}`;
    } catch (e) {
      detalj = String(e).slice(0, 120);
    }
    kontroll(`offline ${sokvag}`, ok, detalj);
  }
  await page.goto(BAS + '/', { waitUntil: 'load' });
  await page.getByLabel('Sök bland alla ämnen').fill('brinner');
  await page.waitForTimeout(300);
  kontroll('sökningen fungerar offline', (await page.locator('[data-sokresultat] li').count()) >= 1);
  await page.goto(BAS + '/finns-inte/', { waitUntil: 'load' }).catch(() => {});
  kontroll('okänd sida offline visar 404-sidan', ((await page.locator('h1').textContent()) ?? '').includes('finns inte'));
  await page.screenshot({ path: `${UT}offline-akut.png` });
  await ctx.close();
}

// 6. Föräldraläge: bocka av, dela länk, öppna i ny webbläsare
{
  const ctx = await browser.newContext({ ...DATOR, permissions: ['clipboard-read', 'clipboard-write'] });
  const page = await ctx.newPage();
  await page.goto(BAS + '/foraldralage/', { waitUntil: 'networkidle' });
  const rutor = page.locator('input[name="klar"]');
  const antal = await rutor.count();
  await rutor.nth(0).check();
  await rutor.nth(antal - 1).check();
  kontroll('föräldraläget räknar avbockade', ((await page.locator('[data-framsteg]').textContent()) ?? '').startsWith('2 av'));
  await page.getByRole('button', { name: 'Kopiera länk till listan' }).click();
  const lank = await page.evaluate(() => navigator.clipboard.readText());
  kontroll('delad länk innehåller bara ämnes-id', /#klara=[a-z0-9,-]+$/.test(lank), lank);
  const ctx2 = await browser.newContext(DATOR);
  const page2 = await ctx2.newPage();
  await page2.goto(lank, { waitUntil: 'networkidle' });
  const ikryssade = await page2.locator('input[name="klar"]:checked').count();
  kontroll('länken öppnar listan med samma avbockningar', ikryssade === 2, `${ikryssade} ikryssade`);
  kontroll('rutan om delad länk visas', await page2.locator('[data-fran-lank]').isVisible());
  await ctx2.close();
  await ctx.close();
}

// 7. Ämnessida: akutruta först, rapportera fel, granskning och utkastmarkering
{
  const ctx = await browser.newContext(MOBIL);
  const page = await ctx.newPage();
  await page.goto(BAS + '/amne/akut-brand/', { waitUntil: 'networkidle' });
  const forstaRuta = await page.locator('article aside').evaluateAll((el) => el.map((e) => e.className));
  kontroll('akutrutan kommer före brödtexten', forstaRuta.indexOf('ruta ruta-akut') >= 0 && forstaRuta.indexOf('ruta ruta-akut') <= 1, forstaRuta.join(', '));
  const tel = await page.locator('.ruta-akut a').getAttribute('href');
  kontroll('akutrutan har ringlänk från kontaktfilen', tel === 'tel:112', tel ?? '');
  const mail = (await page.getByRole('link', { name: 'Rapportera fel på den här sidan' }).getAttribute('href')) ?? '';
  kontroll('Rapportera fel har ämnets id', mail.startsWith('mailto:') && decodeURIComponent(mail).includes('(akut-brand)'));
  kontroll('utkastmarkering syns', await page.locator('.ruta-utkast').isVisible());
  kontroll('senast kontrollerad visas', ((await page.locator('.ruta-granskning').textContent()) ?? '').includes('Senast kontrollerad'));
  await ctx.close();
}

// 8. Tangentbord: hoppa till innehållet
{
  const ctx = await browser.newContext(DATOR);
  const page = await ctx.newPage();
  await page.goto(BAS + '/', { waitUntil: 'networkidle' });
  await page.keyboard.press('Tab');
  kontroll('första tabbstoppet är Hoppa till innehållet', ((await page.evaluate(() => document.activeElement?.textContent)) ?? '').includes('Hoppa'));
  await page.keyboard.press('Enter');
  kontroll('Hoppa till innehållet flyttar fokus', (await page.evaluate(() => document.activeElement?.id)) === 'innehall');
  await ctx.close();
}

// 9. Tvättmaskinen i 3D, med reducerad rörelse. Stegen ska fungera även om WebGL saknas.
{
  const ctx = await browser.newContext({ ...MOBIL, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto(BAS + '/figur/tvattmaskin/', { waitUntil: 'networkidle' });
  await page.locator('.figur3d-steg').scrollIntoViewIfNeeded();
  await page.waitForSelector('.figur3d-steg button');
  const webgl = await page.locator('.tre-canvas').count();
  kontroll('tvättmaskin: 3D-figur eller reservtext visas', webgl > 0 || (await page.locator('.figur-reserv').count()) > 0, `canvas: ${webgl}`);
  await page.getByRole('button', { name: /Starta tvätten/ }).click();
  kontroll('tvättmaskin: start kräver sorterad tvätt', ((await page.locator('.figur3d-status').textContent()) ?? '').includes('Sortera'));
  await page.getByRole('button', { name: /Sortera tvätten/ }).click();
  await page.waitForTimeout(300);
  await page.getByRole('button', { name: /Vrid ratten/ }).click();
  await page.getByRole('button', { name: /Välj temperatur/ }).click();
  await page.getByRole('button', { name: /Starta tvätten/ }).click();
  const status = (await page.locator('.figur3d-status').textContent()) ?? '';
  kontroll('tvättmaskin: status stämmer vid reducerad rörelse', status.includes('Animationen är avstängd'), status);
  kontroll('tvättmaskin: textversionen står under figuren', await page.locator('.textversion').isVisible());
  await ctx.close();
}

// 10. Fas 3: brandvarnaren och elskåpet med tangentbord och reducerad rörelse
{
  const ctx = await browser.newContext({ ...DATOR, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto(BAS + '/figur/brandvarnare/', { waitUntil: 'networkidle' });
  await page.waitForSelector('.figur-brandvarnare .figur3d-steg button');
  await page.getByRole('button', { name: /Tryck på testknappen/ }).focus();
  await page.keyboard.press('Enter');
  const bvStatus = (await page.locator('.figur-brandvarnare .figur3d-status').textContent()) ?? '';
  kontroll('brandvarnare: testknappen fungerar med Enter', bvStatus.includes('larmar'), bvStatus);
  kontroll('brandvarnare: status stämmer vid reducerad rörelse', bvStatus.includes('Animationen är avstängd'));
  await page.getByRole('button', { name: /Byt batteriet/ }).click();
  kontroll('brandvarnare: batteribyte kräver öppen brandvarnare', ((await page.locator('.figur-brandvarnare .figur3d-status').textContent()) ?? '').includes('Öppna'));
  await page.getByRole('button', { name: /Öppna brandvarnaren/ }).click();
  await page.getByRole('button', { name: /Byt batteriet/ }).click();
  kontroll('brandvarnare: batteriet byts när den är öppen', ((await page.locator('.figur-brandvarnare .figur3d-status').textContent()) ?? '').includes('bytt'));
  kontroll('brandvarnare: ljudet är avstängt från början', (await page.getByRole('button', { name: 'Spela upp ljud' }).getAttribute('aria-pressed')) === 'false');

  await page.goto(BAS + '/figur/elskap/', { waitUntil: 'networkidle' });
  await page.waitForSelector('.figur-elskap .spak');
  await page.getByRole('button', { name: 'Koppla in fler apparater i köket' }).click();
  const kok = page.getByRole('switch', { name: 'Säkring 1, Kök' });
  kontroll('elskåp: överlast löser ut köksäkringen direkt vid reducerad rörelse', (await kok.getAttribute('aria-checked')) === 'false');
  await kok.focus();
  await page.keyboard.press('Enter');
  kontroll('elskåp: säkringen löser ut igen med för många apparater', (await kok.getAttribute('aria-checked')) === 'false');
  await page.getByRole('button', { name: 'Dra ur en apparat' }).click();
  await kok.focus();
  await page.keyboard.press(' ');
  kontroll('elskåp: säkringen går att slå på med tangentbord efter att en apparat dragits ur', (await kok.getAttribute('aria-checked')) === 'true');
  await page.getByRole('button', { name: 'Testknapp på jordfelsbrytaren' }).click();
  const jfb = page.getByRole('switch', { name: 'Jordfelsbrytare' });
  kontroll('elskåp: testknappen löser ut jordfelsbrytaren', (await jfb.getAttribute('aria-checked')) === 'false');
  kontroll('elskåp: alla lampor slocknar', (await page.locator('.figur-elskap .rum.tand').count()) === 0);
  await page.getByRole('button', { name: 'Slå på jordfelsbrytaren igen' }).click();
  kontroll('elskåp: jordfelsbrytaren går att slå på igen', (await page.locator('.figur-elskap .rum.tand').count()) === 4);
  await ctx.close();
}

await browser.close();
writeFileSync(`${UT}resultat.json`, JSON.stringify(resultat, null, 2));
console.log(`\n${resultat.length - fel} av ${resultat.length} kontroller godkända.`);
process.exit(fel ? 1 : 0);
