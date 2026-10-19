// Diskmaskinens modell som rena funktioner. Allt som rör sig och alla siffror på sidan kommer härifrån.
// Källor (öppnade 2026-10-19): Råd & Rön nr 4 2015, Vi testar handdisk: diskmaskinens huvudprogram 11,8 l och 0,99 kWh
// per disk på 2 h 12 min; handdisk 44,2 l och 1,27 kWh per disk på 52 min (13 respektive 12 kuvert).
// Electrolux, Hur du rengör och underhåller din diskmaskin: kontrollera filtren efter varje användning och rengör
// vid behov; rengör spolarmarna regelbundet så att hålen inte täpps igen.

export const STEPS = ["load", "start", "wash", "hand", "filter", "arm"];
export const SHOW = [3, 2.4, 9, 5, 5.2, 5];
export const GAP = 0.7;
export const FIRST = 1.0;
export const TOUR = 36;
export const START = SHOW.reduce((list, d, i) => [...list, i ? list[i - 1] + SHOW[i - 1] + GAP : FIRST], []);
export const END = START.map((s, i) => s + SHOW[i]);
export const CLICK = START.map((s) => s - 0.1);

export const MACHINE_L = 11.8;
export const HAND_L = 44.2;
export const MACHINE_KWH = 0.99;
export const HAND_KWH = 1.27;
export const MACHINE_MIN = 132;
export const HAND_MIN = 52;
export const SETTING_DEFAULT = 4; // diskar per vecka, det man själv ställer in

const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const smooth = (a, b, x) => { const u = clamp((x - a) / (b - a)); return u * u * (3 - 2 * u); };

export function setup(setting = SETTING_DEFAULT) {
  const perWeek = Math.round(clamp(setting, 1, 7));
  return {
    setting: perWeek,
    perWeek,
    yearMachine: Math.round(MACHINE_L * perWeek * 52),
    yearHand: Math.round(HAND_L * perWeek * 52),
    real: [null, null, MACHINE_MIN * 60, HAND_MIN * 60, null, null],
  };
}

export function phaseAt(t) {
  let step = -1, p = 1;
  for (let i = 0; i < STEPS.length; i++) if (t >= START[i]) { step = i; p = clamp((t - START[i]) / SHOW[i]); }
  if (step < 0) return { step: 0, p: 0, running: false };
  return { step, p, running: t < END[step] };
}

/**
 * dishes: disken står i korgarna 0..1. on: maskinen är igång 0..1. water: vatten i botten 0..1. jets: spolarmarna sprutar 0..1.
 * spin: spolarmarnas vinkel i varv (växer jämnt under disken). machineL/handL: liter hittills. minutesLeft: kvar på programmet.
 * filterLift/armLift: uppe ur maskinen 0..1. crumbs: matrester i filtret 0..1. clogged: igensatta hål i spolarmen 0..1.
 */
export function stateOf(step, p, s) {
  const st = { step, p, dishes: 1, on: 0, water: 0, jets: 0, spin: 0, machineL: 0, handL: 0, minutesLeft: MACHINE_MIN, filterLift: 0, crumbs: 1, armLift: 0, clogged: 1, press: 0 };
  if (step === 0) st.dishes = smooth(0, 1, p);
  else if (step === 1) {
    st.press = smooth(0.1, 0.3, p) * (1 - smooth(0.4, 0.6, p));
    st.on = smooth(0.3, 0.5, p);
    st.water = smooth(0.5, 1, p) * 0.6;
  } else if (step === 2) {
    st.on = 1;
    st.water = (0.6 + 0.4 * smooth(0, 0.1, p)) * (1 - smooth(0.88, 1, p)); // pumpas ut i slutet
    st.jets = smooth(0, 0.08, p) * (1 - smooth(0.92, 1, p));
    st.spin = 6 * p; // jämn takt; 6 varv under den visade disken
    st.machineL = MACHINE_L * p;
    st.minutesLeft = MACHINE_MIN * (1 - p);
  } else {
    // Disken är klar; vattnet är tömt. Steg 3 jämför med handdisk, steg 4 och 5 rensar filter och spolarm.
    st.spin = 6;
    st.machineL = MACHINE_L;
    st.minutesLeft = 0;
    st.on = step === 3 ? 1 - smooth(0, 0.15, p) : 0;
    st.handL = step === 3 ? HAND_L * p : HAND_L;
    if (step === 4) {
      st.filterLift = smooth(0, 0.3, p) * (1 - smooth(0.7, 1, p));
      st.crumbs = 1 - smooth(0.35, 0.65, p);
    }
    if (step === 5) {
      st.crumbs = 0;
      st.armLift = smooth(0, 0.3, p) * (1 - smooth(0.7, 1, p));
      st.clogged = 1 - smooth(0.35, 0.65, p);
    }
  }
  return st;
}

export function at(t, s) {
  if (t < START[0]) return { ...stateOf(0, 0, s), running: false, t };
  const { step, p, running } = phaseAt(t);
  return { ...stateOf(step, p, s), running, t };
}

export function speedOf(step, s) {
  if (s.real[step] == null) return "";
  const r = s.real[step] / SHOW[step];
  if (r > 0.85 && r < 1.18) return "";
  return r > 1 ? `×${Math.round(r)}` : `×1/${Math.round(1 / r)}`;
}
