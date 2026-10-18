import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { stringify } from 'yaml';
import {
  kontrolleraAmne,
  kontrolleraOfflineCache,
  kontrolleraKontakter,
  delaFrontmatter,
} from '../src/lib/regler.js';

const IDAG = new Date('2026-10-18');

// Ett publicerat ämne som uppfyller alla regler. Testerna ändrar en sak i taget.
function publicerat(andra = {}) {
  const bas = {
    id: 'test-amne',
    titel: 'Testämne',
    titel_en: '',
    kategori: 'tvatt',
    sammanfattning: 'En mening.',
    niva: 'vecka1',
    risk: 'lag',
    regelberoende: false,
    varierar_per_kommun: false,
    akut: false,
    figur: null,
    filter: { boendeform: [], utrustning: [] },
    kallor: [],
    granskning: {
      status: 'publicerad',
      senast_kontrollerad: '2026-09-01',
      nasta_kontroll: '2027-09-01',
      skriven_av: 'A',
      faktagranskad_av: '',
      fackgranskad_av: '',
      fackgranskare_kompetens: '',
    },
    relaterade: [],
  };
  const data = structuredClone(bas);
  for (const [k, v] of Object.entries(andra)) {
    if (k === 'granskning') Object.assign(data.granskning, v);
    else data[k] = v;
  }
  return data;
}

const kor = (data, text = 'Text.', idn = ['test-amne']) =>
  kontrolleraAmne({ fil: data.id ?? 'test-amne', mapp: data.kategori, data, text }, { idn: new Set(idn), idag: IDAG });

const harRegel = (r, regel) => r.fel.some((f) => f.includes(`[${regel}]`));
const harVarning = (r, regel) => r.varningar.some((f) => f.includes(`[${regel}]`));

test('ett korrekt publicerat ämne godkänns', () => {
  const r = kor(publicerat());
  assert.deepEqual(r.fel, []);
  assert.deepEqual(r.varningar, []);
});

test('regel 1: saknat obligatoriskt fält stoppar bygget', () => {
  const data = publicerat();
  delete data.risk;
  assert.ok(harRegel(kor(data), 'schema'));
});

test('regel 1: fel värde stoppar bygget', () => {
  assert.ok(harRegel(kor(publicerat({ risk: 'mycket' })), 'schema'));
  assert.ok(harRegel(kor(publicerat({ kategori: 'finnsinte' })), 'schema'));
  assert.ok(harRegel(kor(publicerat({ figur: 'finnsinte' })), 'schema'));
  assert.ok(harRegel(kor(publicerat({ id: 'Stora Bokstäver' })), 'schema'));
});

test('regel 1: okända fält stoppar bygget', () => {
  assert.ok(harRegel(kor(publicerat({ extra: 1 })), 'schema'));
});

test('regel 1: id måste vara samma som filnamnet och kategori samma som mappen', () => {
  const data = publicerat();
  const r = kontrolleraAmne({ fil: 'annat-namn', mapp: 'mat', data, text: '' }, { idn: new Set(), idag: IDAG });
  assert.equal(r.fel.filter((f) => f.includes('[schema]')).length, 2);
});

test('regel 1: publicerat ämne utan sammanfattning, författare eller datum stoppas', () => {
  assert.ok(harRegel(kor(publicerat({ sammanfattning: '' })), 'regel 1'));
  assert.ok(harRegel(kor(publicerat({ granskning: { skriven_av: '' } })), 'regel 1'));
  assert.ok(harRegel(kor(publicerat({ granskning: { senast_kontrollerad: null } })), 'regel 1'));
  assert.ok(harRegel(kor(publicerat({ granskning: { nasta_kontroll: null } })), 'regel 1'));
});

test('regel 2: TODO-KONTROLL i texten stoppar publicerat ämne', () => {
  assert.ok(harRegel(kor(publicerat(), 'Temperatur: TODO-KONTROLL: grader.'), 'regel 2'));
});

test('regel 2: TODO-KONTROLL i frontmatter stoppar publicerat ämne', () => {
  assert.ok(harRegel(kor(publicerat({ sammanfattning: 'TODO-KONTROLL: skriv' })), 'regel 2'));
});

test('regel 2: TODO-KONTROLL är tillåtet i utkast', () => {
  const r = kor(publicerat({ granskning: { status: 'utkast' } }), 'TODO-KONTROLL: något');
  assert.deepEqual(r.fel, []);
});

test('regel 3: risk medel och hog kräver faktagranskning', () => {
  assert.ok(harRegel(kor(publicerat({ risk: 'medel' })), 'regel 3'));
  assert.ok(harRegel(kor(publicerat({ risk: 'hog' })), 'regel 3'));
  assert.ok(!harRegel(kor(publicerat({ risk: 'medel', granskning: { faktagranskad_av: 'B' } })), 'regel 3'));
});

