// Kontrollerar att färgparen i src/styles/tokens.css når WCAG 2.1 AA (4,5:1 för text) i ljust och mörkt läge.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../src/styles/tokens.css', import.meta.url), 'utf8');

function block(namn) {
  const m = new RegExp(`/\\* ${namn} \\*/([\\s\\S]*?)/\\* slut ${namn} \\*/`).exec(css);
  assert.ok(m, `blocket ${namn} saknas`);
  return Object.fromEntries([...m[1].matchAll(/--([\w-]+):\s*(#[0-9a-f]{6})/gi)].map((x) => [x[1], x[2]]));
}

const lum = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const lin = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
};
const kontrast = (a, b) => {
  const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
};

// [förgrund, bakgrund, minsta kontrast]
const PAR = [
  ['black', 'papper', 4.5],
  ['black', 'yta', 4.5],
  ['black', 'yta-2', 4.5],
  ['text-svag', 'papper', 4.5],
  ['text-svag', 'yta', 4.5],
  ['text-svag', 'yta-2', 4.5],
  ['skiffer', 'papper', 4.5],
  ['skiffer', 'yta', 4.5],
  ['tegel', 'papper', 4.5],
  ['tegel', 'yta', 4.5],
  ['black', 'tegel-yta', 4.5],
  ['black', 'skiffer-yta', 4.5],
  ['black', 'ockra-yta', 4.5],
  ['black', 'salvia-yta', 4.5],
  ['papper', 'black', 4.5],
  // Kantlinjer och ikoner: 3:1 (WCAG 1.4.11)
  ['salvia', 'papper', 3],
];

for (const lage of ['ljust', 'morkt']) {
  const farger = block(lage);
  for (const [fg, bg, min] of PAR) {
    test(`${lage}: ${fg} på ${bg} når ${min}:1`, () => {
      const k = kontrast(farger[fg], farger[bg]);
      assert.ok(k >= min, `${fg} ${farger[fg]} på ${bg} ${farger[bg]} ger ${k.toFixed(2)}:1`);
    });
  }
}
