// Läser docs/INNEHALL.md och returnerar alla ämnen med koder.
// Används av scripts/skapa-stubbar.mjs och av testet som kontrollerar att inget ämne saknas.

const RISK = { L: 'lag', M: 'medel', H: 'hog' };
const NIVA = { V1: 'vecka1', ÅR: 'forsta_aret', BRA: 'bra_att_veta' };

// "- `id` Titel. L, V1, R, K. fig:tvattmaskin"
const RAD = /^- `([a-z0-9-]+)` (.+?)\. ([LMH](?:, (?:V1|ÅR|BRA|R|K|A))+)\.?(?: fig:([a-z-]+))?\s*$/;
const KATEGORI = /^## \d+\. .+ \(`([a-z]+)`\)\s*$/;

/** @returns {{ id, titel, kategori, risk, niva, regelberoende, varierar_per_kommun, akut, figur, rad }[]} */
export function lasKatalog(text) {
  const amnen = [];
  const fel = [];
  let kategori = null;
  for (const [i, rad] of text.split('\n').entries()) {
    const k = KATEGORI.exec(rad);
    if (k) {
      kategori = k[1];
      continue;
    }
    if (rad.startsWith('## ')) kategori = null;
    if (!kategori || !rad.startsWith('- `')) continue;
    const m = RAD.exec(rad);
    if (!m) {
      fel.push(`rad ${i + 1} gick inte att tolka: ${rad}`);
      continue;
    }
    const koder = m[3].split(', ');
    const niva = koder.find((x) => NIVA[x]);
    amnen.push({
      id: m[1],
      titel: m[2],
      kategori,
      risk: RISK[koder[0]],
      niva: NIVA[niva],
      regelberoende: koder.includes('R'),
      varierar_per_kommun: koder.includes('K'),
      akut: koder.includes('A'),
      figur: m[4] ?? null,
      rad: i + 1,
    });
  }
  return { amnen, fel };
}
