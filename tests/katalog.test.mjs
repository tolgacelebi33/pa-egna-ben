// Fas 2: varje ämne i docs/INNEHALL.md ska ha en innehållsfil med samma koder. Inget får utelämnas.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';
import { lasKatalog } from '../src/lib/katalog.js';
import { delaFrontmatter } from '../src/lib/regler.js';

const { amnen, fel } = lasKatalog(readFileSync('docs/INNEHALL.md', 'utf8'));

const filer = new Map();
for (const kat of readdirSync('innehall')) {
  for (const namn of readdirSync(join('innehall', kat))) {
    if (!namn.endsWith('.md')) continue;
    const delar = delaFrontmatter(readFileSync(join('innehall', kat, namn), 'utf8'));
    filer.set(namn.slice(0, -3), { mapp: kat, data: parse(delar.yaml), text: delar.text });
  }
}

test('katalogen går att tolka rad för rad', () => {
  assert.deepEqual(fel, []);
  assert.equal(amnen.length, 290);
});

test('varje ämne i katalogen har en fil', () => {
  const saknas = amnen.filter((a) => !filer.has(a.id)).map((a) => a.id);
  assert.deepEqual(saknas, []);
});

test('inga filer utanför katalogen', () => {
  const ids = new Set(amnen.map((a) => a.id));
  assert.deepEqual([...filer.keys()].filter((id) => !ids.has(id)), []);
});

test('koderna i varje fil stämmer med katalogen', () => {
  const avvikelser = [];
  for (const a of amnen) {
    const f = filer.get(a.id);
    if (!f) continue;
    const d = f.data;
    const vantadFigur = a.kategori === 'nar' ? 'beslutstrad' : a.figur;
    for (const [falt, varde] of [
      ['kategori', a.kategori],
      ['risk', a.risk],
      ['niva', a.niva],
      ['regelberoende', a.regelberoende],
      ['varierar_per_kommun', a.varierar_per_kommun],
      ['akut', a.akut],
      ['figur', vantadFigur],
    ]) {
      if (d[falt] !== varde) avvikelser.push(`${a.id}.${falt}: ${d[falt]} men katalogen säger ${varde}`);
    }
    if (f.mapp !== a.kategori) avvikelser.push(`${a.id} ligger i mappen ${f.mapp}`);
  }
  assert.deepEqual(avvikelser, []);
});

test('regelberoende och riskfyllda utkast har förslag på källtyp', () => {
  const utan = amnen
    .filter((a) => a.regelberoende || a.risk === 'hog')
    .filter((a) => !(filer.get(a.id)?.data.kalltyper?.length > 0))
    .map((a) => a.id);
  assert.deepEqual(utan, []);
});

test('akutämnen har numrerade steg', () => {
  const utan = amnen.filter((a) => a.akut).filter((a) => !/^1\. /m.test(filer.get(a.id)?.text ?? '')).map((a) => a.id);
  assert.deepEqual(utan, []);
});
