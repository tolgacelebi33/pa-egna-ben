// Innehållsschema enligt docs/RISK-OCH-GRANSKNING.md, avsnitt 2.
// Används både av Astros content collection och av scripts/validera.mjs, så att reglerna bara finns på ett ställe.
import { z } from 'astro/zod';
import { KATEGORI_IDN } from '../data/kategorier.js';
import { FIGUR_IDN } from '../data/figurer.js';

export const NIVAER = ['vecka1', 'forsta_aret', 'bra_att_veta'];
export const RISKER = ['lag', 'medel', 'hog'];
export const STATUSAR = ['utkast', 'for_granskning', 'publicerad'];
export const BOENDEFORMER = ['hyresratt', 'andrahand', 'bostadsratt', 'studentboende', 'inneboende'];
export const UTRUSTNING = ['egen_tvattmaskin', 'tvattstuga', 'diskmaskin', 'torktumlare', 'induktion', 'gasspis'];

const ID = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const datum = z.coerce.date();

export const kallaSchema = z.object({
  namn: z.string().min(1),
  url: z.url(),
  hamtad: datum,
});

export const amneSchema = z
  .object({
    id: z.string().regex(ID, 'id får bara innehålla små bokstäver, siffror och bindestreck'),
    titel: z.string().min(1),
    titel_en: z.string(),
    kategori: z.enum(KATEGORI_IDN),
    sammanfattning: z.string(),
    niva: z.enum(NIVAER),
    risk: z.enum(RISKER),
    regelberoende: z.boolean(),
    varierar_per_kommun: z.boolean(),
    akut: z.boolean(),
    figur: z.enum(FIGUR_IDN).nullable(),
    filter: z
      .object({
        boendeform: z.array(z.enum(BOENDEFORMER)),
        utrustning: z.array(z.enum(UTRUSTNING)),
      })
      .strict(),
    kallor: z.array(kallaSchema),
    // Förslag på typ av källa (fas 2). Inga påhittade länkar, bara beskrivningar.
    kalltyper: z.array(z.string()).optional(),
    granskning: z
      .object({
        status: z.enum(STATUSAR),
        senast_kontrollerad: datum.nullable(),
        nasta_kontroll: datum.nullable(),
        skriven_av: z.string(),
        faktagranskad_av: z.string(),
        fackgranskad_av: z.string(),
        fackgranskare_kompetens: z.string(),
      })
      .strict(),
    relaterade: z.array(z.string().regex(ID)),
  })
  .strict();
