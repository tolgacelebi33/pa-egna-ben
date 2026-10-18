import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { amneSchema } from './lib/schema.js';

// Ett ämne per fil: innehall/<kategori>/<id>.md
const amnen = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './innehall' }),
  schema: amneSchema,
});

export const collections = { amnen };
