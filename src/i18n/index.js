import svBas from './sv.js';
import en from './en.js';
import tvattmaskinSv from '../figurer/tvattmaskin/sv.js';
import brandvarnareSv from '../figurer/brandvarnare/sv.js';
import elskapSv from '../figurer/elskap/sv.js';

// Figurernas texter ligger bredvid figuren och läggs in här med figurens id som prefix.
const medPrefix = (prefix, ordlista) =>
  Object.fromEntries(Object.entries(ordlista).map(([k, v]) => [`${prefix}.${k}`, v]));

const sv = {
  ...svBas,
  ...medPrefix('tvattmaskin', tvattmaskinSv),
  ...medPrefix('brandvarnare', brandvarnareSv),
  ...medPrefix('elskap', elskapSv),
};
const ordlistor = { sv, en };
let sprak = 'sv';

export function setSprak(nytt) {
  if (ordlistor[nytt]) sprak = nytt;
}

export function getSprak() {
  return sprak;
}

const fyll = (text, varden) => text.replace(/\{(\w+)\}/g, (_, namn) => varden[namn] ?? '');

// Faller tillbaka på svenska när en översättning saknas. Listor (långa sidtexter) fylls stycke för stycke.
export function t(nyckel, varden = {}) {
  const varde = ordlistor[sprak][nyckel] ?? sv[nyckel];
  if (varde === undefined) {
    if (import.meta.env?.DEV) console.warn(`Saknad översättning: ${nyckel}`);
    return nyckel;
  }
  return Array.isArray(varde) ? varde.map((s) => fyll(s, varden)) : fyll(varde, varden);
}
