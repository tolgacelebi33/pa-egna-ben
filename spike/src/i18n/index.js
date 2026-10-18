import sv from './sv.js';
import en from './en.js';

const ordlistor = { sv, en };
let sprak = 'sv';

export function setSprak(nytt) {
  if (ordlistor[nytt]) sprak = nytt;
}

// Faller tillbaka på svenska när en översättning saknas.
export function t(nyckel, varden = {}) {
  const text = ordlistor[sprak][nyckel] ?? sv[nyckel] ?? nyckel;
  return text.replace(/\{(\w+)\}/g, (_, namn) => varden[namn] ?? '');
}
