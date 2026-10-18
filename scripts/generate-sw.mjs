// Skapar service workern efter bygget och kontrollerar byggregel 7:
// varje akutämne i bygget måste finnas i offline-cachen, annars stoppas bygget.
// Hela bygget förcachas. Det är litet nu; när innehållet växer kan vanliga ämnen flyttas till cache vid besök,
// men akutämnen och sökindexet ska alltid förcachas.
import { generateSW, getManifest } from 'workbox-build';
import { readFileSync } from 'node:fs';
import { kontrolleraOfflineCache } from '../src/lib/regler.js';

const installningar = {
  globDirectory: 'dist',
  globPatterns: ['**/*.{html,js,css,svg,png,jpg,webmanifest,woff2,json}'],
  // Bara latinska och latin-ext-typsnitt behövs för svenska och engelska.
  globIgnores: ['**/*cyrillic*', '**/*greek*', '**/*vietnamese*', 'sw.js', 'workbox-*.js'],
};

const { manifestEntries } = await getManifest(installningar);
const cachade = manifestEntries.map((e) => e.url);

const index = JSON.parse(readFileSync('dist/sokindex.json', 'utf8'));
// Sökindexets adresser börjar med undermappen (BASE_PATH), förcachens gör det inte.
const bas = (process.env.BASE_PATH || '/').replace(/\/?$/, '/');
const akut = index.filter((p) => p.akut).map((p) => `${p.url.slice(bas.length)}index.html`);
const fel = kontrolleraOfflineCache(akut, cachade);
if (!cachade.includes('sokindex.json')) fel.push('[regel 7] sökindexet saknas i offline-cachen');

if (fel.length) {
  for (const f of fel) console.error(`FEL ${f}`);
  console.error('Bygget stoppas eftersom akutinnehåll inte fungerar offline.');
  process.exit(1);
}

const { count, size, warnings } = await generateSW({
  ...installningar,
  swDest: 'dist/sw.js',
  cleanupOutdatedCaches: true,
  clientsClaim: true,
  skipWaiting: true,
  // ?q= används av söksidan. Utan detta matchar /sok/?q=... inte den förcachade sidan.
  ignoreURLParametersMatching: [/^utm_/, /^fbclid$/, /^q$/],
  // Sidor som inte finns i förcachen hämtas från nätet. Bara utan nät visas 404-sidan.
  // (navigateFallback skickade alla sådana sidor till 404 även med nät, se rapporten för fas 1.)
  runtimeCaching: [
    {
      urlPattern: ({ request }) => request.mode === 'navigate',
      handler: 'NetworkOnly',
      options: { precacheFallback: { fallbackURL: `${bas}404.html` } },
    },
  ],
});

for (const w of warnings) console.warn(w);
console.log(`Service worker: ${count} filer förcachade, ${(size / 1024).toFixed(1)} kB. ${akut.length} akutämnen kontrollerade.`);
