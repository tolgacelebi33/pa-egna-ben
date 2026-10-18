// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import remarkDirective from 'remark-directive';
import remarkRutor from './src/lib/remark-rutor.js';

export default defineConfig({
  // Undermapp vid hosting som GitHub Pages, till exempel BASE_PATH=/pa-egna-ben/. Tomt = roten.
  base: process.env.BASE_PATH || '/',
  integrations: [react()],
  trailingSlash: 'always',
  build: { format: 'directory' },
  markdown: {
    remarkPlugins: [remarkDirective, remarkRutor],
  },
});
