// Byggregler enligt docs/RISK-OCH-GRANSKNING.md, avsnitt 3.
// Rena funktioner utan filåtkomst, så att de går att testa. scripts/validera.mjs läser filerna.
import { amneSchema } from './schema.js';

export const TODO = 'TODO-KONTROLL';
// Kända korta nummer och svenska telefonnummer med riktnummer. Årtal och belopp ska inte fångas.
const TELEFONNUMMER = /\b(?:112|1177|114 ?14|90 ?101)\b|\b0\d{1,3}[- ]\d{2,3}[ ]?\d{2}[ ]?\d{2}\b/;
const MANAD_MS = 1000 * 60 * 60 * 24 * 30.44;

const tomt = (v) => v === undefined || v === null || String(v).trim() === '';

// Söker igenom alla strängar i frontmatter och brödtext.
function innehallerTodo(data, text) {
  if (text.includes(TODO)) return true;
  const sok = (v) => {
    if (typeof v === 'string') return v.includes(TODO);
    if (Array.isArray(v)) return v.some(sok);
    if (v && typeof v === 'object' && !(v instanceof Date)) return Object.values(v).some(sok);
    return false;
  };
  return sok(data);
}

/**
 * Kontrollerar ett ämne. Returnerar { fel: [], varningar: [], data }.
 * @param {object} amne { fil, mapp, data, text }  mapp = kategorimappens namn, fil = filnamn utan .md
 * @param {object} ctx { idn: Set<string>, idag: Date }
 */
export function kontrolleraAmne(amne, ctx) {
  const fel = [];
  const varningar = [];
  const ut = (lista, regel, text) => lista.push(`${amne.fil}: [${regel}] ${text}`);

  // Regel 1, del 1: schemat gäller alla ämnen oavsett status, så att fel upptäcks tidigt.
  const tolkat = amneSchema.safeParse(amne.data);
  if (!tolkat.success) {
    for (const p of tolkat.error.issues) ut(fel, 'schema', `${p.path.join('.') || '(rot)'}: ${p.message}`);
    return { fel, varningar, data: null };
  }
  const d = tolkat.data;
  const g = d.granskning;

  if (d.id !== amne.fil) ut(fel, 'schema', `id "${d.id}" ska vara samma som filnamnet "${amne.fil}"`);
  if (amne.mapp !== undefined && d.kategori !== amne.mapp) {
    ut(fel, 'schema', `kategori "${d.kategori}" ska vara samma som mappen "${amne.mapp}"`);
  }

  // Säkerhetsregel för akut (avsnitt 4): telefonnummer får aldrig skrivas i löptext, de hämtas från den centrala filen.
  // Gäller alla statusar, så att numren inte smyger in redan i utkast.
  const nummer = TELEFONNUMMER.exec(amne.text);
  if (nummer) ut(fel, 'akut', `brödtexten innehåller ett telefonnummer ("${nummer[0]}"). Använd den centrala kontaktfilen.`);

  // Regel 8 gäller alla, en trasig länk är fel oavsett status.
  for (const r of d.relaterade) {
    if (!ctx.idn.has(r)) ut(fel, 'regel 8', `relaterade pekar på "${r}" som inte finns`);
  }

  if (g.status === 'publicerad') {
    // Regel 1, del 2: fält som får vara tomma i utkast men krävs för publicering.
    if (tomt(d.sammanfattning)) ut(fel, 'regel 1', 'sammanfattning saknas');
    if (tomt(g.skriven_av)) ut(fel, 'regel 1', 'granskning.skriven_av saknas');
    if (!g.senast_kontrollerad) ut(fel, 'regel 1', 'granskning.senast_kontrollerad saknas');
    if (!g.nasta_kontroll) ut(fel, 'regel 1', 'granskning.nasta_kontroll saknas');

    if (innehallerTodo(amne.data, amne.text)) ut(fel, 'regel 2', `texten innehåller ${TODO}`);

    if ((d.risk === 'medel' || d.risk === 'hog') && tomt(g.faktagranskad_av)) {
      ut(fel, 'regel 3', `risk ${d.risk} saknar faktagranskad_av`);
    }
    if (d.risk === 'hog' && (tomt(g.fackgranskad_av) || tomt(g.fackgranskare_kompetens))) {
      ut(fel, 'regel 4', 'risk hog saknar fackgranskad_av eller fackgranskare_kompetens');
    }
    if (g.nasta_kontroll && g.nasta_kontroll < ctx.idag) {
      if (d.risk === 'hog') ut(fel, 'regel 5', `risk hog har passerat nasta_kontroll (${datumText(g.nasta_kontroll)})`);
      else ut(varningar, 'varning 1', `risk ${d.risk} har passerat nasta_kontroll (${datumText(g.nasta_kontroll)})`);
    }
    if (d.regelberoende && d.kallor.length === 0) ut(fel, 'regel 6', 'regelberoende men kallor är tom');
    if (d.regelberoende) {
      for (const k of d.kallor) {
        if (ctx.idag - k.hamtad > 12 * MANAD_MS) {
          ut(varningar, 'varning 2', `källan "${k.namn}" är äldre än 12 månader`);
        }
      }
    }
  }

  return { fel, varningar, data: d };
}

/**
 * Regel 7: varje publicerat akutämne måste finnas i offline-cachen.
 * @param {string[]} akutSokvagar t.ex. ["amne/nar-det-brinner/index.html"]
 * @param {string[]} cachadeSokvagar sökvägar i service workerns förcache
 */
export function kontrolleraOfflineCache(akutSokvagar, cachadeSokvagar) {
  const cachade = new Set(cachadeSokvagar.map((s) => s.replace(/^\//, '')));
  return akutSokvagar
    .filter((s) => !cachade.has(s.replace(/^\//, '')))
    .map((s) => `[regel 7] akutämnet ${s} saknas i offline-cachen`);
}

/**
 * Säkerhetsregel för akut (avsnitt 4): telefonnummer hämtas från den centrala filen, med källa och kontrolldatum.
 * Om något publicerat akutämne finns måste alla kontakter som har ett nummer vara källbelagda.
 */
export function kontrolleraKontakter(kontakter, finnsPubliceratAkut) {
  if (!finnsPubliceratAkut) return [];
  const fel = [];
  for (const k of kontakter) {
    if (tomt(k.nummer) && tomt(k.namn)) continue;
    if (tomt(k.kalla?.url) || !k.kalla?.hamtad || !k.senast_kontrollerad) {
      fel.push(`[akut] kontakten "${k.id}" saknar källa eller kontrolldatum i src/data/kontakter.json`);
    }
    if (innehallerTodo(k, '')) fel.push(`[akut] kontakten "${k.id}" innehåller ${TODO}`);
  }
  return fel;
}

export function datumText(d) {
  return d instanceof Date && !Number.isNaN(d.getTime()) ? d.toISOString().slice(0, 10) : '';
}

// Delar upp en Markdown-fil i frontmatter och text.
export function delaFrontmatter(rad) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(rad);
  if (!m) return null;
  return { yaml: m[1], text: m[2] };
}
