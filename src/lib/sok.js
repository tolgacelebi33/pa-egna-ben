// Enkel sökning: alla ord i frågan måste finnas. Träffar i titeln väger tyngst, akutämnen först vid lika.
// Å, ä och ö jämförs utan prickar så att "tvatt" hittar "tvätt".

/** @typedef {{ id: string, titel: string, sammanfattning: string, kategoriTitel: string, akut: boolean, url: string }} SokPost */

export const normalisera = (s) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9 ]/g, ' ');

/**
 * @param {SokPost[]} index
 * @param {string} fraga
 * @returns {SokPost[]}
 */
export function sok(index, fraga) {
  const ord = normalisera(fraga).split(/\s+/).filter(Boolean);
  if (ord.length === 0) return [];
  const traffar = [];
  for (const p of index) {
    const titel = normalisera(p.titel);
    const allt = `${titel} ${normalisera(p.sammanfattning)} ${normalisera(p.kategoriTitel)} ${p.id.replace(/-/g, ' ')}`;
    if (!ord.every((o) => allt.includes(o))) continue;
    let poang = ord.filter((o) => titel.includes(o)).length * 10;
    if (ord.some((o) => titel.startsWith(o))) poang += 5;
    if (p.akut) poang += 1;
    traffar.push({ p, poang });
  }
  return traffar.sort((a, b) => b.poang - a.poang || a.p.titel.localeCompare(b.p.titel, 'sv')).map((x) => x.p);
}
