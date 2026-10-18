// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import remarkDirective from 'remark-directive';
import remarkRutor from './src/lib/remark-rutor.js';

export default defineConfig({
  integrations: [react()],
  trailingSlash: 'always',
  build: { format: 'directory' },
  markdown: {
    remarkPlugins: [remarkDirective, remarkRutor],
  },
});
