// Figurernas texter. Läggs in i översättningslagret med figurens id som prefix, till exempel "kyl.steg.oppna".
import tvattmaskin from './tvattmaskin/sv.js';
import brandvarnare from './brandvarnare/sv.js';
import elskap from './elskap/sv.js';
import kyl from './kyl/sv.js';
import vattenlas from './vattenlas/sv.js';
import cistern from './cistern/sv.js';

export const FIGURORDLISTOR = { tvattmaskin, brandvarnare, elskap, kyl, 'vattenlas': vattenlas, 'cistern': cistern };
