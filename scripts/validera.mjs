// Validerar allt innehåll före bygget. Avslutar med felkod 1 om någon byggregel bryts.
// Användning: node scripts/validera.mjs <innehållsmapp> [--idag=YYYY-MM-DD]
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, basename, dirname, relative } from 'node:path';
import { parse } from 'yaml';
import { kontrolleraAmne, kontrolleraKontakter, delaFrontmatter } from '../src/lib/regler.js';

const rot = process.argv[2] ?? 'innehall';
const idagArg = process.argv.find((a) => a.startsWith('--idag='));
const idag = idagArg ? new Date(idagArg.slice(7)) : new Date();
const kontaktfil = process.argv.find((a) => a.startsWith('--kontakter='))?.slice(12) ?? 'src/data/kontakter.json';

function filer(mapp) {
  let ut = [];
  for (const namn of readdirSync(mapp)) {
    const sokvag = join(mapp, namn);
    if (statSync(sokvag).isDirectory()) ut = ut.concat(filer(sokvag));
    else if (namn.endsWith('.md')) ut.push(sokvag);
  }
  return ut;
}

const fel = [];
const varningar = [];
const amnen = [];

for (const sokvag of filer(rot)) {
  const delar = delaFrontmatter(readFileSync(sokvag, 'utf8'));
  const fil = basename(sokvag, '.md');
  if (!delar) {
    fel.push(`${fil}: [schema] frontmatter saknas`);
    continue;
  }
  let data;
  try {
    data = parse(delar.yaml);
  } catch (e) {
    fel.push(`${fil}: [schema] ogiltig YAML: ${e.message}`);
    continue;
  }
  const mapp = relative(rot, dirname(sokvag)) || undefined;
  amnen.push({ fil, mapp, data, text: delar.text });
}

const dubletter = amnen.map((a) => a.fil).filter((f, i, alla) => alla.indexOf(f) !== i);
for (const d of new Set(dubletter)) fel.push(`${d}: [schema] id finns i flera filer`);

const idn = new Set(amnen.map((a) => a.fil));
let publiceradeAkut = 0;
let publicerade = 0;
for (const amne of amnen) {
  const r = kontrolleraAmne(amne, { idn, idag });
  fel.push(...r.fel);
  varningar.push(...r.varningar);
  if (r.data?.granskning.status === 'publicerad') {
    publicerade++;
    if (r.data.akut) publiceradeAkut++;
  }
}

const kontakter = JSON.parse(readFileSync(kontaktfil, 'utf8')).kontakter;
fel.push(...kontrolleraKontakter(kontakter, publiceradeAkut > 0));

for (const v of varningar) console.warn(`VARNING ${v}`);
for (const f of fel) console.error(`FEL ${f}`);
console.log(`Validering: ${amnen.length} ämnen, ${publicerade} publicerade, ${fel.length} fel, ${varningar.length} varningar.`);
if (fel.length > 0) {
  console.error('Bygget stoppas eftersom byggreglerna i docs/RISK-OCH-GRANSKNING.md bryts.');
  process.exit(1);
}
