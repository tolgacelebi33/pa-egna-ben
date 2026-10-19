// Cisternens modell som rena funktioner. Allt som rör sig och alla siffror på sidan kommer härifrån.
// Källor: spolmängd 4/2 l och fabriksinställning (Gustavsberg Skandic 1410, Bauhaus), justerbar upp till 6 l
// (Gustavsberg Nautic 1500, Bauhaus). Att vattnet ska stå under överfallsröret: Byggahus forum (TODO-KONTROLL).
// Tiderna i REAL är uppskattningar utan källa (TODO-KONTROLL), de styr bara fartmärket.

export const STEPS = ["press", "flush", "close", "fill", "stop"];
// Visningstid per steg i sekunder. Spolningen är huvudmomentet och längst.
export const SHOW = [1.4, 11, 4, 10, 3.8];
export const GAP = 0.7;
export const FIRST = 1.0; // första klicket sker 0.1 s före, vid 0.9 s
export const TOUR = 36;
export const START = SHOW.reduce((list, d, i) => [...list, i ? list[i - 1] + SHOW[i - 1] + GAP : FIRST], []);
export const END = START.map((s, i) => s + SHOW[i]);
export const CLICK = START.map((s) => s - 0.1);

export const H_MIN = 0.12; // nivån där proppen faller tillbaka (andel av cisternens innerhöjd)
export const H_DEFAULT = 0.78; // flottörens fabriksläge, ger 4 l
export const OVERFLOW = 0.9; // överfallsrörets överkant
export const LITERS_DEFAULT = 4;
const FILL_RATE = 4 / 30; // l/s genom påfyllningsventilen, uppskattning

const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const smooth = (a, b, x) => { const u = clamp((x - a) / (b - a)); return u * u * (3 - 2 * u); };
const lerp = (a, b, u) => a + (b - a) * u;

/** Det som beror på flottörens läge (reglaget). setting 0..1 ger stängningsnivå 0.45..0.95. */
export const SETTING_DEFAULT = (H_DEFAULT - 0.45) / 0.5;
export function setup(setting = SETTING_DEFAULT) {
  const close = 0.45 + 0.5 * clamp(setting);
  const runs = close > OVERFLOW; // flottören stänger aldrig innan vattnet når överfallet
  const full = runs ? OVERFLOW : close;
  const liters = (LITERS_DEFAULT * (full - H_MIN)) / (H_DEFAULT - H_MIN);
  const real = [0.4, 3.0, 1.0, liters / FILL_RATE, 1.0];
  return { setting: clamp(setting), close, runs, full, liters, real };
}

/** Vilket steg och hur långt in (0..1) vid turtiden t. Mellan stegen står allt still på förra stegets slut. */
export function phaseAt(t) {
  let step = -1, p = 1;
  for (let i = 0; i < STEPS.length; i++) {
    if (t >= START[i]) { step = i; p = clamp((t - START[i]) / SHOW[i]); }
  }
  if (step < 0) return { step: 0, p: 0, running: false };
  return { step, p, running: t < END[step] };
}

/** Hela tillståndet i ett steg, p 0..1. */
export function stateOf(step, p, s) {
  let press = 0, lift = 0, h = s.full;
  const low = H_MIN + 0.04;
  if (step === 0) {
    press = smooth(0, 0.3, p) * (1 - smooth(0.6, 0.95, p));
    lift = smooth(0.25, 0.75, p);
  } else if (step === 1) {
    lift = 1;
    // Torricelli: utflödet följer roten ur nivån, så nivån faller fort först och sedan långsammare.
    const a = Math.sqrt(s.full), b = Math.sqrt(low);
    h = Math.pow(lerp(a, b, p), 2);
  } else if (step === 2) {
    lift = 1 - smooth(0, 0.7, p);
    h = lerp(low, H_MIN, smooth(0, 0.8, p));
  } else if (step === 3) {
    h = lerp(H_MIN, s.full - 0.05, p); // ventilen helt öppen, jämnt flöde
  } else {
    // Flottören stryper flödet. Sitter den för högt når vattnet överfallet tidigt och rinner sedan över.
    h = lerp(s.full - 0.05, s.full, s.runs ? 1 - Math.pow(1 - Math.min(1, p / 0.4), 2) : 1 - Math.pow(1 - p, 2.2));
  }
  const valve = s.runs ? clamp(Math.max((s.close - h) / 0.06, step === 4 ? 0.35 : 0)) : clamp((s.close - h) / 0.06);
  const overflowing = s.runs && h >= OVERFLOW - 1e-6;
  const out = step === 0 ? 0 : step >= 3 ? s.liters : (s.liters * (s.full - h)) / (s.full - H_MIN);
  const realBefore = s.real.slice(0, step).reduce((a, b) => a + b, 0);
  return { step, p, press, lift, h, valve, overflowing, out, real: realBefore + p * s.real[step] };
}

/** Tillståndet vid turtiden t. */
export function at(t, s) {
  const { step, p, running } = phaseAt(t);
  return { ...stateOf(step, p, s), running, t };
}

/** Fartmärke för ett steg: verklig tid delad med visningstid, avrundat till ×n eller ×1/n. Tomt nära 1. */
export function speedOf(step, s) {
  const r = s.real[step] / SHOW[step];
  if (r > 0.85 && r < 1.18) return "";
  return r > 1 ? `×${Math.round(r)}` : `×1/${Math.round(1 / r)}`;
}
