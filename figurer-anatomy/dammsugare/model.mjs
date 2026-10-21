// Dammsugarens modell som rena funktioner. Allt som rör sig och alla ord och siffror på sidan kommer härifrån.
// Källor (öppnade 2026-10-21): Elgiganten, Dammsugare som luktar illa eller suger dåligt?: en påse som suttit för länge
// luktar; byt påse en gång i kvartalet oavsett om den är full (Electrolux produktexpert); suger den dåligt är filtret
// troligen igensatt; ett filter sitter mellan påsen och motorn och ett på baksidan, byt eller rensa dem en gång i halvåret;
// rengör munstycket när det är fullt av damm och hår; dra ut sladden först. Miele, Rengöringseffekten avtar (påslös modell):
// större föremål kan blockera sugvägarna.
// Luftflödet visas utan siffror: hur mycket det minskar av påse och filter har ingen källa.

export const STEPS = ["vacuum", "weak", "unplug", "bag", "filter", "nozzle"];
export const SHOW = [4.4, 7, 2.2, 4.6, 5, 5.6];
export const GAP = 0.7;
export const FIRST = 1.0;
export const TOUR = 36;
export const START = SHOW.reduce((list, d, i) => [...list, i ? list[i - 1] + SHOW[i - 1] + GAP : FIRST], []);
export const END = START.map((s, i) => s + SHOW[i]);
export const CLICK = START.map((s) => s - 0.1);

export const BAG_MONTHS = 3; // byt påse en gång i kvartalet
export const FILTER_MONTHS = 6; // byt eller rensa filtren en gång i halvåret
export const SETTING_DEFAULT = 4; // månader sedan påsen byttes

const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const smooth = (a, b, x) => { const u = clamp((x - a) / (b - a)); return u * u * (3 - 2 * u); };
const lerp = (a, b, u) => a + (b - a) * u;

/** Reglaget: månader sedan påsen byttes (och filtren rensades), 0..8. */
export function setup(setting = SETTING_DEFAULT) {
  const months = Math.round(clamp(setting, 0, 8));
  return {
    setting: months,
    months,
    startFill: 0.15 + 0.08 * months, // illustration: påsen fylls med tiden
    startDirt: clamp(months / FILTER_MONTHS),
    smells: months >= BAG_MONTHS,
    real: STEPS.map(() => null),
  };
}

export function phaseAt(t) {
  let step = -1, p = 1;
  for (let i = 0; i < STEPS.length; i++) if (t >= START[i]) { step = i; p = clamp((t - START[i]) / SHOW[i]); }
  if (step < 0) return { step: 0, p: 0, running: false };
  return { step, p, running: t < END[step] };
}

/**
 * sucked: hur mycket av dammet på mattan som är uppsuget 0..1. fill: påsens fyllnad 0..1. dirt: filtrens smuts 0..1.
 * hair: hår i munstycket 0..1. plug: kontakten i 1, ute 0. lid: locket uppe 0..1. bagSwap: gammal påse ut 0..1, ny in 1..2.
 * filterLift: filtren uppe 0..1. motor: motorn går 0..1. flow: luftflöde 0..1 (räknat ur påse, filter, hår och kontakt; ingen skala).
 */
export function stateOf(step, p, s) {
  const st = { step, p, sucked: 0, fill: s.startFill, dirt: s.startDirt, hair: 1, plug: 1, lid: 0, bagSwap: 0, filterLift: 0, motor: 1 };
  const endFill = Math.min(0.97, s.startFill + 0.45);
  if (step === 0) {
    st.motor = smooth(0, 0.1, p);
    st.sucked = 0.55 * smooth(0.1, 1, p);
  } else if (step === 1) {
    st.sucked = 0.55 + 0.12 * smooth(0, 1, p);
  } else if (step === 2) {
    st.sucked = 0.67;
    st.plug = 1 - smooth(0.2, 0.7, p);
    st.motor = 1 - smooth(0.2, 0.5, p);
  } else {
    st.sucked = 0.67; st.plug = 0; st.motor = 0;
  }
  if (step <= 2) st.fill = lerp(s.startFill, endFill, st.sucked / 0.67);
  else st.fill = endFill;
  if (step === 3) {
    st.lid = smooth(0, 0.2, p) * (1 - smooth(0.8, 1, p));
    st.bagSwap = 2 * smooth(0.2, 0.8, p);
    if (st.bagSwap >= 1) st.fill = 0;
  }
  if (step >= 4) { st.fill = 0; st.bagSwap = 2; }
  if (step === 4) {
    st.lid = smooth(0, 0.15, p) * (1 - smooth(0.85, 1, p));
    st.filterLift = smooth(0.15, 0.35, p) * (1 - smooth(0.65, 0.85, p));
    st.dirt = s.startDirt * (1 - smooth(0.35, 0.65, p));
  }
  if (step === 5) {
    st.dirt = 0;
    st.hair = 1 - smooth(0.05, 0.4, p);
    st.plug = smooth(0.4, 0.55, p);
    st.motor = smooth(0.5, 0.6, p);
    st.fill = 0.33 * smooth(0.6, 1, p) * 0.3;
    st.sucked = 0.67 + 0.33 * smooth(0.6, 1, p);
  }
  // Påsen ser full ut när bytet startar och tom efter; i mitten byts den.
  st.flow = st.motor * (1 - 0.55 * st.dirt) * (1 - 0.5 * smooth(0.6, 1, st.fill)) * (1 - 0.3 * st.hair);
  st.weak = st.motor > 0.5 && st.flow < 0.45;
  return st;
}

export function at(t, s) {
  if (t < START[0]) return { ...stateOf(0, 0, s), motor: 0, flow: 0, running: false, t };
  const { step, p, running } = phaseAt(t);
  return { ...stateOf(step, p, s), running, t };
}

export const speedOf = () => "";
