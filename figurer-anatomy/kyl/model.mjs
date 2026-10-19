// Kylens modell som rena funktioner. Allt som rör sig och alla siffror på sidan kommer härifrån.
// Källor (öppnade 2026-10-18): Livsmedelsverket, Förvaring av kylvaror: kylen 4 °C, frysen −18 °C eller kallare,
// vid 4 °C håller maten ungefär dubbelt så länge som vid 8 °C, kylvaror framme högst 4 h vid 20 °C, 3 h vid 25 °C
// och 2 h vid 26–30 °C. Electrolux, Avfrostning av kyl/frys: frosta av vid 3–5 mm is, skål med varmt (inte kokande) vatten,
// kallaste läget i minst 3 h efteråt.

export const STEPS = ["temp", "meat", "out", "clock", "back", "defrost"];
export const SHOW = [3.2, 3.4, 2.6, 9, 2.6, 7];
export const GAP = 0.7;
export const FIRST = 1.0;
export const TOUR = 36;
export const START = SHOW.reduce((list, d, i) => [...list, i ? list[i - 1] + SHOW[i - 1] + GAP : FIRST], []);
export const END = START.map((s, i) => s + SHOW[i]);
export const CLICK = START.map((s) => s - 0.1);

export const FRIDGE_C = 4;
export const WARM_C = 8; // jämförelsen hos Livsmedelsverket
export const FREEZER_C = -18;
export const ICE_MM = 4; // inom 3–5 mm: dags att frosta av
export const SHARE = 0.85; // turen ställer in maten när 85 % av tiden gått

// Reglaget har tre lägen, ett per temperatur som Livsmedelsverket anger.
export const ROOMS = [
  { label: "20 °C", limitH: 4 },
  { label: "25 °C", limitH: 3 },
  { label: "26–30 °C", limitH: 2 },
];
export const SETTING_DEFAULT = 0;

const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const smooth = (a, b, x) => { const u = clamp((x - a) / (b - a)); return u * u * (3 - 2 * u); };

export function setup(setting = SETTING_DEFAULT) {
  const room = ROOMS[Math.round(clamp(setting, 0, ROOMS.length - 1))];
  const outH = room.limitH * SHARE;
  // Verklig tid finns bara för steget där maten står framme; övriga steg visas i ungefär verklig takt.
  const real = [null, null, null, outH * 3600, null, null];
  return { setting: Math.round(clamp(setting, 0, 2)), room, outH, real };
}

export function phaseAt(t) {
  let step = -1, p = 1;
  for (let i = 0; i < STEPS.length; i++) if (t >= START[i]) { step = i; p = clamp((t - START[i]) / SHOW[i]); }
  if (step < 0) return { step: 0, p: 0, running: false };
  return { step, p, running: t < END[step] };
}

/** Tillståndet i ett steg. Allt som inte rör sig i steget står kvar där förra steget slutade. */
export function stateOf(step, p, s) {
  const st = { step, p, knob: 1, temp: FRIDGE_C, meat: 1, box: 0, hours: 0, ice: ICE_MM, drawer: 0, bowl: 0 };
  if (step === 0) {
    st.knob = smooth(0, 0.35, p);
    st.temp = WARM_C - (WARM_C - FRIDGE_C) * smooth(0.25, 1, p);
    st.meat = 0;
  } else if (step === 1) st.meat = smooth(0, 1, p);
  else if (step === 2) st.box = smooth(0, 1, p);
  else if (step === 3) { st.box = 1; st.hours = s.outH * p; }
  else if (step === 4) { st.box = 1 - smooth(0, 1, p); st.hours = s.outH; }
  else {
    st.hours = s.outH;
    st.drawer = smooth(0, 0.22, p) * (1 - smooth(0.9, 1, p));
    st.bowl = smooth(0.18, 0.3, p) * (1 - smooth(0.82, 0.92, p));
    st.ice = ICE_MM * (1 - smooth(0.3, 0.85, p));
  }
  if (step === 0 && p === 0) { st.knob = 0; st.temp = WARM_C; }
  return st;
}

export function at(t, s) {
  const { step, p, running } = phaseAt(t);
  if (t < START[0]) return { ...stateOf(0, 0, s), running: false, t };
  return { ...stateOf(step, p, s), running, t };
}

/** Fartmärke: verklig tid delad med visningstid. Tomt där verklig tid saknas eller är nära 1. */
export function speedOf(step, s) {
  if (s.real[step] == null) return "";
  const r = s.real[step] / SHOW[step];
  if (r > 0.85 && r < 1.18) return "";
  return r > 1 ? `×${Math.round(r)}` : `×1/${Math.round(1 / r)}`;
}
