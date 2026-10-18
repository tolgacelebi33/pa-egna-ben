// Telefonnummer och tjänstenamn hämtas bara härifrån (docs/RISK-OCH-GRANSKNING.md, avsnitt 4).
import data from '../data/kontakter.json';

export const KONTAKTER = data.kontakter;

export function kontakt(id) {
  const k = KONTAKTER.find((x) => x.id === id);
  if (!k) throw new Error(`Kontakten "${id}" finns inte i src/data/kontakter.json`);
  return k;
}

export const nodnummer = () => kontakt('nodnummer').nummer;

// Namn på sjukvårdsrådgivningen, eller en allmän beskrivning tills namnet är kontrollerat.
export const vardradgivning = () => kontakt('sjukvardsradgivning').namn || 'sjukvårdsrådgivningen';
