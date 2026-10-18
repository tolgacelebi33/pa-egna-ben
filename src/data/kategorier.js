// Kategorier enligt docs/INNEHALL.md, i samma ordning. "nar" visas först på startsidan.
export const KATEGORIER = [
  { id: 'nar', titel: 'Vad gör jag när...' },
  { id: 'bostad', titel: 'Hitta bostad och flytta' },
  { id: 'pengar', titel: 'Pengar', regel: 'Förklarar begrepp och regler. Rekommenderar inga produkter eller placeringar.' },
  { id: 'tvatt', titel: 'Tvätt och kläder' },
  { id: 'mat', titel: 'Mat' },
  { id: 'stad', titel: 'Städning och skötsel' },
  { id: 'skadedjur', titel: 'Skadedjur och småkryp', regel: 'Inga råd om bekämpningsmedel utöver det som är tillåtet för privatpersoner. Kontakta din hyresvärd.' },
  { id: 'fixa', titel: 'Fixa, laga och montera' },
  { id: 'huset', titel: 'Huset: el, vatten, värme och luft' },
  { id: 'akut', titel: 'Säkerhet och akuta lägen' },
  { id: 'halsa', titel: 'Hälsa och mående', regel: 'Inga diagnoser och inga doser. Kontakta vården.' },
  { id: 'grannar', titel: 'Grannar och samboende' },
  { id: 'sopor', titel: 'Sopor och miljö' },
  { id: 'inredning', titel: 'Inredning och trivsel' },
  { id: 'myndigheter', titel: 'Arbete, studier och myndigheter' },
  { id: 'digitalt', titel: 'Digitalt' },
  { id: 'transport', titel: 'Transport' },
  { id: 'vardag', titel: 'Vardagsrutiner och socialt' },
  { id: 'arshjul', titel: 'Årshjul' },
];

export const KATEGORI_IDN = KATEGORIER.map((k) => k.id);

export const kategori = (id) => KATEGORIER.find((k) => k.id === id);
