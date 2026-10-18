// Avgör om ett ämne ska visas utifrån användarens val i onboarding.
// Bara det vi faktiskt frågar om filtreras. Utrustning vi inte frågar om (till exempel gasspis) döljs aldrig.

export const FRAGAD_UTRUSTNING = ['egen_tvattmaskin', 'tvattstuga', 'diskmaskin'];

/** Gör om svaren i onboarding till listor som går att jämföra med ämnenas filter. */
export function profilTillFilter(profil) {
  if (!profil) return null;
  const utrustning = new Set();
  const kanda = new Set();
  if (profil.tvatt === 'egen' || profil.tvatt === 'stuga') {
    kanda.add('egen_tvattmaskin');
    kanda.add('tvattstuga');
    utrustning.add(profil.tvatt === 'egen' ? 'egen_tvattmaskin' : 'tvattstuga');
  }
  if (profil.diskmaskin === 'ja' || profil.diskmaskin === 'nej') {
    kanda.add('diskmaskin');
    if (profil.diskmaskin === 'ja') utrustning.add('diskmaskin');
  }
  const boendeform = profil.boendeform && profil.boendeform !== 'vet_inte' ? profil.boendeform : null;
  return { boendeform, utrustning, kanda };
}

/**
 * @param {{boendeform: string[], utrustning: string[]}} amnesfilter från ämnets frontmatter
 * @param {ReturnType<typeof profilTillFilter>} anvandare
 */
export function visas(amnesfilter, anvandare) {
  if (!anvandare) return true;
  const { boendeform = [], utrustning = [] } = amnesfilter ?? {};
  if (boendeform.length > 0 && anvandare.boendeform && !boendeform.includes(anvandare.boendeform)) return false;
  if (utrustning.length > 0) {
    // Visas om användaren kan ha någon av sakerna: antingen har hen den, eller så har vi inte frågat.
    const kanHa = utrustning.some((u) => !anvandare.kanda.has(u) || anvandare.utrustning.has(u));
    if (!kanHa) return false;
  }
  return true;
}
