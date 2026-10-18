// All lokal lagring går via dessa funktioner, så att "Radera mina uppgifter" hittar allt.
// Fel fångas: privat läge eller blockerad lagring ska inte få sidan att sluta fungera.
import { CONFIG } from '../config.js';

const P = CONFIG.lagringsprefix;

export function las(nyckel, standard = null) {
  try {
    const v = localStorage.getItem(P + nyckel);
    return v === null ? standard : JSON.parse(v);
  } catch {
    return standard;
  }
}

export function spara(nyckel, varde) {
  try {
    localStorage.setItem(P + nyckel, JSON.stringify(varde));
    return true;
  } catch {
    return false;
  }
}

export function taBort(nyckel) {
  try {
    localStorage.removeItem(P + nyckel);
  } catch {
    /* inget att göra */
  }
}

export function raderaAllt() {
  try {
    for (const k of Object.keys(localStorage)) if (k.startsWith(P)) localStorage.removeItem(k);
    for (const k of Object.keys(sessionStorage)) if (k.startsWith(P)) sessionStorage.removeItem(k);
    return true;
  } catch {
    return false;
  }
}

export const NYCKLAR = {
  profil: 'profil',
  onboardingKlar: 'onboarding-klar',
  tema: 'tema',
  visaAlla: 'visa-alla',
  foraldralage: 'foraldralage',
  budget: 'budget',
  stadschema: 'stadschema',
};
