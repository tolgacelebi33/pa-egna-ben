// Skapar en service worker som förcachar hela bygget, så att sidan fungerar offline efter första besöket.
import { generateSW } from 'workbox-build';

const { count, size, warnings } = await generateSW({
  globDirectory: 'dist',
  globPatterns: ['**/*.{html,js,css,svg,ico,png,webmanifest,woff2}'],
  swDest: 'dist/sw.js',
  cleanupOutdatedCaches: true,
  clientsClaim: true,
  skipWaiting: true,
});

for (const w of warnings) console.warn(w);
console.log(`Service worker: ${count} filer förcachade, ${(size / 1024).toFixed(1)} kB`);