test('regel 4: risk hog kräver fackgranskare och kompetens', () => {
  const bara = publicerat({ risk: 'hog', granskning: { faktagranskad_av: 'B', fackgranskad_av: 'C' } });
  assert.ok(harRegel(kor(bara), 'regel 4'));
  const komplett = publicerat({
    risk: 'hog',
    granskning: { faktagranskad_av: 'B', fackgranskad_av: 'C', fackgranskare_kompetens: 'behörig elinstallatör' },
  });
  assert.deepEqual(kor(komplett).fel, []);
});

test('regel 5: risk hog med passerat kontrolldatum stoppar bygget', () => {
  const data = publicerat({
    risk: 'hog',
    granskning: {
      faktagranskad_av: 'B',
      fackgranskad_av: 'C',
      fackgranskare_kompetens: 'D',
      nasta_kontroll: '2026-10-01',
    },
  });
  assert.ok(harRegel(kor(data), 'regel 5'));
});

test('regel 6: regelberoende utan källor stoppar bygget', () => {
  assert.ok(harRegel(kor(publicerat({ regelberoende: true })), 'regel 6'));
  const medKalla = publicerat({
    regelberoende: true,
    kallor: [{ namn: 'Källa', url: 'https://example.org/', hamtad: '2026-09-01' }],
  });
  assert.deepEqual(kor(medKalla).fel, []);
});

test('regel 7: akutämne som saknas i offline-cachen stoppar bygget', () => {
  const fel = kontrolleraOfflineCache(
    ['amne/nar-det-brinner/index.html', 'amne/akut-brand/index.html'],
    ['/amne/nar-det-brinner/index.html', 'index.html'],
  );
  assert.equal(fel.length, 1);
  assert.match(fel[0], /akut-brand/);
  assert.deepEqual(kontrolleraOfflineCache(['amne/a/index.html'], ['amne/a/index.html']), []);
});

test('regel 8: relaterade som pekar på saknat ämne stoppar bygget, även i utkast', () => {
  assert.ok(harRegel(kor(publicerat({ relaterade: ['finns-inte'] })), 'regel 8'));
  assert.ok(harRegel(kor(publicerat({ relaterade: ['finns-inte'], granskning: { status: 'utkast' } })), 'regel 8'));
  assert.deepEqual(kor(publicerat({ relaterade: ['annat'] }), 'x', ['test-amne', 'annat']).fel, []);
});

test('varning 1: risk lag eller medel med passerat kontrolldatum ger varning, inte fel', () => {
  const r = kor(publicerat({ granskning: { nasta_kontroll: '2026-01-01' } }));
  assert.deepEqual(r.fel, []);
  assert.ok(harVarning(r, 'varning 1'));
});

test('varning 2: källa äldre än 12 månader i regelberoende ämne ger varning', () => {
  const r = kor(
    publicerat({ regelberoende: true, kallor: [{ namn: 'Gammal', url: 'https://example.org/', hamtad: '2025-06-01' }] }),
  );
  assert.deepEqual(r.fel, []);
  assert.ok(harVarning(r, 'varning 2'));
});

test('akut: kontakter utan källa stoppar bygget när publicerat akutinnehåll finns', () => {
  const kontakter = [{ id: 'x', namn: 'Nöd', nummer: '1', kalla: { url: '', hamtad: null }, senast_kontrollerad: null }];
  assert.equal(kontrolleraKontakter(kontakter, false).length, 0);
  assert.ok(kontrolleraKontakter(kontakter, true).length > 0);
});

test('delaFrontmatter delar fil i yaml och text', () => {
  assert.deepEqual(delaFrontmatter('---\na: 1\n---\nText'), { yaml: 'a: 1', text: 'Text' });
  assert.equal(delaFrontmatter('Ingen frontmatter'), null);
});

// Hela kedjan: skriptet som körs före bygget ska avsluta med felkod 1.
function korSkript(amnen) {
  const rot = mkdtempSync(join(tmpdir(), 'peb-'));
  for (const data of amnen) {
    mkdirSync(join(rot, data.kategori), { recursive: true });
    writeFileSync(join(rot, data.kategori, `${data.id}.md`), `---\n${stringify(data)}---\nText.\n`);
  }
  return spawnSync('node', ['scripts/validera.mjs', rot, '--idag=2026-10-18'], { encoding: 'utf8' });
}

test('validera.mjs: godkänt innehåll ger felkod 0', () => {
  const r = korSkript([publicerat()]);
  assert.equal(r.status, 0, r.stderr);
});

test('validera.mjs: brutna regler ger felkod 1 och bygget stoppas', () => {
  const r = korSkript([publicerat({ risk: 'hog' })]);
  assert.equal(r.status, 1);
  assert.match(r.stderr, /regel 3/);
  assert.match(r.stderr, /regel 4/);
});
