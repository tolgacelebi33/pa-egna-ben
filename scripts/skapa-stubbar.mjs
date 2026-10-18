// Fas 2: skapar en innehållsfil för varje ämne i docs/INNEHALL.md och en översiktstabell.
// Användning: node scripts/skapa-stubbar.mjs [--skriv-over]
// Utan --skriv-over rörs befintliga filer inte. Filer som inte längre är utkast skrivs aldrig över.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { stringify, parse } from 'yaml';
import { lasKatalog } from '../src/lib/katalog.js';
import { delaFrontmatter } from '../src/lib/regler.js';
import { KATEGORIER } from '../src/data/kategorier.js';
import bostadPengar from './disposition/bostad-pengar.mjs';
import tvattMat from './disposition/tvatt-mat.mjs';
import stadFixaHuset from './disposition/stad-fixa-huset.mjs';
import ovriga from './disposition/ovriga.mjs';

const skrivOver = process.argv.includes('--skriv-over');
const DISPOSITION = { ...bostadPengar, ...tvattMat, ...stadFixaHuset, ...ovriga };

// Titlar där katalogen har en anvisning efter titeln. Anvisningen läggs som kommentar i filen.
const TITLAR = {
  'stad-schema': 'Städschema med frekvens per uppgift',
  'mat-allergier': 'Allergier och specialkost',
};

const { amnen, fel: tolkfel } = lasKatalog(readFileSync('docs/INNEHALL.md', 'utf8'));
if (tolkfel.length) {
  for (const f of tolkfel) console.error(f);
  process.exit(1);
}

const saknas = amnen.filter((a) => !DISPOSITION[a.id]).map((a) => a.id);
const extra = Object.keys(DISPOSITION).filter((id) => !amnen.some((a) => a.id === id));
if (saknas.length || extra.length) {
  if (saknas.length) console.error(`Disposition saknas för: ${saknas.join(', ')}`);
  if (extra.length) console.error(`Disposition finns för ämnen som inte står i katalogen: ${extra.join(', ')}`);
  process.exit(1);
}

function brodtext(a, d) {
  const delar = [];
  if (d.anteckning) delar.push(`<!-- Anvisning från katalogen: ${d.anteckning} -->`);
  delar.push('## Vad gör jag nu');
  delar.push(d.nu.map((p, i) => (a.akut ? `${i + 1}. ${p}` : `- ${p}`)).join('\n'));
  if (d.varning) delar.push(`:::varning\n${d.varning}\n:::`);
  if (d.proffs) delar.push(`:::anlita-proffs\n${d.proffs}\n:::`);
  if (d.mer?.length) {
    delar.push('## Bra att veta');
    delar.push(d.mer.map((p) => `- ${p}`).join('\n'));
  }
  return `${delar.join('\n\n')}\n`;
}

let skapade = 0;
let ororda = 0;
const rader = [];

for (const a of amnen) {
  const d = DISPOSITION[a.id];
  const fil = `innehall/${a.kategori}/${a.id}.md`;
  const figur = a.kategori === 'nar' ? 'beslutstrad' : a.figur;
  const data = {
    id: a.id,
    titel: TITLAR[a.id] ?? a.titel,
    titel_en: '',
    kategori: a.kategori,
    sammanfattning: '',
    niva: a.niva,
    risk: a.risk,
    regelberoende: a.regelberoende,
    varierar_per_kommun: a.varierar_per_kommun,
    akut: a.akut,
    figur,
    filter: { boendeform: d.filter?.boendeform ?? [], utrustning: d.filter?.utrustning ?? [] },
    kallor: [],
    kalltyper: d.kallor ?? [],
    granskning: {
      status: 'utkast',
      senast_kontrollerad: null,
      nasta_kontroll: null,
      skriven_av: '',
      faktagranskad_av: '',
      fackgranskad_av: '',
      fackgranskare_kompetens: '',
    },
    relaterade: d.relaterade ?? [],
  };

  let status = 'utkast';
  if (existsSync(fil)) {
    const befintlig = delaFrontmatter(readFileSync(fil, 'utf8'));
    status = befintlig ? (parse(befintlig.yaml)?.granskning?.status ?? 'utkast') : 'utkast';
  }
  if (existsSync(fil) && (!skrivOver || status !== 'utkast')) {
    if (status !== 'utkast') console.warn(`Rörs inte, status ${status}: ${fil}`);
    ororda++;
  } else {
    mkdirSync(`innehall/${a.kategori}`, { recursive: true });
    writeFileSync(fil, `---\n${stringify(data, { lineWidth: 0 })}---\n\n${brodtext(a, d)}`);
    skapade++;
  }
  rader.push({ ...a, figur, status });
}

// Översiktstabell
const flagga = (a) => [a.regelberoende && 'R', a.varierar_per_kommun && 'K', a.akut && 'A'].filter(Boolean).join(' ');
const RISK = { lag: 'låg', medel: 'medel', hog: 'hög' };
const NIVA = { vecka1: 'vecka 1', forsta_aret: 'första året', bra_att_veta: 'bra att veta' };
const antal = (f) => rader.filter(f).length;
const md = [
  '# Översikt över alla ämnen',
  '',
  'Genereras av `node scripts/skapa-stubbar.mjs`. Ändra inte för hand.',
  '',
  `Totalt ${rader.length} ämnen. Risk: ${antal((r) => r.risk === 'hog')} hög, ${antal((r) => r.risk === 'medel')} medel, ${antal((r) => r.risk === 'lag')} låg. ` +
    `Nivå: ${antal((r) => r.niva === 'vecka1')} vecka 1, ${antal((r) => r.niva === 'forsta_aret')} första året, ${antal((r) => r.niva === 'bra_att_veta')} bra att veta. ` +
    `${antal((r) => r.regelberoende)} regelberoende, ${antal((r) => r.varierar_per_kommun)} varierar per kommun, ${antal((r) => r.akut)} akut, ${antal((r) => r.figur)} med figur.`,
  '',
  'Flaggor: R regelberoende, K varierar per kommun, A akut.',
  '',
];
for (const k of KATEGORIER) {
  const iKat = rader.filter((r) => r.kategori === k.id);
  if (!iKat.length) continue;
  md.push(`## ${k.titel} (${iKat.length})`, '', '| Ämne | Id | Risk | Nivå | Flaggor | Figur | Status |', '|---|---|---|---|---|---|---|');
  for (const r of iKat) {
    md.push(`| ${TITLAR[r.id] ?? r.titel} | \`${r.id}\` | ${RISK[r.risk]} | ${NIVA[r.niva]} | ${flagga(r)} | ${r.figur ?? ''} | ${r.status} |`);
  }
  md.push('');
}
writeFileSync('docs/OVERSIKT-AMNEN.md', md.join('\n'));

console.log(`${amnen.length} ämnen i katalogen. ${skapade} filer skrivna, ${ororda} lämnades orörda. Översikt: docs/OVERSIKT-AMNEN.md`);
