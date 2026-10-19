// Spisens modell som rena funktioner. Allt som rör sig och alla siffror på sidan kommer härifrån.
// Källor: Electrolux och AEG, Vilka kokkärl är lämpliga för induktionshäll? (öppnade 2026-10-18): magnettestet;
// gjutjärn, stål, emaljerat stål och rostfritt med magnetisk botten fungerar, aluminium, koppar, mässing, glas, keramik
// och porslin utan magnetisk botten fungerar inte. Myndigheten för civilt försvar, Skydda dig mot brand hemma (MCF0034,
// april 2026, öppnad 2026-10-19): lämna inte spisen när den är påslagen; brinner det i en kastrull, lägg på locket eller
// en brandfilt för att kväva branden; använd aldrig vatten, det får lågorna att spridas; brandsläckare med 6 kilo pulver.
// SVT om räddningstjänsten (öppnad 2026-10-19): lägg på locket, stäng av spisen och ställ bort kastrullen.
// Inga temperaturer eller tider: de saknar källa, därför visas inget fartmärke.

export const STEPS = ["magnet", "on", "leave", "fire", "lid", "off"];
export const SHOW = [3, 3.4, 3.4, 4.4, 7, 4.6];
export const GAP = 0.7;
export const FIRST = 1.0;
export const TOUR = 36;
export const START = SHOW.reduce((list, d, i) => [...list, i ? list[i - 1] + SHOW[i - 1] + GAP : FIRST], []);
export const END = START.map((s, i) => s + SHOW[i]);
export const CLICK = START.map((s) => s - 0.1);

export const MATERIALS = [
  { label: "gjutjärn", magnetic: true },
  { label: "rostfritt med magnetisk botten", magnetic: true },
  { label: "aluminium", magnetic: false },
  { label: "koppar", magnetic: false },
];
export const EXTINGUISHER_KG = 6;
export const SETTING_DEFAULT = 0;

const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const smooth = (a, b, x) => { const u = clamp((x - a) / (b - a)); return u * u * (3 - 2 * u); };

export function setup(setting = SETTING_DEFAULT) {
  const i = Math.round(clamp(setting, 0, MATERIALS.length - 1));
  return { setting: i, material: MATERIALS[i], magnetic: MATERIALS[i].magnetic, real: STEPS.map(() => null) };
}

export function phaseAt(t) {
  let step = -1, p = 1;
  for (let i = 0; i < STEPS.length; i++) if (t >= START[i]) { step = i; p = clamp((t - START[i]) / SHOW[i]); }
  if (step < 0) return { step: 0, p: 0, running: false };
  return { step, p, running: t < END[step] };
}

/**
 * magnet: magnetens väg mot kastrullen 0..1; drop: hur långt den har ramlat (bara om kastrullen inte är magnetisk).
 * on: plattan på 0..1. heat: hur varm kastrullen är 0..1 (ingen skala, bara mer eller mindre). smoke, fire: 0..1.
 * lid: lockets väg från bänken till kastrullen 0..1. air: hur mycket luft elden får 0..1. away: kastrullen flyttad bakåt 0..1.
 */
export function stateOf(step, p, s) {
  const m = s.magnetic ? 1 : 0;
  const st = { step, p, magnet: 1, drop: s.magnetic ? 0 : 1, on: 1, heat: m * 0.6, smoke: 0, fire: 0, lid: 0, air: 1, away: 0 };
  if (step === 0) {
    st.magnet = smooth(0, 0.5, p);
    st.drop = s.magnetic ? 0 : smooth(0.55, 0.85, p);
    st.on = 0; st.heat = 0;
  } else if (step === 1) {
    st.on = smooth(0, 0.15, p);
    st.heat = m * 0.6 * smooth(0.15, 1, p);
  } else if (step === 2) {
    st.heat = m * (0.6 + 0.4 * smooth(0, 1, p));
    st.smoke = m * smooth(0.3, 1, p);
  } else if (step === 3) {
    st.heat = m; st.smoke = m;
    st.fire = m * smooth(0.1, 0.6, p);
  } else if (step === 4) {
    st.heat = m; st.smoke = m * (1 - smooth(0.6, 1, p));
    st.lid = smooth(0.05, 0.6, p);
    st.air = 1 - smooth(0.45, 0.62, p); // locket stänger ute luften när det ligger på
    st.fire = m * st.air;
  } else {
    st.heat = m; st.lid = 1; st.air = 0;
    st.on = 1 - smooth(0, 0.2, p);
    st.away = smooth(0.35, 0.85, p);
  }
  return st;
}

export function at(t, s) {
  if (t < START[0]) return { ...stateOf(0, 0, s), running: false, t };
  const { step, p, running } = phaseAt(t);
  return { ...stateOf(step, p, s), running, t };
}

export const speedOf = () => "";
