import { hamtaAmnen, amneUrl } from '../lib/innehall.js';
import { kategori } from '../data/kategorier.js';

// Sökindex med bara det som syns i bygget. Förcachas av service workern.
export async function GET() {
  const amnen = await hamtaAmnen();
  const index = amnen.map(({ data: d }) => ({
    id: d.id,
    titel: d.titel,
    sammanfattning: d.sammanfattning,
    kategoriTitel: kategori(d.kategori)?.titel ?? '',
    akut: d.akut,
    url: amneUrl(d.id),
  }));
  return new Response(JSON.stringify(index), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
}
