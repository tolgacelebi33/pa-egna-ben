import { test } from 'node:test';
import assert from 'node:assert/strict';
import { profilTillFilter, visas } from '../src/lib/filter.js';
import { sok, normalisera } from '../src/lib/sok.js';

const alla = { boendeform: [], utrustning: [] };

test('filter: utan val visas allt', () => {
  assert.equal(visas({ boendeform: ['andrahand'], utrustning: ['diskmaskin'] }, profilTillFilter(null)), true);
});

test('filter: ämne utan filter visas alltid', () => {
  assert.equal(visas(alla, profilTillFilter({ boendeform: 'hyresratt', tvatt: 'stuga', diskmaskin: 'nej' })), true);
});

test('filter: boendeform döljer ämnen för andra boendeformer', () => {
  const anv = profilTillFilter({ boendeform: 'hyresratt' });
  assert.equal(visas({ boendeform: ['andrahand'], utrustning: [] }, anv), false);
  assert.equal(visas({ boendeform: ['andrahand', 'hyresratt'], utrustning: [] }, anv), true);
});

test('filter: "vet inte" filtrerar inte', () => {
  const anv = profilTillFilter({ boendeform: 'vet_inte', tvatt: 'vet_inte', diskmaskin: 'vet_inte' });
  assert.equal(visas({ boendeform: ['andrahand'], utrustning: ['tvattstuga', 'diskmaskin'] }, anv), true);
});

test('filter: tvättstuga döljer ämnen som bara gäller egen tvättmaskin och tvärtom', () => {
  const stuga = profilTillFilter({ tvatt: 'stuga' });
  assert.equal(visas({ boendeform: [], utrustning: ['egen_tvattmaskin'] }, stuga), false);
  assert.equal(visas({ boendeform: [], utrustning: ['tvattstuga'] }, stuga), true);
  const egen = profilTillFilter({ tvatt: 'egen' });
  assert.equal(visas({ boendeform: [], utrustning: ['tvattstuga'] }, egen), false);
});

test('filter: diskmaskin nej döljer diskmaskinsämnen', () => {
  assert.equal(visas({ boendeform: [], utrustning: ['diskmaskin'] }, profilTillFilter({ diskmaskin: 'nej' })), false);
  assert.equal(visas({ boendeform: [], utrustning: ['diskmaskin'] }, profilTillFilter({ diskmaskin: 'ja' })), true);
});

test('filter: utrustning vi inte frågar om döljs aldrig', () => {
  const anv = profilTillFilter({ tvatt: 'stuga', diskmaskin: 'nej' });
  assert.equal(visas({ boendeform: [], utrustning: ['gasspis'] }, anv), true);
});

const INDEX = [
  { id: 'tvatt-maskinen', titel: 'Tvättmaskinen', sammanfattning: 'Program och temperatur.', kategoriTitel: 'Tvätt och kläder', akut: false, url: '/a/' },
  { id: 'nar-det-brinner', titel: 'Det brinner eller ryker', sammanfattning: '', kategoriTitel: 'Vad gör jag när...', akut: true, url: '/b/' },
  { id: 'akut-brand', titel: 'Det brinner: vad man gör', sammanfattning: '', kategoriTitel: 'Säkerhet', akut: true, url: '/c/' },
  { id: 'tvatt-tvattstugan', titel: 'Tvättstugan', sammanfattning: 'Bokning och regler för tvätt.', kategoriTitel: 'Tvätt och kläder', akut: false, url: '/d/' },
];

test('sök: hittar med och utan å, ä och ö', () => {
  assert.equal(normalisera('Tvätt Å Ö'), 'tvatt a o');
  assert.deepEqual(sok(INDEX, 'tvatt').map((p) => p.id).sort(), ['tvatt-maskinen', 'tvatt-tvattstugan']);
  assert.deepEqual(sok(INDEX, 'tvätt').map((p) => p.id).sort(), ['tvatt-maskinen', 'tvatt-tvattstugan']);
});

test('sök: alla ord måste finnas', () => {
  assert.deepEqual(sok(INDEX, 'tvätt bokning').map((p) => p.id), ['tvatt-tvattstugan']);
  assert.deepEqual(sok(INDEX, 'tvätt brand'), []);
});

test('sök: titelträffar först', () => {
  assert.equal(sok(INDEX, 'brinner')[0].titel.startsWith('Det brinner'), true);
});

test('sök: tom fråga ger inga träffar', () => {
  assert.deepEqual(sok(INDEX, '   '), []);
});
