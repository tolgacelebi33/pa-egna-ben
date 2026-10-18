// Hämtar ämnen till sidorna. Utkast tas bara med i utvecklingsläge eller när VISA_UTKAST=1 är satt.
import { getCollection } from 'astro:content';
import { KATEGORIER } from '../data/kategorier.js';
import { url } from './url.js';

export const VISA_UTKAST = import.meta.env.DEV || process.env.VISA_UTKAST === '1';

const NIVAORDNING = { vecka1: 0, forsta_aret: 1, bra_att_veta: 2 };

let cache;

/** Alla ämnen som får visas i det här bygget, sorterade efter nivå och titel. */
export async function hamtaAmnen() {
  if (cache) return cache;
  const poster = await getCollection('amnen');
  cache = poster
    .filter((p) => VISA_UTKAST || p.data.granskning.status === 'publicerad')
    .sort(
      (a, b) =>
        NIVAORDNING[a.data.niva] - NIVAORDNING[b.data.niva] || a.data.titel.localeCompare(b.data.titel, 'sv'),
    );
  return cache;
}

export async function amnenIKategori(kategoriId) {
  return (await hamtaAmnen()).filter((p) => p.data.kategori === kategoriId);
}

export async function kategorierMedAntal() {
  const amnen = await hamtaAmnen();
  return KATEGORIER.map((k) => ({ ...k, antal: amnen.filter((p) => p.data.kategori === k.id).length }));
}

export const amneUrl = (id) => url(`amne/${id}/`);
export const kategoriUrl = (id) => url(`kategori/${id}/`);
export const figurUrl = (id) => url(`figur/${id}/`);

export const arUtkast = (data) => data.granskning.status !== 'publicerad';
